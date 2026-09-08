from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from models.product import Product
from models.inventory import Inventory
from ai.tools.base_tool import AITool

class GetProductTool(AITool):
    name = "get_product"
    description = "Retrieve detailed information for a specific product by its integer ID."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, product_id: int = 0, **kwargs) -> Dict[str, Any]:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return {"found": False, "message": f"Product with ID {product_id} not found."}
        inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        return {
            "found": True,
            "product": {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "category": product.category,
                "price": product.price,
                "cost_price": product.cost_price,
                "status": product.status,
                "lead_time_days": product.lead_time_days or 5,
                "safety_stock": product.safety_stock or 10,
                "reorder_point": product.reorder_point or 15,
                "current_stock": inv.current_stock if inv else 0,
                "available_stock": (inv.current_stock - inv.reserved_stock) if inv else 0
            }
        }


class GetProductBySKUTool(AITool):
    name = "get_product_by_sku"
    description = "Retrieve product data by unique SKU code."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, sku: str = "", **kwargs) -> Dict[str, Any]:
        clean_sku = (sku or "").strip()
        product = db.query(Product).filter(Product.sku.ilike(f"%{clean_sku}%")).first()
        if not product:
            return {"found": False, "message": f"Product with SKU '{sku}' not found."}
        inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        return {
            "found": True,
            "product": {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "category": product.category,
                "price": product.price,
                "cost_price": product.cost_price,
                "lead_time_days": product.lead_time_days or 5,
                "safety_stock": product.safety_stock or 10,
                "reorder_point": product.reorder_point or 15,
                "current_stock": inv.current_stock if inv else 0,
                "available_stock": (inv.current_stock - inv.reserved_stock) if inv else 0
            }
        }
