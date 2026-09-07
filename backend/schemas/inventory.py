from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class InventoryCreate(BaseModel):
    product_id: int
    warehouse_id: Optional[int] = None
    current_stock: int
    reorder_level: Optional[int] = 10
    safety_stock: Optional[int] = 10

class InventoryUpdate(BaseModel):
    current_stock: Optional[int] = None
    reserved_stock: Optional[int] = None
    reorder_level: Optional[int] = None
    safety_stock: Optional[int] = None
    warehouse_id: Optional[int] = None

class InventoryAdjustment(BaseModel):
    adjustment: int # e.g. +50 or -10
    reason: str # "Audit adjustment", "Cycle count discrepancy", "Damaged units written off"

class InventoryResponse(BaseModel):
    id: int
    product_id: int
    warehouse_id: Optional[int] = None
    current_stock: int
    reserved_stock: int
    reorder_level: int
    safety_stock: int
    available_stock: int
    last_restocked_at: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class InventoryDetailedResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    category: str
    brand: Optional[str] = "Standard"
    price: float
    cost_price: float
    warehouse_name: str
    current_stock: int
    reserved_stock: int
    available_stock: int
    reorder_level: int
    safety_stock: int
    days_remaining: float
    status: str # "Healthy", "Low", "Critical", "Out of Stock", "Overstock"
    recommended_reorder_qty: int
    recommended_supplier: str
    updated_at: datetime

InventoryWithProduct = InventoryDetailedResponse