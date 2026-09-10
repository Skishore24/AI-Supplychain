from datetime import datetime, timezone
from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from db.base import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, unique=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    current_stock = Column(Integer, nullable=False, default=0) # Total physical units on hand
    reserved_stock = Column(Integer, nullable=False, default=0) # Units committed to active orders
    reorder_level = Column(Integer, nullable=False, default=10) # Threshold triggering restock
    safety_stock = Column(Integer, nullable=False, default=10) # Minimum emergency buffer
    last_restocked_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="inventory_items")
    warehouse_rel = relationship("Warehouse", back_populates="inventory_items")

    @property
    def available_stock(self) -> int:
        return max(0, self.current_stock - self.reserved_stock)