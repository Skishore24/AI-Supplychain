from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.product import Product
from models.inventory import Inventory
from models.supplier import Supplier
from models.purchase_order import PurchaseOrder
from models.sales import Sale
from ai.tools.base_tool import AITool

class GetSupplyChainKPIsTool(AITool):
    name = "get_supply_chain_kpis"
    description = "Retrieve master supply chain operational KPIs: total inventory value, active suppliers, open POs, and sales velocity."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, **kwargs) -> Dict[str, Any]:
        total_products = db.query(Product).count()
        total_suppliers = db.query(Supplier).filter(Supplier.status == "active").count()
        total_stock_units = db.query(func.sum(Inventory.current_stock)).scalar() or 0
        open_pos = db.query(PurchaseOrder).filter(PurchaseOrder.status.in_(["draft", "pending", "approved", "sent"])).count()
        total_sales_revenue = db.query(func.sum(Sale.total_amount)).scalar() or 0.0

        return {
            "total_products": total_products,
            "active_suppliers": total_suppliers,
            "total_stock_units": total_stock_units,
            "open_purchase_orders": open_pos,
            "total_sales_revenue": round(float(total_sales_revenue), 2)
        }
