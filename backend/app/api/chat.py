import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.history import QueryHistory
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, RawSQLExecuteRequest
from app.services.groq_service import groq_service
from app.services.sql_service import sql_service

logger = logging.getLogger("askdb.api.chat")
router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
def handle_chat_message(
    payload: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Receives user natural language query, generates SQL using Groq LLM (or mock fallback),
    safely executes SQL against the active database, generates chart config, and logs history.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message query cannot be empty."
        )

    try:
        # 1. Generate SQL and AI metadata
        gen_result = groq_service.generate_sql_and_metadata(payload.message)
        sql = gen_result.get("sql", "").strip()
        explanation = gen_result.get("explanation", "")
        ai_chart_rec = {
            "chart_type": gen_result.get("chart_type", "bar"),
            "x_key": gen_result.get("x_key"),
            "y_keys": gen_result.get("y_keys", []),
            "title": gen_result.get("title")
        }

        # 2. Execute SQL on active database
        exec_res = sql_service.execute_sql(sql)

        # 3. Auto-heal if execution failed
        if not exec_res["success"] and exec_res.get("error"):
            logger.warning(f"Initial query execution failed: {exec_res['error']}. Attempting auto-heal...")
            corrected_sql = groq_service.auto_heal_sql(sql, exec_res["error"], payload.message)
            if corrected_sql:
                healed_exec = sql_service.execute_sql(corrected_sql)
                if healed_exec["success"]:
                    sql = corrected_sql
                    exec_res = healed_exec
                    explanation += " (Query was automatically corrected to match database schema.)"

        # 4. Resolve chart configuration
        final_chart_config = exec_res.get("chart_recommendation") or ai_chart_rec
        if ai_chart_rec.get("chart_type") and ai_chart_rec["chart_type"] != "table":
            if ai_chart_rec.get("x_key") in (exec_res.get("columns") or []):
                final_chart_config = ai_chart_rec

        # 5. Persist to QueryHistory
        query_status = "Success" if exec_res["success"] else "Failed"
        try:
            history_record = QueryHistory(
                user_id=current_user.id if current_user else None,
                question=payload.message,
                sql=sql,
                status=query_status,
                execution_time_ms=exec_res.get("execution_time_ms", 0.0),
                row_count=exec_res.get("row_count", 0),
                error_message=exec_res.get("error")
            )
            db.add(history_record)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to record query history: {e}")

        return {
            "question": payload.message,
            "sql": sql,
            "explanation": explanation,
            "status": query_status.lower(),
            "columns": exec_res.get("columns", []),
            "data": exec_res.get("rows", []),
            "row_count": exec_res.get("row_count", 0),
            "execution_time_ms": exec_res.get("execution_time_ms", 0.0),
            "chart_config": final_chart_config,
            "error": exec_res.get("error")
        }
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating and executing query: {str(e)}"
        )

@router.post("/chat/execute-raw", response_model=ChatMessageResponse)
def execute_raw_sql(
    payload: RawSQLExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes a direct or edited SQL query against the active database.
    """
    if not payload.sql.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SQL query cannot be empty."
        )

    exec_res = sql_service.execute_sql(payload.sql)
    query_status = "Success" if exec_res["success"] else "Failed"

    # Persist in history
    try:
        history_record = QueryHistory(
            user_id=current_user.id if current_user else None,
            question="Direct SQL Execution",
            sql=payload.sql,
            status=query_status,
            execution_time_ms=exec_res.get("execution_time_ms", 0.0),
            row_count=exec_res.get("row_count", 0),
            error_message=exec_res.get("error")
        )
        db.add(history_record)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log history: {e}")

    return {
        "question": "Direct SQL Execution",
        "sql": payload.sql,
        "explanation": "Executed directly against the active database.",
        "status": query_status.lower(),
        "columns": exec_res.get("columns", []),
        "data": exec_res.get("rows", []),
        "row_count": exec_res.get("row_count", 0),
        "execution_time_ms": exec_res.get("execution_time_ms", 0.0),
        "chart_config": exec_res.get("chart_recommendation"),
        "error": exec_res.get("error")
    }
