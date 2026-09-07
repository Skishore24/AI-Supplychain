import os
import urllib.parse
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Automatically load environment variables from backend/.env or root .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass


def sanitize_db_url(url: str) -> str:
    """Ensure passwords with special characters (like '@') are properly percent-encoded."""
    if not url or url.startswith("sqlite"):
        return url
    # Ensure psycopg2 is used if generic postgresql:// or postgresql+psycopg:// is supplied
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
                # Unquote first to prevent double-encoding, then safely quote
                pwd_encoded = urllib.parse.quote(urllib.parse.unquote(pwd), safe="")
                return f"{scheme}://{user}:{pwd_encoded}@{host}/{path}"
    return url


# Configurable database URL with default PostgreSQL or SQLite fallback
DEFAULT_PG = "postgresql+psycopg2://postgres:Admin%40123@localhost:5432/supply_chain_db"
DATABASE_URL = sanitize_db_url(os.getenv("DATABASE_URL", DEFAULT_PG))

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL)
        # Test connection
        with engine.connect() as conn:
            pass
except Exception as e:
    print(f"Warning: Primary database connection failed ({e}). Falling back to local SQLite.")
    DATABASE_URL = "sqlite:///./supply_chain.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()