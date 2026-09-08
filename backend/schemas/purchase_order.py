from datetime import datetime, date
from typing import List, Optional, Any
from pydantic import BaseModel, model_validator

class POItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: Optional[float] = 0.0
    unit_price: Optional[float] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_cost_and_price(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if data.get("unit_cost") is None and data.get("unit_price") is not None:
                data["unit_cost"] = float(data["unit_price"])
            elif data.get("unit_cost") is not None and data.get("unit_price") is None:
                data["unit_price"] = float(data["unit_cost"])
            elif data.get("unit_cost") is None:
                data["unit_cost"] = 0.0
                data["unit_price"] = 0.0
        return data

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
    received_quantity: Optional[int] = 0
    quantity_received: Optional[int] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_qty(cls, data: Any) -> Any:
        if isinstance(data, dict):
            qty = data.get("received_quantity") if data.get("received_quantity") is not None else data.get("quantity_received", 0)
            data["received_quantity"] = qty
            data["quantity_received"] = qty
        return data

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
