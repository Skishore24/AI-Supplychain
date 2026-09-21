from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.services.inventory_service import inventory_service

class GetInventoryInput(BaseModel):
    product_id: Optional[int] = Field(None, description="Target product ID. If omitted, returns organization catalog.")

class AdjustInventoryInput(BaseModel):
    product_id: int = Field(..., description="ID of product to adjust")
    new_quantity: int = Field(..., ge=0, description="New physical unit quantity")
    reason: str = Field("AI Automated Restock Adjustment", description="Audit reason for adjustment")

class GetInventoryTool(AITool):
    name = "get_inventory"
    description = "Retrieve current inventory levels, reserved stock, coverage days, and warehouse positions for a product or full catalog."
    input_schema = GetInventoryInput
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        result = inventory_service.get_inventory_status(
            db,
            organization_id=organization_id,
            product_id=params.get("product_id")
        )
        return result

class GetInventoryRiskTool(AITool):
    name = "get_inventory_risk"
    description = "Compute stockout run-rate, days of coverage, and identify depleted SKUs requiring replenishment."
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        inv_data = inventory_service.get_inventory_status(db, organization_id=organization_id)
        risky_items = [item for item in inv_data["items"] if item["health_status"] != "HEALTHY"]
        return {
            "total_at_risk": len(risky_items),
            "critical_stockout_count": inv_data["stockout_count"],
            "low_stock_count": inv_data["low_stock_count"],
            "items": risky_items
        }

class AdjustInventoryTool(AITool):
    name = "adjust_inventory"
    description = "Authorized action to adjust physical on-hand inventory units with full audit logging."
    input_schema = AdjustInventoryInput
    permission_level = ToolPermissionLevel.WRITE

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        if not self.check_authorization(user):
            return {"success": False, "error": "Unauthorized: Only managers and admins can adjust physical inventory."}

        params = self.validate_inputs(**kwargs)
        res = inventory_service.adjust_stock(
            db,
            organization_id=organization_id,
            product_id=params["product_id"],
            new_quantity=params["new_quantity"],
            reason=params["reason"]
        )
        self.audit_execution(
            db=db,
            user=user,
            organization_id=organization_id,
            action="INVENTORY_ADJUSTED",
            entity="Inventory",
            entity_id=params["product_id"],
            details=res
        )
        return res
