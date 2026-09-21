from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class SupplierCreate(BaseModel):
    name: str
    product_name: Optional[str] = "General Components"
    price: Optional[float] = 0.0
    quality_score: Optional[float] = 90.0
    delivery_days: Optional[int] = 5
    reliability_score: Optional[float] = 90.0
    email: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    category: Optional[str] = "Electronics & Hardware"
    status: Optional[str] = "active"

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    product_name: Optional[str] = None
    price: Optional[float] = None
    quality_score: Optional[float] = None
    delivery_days: Optional[int] = None
    reliability_score: Optional[float] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None

class SupplierResponse(BaseModel):
    id: int
    name: str
    product_name: str
    price: float
    quality_score: float
    delivery_days: int
    reliability_score: float
    email: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    category: Optional[str] = "Electronics & Hardware"
    status: str
    overall_score: float
    created_at: datetime
    updated_at: datetime

    # Summary metrics
    products_count: Optional[int] = 0
    open_pos_count: Optional[int] = 0

    class Config:
        from_attributes = True

class SupplierComparisonItem(BaseModel):
    id: int
    name: str
    price: float
    quality_score: float
    delivery_days: int
    reliability_score: float
    price_score: float
    final_score: float
    rank: int
    is_recommended: bool
    explanation: str

class SupplierComparisonResponse(BaseModel):
    product_name: str
    recommended_supplier: SupplierComparisonItem
    all_suppliers: List[SupplierComparisonItem]
    decision_rationale: str

SupplierOut = SupplierResponse