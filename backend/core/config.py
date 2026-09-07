import os
import urllib.parse
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Base directory for backend
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent Supply Chain AI"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:Admin%40123@localhost:5432/supply_chain_db"
    )
    
    # JWT Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", "emox_enterprise_supply_chain_super_secret_jwt_key_2026_x9")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Fallback to local sqlite if postgres fails
    SQLITE_FALLBACK_URL: str = f"sqlite:///{BASE_DIR}/supply_chain.db"

    class Config:
        case_sensitive = True
        env_file = str(BASE_DIR / ".env")
        extra = "allow"

def sanitize_db_url(url: str) -> str:
    """Ensure passwords with special characters (like '@') are properly percent-encoded."""
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
