from datetime import date
from typing import Optional, List
from pydantic import BaseModel


class SaleCreate(BaseModel):
    product_id: int
    quantity_sold: int
    sale_date: Optional[date] = None


class BatchOrderItem(BaseModel):
    product_id: int
    quantity: int


class BatchOrderCreate(BaseModel):
    customer_name: Optional[str] = "Customer"
    customer_email: Optional[str] = ""
    shipping_address: Optional[str] = ""
    items: List[BatchOrderItem]


class SaleResponse(BaseModel):
    id: int
    product_id: int
    quantity_sold: int
    sale_date: date

    class Config:
        from_attributes = True


class EnrichedSaleResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    category: str
    unit_price: float
    quantity_sold: int
    total_revenue: float
    sale_date: date