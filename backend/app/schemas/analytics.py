from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class TopProductItem(BaseModel):
    id: int
    name: str
    sku: str
    units: int
    revenue: float

class CategoryBreakdownItem(BaseModel):
    category: str
    units: int
    revenue: float

class ExecutiveAnalyticsOverview(BaseModel):
    timeframe: str
    total_revenue: float
    total_units_sold: int
    order_count: int
    average_order_value: float
    inventory_valuation: float
    total_inventory_units: int
    low_stock_sku_count: int
    stockout_sku_count: int
    active_supplier_count: int
    pending_po_count: int
    top_selling_products: List[TopProductItem]
    category_distribution: List[CategoryBreakdownItem]
    accuracy_score: float
