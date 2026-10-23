import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger("askdb.database")
Base = declarative_base()

SessionLocal = None
engine = None

# Attempt PostgreSQL setup
try:
    if settings.DEMO_MODE:
        # In Demo Mode we can default to local SQLite to make local deployment seamless
        logger.info("Demo mode active. Initializing SQLite local database.")
        DATABASE_URL = "sqlite:///./sqlite.db"
    else:
        DATABASE_URL = settings.DATABASE_URL

    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL, connect_args={"check_same_thread": False}
        )
    else:
        # PostgreSQL configurations
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600
        )
    
    # Verify connection
    with engine.connect() as conn:
        logger.info("Successfully connected to the database.")
except Exception as e:
    logger.error(f"Failed to connect to database ({settings.DATABASE_URL}). Falling back to local SQLite database: {e}")
    # Local fallback
    DATABASE_URL = "sqlite:///./sqlite.db"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
