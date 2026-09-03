from typing import Optional
from pydantic import BaseModel


class InventoryCreate(BaseModel):
    product_id: int
    current_stock: int
    reorder_level: int


class InventoryUpdate(BaseModel):
    current_stock: Optional[int] = None
    reorder_level: Optional[int] = None


class InventoryResponse(InventoryCreate):
    id: int

    class Config:
        from_attributes = True


class InventoryWithProduct(BaseModel):
    id: int
    product_id: int
    product_name: str
    category: str
    sku: str
    price: float
    current_stock: int
    reorder_level: int
    is_low_stock: bool
    reorder_needed: int