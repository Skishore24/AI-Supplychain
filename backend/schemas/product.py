from typing import Optional
from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    category: str
    sku: str
    price: Optional[float] = 0.0
    description: Optional[str] = ""


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True