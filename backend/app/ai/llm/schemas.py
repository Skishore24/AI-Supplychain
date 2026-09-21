from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SourceCitation(BaseModel):
    document_name: str
    document_id: Optional[int] = None
    page: Optional[int] = None
    section: Optional[str] = None
    chunk_id: Optional[int] = None
    snippet: Optional[str] = None

class AIRecommendationResponse(BaseModel):
    recommendation_type: str = Field(..., description="supplier_selection, replenishment, risk_mitigation, procurement")
    entity_type: str = Field(..., description="product, supplier, inventory, purchase_order")
    entity_id: Optional[int] = None
    recommendation: str
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    risk_score: Optional[float] = Field(0.0, ge=0.0, le=100.0)
    reasoning: str
    supporting_data: Dict[str, Any] = Field(default_factory=dict)
    suggested_action: str
    sources: List[SourceCitation] = Field(default_factory=list)

class SupplierAlternative(BaseModel):
    supplier_id: int
    supplier_name: str
    price: float
    quality_score: float
    delivery_days: int
    reliability_score: float
    score: float

class SupplierSelectionResponse(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    recommended_supplier: Dict[str, Any]
    alternative_suppliers: List[Dict[str, Any]] = Field(default_factory=list)
    score: float
    confidence: Optional[float] = None
    expected_cost: float
    expected_delivery_days: int
    risk: str
    reasoning: str
    supporting_data: Dict[str, Any] = Field(default_factory=dict)
    sources: List[SourceCitation] = Field(default_factory=list)

class InventoryRiskItem(BaseModel):
    product_id: int
    sku: str
    product_name: str
    current_stock: int
    available_stock: int
    reserved_stock: int
    daily_demand: float
    days_of_inventory: float
    lead_time_days: int
    safety_stock: int
    reorder_point: int
    suggested_reorder_quantity: int
    expected_stockout_date: Optional[str] = None
    risk_level: str  # "CRITICAL", "WARNING", "OPTIMAL", "OVERSTOCK"
    reasoning: str
    recommended_supplier: Optional[str] = None

class RiskAnomalyItem(BaseModel):
    risk_type: str  # "stockout", "supplier_delay", "demand_spike", "demand_drop", "inventory_anomaly", "quality_decline", "price_variance"
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    probability: float
    impact: float
    risk_score: float
    reason: str
    recommended_action: str
    affected_entity: str
    supporting_data: Dict[str, Any] = Field(default_factory=dict)

class InvoiceLineItem(BaseModel):
    sku: Optional[str] = None
    product_name: str
    quantity: float
    unit_price: float
    total_price: float

class InvoiceExtractionResponse(BaseModel):
    supplier_name: str
    invoice_number: str
    invoice_date: Optional[str] = None
    items: List[InvoiceLineItem] = Field(default_factory=list)
    subtotal: float
    tax: float
    total_amount: float
    currency: str = "INR"
    confidence: Optional[float] = None
    notes: Optional[str] = None

class ProductPackagingInspectionResponse(BaseModel):
    product_identified: str
    packaging_condition: str  # "intact", "damaged", "seal_broken", "mismatched"
    defect_detected: bool
    defect_type: Optional[str] = None
    confidence: Optional[float] = None
    observations: List[str] = Field(default_factory=list)
    action_required: bool = False
