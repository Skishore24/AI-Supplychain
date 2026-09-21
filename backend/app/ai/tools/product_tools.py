from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.models.product import Product

class GetProductBySKUInput(BaseModel):
    sku: str = Field(..., description="Unique product SKU to query")

class GetProductBySKUTool(AITool):
    name = "get_product_by_sku"
    description = "Retrieve detailed specifications, pricing, and category info for a given SKU."
    input_schema = GetProductBySKUInput
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        sku = params["sku"].strip()
        prod = db.query(Product).filter(
            Product.sku.ilike(sku),
            Product.organization_id == organization_id
        ).first()

        if not prod:
            return {"found": False, "message": f"SKU {sku} not found in this organization."}

        return {
            "found": True,
            "product": {
                "id": prod.id,
                "name": prod.name,
                "sku": prod.sku,
                "category": prod.category,
                "price": prod.price,
                "cost_price": prod.cost_price,
                "reorder_point": prod.reorder_point,
                "safety_stock": prod.safety_stock,
                "lead_time_days": prod.lead_time_days
            }
        }
