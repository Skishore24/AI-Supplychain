import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import date, timedelta
from sqlalchemy import func

from app.models.sales import Sale
from app.models.supplier import Supplier
from app.models.purchase_order import PurchaseOrder

def extract_anomaly_features(db: Session) -> Dict[str, Any]:
    """
    Extracts aggregated behavioral statistics for anomaly detection.
    """
    today = date.today()
    seven_days = today - timedelta(days=7)
    thirty_days = today - timedelta(days=30)

    # Sales surges and drops
    sales_7 = db.query(Sale.product_id, func.sum(Sale.quantity_sold)).filter(
        Sale.sale_date >= seven_days
    ).group_by(Sale.product_id).all()

    sales_30 = db.query(Sale.product_id, func.sum(Sale.quantity_sold)).filter(
        Sale.sale_date >= thirty_days
    ).group_by(Sale.product_id).all()

    rates_7 = {r[0]: float(r[1]) / 7.0 for r in sales_7}
    rates_30 = {r[0]: float(r[1]) / 30.0 for r in sales_30}

    # Supplier quality & delay indicators
    suppliers = db.query(Supplier).all()
    sup_metrics = {
        s.id: {
            "name": s.name,
            "quality": float(s.quality_score),
            "delivery_days": s.delivery_days,
            "reliability": float(s.reliability_score)
        }
        for s in suppliers
    }

    return {
        "velocity_7d": rates_7,
        "velocity_30d": rates_30,
        "suppliers": sup_metrics
    }
