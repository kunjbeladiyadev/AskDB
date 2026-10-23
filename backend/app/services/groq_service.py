import os
import re
import json
import logging
from typing import Tuple, Dict, Any, Optional
from groq import Groq
from app.core.config import settings
from app.services.schema_service import schema_service

logger = logging.getLogger("askdb.groq")

# Predefined mock SQL responses with chart configs for offline Demo Mode
DEMO_SQL_MAP = [
    {
        "pattern": r"(top.*customer|revenue.*customer|customer.*revenue|best.*customer)",
        "sql": """SELECT c.name AS customer_name, SUM(o.total_amount) AS total_revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY total_revenue DESC
LIMIT 5;""",
        "explanation": "Calculated the customer sales revenue breakdown by joining the customers and orders tables, ordering by total spent.",
        "chart_type": "bar",
        "x_key": "customer_name",
        "y_keys": ["total_revenue"],
        "title": "Top 5 Customers by Revenue"
    },
    {
        "pattern": r"(sales.*region|region.*sales|manager.*region|highest.*sales.*region)",
        "sql": """SELECT r.name AS region_name, SUM(o.total_amount) AS total_sales
FROM regions r
JOIN customers c ON r.id = c.region_id
JOIN orders o ON c.id = o.customer_id
GROUP BY r.name
ORDER BY total_sales DESC;""",
        "explanation": "Aggregated sales totals across geographical regions by linking region managers and customer purchases.",
        "chart_type": "bar",
        "x_key": "region_name",
        "y_keys": ["total_sales"],
        "title": "Total Sales by Region"
    },
    {
        "pattern": r"(monthly.*revenue|revenue.*month|monthly.*trend|trend.*month|month.*revenue)",
        "sql": """SELECT o.order_date AS order_month, SUM(o.total_amount) AS monthly_revenue
FROM orders o
GROUP BY o.order_date
ORDER BY o.order_date ASC;""",
        "explanation": "Aggregated total order amounts grouped by date to show revenue performance trends.",
        "chart_type": "line",
        "x_key": "order_month",
        "y_keys": ["monthly_revenue"],
        "title": "Revenue Performance Trend"
    },
    {
        "pattern": r"(poorly.*product|selling.*most|top.*product|product.*revenue|products.*selling)",
        "sql": """SELECT p.name AS product_name, SUM(s.quantity) AS total_quantity, SUM(s.amount) AS total_sales
FROM products p
JOIN sales s ON p.id = s.product_id
GROUP BY p.name
ORDER BY total_sales DESC
LIMIT 10;""",
        "explanation": "Identified top selling items by calculating sold quantities and sales totals from order history.",
        "chart_type": "bar",
        "x_key": "product_name",
        "y_keys": ["total_sales"],
        "title": "Top Products by Sales"
    },
    {
        "pattern": r"(gujarat.*sales|sales.*gujarat|customer.*gujarat)",
        "sql": """SELECT c.name AS customer_name, SUM(o.total_amount) AS total_sales
FROM customers c
JOIN regions r ON r.id = c.region_id
JOIN orders o ON c.id = o.customer_id
WHERE r.name = 'Gujarat'
GROUP BY c.name
ORDER BY total_sales DESC;""",
        "explanation": "Filtered customer sales totals specifically for customers in the Gujarat region.",
        "chart_type": "bar",
        "x_key": "customer_name",
        "y_keys": ["total_sales"],
        "title": "Gujarat Region Customer Sales"
    }
]

