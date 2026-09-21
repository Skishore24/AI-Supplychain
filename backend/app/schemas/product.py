from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    category: str
    category_id: Optional[int] = None
    sku: str
    brand: Optional[str] = "Standard"
    price: float
    cost_price: Optional[float] = 0.0
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    status: Optional[str] = "active"
    reorder_point: Optional[int] = 15
    safety_stock: Optional[int] = 10
    lead_time_days: Optional[int] = 5
    specifications: Optional[str] = "{}"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[int] = None
    sku: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    reorder_point: Optional[int] = None
    safety_stock: Optional[int] = None
    lead_time_days: Optional[int] = None
    specifications: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    category_id: Optional[int] = None
    sku: str
    brand: Optional[str] = "Standard"
    price: float
    cost_price: float = 0.0
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    status: str = "active"
    reorder_point: int = 15
    safety_stock: int = 10
    lead_time_days: int = 5
    specifications: Optional[str] = "{}"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Enriched stock data if joined
    current_stock: Optional[int] = None
    available_stock: Optional[int] = None
    stock_status: Optional[str] = None

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    reserved_stock: Optional[int] = 0
    days_of_inventory: Optional[float] = 0.0
    daily_velocity: Optional[float] = 0.0
    total_sales_units: Optional[int] = 0
    total_revenue: Optional[float] = 0.0
    suppliers_count: Optional[int] = 0
    suppliers_comparison: Optional[List[dict]] = []

ProductOut = ProductResponse
ProductListItem = ProductResponse