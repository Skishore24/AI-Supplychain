from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.db.base import Base

try:
    if settings.DATABASE_URL.startswith("sqlite"):
        engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20
        )
        with engine.connect() as conn:
            pass
except Exception as e:
    settings.DATABASE_URL = settings.SQLITE_FALLBACK_URL
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