PREFERRED_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b"
]

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = None
        if self.api_key and self.api_key not in ("", "your_groq_api_key", "your_groq_api_key_here"):
            try:
                self.client = Groq(api_key=self.api_key)
                logger.info("Groq client successfully initialized.")
            except Exception as e:
                logger.error(f"Error initializing Groq client: {e}")

    def generate_sql_and_metadata(self, question: str) -> Dict[str, Any]:
        """
        Converts user query into SQL and extracts explanation, chart recommendation, and axis mappings.
        """
        # Try real-time Groq compilation first
        if self.client and self.api_key and self.api_key not in ("", "your_groq_api_key", "your_groq_api_key_here"):
            schema_context = schema_service.get_schema_for_llm()
            
            prompt = f"""You are AskDB, an elite AI SQL & Data Analyst assistant.
Convert the user's natural-language question into an accurate, read-only SQL query and recommend the optimal chart visualization.

CRITICAL RULES:
1. Use ONLY the provided database schema tables and columns.
2. Produce ONLY read-only queries (SELECT).
3. Always provide table aliases (e.g. customers c, orders o).
4. For date aggregations, use standard SQL syntax compatible with SQLite and standard SQL.
5. In your chart recommendation, pick the most appropriate chart: "bar", "line", "pie", "area", or "table".

Database schema:
{schema_context}

User question:
{question}

You MUST return a JSON object with exactly these keys:
- "sql": (string) The executable SQL query.
- "explanation": (string) A clear, 1-2 sentence business explanation of the query and calculation.
- "chart_type": (string) "bar" | "line" | "pie" | "area" | "table"
- "x_key": (string) Column name for the X-axis / category label.
- "y_keys": (array of strings) Column name(s) for the Y-axis numeric metric(s).
- "title": (string) A concise title for the chart.
"""

            for model_name in PREFERRED_MODELS:
                try:
                    logger.info(f"Attempting SQL generation with model {model_name}...")
                    chat_completion = self.client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model=model_name,
                        temperature=0.0,
                        max_tokens=500,
                        response_format={"type": "json_object"}
                    )
                    content = chat_completion.choices[0].message.content.strip()
                    result = json.loads(content)
                    sql = result.get("sql", "").strip()
                    if sql:
                        logger.info(f"Successfully generated SQL using {model_name}.")
                        return {
                            "sql": sql,
                            "explanation": result.get("explanation", "Query generated based on schema."),
                            "chart_type": result.get("chart_type", "bar"),
                            "x_key": result.get("x_key"),
                            "y_keys": result.get("y_keys", []),
                            "title": result.get("title", "Data Visualization")
                        }
                except Exception as e:
                    logger.warning(f"Groq generation failed with {model_name}: {e}")

        # Fallback to local mock generator
        logger.info("Using local mock compiler fallback.")
        return self._get_mock_sql_and_metadata(question)

    def auto_heal_sql(self, failed_sql: str, error_msg: str, question: str) -> Optional[str]:
        """
        Sends the failed SQL and error message back to Groq to fix the query.
        """
        if not self.client:
            return None

        schema_context = schema_service.get_schema_for_llm()
        heal_prompt = f"""You are AskDB AI. A generated SQL query failed execution against the database.
Fix the SQL query so it is valid and executes cleanly.

Database Schema:
{schema_context}

Original User Question:
{question}

Failed SQL:
{failed_sql}

Database Error Message:
{error_msg}

Return ONLY a JSON object:
{{
  "corrected_sql": "<executable SQL query>",
  "explanation": "<brief note of what was fixed>"
}}
"""
        for model_name in PREFERRED_MODELS:
            try:
                resp = self.client.chat.completions.create(
                    messages=[{"role": "user", "content": heal_prompt}],
                    model=model_name,
                    temperature=0.0,
                    max_tokens=400,
                    response_format={"type": "json_object"}
                )
                data = json.loads(resp.choices[0].message.content)
                corrected = data.get("corrected_sql", "").strip()
                if corrected:
                    return corrected
            except Exception as e:
                logger.warning(f"Auto-heal failed with {model_name}: {e}")

        return None

    def generate_sql_and_explanation(self, question: str) -> Tuple[str, str]:
        """Backward compatible wrapper"""
        meta = self.generate_sql_and_metadata(question)
        return meta["sql"], meta["explanation"]

    def _get_mock_sql_and_metadata(self, question: str) -> Dict[str, Any]:
        q_lower = question.lower()

        # 1. Check pre-compiled analytical mappings
        for item in DEMO_SQL_MAP:
            if re.search(item["pattern"], q_lower):
                return {
                    "sql": item["sql"],
                    "explanation": item["explanation"],
                    "chart_type": item["chart_type"],
                    "x_key": item["x_key"],
                    "y_keys": item["y_keys"],
                    "title": item["title"]
                }

        # 2. Schema tables synonyms
        SYNONYMS = {
            "customers": ["customer", "users", "user", "members", "buyers", "clients", "accounts"],
            "products": ["product", "items", "item", "goods", "stocks", "inventory", "wares"],
            "orders": ["order", "transactions", "purchases", "deals", "bills", "invoices"],
            "sales": ["sale", "revenue", "revenues", "income", "profit", "sold"],
            "regions": ["region", "areas", "area", "locations", "countries", "states", "zones"]
        }

        target_table = None
        for table, keywords in SYNONYMS.items():
            if table in q_lower or any(kw in q_lower for kw in keywords):
                target_table = table
                break

        if target_table:
            if any(kw in q_lower for kw in ["count", "how many", "number of", "total count"]):
                sql = f"SELECT COUNT(*) AS total_count\nFROM {target_table};"
                return {
                    "sql": sql,
                    "explanation": f"Counted total records in the '{target_table}' table.",
                    "chart_type": "table",
                    "x_key": "total_count",
                    "y_keys": ["total_count"],
                    "title": f"Count of {target_table.title()}"
                }

            selected_cols = []
            if target_table == "customers":
                selected_cols = ["c.id", "c.name", "c.email"]
                if "region" in q_lower:
                    selected_cols.append("r.name AS region_name")
                    sql = f"SELECT {', '.join(selected_cols)}\nFROM customers c\nLEFT JOIN regions r ON c.region_id = r.id\nLIMIT 20;"
                    return {
                        "sql": sql,
                        "explanation": "Selected customer profiles joined with their geographic regions.",
                        "chart_type": "table",
                        "x_key": "name",
                        "y_keys": [],
                        "title": "Customers by Region"
                    }
            elif target_table == "products":
                sql = "SELECT p.name AS product_name, p.category, p.price\nFROM products p\nORDER BY p.price DESC\nLIMIT 15;"
                return {
                    "sql": sql,
                    "explanation": "Retrieved product catalog listing names, categories, and prices ordered from highest to lowest.",
                    "chart_type": "bar",
                    "x_key": "product_name",
                    "y_keys": ["price"],
                    "title": "Product Pricing Overview"
                }
            elif target_table == "orders":
                sql = "SELECT o.id AS order_id, c.name AS customer_name, o.total_amount, o.order_date\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nORDER BY o.order_date DESC\nLIMIT 15;"
                return {
                    "sql": sql,
                    "explanation": "Selected recent orders with customer names and total amounts.",
                    "chart_type": "bar",
                    "x_key": "customer_name",
                    "y_keys": ["total_amount"],
                    "title": "Recent Customer Orders"
                }

        # Default query
        default_sql = """SELECT c.name AS customer_name, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.name
ORDER BY total_spent DESC
LIMIT 10;"""
        return {
            "sql": default_sql,
            "explanation": "Aggregated customer names, total order counts, and total spending.",
            "chart_type": "bar",
            "x_key": "customer_name",
            "y_keys": ["total_spent"],
            "title": "Customer Spending Overview"
        }

groq_service = GroqService()
