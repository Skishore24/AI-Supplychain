from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.db.base import Base

class SupplierProduct(Base):
    __tablename__ = "supplier_products"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    unit_cost = Column(Float, nullable=False)
    lead_time_days = Column(Integer, nullable=False, default=5)
    quality_score = Column(Float, nullable=False, default=90.0)
    reliability_score = Column(Float, nullable=False, default=92.0)
    min_order_qty = Column(Integer, nullable=False, default=10)
    is_preferred = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    supplier = relationship("Supplier", back_populates="supplier_products")
    product = relationship("Product", back_populates="supplier_products")
