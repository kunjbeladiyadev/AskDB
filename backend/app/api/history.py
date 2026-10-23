import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.history import QueryHistory

logger = logging.getLogger("askdb.api.history")
router = APIRouter()

@router.get("/history")
def get_query_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all query execution logs for the current user or system"""
    logs = db.query(QueryHistory).order_by(QueryHistory.created_at.desc()).limit(50).all()
    
    result = []
    for log in logs:
        # Compute friendly time ago
        diff = datetime.now(timezone.utc) - (log.created_at.replace(tzinfo=timezone.utc) if log.created_at.tzinfo is None else log.created_at)
        seconds = int(diff.total_seconds())
        if seconds < 60:
            time_ago = "Just now"
        elif seconds < 3600:
            time_ago = f"{seconds // 60}m ago"
        elif seconds < 86400:
            time_ago = f"{seconds // 3600}h ago"
        else:
            time_ago = f"{seconds // 86400}d ago"

        result.append({
            "id": log.id,
            "question": log.question,
            "sql": log.sql,
            "status": log.status,
            "executionTime": f"{round(log.execution_time_ms / 1000.0, 2)}s" if log.execution_time_ms >= 1000 else f"{round(log.execution_time_ms, 1)}ms",
            "executionTimeMs": log.execution_time_ms,
            "rowCount": log.row_count,
            "date": time_ago,
            "error": log.error_message,
            "created_at": log.created_at.isoformat() if log.created_at else None
        })
    return result

@router.get("/history/stats")
def get_history_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns analytics stats for Dashboard (queries today, success rate, avg latency)"""
    total_queries = db.query(QueryHistory).count()
    successful_queries = db.query(QueryHistory).filter(QueryHistory.status == "Success").count()
    
    # Calculate average execution latency
    avg_latency = db.query(func.avg(QueryHistory.execution_time_ms)).scalar() or 0.0
    
    # Queries today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    queries_today = db.query(QueryHistory).filter(QueryHistory.created_at >= today_start).count()

    success_rate = round((successful_queries / total_queries * 100), 1) if total_queries > 0 else 100.0

    return {
        "total_queries": total_queries,
        "queries_today": queries_today or total_queries,
        "successful_queries": successful_queries,
        "success_rate": f"{success_rate}%",
        "avg_latency": f"{round(avg_latency / 1000.0, 2)}s" if avg_latency >= 1000 else f"{round(avg_latency, 1)}ms"
    }

@router.delete("/history/{item_id}")
def delete_history_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a specific query history record"""
    item = db.query(QueryHistory).filter(QueryHistory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="History record not found.")
    db.delete(item)
    db.commit()
    return {"success": True, "message": "History record deleted."}

@router.delete("/history")
def clear_all_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clears all query history records"""
    db.query(QueryHistory).delete()
    db.commit()
    return {"success": True, "message": "All query history cleared."}
