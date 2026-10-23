import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.database import engine, Base
# Import all models to register with Base.metadata
from app.models.user import User
from app.models.data_source import DataSource
from app.models.history import QueryHistory
from app.api import health, auth, chat, database, history
from app.core.sample_data import seed_sample_database
from app.services.database_manager import database_manager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("askdb.main")

# Auto-create database tables
try:
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schemas initialized.")
    # Seed enterprise sample business analytics tables
    seed_sample_database()
    # Initialize default data sources in DB
    database_manager.initialize_default_sources()
except Exception as e:
    logger.error(f"Error creating database schemas on startup: {e}")

# Initialize app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Conversational Natural Language to SQL Analytics Platform",
    version="1.0.0",
)

# CORS middleware configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.API_VERSION, tags=["Health"])
app.include_router(auth.router, prefix=f"{settings.API_VERSION}/auth", tags=["Authentication"])
app.include_router(chat.router, prefix=settings.API_VERSION, tags=["Chat"])
app.include_router(database.router, prefix=settings.API_VERSION, tags=["Database"])
app.include_router(history.router, prefix=settings.API_VERSION, tags=["History"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to AskDB — AI Data Analyst API",
        "health": f"{settings.API_VERSION}/health",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
