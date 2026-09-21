from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    plan = Column(String, nullable=False, default="starter") # "starter", "professional", "enterprise"
    is_active = Column(Boolean, default=True, nullable=False)
    settings = Column(Text, nullable=True, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    memberships = relationship("OrganizationMembership", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization")

class OrganizationMembership(Base):
    __tablename__ = "organization_memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False, default="MEMBER") # "SUPER_ADMIN", "ORG_ADMIN", "MANAGER", "ANALYST", "MEMBER"
    is_default = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="memberships")
