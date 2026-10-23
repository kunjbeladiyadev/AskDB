from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from app.core.database import Base

class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    question = Column(Text, nullable=False)
    sql = Column(Text, nullable=False)
    status = Column(String, default="Success")  # Success, Failed
    execution_time_ms = Column(Float, default=0.0)
    row_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
