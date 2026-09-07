from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True) # Text category name for quick query
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    sku = Column(String, unique=True, nullable=False, index=True)
    brand = Column(String, nullable=True, default="Standard")
    price = Column(Float, nullable=False, default=0.0)
    cost_price = Column(Float, nullable=False, default=0.0)
    description = Column(Text, nullable=True, default="")
    image_url = Column(String, nullable=True, default="")
    status = Column(String, nullable=False, default="active") # "active", "archived"
    reorder_point = Column(Integer, nullable=False, default=15)
    safety_stock = Column(Integer, nullable=False, default=10)
    lead_time_days = Column(Integer, nullable=False, default=5)
    specifications = Column(Text, nullable=True, default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    category_rel = relationship("Category", back_populates="products")
    inventory_items = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")
    supplier_products = relationship("SupplierProduct", back_populates="product", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    ai_recommendations = relationship("AIRecommendation", back_populates="product")