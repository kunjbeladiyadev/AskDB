import os
import logging
from typing import Dict, List, Any, Optional
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session
from app.core.database import engine as default_engine, SessionLocal
from app.models.data_source import DataSource

logger = logging.getLogger("askdb.db_manager")

class DatabaseManager:
    def __init__(self):
        self._active_engine = default_engine
        self._active_source_id: Optional[int] = None
        self._cached_schema: Optional[Dict[str, Any]] = None

    def initialize_default_sources(self):
        """Ensures the built-in Enterprise Sample DB is registered in DataSource table"""
        try:
            with SessionLocal() as db:
                sample_source = db.query(DataSource).filter(DataSource.name == "AskDB Enterprise Sample DB").first()
                if not sample_source:
                    sample_source = DataSource(
                        name="AskDB Enterprise Sample DB",
                        db_type="SQLite",
                        connection_url="sqlite:///./sqlite.db",
                        host="localhost",
                        port=0,
                        database_name="askdb_sample.db",
                        username="app_user",
                        is_active=True
                    )
                    db.add(sample_source)
                    db.commit()
                    db.refresh(sample_source)
                    self._active_source_id = sample_source.id
                    logger.info("Initialized default Enterprise Sample DB data source.")
                else:
                    # If an active source is set, activate it
                    active = db.query(DataSource).filter(DataSource.is_active == True).first()
                    if active:
                        self._active_source_id = active.id
                        self._switch_engine(active)
                    else:
                        sample_source.is_active = True
                        db.commit()
                        self._active_source_id = sample_source.id
        except Exception as e:
            logger.error(f"Error initializing default sources: {e}")

    def get_all_sources(self, db: Session) -> List[Dict[str, Any]]:
        sources = db.query(DataSource).order_by(DataSource.id.asc()).all()
        result = []
        for s in sources:
            result.append({
                "id": s.id,
                "name": s.name,
                "db_type": s.db_type,
                "database_name": s.database_name or s.name,
                "host": s.host or "local",
                "port": s.port or 0,
                "username": s.username or "default",
                "status": "Connected" if s.is_active else "Available",
                "is_active": bool(s.is_active),
                "last_synced": "Active" if s.is_active else "Ready"
            })
        return result

    def test_connection_url(self, db_type: str, connection_url: str) -> tuple[bool, str]:
        """Tests whether a database connection URL is reachable"""
        temp_engine = None
        try:
            connect_args = {"check_same_thread": False} if "sqlite" in connection_url.lower() else {}
            temp_engine = create_engine(connection_url, connect_args=connect_args)
            with temp_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True, "Connection test successful! Database is reachable."
        except Exception as e:
            logger.error(f"Test connection error: {e}")
            return False, str(e)
        finally:
            if temp_engine:
                temp_engine.dispose()

    def build_connection_url(self, db_type: str, host: str, port: int, database_name: str, username: str, password: str) -> str:
        from urllib.parse import quote_plus
        db_type_lower = db_type.lower()
        if db_type_lower == "sqlite":
            if not database_name:
                database_name = "custom.db"
            return f"sqlite:///{database_name}"
        elif db_type_lower in ("postgresql", "postgres"):
            u = quote_plus(username) if username else ""
            p = f":{quote_plus(password)}" if password else ""
            auth = f"{u}{p}@" if u else ""
            return f"postgresql://{auth}{host}:{port}/{database_name}"
        elif db_type_lower == "mysql":
            u = quote_plus(username) if username else ""
            p = f":{quote_plus(password)}" if password else ""
            auth = f"{u}{p}@" if u else ""
            return f"mysql+pymysql://{auth}{host}:{port}/{database_name}"
        else:
            raise ValueError(f"Unsupported database type: {db_type}")

    def add_data_source(self, db: Session, db_type: str, host: str, port: int, database_name: str, username: str, password: str, name: Optional[str] = None) -> DataSource:
        url = self.build_connection_url(db_type, host, port, database_name, username, password)
        success, err = self.test_connection_url(db_type, url)
        if not success:
            raise ValueError(f"Could not connect to database: {err}")

        display_name = name or f"{database_name} ({db_type})"
        new_source = DataSource(
            name=display_name,
            db_type=db_type,
            connection_url=url,
            host=host,
            port=port,
            database_name=database_name,
            username=username,
            is_active=False
        )
        db.add(new_source)
        db.commit()
        db.refresh(new_source)
        return new_source

    def set_active_source(self, db: Session, source_id: int) -> DataSource:
        source = db.query(DataSource).filter(DataSource.id == source_id).first()
        if not source:
            raise ValueError(f"Data source with id {source_id} not found.")

        # Deactivate others
        db.query(DataSource).update({DataSource.is_active: False})
        source.is_active = True
        db.commit()
        db.refresh(source)

        self._switch_engine(source)
        self._active_source_id = source.id
        self._cached_schema = None  # Invalidate cache
        return source

    def delete_data_source(self, db: Session, source_id: int) -> bool:
        source = db.query(DataSource).filter(DataSource.id == source_id).first()
        if not source:
            raise ValueError(f"Data source with id {source_id} not found.")

        was_active = source.is_active
        db.delete(source)
        db.commit()

        # If deleted source was active, switch to default sample DB or another available source
        if was_active or self._active_source_id == source_id:
            fallback = db.query(DataSource).first()
            if fallback:
                fallback.is_active = True
                db.commit()
                self._switch_engine(fallback)
                self._active_source_id = fallback.id
            else:
                self._active_engine = default_engine
                self._active_source_id = None
            self._cached_schema = None

        return True

    def _switch_engine(self, source: DataSource):
        try:
            connect_args = {"check_same_thread": False} if "sqlite" in source.connection_url.lower() else {}
            new_eng = create_engine(source.connection_url, connect_args=connect_args)
            with new_eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            self._active_engine = new_eng
            logger.info(f"Switched active database engine to: {source.name} ({source.connection_url})")
        except Exception as e:
            logger.error(f"Failed to switch database engine to {source.name}: {e}. Retaining default engine.")
            self._active_engine = default_engine

    def get_active_engine(self):
        return self._active_engine or default_engine

    def get_active_source_name(self, db: Session) -> str:
        if self._active_source_id:
            src = db.query(DataSource).filter(DataSource.id == self._active_source_id).first()
            if src:
                return src.name
        return "AskDB Enterprise Sample DB"

    def introspect_schema(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Dynamically inspects the active database schema: tables, columns, data types,
        primary keys, and foreign keys.
        """
        if self._cached_schema and not force_refresh:
            return self._cached_schema

        engine = self.get_active_engine()
        inspector = inspect(engine)
        table_names = inspector.get_table_names()

        schema = {}
        # Ignore internal system tables like users, data_sources, query_history from business queries
        system_tables = {"users", "data_sources", "query_history"}

        business_tables = [t for t in table_names if t not in system_tables]
        # If no business tables, include all tables
        inspect_target_tables = business_tables if business_tables else table_names

        for table_name in inspect_target_tables:
            columns_info = []
            pk_constraint = inspector.get_pk_constraint(table_name)
            pk_cols = set(pk_constraint.get("constrained_columns", [])) if pk_constraint else set()
            fk_constraints = inspector.get_foreign_keys(table_name)

            fk_map = {}
            for fk in fk_constraints:
                referred_table = fk.get("referred_table")
                for col, ref_col in zip(fk.get("constrained_columns", []), fk.get("referred_columns", [])):
                    fk_map[col] = f"{referred_table}.{ref_col}"

            columns = inspector.get_columns(table_name)
            for col in columns:
                col_name = col["name"]
                col_type = str(col["type"])
                columns_info.append({
                    "name": col_name,
                    "type": col_type,
                    "primary_key": col_name in pk_cols,
                    "foreign_key": fk_map.get(col_name, None),
                    "nullable": col.get("nullable", True)
                })

            schema[table_name] = {
                "description": f"Table storing {table_name} records",
                "columns": columns_info
            }

        self._cached_schema = schema
        return schema

    def get_schema_for_llm(self) -> str:
        schema = self.introspect_schema()
        output = []
        for table_name, table_info in schema.items():
            output.append(f"Table: {table_name}")
            output.append(f"Description: {table_info.get('description', '')}")
            output.append("Columns:")
            for col in table_info.get("columns", []):
                pk_flag = " (Primary Key)" if col["primary_key"] else ""
                fk_flag = f" (Foreign Key referencing {col['foreign_key']})" if col["foreign_key"] else ""
                output.append(f"  - {col['name']}: {col['type']}{pk_flag}{fk_flag}")
            output.append("")
        return "\n".join(output)

database_manager = DatabaseManager()
