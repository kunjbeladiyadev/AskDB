from typing import Dict, List, Any
import logging
from app.services.database_manager import database_manager

logger = logging.getLogger("askdb.schema")

SAMPLE_SCHEMA = {
    "regions": {
        "description": "Stores geographic regions and region managers",
        "columns": [
            {"name": "id", "type": "INT", "primary_key": True, "foreign_key": None},
            {"name": "name", "type": "VARCHAR(100)", "primary_key": False, "foreign_key": None},
            {"name": "manager", "type": "VARCHAR(100)", "primary_key": False, "foreign_key": None}
        ]
    },
    "customers": {
        "description": "Business customers details and region mappings",
        "columns": [
            {"name": "id", "type": "INT", "primary_key": True, "foreign_key": None},
            {"name": "name", "type": "VARCHAR(150)", "primary_key": False, "foreign_key": None},
            {"name": "email", "type": "VARCHAR(150)", "primary_key": False, "foreign_key": None},
            {"name": "region_id", "type": "INT", "primary_key": False, "foreign_key": "regions.id"},
            {"name": "created_at", "type": "TIMESTAMP", "primary_key": False, "foreign_key": None}
        ]
    },
    "orders": {
        "description": "Customer purchase orders and transactions",
        "columns": [
            {"name": "id", "type": "INT", "primary_key": True, "foreign_key": None},
            {"name": "customer_id", "type": "INT", "primary_key": False, "foreign_key": "customers.id"},
            {"name": "total_amount", "type": "DECIMAL(10,2)", "primary_key": False, "foreign_key": None},
            {"name": "order_date", "type": "DATE", "primary_key": False, "foreign_key": None}
        ]
    },
    "products": {
        "description": "Product inventory, pricing and category groups",
        "columns": [
            {"name": "id", "type": "INT", "primary_key": True, "foreign_key": None},
            {"name": "name", "type": "VARCHAR(150)", "primary_key": False, "foreign_key": None},
            {"name": "price", "type": "DECIMAL(10,2)", "primary_key": False, "foreign_key": None},
            {"name": "category", "type": "VARCHAR(100)", "primary_key": False, "foreign_key": None}
        ]
    },
    "sales": {
        "description": "Detailed items sold breakdown mapping orders to products",
        "columns": [
            {"name": "id", "type": "INT", "primary_key": True, "foreign_key": None},
            {"name": "order_id", "type": "INT", "primary_key": False, "foreign_key": "orders.id"},
            {"name": "product_id", "type": "INT", "primary_key": False, "foreign_key": "products.id"},
            {"name": "quantity", "type": "INT", "primary_key": False, "foreign_key": None},
            {"name": "amount", "type": "DECIMAL(10,2)", "primary_key": False, "foreign_key": None}
        ]
    }
}

class SchemaService:
    @staticmethod
    def get_raw_schema() -> Dict[str, Any]:
        """Returns the structured schema definition for API consumption from active database"""
        try:
            schema = database_manager.introspect_schema()
            if schema:
                return schema
        except Exception as e:
            logger.warning(f"Error introspecting active database schema: {e}. Falling back to default schema.")
        return SAMPLE_SCHEMA

    @staticmethod
    def get_schema_for_llm() -> str:
        """Formats the schema definition as a plain text string for inject-prompts"""
        try:
            llm_schema = database_manager.get_schema_for_llm()
            if llm_schema.strip():
                return llm_schema
        except Exception as e:
            logger.warning(f"Error getting schema for LLM from db_manager: {e}")

        # Fallback to static SAMPLE_SCHEMA
        output = []
        for table_name, table_info in SAMPLE_SCHEMA.items():
            output.append(f"Table: {table_name}")
            output.append(f"Description: {table_info['description']}")
            output.append("Columns:")
            for col in table_info["columns"]:
                pk_flag = " (Primary Key)" if col["primary_key"] else ""
                fk_flag = f" (Foreign Key referencing {col['foreign_key']})" if col["foreign_key"] else ""
                output.append(f"  - {col['name']}: {col['type']}{pk_flag}{fk_flag}")
            output.append("")
        return "\n".join(output)

schema_service = SchemaService()
