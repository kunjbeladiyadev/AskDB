import sys
import os

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=" * 60)
    print("RUNNING ASKDB END-TO-END AUTOMATED VERIFICATION SUITE")
    print("=" * 60)

    client = TestClient(app)

    # 1. Health Check
    print("\n[1/7] Testing API Health Check...")
    resp = client.get("/api/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    print("[PASS] Health Check Passed:", resp.json())

    # 2. Authentication Flow
    print("\n[2/7] Testing User Authentication (Signup / Login)...")
    test_email = "tester_analytics@askdb.ai"
    test_password = "SecurePassword123!"
    
    signup_resp = client.post("/api/auth/signup", json={
        "name": "Analytics Tester",
        "email": test_email,
        "password": test_password
    })
    if signup_resp.status_code == 200:
        token = signup_resp.json()["access_token"]
        print("[PASS] Signup successful! Token acquired.")
    else:
        login_resp = client.post("/api/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json()["access_token"]
        print("[PASS] Login successful! Token acquired.")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Database Data Sources & Schema
    print("\n[3/7] Testing Database Data Sources & Schema Introspection...")
    sources_resp = client.get("/api/database/sources", headers=headers)
    assert sources_resp.status_code == 200, f"Sources failed: {sources_resp.text}"
    sources = sources_resp.json()
    active_source = next((s['name'] for s in sources if s['is_active']), 'None')
    print(f"[PASS] Retrieved {len(sources)} data source(s). Active source: {active_source}")

    schema_resp = client.get("/api/database/schema", headers=headers)
    assert schema_resp.status_code == 200, f"Schema failed: {schema_resp.text}"
    schema = schema_resp.json()
    print("[PASS] Introspected database tables:", list(schema.keys()))
    assert "customers" in schema and "orders" in schema and "products" in schema, "Schema missing core business tables!"

    # 4. Text-to-SQL & Database Execution Pipeline
    print("\n[4/7] Testing Text-to-SQL + Safe Query Execution Pipeline...")
    test_queries = [
        "Show top 5 customers by revenue",
        "Compare total sales by region",
        "What is the monthly revenue trend?"
    ]

    for q in test_queries:
        print(f"\n   -> Asking: '{q}'")
        chat_resp = client.post("/api/chat", json={"message": q}, headers=headers)
        assert chat_resp.status_code == 200, f"Chat failed for '{q}': {chat_resp.text}"
        result = chat_resp.json()
        print(f"      Generated SQL: {result['sql'][:70]}...")
        print(f"      Status: {result['status']}, Rows: {result['row_count']}, Latency: {result['execution_time_ms']}ms")
        print(f"      Columns: {result['columns']}")
        print(f"      Chart Type: {result.get('chart_config', {}).get('chart_type')}")
        assert result['row_count'] > 0, f"Query returned 0 rows for '{q}'!"
        assert result['status'] == 'success', f"Query failed for '{q}'!"
        assert len(result['data']) > 0, "Data payload is empty!"

    # 5. Security & Malicious SQL Injection Prevention
    print("\n[5/7] Testing Safe SQL Validator & Malicious Statement Blocking...")
    dangerous_sql = "DROP TABLE customers;"
    sec_resp = client.post("/api/chat/execute-raw", json={"sql": dangerous_sql}, headers=headers)
    assert sec_resp.status_code == 200
    sec_data = sec_resp.json()
    assert sec_data["status"] == "failed"
    assert "Dangerous SQL operation detected" in sec_data["error"]
    print(f"[PASS] Blocked destructive query successfully! Error: '{sec_data['error']}'")

    # 6. Raw SQL Execution
    print("\n[6/7] Testing Direct Raw SQL Execution...")
    raw_query = "SELECT category, COUNT(*) as product_count, AVG(price) as avg_price FROM products GROUP BY category ORDER BY avg_price DESC;"
    raw_resp = client.post("/api/chat/execute-raw", json={"sql": raw_query}, headers=headers)
    assert raw_resp.status_code == 200
    raw_data = raw_resp.json()
    assert raw_data["status"] == "success"
    print(f"[PASS] Raw SQL executed successfully! Returned {raw_data['row_count']} categories with chart recommendation: {raw_data['chart_config']['chart_type']}")

    # 7. Query History & Audit Logging
    print("\n[7/7] Testing Query History & Performance Metrics...")
    history_resp = client.get("/api/history", headers=headers)
    assert history_resp.status_code == 200
    history_items = history_resp.json()
    print(f"[PASS] Query history contains {len(history_items)} recorded executions.")

    stats_resp = client.get("/api/history/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    print(f"[PASS] Analytics Stats: Total={stats['total_queries']}, Success Rate={stats['success_rate']}, Avg Latency={stats['avg_latency']}")

    print("\n" + "=" * 60)
    print("ALL 7 END-TO-END PIPELINE VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
