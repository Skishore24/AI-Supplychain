"""
Compatibility module mapping legacy database imports to modern db/session and db/base.
"""
from core.config import settings
from db.base import Base
from db.session import engine, SessionLocal, get_db

DATABASE_URL = settings.DATABASE_URL

__all__ = ["Base", "engine", "SessionLocal", "get_db", "DATABASE_URL"]