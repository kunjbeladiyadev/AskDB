# AskDB — AI Data Analyst

**AskDB** is a modern, enterprise-ready AI conversational analytics platform where business users can ask questions about their company data in natural language instead of writing complex SQL queries.

AskDB automatically converts English questions into optimized, safe SQL queries, executes them against the connected database, and presents users with interactive tabular data alongside dynamic graphical visualizations (Bar, Line, Area, and Pie charts).

---

## Key Features

| Feature Component | Status | Description |
| :--- | :---: | :--- |
| **Aesthetic SaaS Interface** | Complete | Clean dark/light mode UI built with React, Vite, and Tailwind CSS. |
| **Multi-Source Database Connection** | Complete | Connect, test, and switch target databases (SQLite, PostgreSQL, MySQL) dynamically. |
| **Dynamic Schema Introspection** | Complete | Live schema inspection extracting tables, column keys, types, and foreign key relationships. |
| **Enterprise Sample Database** | Complete | Pre-seeded with 100+ business analytics records across `regions`, `customers`, `products`, `orders`, and `sales`. |
| **Text-to-SQL AI Engine** | Complete | Real-time Groq LLM inference with automated SQL error self-healing. |
| **Safe SQL Sandbox** | Complete | SELECT-only validator blocking DDL/DML write statements, injections, and destructive commands. |
| **Interactive Data Table** | Complete | Filter rows, paginate, and export results as **CSV** or **JSON**. |
| **Automated Graphical Charts** | Complete | Recharts integration rendering Bar, Line, Area, and Pie charts with type toggling and metric summaries. |
| **Direct SQL Sandbox** | Complete | Run custom or edited SQL queries directly with immediate visualization. |
| **Audit Logging & Query History** | Complete | Persistent query audit trail logging question, generated SQL, latency, row count, and execution status. |
| **JWT Authentication** | Complete | Secure signup and login with salted and hashed passwords using bcrypt. |

---

## Architecture Flow

```
[ Business User ]
       │
       ▼  (Natural Language Query)
[ AskDB Web Client (React + Recharts) ]
       │
       ▼  (POST /api/chat)
[ FastAPI Backend ]
       │
       ├──► [ Dynamic Schema Introspector ] (Reads active DB schema)
       ├──► [ Groq AI Engine ]              (Generates SQL + Chart Recommendation)
       ├──► [ Safe SQL Validator ]          (SELECT-only, blocks DROP/DELETE/INSERT)
       ├──► [ Multi-Database Engine ]       (Executes query against active SQLite/PG/MySQL)
       │         └── [ Auto-Heal Loop ]     (Corrects SQL syntax if execution fails)
       ├──► [ Query History Logger ]        (Records execution metrics and audit logs)
       │
       ▼  (JSON: SQL, Columns, Rows, Chart Config, Metrics)
[ Interactive Table + Recharts Visualizer ]
```

---

## Quick Start Instructions

### 1. Run Automated Test Suite
Verify all 7 components in one command:
```bash
cd backend
.\venv\Scripts\python.exe test_pipeline.py
```

### 2. Start Backend Server
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 3. Start Frontend Client
```bash
cd frontend
npm run dev
```
Client app will be live at `http://localhost:5173`.

---

## Sample Queries to Try

- *"What are my top 5 customers by revenue?"*
- *"Compare total sales across regions."*
- *"What is the monthly revenue trend?"*
- *"Which products are selling the most?"*
- *"Show sales only for Gujarat region."*
- *"Show total sales by product category."*

For detailed setup instructions, see [INSTALLATION.md](INSTALLATION.md).
