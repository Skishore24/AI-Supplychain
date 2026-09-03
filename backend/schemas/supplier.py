from typing import Optional
from pydantic import BaseModel


class SupplierCreate(BaseModel):
    name: str
    product_name: str
    price: float
    quality_score: float
    delivery_days: int


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    product_name: Optional[str] = None
    price: Optional[float] = None
    quality_score: Optional[float] = None
    delivery_days: Optional[int] = None


class SupplierResponse(SupplierCreate):
    id: int

    class Config:
        from_attributes = True