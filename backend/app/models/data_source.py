from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    db_type = Column(String, nullable=False)  # sqlite, postgresql, mysql
    connection_url = Column(String, nullable=False)
    host = Column(String, nullable=True)
    port = Column(Integer, nullable=True)
    database_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
