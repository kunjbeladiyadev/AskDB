# AskDB — AI Data Analyst Installation & Execution Guide

Follow these instructions to run and test the complete **AskDB** full-stack AI data analytics platform.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.10 or higher
- **Groq API Key**: (Provided in `.env` for blazing-fast inference)

---

## 1. Environment Configuration

Ensure a `.env` file exists in the root directory (or use `.env.example` as reference):

```env
# Database Configuration (Defaults seamlessly to local SQLite if PostgreSQL is offline)
DATABASE_URL=sqlite:///./sqlite.db

# Groq LLM API Key
GROQ_API_KEY=groqapikey

# JWT Security
JWT_SECRET_KEY=supersecretkeyforlocalaskdbdevelopmentsessiontokens123
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120

# Demo Mode (false uses real Groq LLM + live database execution)
DEMO_MODE=false
```

---

## 2. Backend Setup & Startup

Open a terminal at the project root:

```bash
cd backend
```

### Activate the Virtual Environment

- **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\activate
  ```
- **Windows (CMD):**
  ```cmd
  venv\Scripts\activate.bat
  ```
- **Linux/macOS:**
  ```bash
  source venv/bin/activate
  ```

### Install Dependencies (If not already installed)

```bash
pip install -r requirements.txt
```

### Run the FastAPI Server

```bash
uvicorn app.main:app --reload --port 8000
```

> **Backend API is now live at:** `http://localhost:8000`  
> **Interactive Swagger API Docs:** `http://localhost:8000/docs`

---

## 3. Frontend Setup & Startup

Open a second terminal window at the project root:

```bash
cd frontend
npm install
npm run dev
```

> **AskDB Web App is now running at:** `http://localhost:5173`

---

## 4. Automated End-to-End Verification

To verify all components (Health, Auth, Multi-DB Schema Introspection, Text-to-SQL Pipeline, Safe SQL Blocking, Direct Query Execution, and Query History) in one command:

```bash
cd backend
.\venv\Scripts\python.exe test_pipeline.py
```

Expected result:
```
============================================================
ALL 7 END-TO-END PIPELINE VERIFICATION TESTS PASSED SUCCESSFULLY!
============================================================
```

---

## 5. Manual Testing Steps in Web Browser

1. Open `http://localhost:5173` in your browser.
2. **Sign Up / Log In**:
   - Register a new account or log in with your credentials.
3. **Database Connections Page (`/database`)**:
   - View connected data sources.
   - The built-in **AskDB Enterprise Sample DB** is pre-seeded with 100+ business rows across `regions`, `customers`, `products`, `orders`, and `sales`.
   - Click **Connect Database** to connect any external SQLite file or PostgreSQL/MySQL server.
   - Click **Set as Active Database** to switch which database is being queried.
4. **Schema Explorer (`/schema`)**:
   - Inspect table schemas, primary keys, foreign key relations, and column types introspected live from the active database.
5. **AskDB Chat Session (`/chat`)**:
   - Ask any natural language question:
     - *"What are my top 5 customers by revenue?"*
     - *"Compare sales across regions."*
     - *"What is the monthly revenue trend?"*
     - *"Which products are selling the most?"*
     - *"Show sales only for Gujarat region."*
   - Observe:
     - Generated SQL query with syntax highlighting.
     - Execution latency badge (e.g. `0.4ms`).
     - **Visualization Tab**: Interactive Recharts chart with Bar, Line, Area, and Pie chart toggles and summary statistics.
     - **Table View Tab**: Interactive data table with in-table search filter, pagination, and **Export to CSV / Copy JSON**.
     - **SQL Query Tab**: Re-execute or inspect the raw query.
6. **Query History (`/history`)**:
   - Audit all executed queries, execution latency, row counts, and status.
   - Click the **Play** button to re-run any past query in Chat.
