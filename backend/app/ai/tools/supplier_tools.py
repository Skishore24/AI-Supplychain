from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.services.supplier_service import supplier_service
from app.models.supplier import Supplier

class EvaluateSuppliersInput(BaseModel):
    product_id: int = Field(..., description="ID of product for multi-criteria vendor evaluation")

class GetSuppliersTool(AITool):
    name = "get_suppliers"
    description = "List all active suppliers, ratings, lead-time parameters, and contact points."
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        suppliers = db.query(Supplier).filter(
            Supplier.organization_id == organization_id,
            Supplier.status == "active"
        ).all()
        return {
            "total_suppliers": len(suppliers),
            "suppliers": [
                {
                    "id": s.id,
                    "name": s.name,
                    "quality_score": s.quality_score,
                    "delivery_days": s.delivery_days,
                    "reliability_score": s.reliability_score,
                    "category": s.category,
                    "email": s.email
                }
                for s in suppliers
            ]
        }

class EvaluateSuppliersTool(AITool):
    name = "evaluate_suppliers"
    description = "Rank available suppliers for a SKU using deterministic weights (Price 40%, Quality 35%, Delivery 15%, Reliability 10%)."
    input_schema = EvaluateSuppliersInput
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        result = supplier_service.evaluate_suppliers_for_product(
            db=db,
            organization_id=organization_id,
            product_id=params["product_id"]
        )
        return result
