import os
from dotenv import load_dotenv

# Search for .env file in the workspace root and parent directories
base_dir = os.path.abspath(os.path.dirname(__file__))
# Traverse up to locate .env file
for _ in range(5):
    env_path = os.path.join(base_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
        break
    base_dir = os.path.dirname(base_dir)
else:
    # Fallback to load default env
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "AskDB — AI Data Analyst"
    API_VERSION: str = "/api"
    
    # Secrets
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "supersecretkeyforlocalaskdbdevelopmentsessiontokens123")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # DB
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/askdb")
    
    # Groq API
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # ChromaDB
    CHROMA_PERSIST_DIRECTORY: str = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_data")
    
    # Demo Mode
    # If True, bypasses Groq LLM API and DB connection requirements
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

settings = Settings()
