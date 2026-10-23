from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatMessageRequest(BaseModel):
    message: str
    db_id: Optional[int] = None

class ChartConfigSchema(BaseModel):
    chart_type: str  # bar, line, pie, area, table
    x_key: Optional[str] = None
    y_keys: Optional[List[str]] = None
    title: Optional[str] = None

class ChatMessageResponse(BaseModel):
    question: str
    sql: str
    explanation: str
    status: str
    columns: Optional[List[str]] = []
    data: Optional[List[Dict[str, Any]]] = []
    row_count: Optional[int] = 0
    execution_time_ms: Optional[float] = 0.0
    chart_config: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class RawSQLExecuteRequest(BaseModel):
    sql: str
