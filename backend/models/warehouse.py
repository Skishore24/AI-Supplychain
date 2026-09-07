from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from db.base import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    code = Column(String, unique=True, index=True, nullable=False)
    location = Column(String, nullable=False, default="Central Hub")
    capacity = Column(Integer, default=50000, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    inventory_items = relationship("Inventory", back_populates="warehouse_rel")
