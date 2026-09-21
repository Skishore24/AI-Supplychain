import os
import urllib.parse
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise AI-Supplychain SaaS"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:Admin%40123@localhost:5432/supply_chain_db"
    )
    SQLITE_FALLBACK_URL: str = f"sqlite:///{BASE_DIR}/supply_chain.db"
    
    # JWT Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "emox_enterprise_supply_chain_super_secret_jwt_key_2026_x9")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Ollama & AI
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
    OLLAMA_SMALL_MODEL: str = os.getenv("OLLAMA_SMALL_MODEL", "llama3.2:3b")
    OLLAMA_REASONING_MODEL: str = os.getenv("OLLAMA_REASONING_MODEL", "llama3.1:8b")
    OLLAMA_VISION_MODEL: str = os.getenv("OLLAMA_VISION_MODEL", "llama3.2-vision")
    OLLAMA_EMBEDDING_MODEL: str = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    
    # Optional OpenAI-Compatible fallback
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Document & RAG Pipeline
    MAX_DOCUMENT_SIZE: int = int(os.getenv("MAX_DOCUMENT_SIZE", str(20 * 1024 * 1024)))
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "20"))
    RAG_RERANK_K: int = int(os.getenv("RAG_RERANK_K", "5"))
    AI_TIMEOUT_SECONDS: int = int(os.getenv("AI_TIMEOUT_SECONDS", "60"))
    DOCUMENTS_DIR: str = str(BASE_DIR / "uploaded_documents")

    class Config:
        case_sensitive = True
        env_file = str(BASE_DIR / ".env")
        extra = "allow"

def sanitize_db_url(url: str) -> str:
    if not url or url.startswith("sqlite"):
        return url
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://"):]
    elif url.startswith("postgresql+psycopg://"):
        url = "postgresql+psycopg2://" + url[len("postgresql+psycopg://"):]
    if "://" in url:
        scheme, rest = url.split("://", 1)
        if "@" in rest and "/" in rest:
            auth_and_host, path = rest.split("/", 1)
            r_at = auth_and_host.rfind("@")
            auth = auth_and_host[:r_at]
            host = auth_and_host[r_at + 1:]
            if ":" in auth:
                user, pwd = auth.split(":", 1)
                pwd_encoded = urllib.parse.quote(urllib.parse.unquote(pwd), safe="")
                return f"{scheme}://{user}:{pwd_encoded}@{host}/{path}"
    return url

settings = Settings()
settings.DATABASE_URL = sanitize_db_url(settings.DATABASE_URL)
