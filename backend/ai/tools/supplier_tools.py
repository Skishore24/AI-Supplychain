from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from models.supplier import Supplier
from models.product import Product
from models.purchase_order import PurchaseOrder
from ai.tools.base_tool import AITool

class GetSupplierTool(AITool):
    name = "get_supplier"
    description = "Retrieve supplier profile, pricing, lead time, and reliability metrics by supplier ID."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, supplier_id: int = 0, **kwargs) -> Dict[str, Any]:
        sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not sup:
            return {"found": False, "message": f"Supplier with ID {supplier_id} not found."}
        return {
            "found": True,
            "supplier": {
                "id": sup.id,
                "name": sup.name,
                "email": sup.email,
                "phone": sup.phone,
                "category": sup.category,
                "product_name": sup.product_name,
                "price": sup.price,
                "delivery_days": sup.delivery_days,
                "quality_score": sup.quality_score,
                "reliability_score": sup.reliability_score,
                "status": sup.status
            }
        }

class GetSupplierPerformanceTool(AITool):
    name = "get_supplier_performance"
    description = "Fetch historical PO delivery track record and fulfillment rates for a supplier."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, supplier_id: int = 0, **kwargs) -> Dict[str, Any]:
        sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not sup:
            return {"found": False, "message": f"Supplier {supplier_id} not found."}
        
        pos = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id).all()
        total_pos = len(pos)
        completed_pos = sum(1 for p in pos if p.status == "received")
        
        return {
            "supplier_id": supplier_id,
            "supplier_name": sup.name,
            "total_purchase_orders": total_pos,
            "completed_orders": completed_pos,
            "quality_rating": sup.quality_score,
            "turnaround_days": sup.delivery_days,
            "on_time_reliability": sup.reliability_score
        }
