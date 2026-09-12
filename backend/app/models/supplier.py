from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    product_name = Column(String, nullable=False, default="General Components") # Legacy support
    price = Column(Float, nullable=False, default=0.0) # Base unit cost / quote
    quality_score = Column(Float, nullable=False, default=90.0)
    delivery_days = Column(Integer, nullable=False, default=5)
    reliability_score = Column(Float, nullable=False, default=92.0)
    email = Column(String, nullable=True, default="")
    phone = Column(String, nullable=True, default="")
    address = Column(String, nullable=True, default="")
    category = Column(String, nullable=True, default="Electronics & Hardware")
    status = Column(String, nullable=False, default="active") # "active", "archived", "review"
    overall_score = Column(Float, nullable=False, default=88.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    supplier_products = relationship("SupplierProduct", back_populates="supplier", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
    evaluations = relationship("SupplierEvaluation", back_populates="supplier")