from typing import Dict, Any, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field

from app.ai.tools.base_tool import AITool, ToolPermissionLevel
from app.models.sales import Sale
from app.models.product import Product

class GetSalesHistoryInput(BaseModel):
    product_id: Optional[int] = Field(None, description="Filter sales by product ID")
    days: int = Field(30, description="Historical lookback window in days")

class GetSalesHistoryTool(AITool):
    name = "get_sales_history"
    description = "Retrieve historical transaction volumes, revenue, and daily burn-rates for demand analysis."
    input_schema = GetSalesHistoryInput
    permission_level = ToolPermissionLevel.READ

    def execute(self, db: Session, user: Optional[Any] = None, organization_id: int = 1, **kwargs) -> Dict[str, Any]:
        params = self.validate_inputs(**kwargs)
        days = params.get("days", 30)
        p_id = params.get("product_id")
        cutoff = date.today() - timedelta(days=days)

        query = db.query(Sale, Product).join(Product, Sale.product_id == Product.id).filter(
            Sale.organization_id == organization_id,
            Sale.sale_date >= cutoff
        )
        if p_id:
            query = query.filter(Sale.product_id == p_id)

        sales = query.order_by(Sale.sale_date.desc()).limit(100).all()

        total_units = sum(s.quantity_sold for s, _ in sales)
        total_rev = sum(s.total_amount if s.total_amount > 0 else (p.price or 0.0) * s.quantity_sold for s, p in sales)
        daily_velocity = round(total_units / max(1, days), 2)

        return {
            "period_days": days,
            "total_transactions": len(sales),
            "total_units_sold": total_units,
            "total_revenue": round(total_rev, 2),
            "daily_velocity": daily_velocity,
            "recent_records": [
                {
                    "date": s.sale_date.isoformat(),
                    "product_name": p.name,
                    "sku": p.sku,
                    "quantity": s.quantity_sold,
                    "total": s.total_amount
                }
                for s, p in sales[:10]
            ]
        }
