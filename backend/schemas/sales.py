from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel

class SaleCreate(BaseModel):
    product_id: int
    quantity_sold: int
    sale_date: Optional[date] = None

class SaleResponse(BaseModel):
    id: int
    product_id: int
    order_id: Optional[int] = None
    quantity_sold: int
    sale_date: date
    unit_price: float = 0.0
    total_amount: float = 0.0
    currency: str = "INR"
    transaction_ref: Optional[str] = None
    created_at: Optional[datetime] = None

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

class BatchOrderItem(BaseModel):
    product_id: int
    quantity: int

class BatchOrderCreate(BaseModel):
    customer_name: Optional[str] = "Customer"
    customer_email: Optional[str] = "customer@emox.ai"
    shipping_address: Optional[str] = "123 Supply Chain Ave"
    payment_method: Optional[str] = "UPI"
    payment_currency: Optional[str] = "INR"
    amount_inr: Optional[float] = None
    items: List[BatchOrderItem]

class CategorySalesSummary(BaseModel):
    category: str
    units: int
    revenue: float

class SalesAnalyticsResponse(BaseModel):
    total_revenue: float
    total_units_sold: int
    total_orders: int
    average_order_value: float
    growth_rate: float
    category_breakdown: List[CategorySalesSummary]