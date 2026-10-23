import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.database_manager import database_manager
from app.core.sample_data import seed_sample_database

logger = logging.getLogger("askdb.api.database")
router = APIRouter()

class DBConnectionSchema(BaseModel):
    db_type: str  # SQLite, PostgreSQL, MySQL
    host: Optional[str] = "localhost"
    port: Optional[int] = 5432
    database_name: str
    username: Optional[str] = ""
    password: Optional[str] = ""
    name: Optional[str] = None

class SetActiveDBSchema(BaseModel):
    source_id: int

class DBConnectionResponse(BaseModel):
    id: int
    name: str
    db_type: str
    database_name: str
    host: str
    port: int
    username: str
    status: str
    is_active: bool
    last_synced: str

@router.get("/database/schema")
def get_db_schema(current_user: User = Depends(get_current_user)):
    """Returns the database schema structure of the active database for Schema Explorer"""
    try:
        return database_manager.introspect_schema(force_refresh=True)
    except Exception as e:
        logger.error(f"Error fetching schema: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to inspect database schema: {str(e)}"
        )

@router.get("/database/sources", response_model=List[DBConnectionResponse])
def get_db_sources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns list of all configured database sources"""
    database_manager.initialize_default_sources()
    return database_manager.get_all_sources(db)

@router.post("/database/test")
def test_db_connection(
    config: DBConnectionSchema,
    current_user: User = Depends(get_current_user)
):
    """Tests connection parameters against the requested database"""
    if not config.database_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database name or file path is required."
        )

    try:
        url = database_manager.build_connection_url(
            config.db_type,
            config.host or "localhost",
            config.port or (5432 if config.db_type.lower() == "postgresql" else 3306),
            config.database_name,
            config.username or "",
            config.password or ""
        )
        success, message = database_manager.test_connection_url(config.db_type, url)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Connection test failed: {message}"
            )
        return {
            "success": True,
            "message": f"Connection verified successfully! {config.db_type} database is reachable."
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Connection test error: {str(e)}"
        )

@router.post("/database/connect", response_model=DBConnectionResponse)
def connect_db(
    config: DBConnectionSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registers and establishes a new database data source configuration"""
    if not config.database_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database name or path is required."
        )

    try:
        new_source = database_manager.add_data_source(
            db,
            db_type=config.db_type,
            host=config.host or "localhost",
            port=config.port or (5432 if config.db_type.lower() == "postgresql" else 3306),
            database_name=config.database_name,
            username=config.username or "",
            password=config.password or "",
            name=config.name
        )
        return {
            "id": new_source.id,
            "name": new_source.name,
            "db_type": new_source.db_type,
            "database_name": new_source.database_name or new_source.name,
            "host": new_source.host or "local",
            "port": new_source.port or 0,
            "username": new_source.username or "default",
            "status": "Available",
            "is_active": False,
            "last_synced": "Just now"
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/database/active")
def set_active_database(
    payload: SetActiveDBSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sets a specific database source as the active target for AI queries"""
    try:
        updated = database_manager.set_active_source(db, payload.source_id)
        return {
            "success": True,
            "message": f"Active database changed to: {updated.name}",
            "active_source_id": updated.id,
            "database_name": updated.database_name
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/database/seed-sample")
def reset_sample_database(
    current_user: User = Depends(get_current_user)
):
    """Initializes or resets the AskDB enterprise sample database with business data"""
    try:
        seed_sample_database()
        return {"success": True, "message": "Enterprise sample database initialized successfully."}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/database/{source_id}")
def delete_database_source(
    source_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a database connection from user account"""
    try:
        database_manager.delete_data_source(db, source_id)
        return {
            "success": True,
            "message": "Database connection successfully deleted."
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

