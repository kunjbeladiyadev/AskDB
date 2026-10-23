import re
import time
import logging
from decimal import Decimal
from datetime import date, datetime
from typing import Dict, List, Any, Tuple, Optional
from sqlalchemy import text
from app.services.database_manager import database_manager

logger = logging.getLogger("askdb.sql")

BLOCKED_KEYWORDS = [
    r"\bINSERT\b", r"\bUPDATE\b", r"\bDELETE\b", r"\bDROP\b",
    r"\bALTER\b", r"\bTRUNCATE\b", r"\bCREATE\b", r"\bREPLACE\b",
    r"\bEXEC\b", r"\bEXECUTE\b", r"\bGRANT\b", r"\bREVOKE\b",
    r"\bATTACH\b", r"\bDETACH\b", r"\bPRAGMA\b"
]

class SQLService:
    @staticmethod
    def clean_sql(sql: str) -> str:
        """Removes markdown code fences and unnecessary trailing whitespace"""
        cleaned = re.sub(r"^```(?:sql)?\s*", "", sql.strip(), flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned.strip())
        return cleaned.strip()

    @staticmethod
    def validate_sql(sql: str) -> Tuple[bool, str]:
        """
        Validates generated SQL to ensure it contains only SELECT queries and
        blocks dangerous keywords (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, etc.).
        """
        cleaned = SQLService.clean_sql(sql)
        if not cleaned:
            return False, "SQL query cannot be empty."

        # Strip comments before checking syntax
        no_single_comments = re.sub(r"--.*$", "", cleaned, flags=re.MULTILINE)
        no_comments = re.sub(r"/\*.*?\*/", "", no_single_comments, flags=re.DOTALL).strip()

        # Check for blocked destructive keywords
        for pattern in BLOCKED_KEYWORDS:
            if re.search(pattern, no_comments, re.IGNORECASE):
                matched = re.search(pattern, no_comments, re.IGNORECASE).group()
                return False, f"Dangerous SQL operation detected: '{matched}'. Only read-only SELECT queries are allowed."

        # Must start with SELECT or WITH (for CTEs)
        normalized = no_comments.strip().upper()
        if not (normalized.startswith("SELECT") or normalized.startswith("WITH")):
            return False, "Only SELECT statements (or WITH ... SELECT) are allowed for business intelligence queries."

        # Check for multiple stacked queries (e.g. SELECT 1; DROP TABLE ...)
        statements = [s.strip() for s in no_comments.split(";") if s.strip()]
        if len(statements) > 1:
            return False, "Multiple queries in a single execution are prohibited."

        return True, cleaned

    @staticmethod
    def execute_sql(sql: str, custom_engine=None, max_rows: int = 500) -> Dict[str, Any]:
        """
        Executes the validated SQL query against the target database and returns
        the tabular results and execution metadata.
        """
        is_valid, validation_msg = SQLService.validate_sql(sql)
        if not is_valid:
            return {
                "success": False,
                "error": validation_msg,
                "columns": [],
                "rows": [],
                "row_count": 0,
                "execution_time_ms": 0.0,
                "chart_recommendation": None
            }

        cleaned_sql = validation_msg
        engine = custom_engine or database_manager.get_active_engine()

        start_time = time.perf_counter()
        try:
            with engine.connect() as conn:
                # Execute with read-only cursor
                result = conn.execute(text(cleaned_sql))
                execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

                if result.returns_rows:
                    columns = list(result.keys())
                    raw_rows = result.fetchmany(max_rows)

                    formatted_rows = []
                    for row in raw_rows:
                        row_dict = {}
                        for col_name, val in zip(columns, row):
                            # Convert non-JSON serializable types
                            if isinstance(val, Decimal):
                                row_dict[col_name] = float(val)
                            elif isinstance(val, (datetime, date)):
                                row_dict[col_name] = val.isoformat()
                            elif isinstance(val, bytes):
                                row_dict[col_name] = val.decode("utf-8", errors="ignore")
                            else:
                                row_dict[col_name] = val
                        formatted_rows.append(row_dict)

                    chart_rec = SQLService.infer_chart_config(columns, formatted_rows)

                    return {
                        "success": True,
                        "sql": cleaned_sql,
                        "columns": columns,
                        "rows": formatted_rows,
                        "row_count": len(formatted_rows),
                        "execution_time_ms": execution_time_ms,
                        "chart_recommendation": chart_rec,
                        "error": None
                    }
                else:
                    return {
                        "success": True,
                        "sql": cleaned_sql,
                        "columns": [],
                        "rows": [],
                        "row_count": 0,
                        "execution_time_ms": execution_time_ms,
                        "chart_recommendation": None,
                        "error": None
                    }
        except Exception as e:
            execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(f"SQL execution failed: {e}")
            return {
                "success": False,
                "sql": cleaned_sql,
                "columns": [],
                "rows": [],
                "row_count": 0,
                "execution_time_ms": execution_time_ms,
                "chart_recommendation": None,
                "error": str(e)
            }

    @staticmethod
    def infer_chart_config(columns: List[str], rows: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Analyzes column types and row values to automatically recommend the optimal
        chart visualization (Bar, Line, Area, or Pie).
        """
        if not columns or not rows:
            return None

        # Detect column types from first few rows
        numeric_cols = []
        date_cols = []
        string_cols = []

        sample_rows = rows[:10]
        for col in columns:
            is_num = all(isinstance(r.get(col), (int, float)) and not isinstance(r.get(col), bool) for r in sample_rows if r.get(col) is not None)
            is_date = any(
                isinstance(r.get(col), str) and re.match(r"^\d{4}-\d{2}", str(r.get(col)))
                for r in sample_rows if r.get(col) is not None
            )

            # Check column name heuristics
            col_lower = col.lower()
            if is_num and col_lower not in ("id", "user_id", "customer_id", "order_id", "region_id", "product_id"):
                numeric_cols.append(col)
            elif is_date or "date" in col_lower or "month" in col_lower or "year" in col_lower:
                date_cols.append(col)
            else:
                string_cols.append(col)

        if not numeric_cols:
            return {
                "chart_type": "table",
                "x_key": columns[0],
                "y_keys": [],
                "title": "Query Results"
            }

        # Date/time trend -> Line or Area chart
        if date_cols and numeric_cols:
            return {
                "chart_type": "line",
                "x_key": date_cols[0],
                "y_keys": numeric_cols[:2],
                "title": f"{numeric_cols[0].replace('_', ' ').title()} Over Time"
            }

        # String category + 1 numeric -> Bar or Pie
        if string_cols and numeric_cols:
            chart_type = "pie" if len(rows) <= 5 and "share" in numeric_cols[0].lower() else "bar"
            return {
                "chart_type": chart_type,
                "x_key": string_cols[0],
                "y_keys": [numeric_cols[0]],
                "title": f"{numeric_cols[0].replace('_', ' ').title()} by {string_cols[0].replace('_', ' ').title()}"
            }

        # Fallback to first column as X, first numeric as Y
        return {
            "chart_type": "bar",
            "x_key": columns[0],
            "y_keys": [numeric_cols[0]],
            "title": f"{numeric_cols[0].replace('_', ' ').title()} Comparison"
        }

sql_service = SQLService()
