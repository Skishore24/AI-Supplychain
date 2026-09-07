from sqlalchemy.orm import Session
from datetime import datetime, timezone
from models.product import Product
from models.supplier import Supplier
from models.inventory import Inventory
from models.sales import Sale
from models.purchase_order import PurchaseOrder

from agents.supplier_agent import evaluate_suppliers_for_product
from agents.inventory_agent import calculate_inventory_intelligence

def calculate_supplier_score(supplier: Supplier, min_price: float, max_price: float):
    if max_price == min_price:
        price_score = 100.0
    else:
        price_score = max(0.0, ((max_price - supplier.price) / (max_price - min_price)) * 100.0)

    quality_score = float(supplier.quality_score)
    delivery_score = max(0.0, 100.0 - (supplier.delivery_days * 10.0))
    reliability_score = float(supplier.reliability_score or 90.0)

    final_score = (
        price_score * 0.40
        + quality_score * 0.35
        + delivery_score * 0.15
        + reliability_score * 0.10
    )
    return round(final_score, 2)

def recommend_supplier(db: Session, product_name: str):
    res = evaluate_suppliers_for_product(db, product_name)
    all_sups = res.get("all_suppliers", [])
    if not all_sups:
        return None
    # Map overall_score
    for s in all_sups:
        s["overall_score"] = s["final_score"]
    return all_sups

def get_inventory_intelligence(db: Session):
    return calculate_inventory_intelligence(db)

def get_supply_chain_summary(db: Session):
    product_count = db.query(Product).count()
    supplier_count = db.query(Supplier).count()
    inventory_summary = get_inventory_intelligence(db)
    
    # Calculate revenue from Sale records
    sales = db.query(Sale, Product).join(Product, Sale.product_id == Product.id).all()
    total_revenue = sum(
        sale.total_amount if sale.total_amount > 0 else (prod.price or 0.0) * sale.quantity_sold
        for sale, prod in sales
    )
    total_sales_units = sum(sale.quantity_sold for sale, _ in sales)
    
    active_pos = db.query(PurchaseOrder).filter(
        PurchaseOrder.status.in_(["pending_approval", "approved", "sent", "partially_received"])
    ).count()

    health_score = 100
    if inventory_summary["total_items_tracked"] > 0:
        ratio = inventory_summary["low_stock_alerts_count"] / inventory_summary["total_items_tracked"]
        health_score -= min(50, int(ratio * 60))
    if supplier_count == 0:
        health_score -= 20

    return {
        "supply_chain_health_score": max(20, health_score),
        "total_products": product_count,
        "total_suppliers": supplier_count,
        "total_inventory_value": inventory_summary["total_inventory_value"],
        "total_stock_units": inventory_summary["total_stock_units"],
        "total_revenue": round(total_revenue, 2),
        "total_sales_units": total_sales_units,
        "low_stock_alerts_count": inventory_summary["low_stock_alerts_count"],
        "critical_out_of_stock_count": inventory_summary["critical_out_of_stock_count"],
        "active_purchase_orders_count": active_pos,
        "system_status": "Operational & Synced",
        "last_sync": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    }