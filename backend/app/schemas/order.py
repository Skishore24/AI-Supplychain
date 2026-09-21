from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    total_price: float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: Optional[str] = "Customer"
    customer_email: Optional[str] = "customer@emox.ai"
    shipping_address: str
    payment_method: Optional[str] = "UPI"
    payment_currency: Optional[str] = "INR"
    notes: Optional[str] = ""
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str # "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int] = None
    customer_name: str
    customer_email: str
    shipping_address: str
    payment_method: str
    payment_currency: str
    payment_status: str
    transaction_id: Optional[str] = None
    status: str
    subtotal: float
    tax: float
    shipping_cost: float
    total_amount: float
    created_at: datetime
    updated_at: datetime
    items_count: int = 0

    class Config:
        from_attributes = True

class OrderDetailResponse(OrderResponse):
    items: List[OrderItemResponse]
