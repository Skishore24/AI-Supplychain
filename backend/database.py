import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configurable database URL with default PostgreSQL or SQLite fallback
DEFAULT_PG = "postgresql+psycopg://postgres:Admin%40123@localhost:5432/supply_chain_db"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_PG)

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