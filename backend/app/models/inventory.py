from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.db.base import Base

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
    status = Column(String, nullable=False, default="optimal") # "optimal", "low_stock", "out_of_stock", "overstocked"
    last_restocked_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="inventory_items")
    warehouse_rel = relationship("Warehouse", back_populates="inventory_items")
    movements = relationship("InventoryMovement", back_populates="inventory", cascade="all, delete-orphan")

    @property
    def available_stock(self) -> int:
        return max(0, self.current_stock - self.reserved_stock)


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True, default=1)
    quantity = Column(Integer, nullable=False)
    movement_type = Column(String, nullable=False) # "IN", "OUT", "ADJUSTMENT", "RETURN", "RESTOCK"
    reference_id = Column(String, nullable=True) # PO-xxx, ORD-xxx, or reason
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    inventory = relationship("Inventory", back_populates="movements")
    product = relationship("Product")