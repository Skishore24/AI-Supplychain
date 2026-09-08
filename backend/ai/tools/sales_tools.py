from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from models.sales import Sale
from models.product import Product
from ai.tools.base_tool import AITool

class GetSalesHistoryTool(AITool):
    name = "get_sales_history"
    description = "Fetch daily sales history for a product across a specified number of days (e.g. 30, 60, 90)."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, product_id: int = 0, days: int = 30, **kwargs) -> Dict[str, Any]:
        since_date = date.today() - timedelta(days=days)
        sales = db.query(Sale).filter(
            Sale.product_id == product_id,
            Sale.sale_date >= since_date
        ).order_by(Sale.sale_date.asc()).all()

        total_units = sum(s.quantity_sold for s in sales)
        daily_records = [{"date": str(s.sale_date), "quantity": s.quantity_sold, "channel": s.channel} for s in sales]

        return {
            "product_id": product_id,
            "period_days": days,
            "total_units_sold": total_units,
            "average_daily_run_rate": round(total_units / max(1, days), 2),
            "records_count": len(sales),
            "daily_sales": daily_records
        }

class GetSalesAnalyticsTool(AITool):
    name = "get_sales_analytics"
    description = "Aggregate sales velocity and revenue trends across all products or categories."
    is_write = False
    requires_auth = False

    def execute(self, db: Session, user: Optional[Any] = None, days: int = 30, **kwargs) -> Dict[str, Any]:
        since_date = date.today() - timedelta(days=days)
        sales_by_prod = db.query(
            Sale.product_id,
            func.sum(Sale.quantity_sold).label("units_sold")
        ).filter(Sale.sale_date >= since_date).group_by(Sale.product_id).all()

        return {
            "timeframe_days": days,
            "products_analyzed": len(sales_by_prod),
            "summary": [{"product_id": p_id, "units_sold": units} for p_id, units in sales_by_prod]
        }
