from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel

class POItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float

class POItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: int
    received_quantity: int
    unit_cost: float
    total_cost: float

    class Config:
        from_attributes = True

class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    expected_delivery: Optional[date] = None
    notes: Optional[str] = ""
    items: List[POItemCreate]

class PurchaseOrderStatusUpdate(BaseModel):
    status: str # "draft", "pending_approval", "approved", "sent", "partially_received", "received", "cancelled", "rejected"
    notes: Optional[str] = None

class PurchaseOrderReceiveItem(BaseModel):
    item_id: int
    received_quantity: int

class PurchaseOrderReceiveRequest(BaseModel):
    received_items: List[PurchaseOrderReceiveItem]
    notes: Optional[str] = "Stock received in central warehouse"

class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    supplier_id: int
    supplier_name: str
    status: str
    total_cost: float
    expected_delivery: Optional[date] = None
    actual_delivery: Optional[date] = None
    created_by: str
    approved_by: Optional[str] = None
    notes: Optional[str] = ""
    created_at: datetime
    updated_at: datetime
    items_count: int = 0

    class Config:
        from_attributes = True

class PurchaseOrderDetailResponse(PurchaseOrderResponse):
    items: List[POItemResponse]
