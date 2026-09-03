from sqlalchemy.orm import Session
from models.supplier import Supplier
from models.product import Product
from models.inventory import Inventory
from models.sales import Sale


def calculate_supplier_score(supplier: Supplier, min_price: float, max_price: float):
    """
    Calculate supplier score based on:
    - Price: 40% (lower is better)
    - Quality: 35% (higher is better)
    - Delivery speed: 25% (lower days is better)
    """
    if max_price == min_price:
        price_score = 100.0
    else:
        price_score = (
            (max_price - supplier.price)
            / (max_price - min_price)
        ) * 100.0

    quality_score = float(supplier.quality_score)
    delivery_score = max(0.0, 100.0 - (supplier.delivery_days * 10.0))

    final_score = (
        price_score * 0.40
        + quality_score * 0.35
        + delivery_score * 0.25
    )

    return round(final_score, 2)


def recommend_supplier(
    db: Session,
    product_name: str
):
    suppliers = db.query(Supplier).filter(
        Supplier.product_name.ilike(f"%{product_name}%")
    ).all()

    if not suppliers:
        return None

    prices = [supplier.price for supplier in suppliers]
    min_price = min(prices)
    max_price = max(prices)

    recommendations = []
    for supplier in suppliers:
        score = calculate_supplier_score(
            supplier,
            min_price,
            max_price
        )

        recommendations.append({
            "id": supplier.id,
            "name": supplier.name,
            "product_name": supplier.product_name,
            "price": supplier.price,
            "quality_score": supplier.quality_score,
            "delivery_days": supplier.delivery_days,
            "overall_score": score
        })

    recommendations.sort(
        key=lambda s: s["overall_score"],
        reverse=True
    )

    return recommendations


def get_inventory_intelligence(db: Session):
    """
    Agent 2: Inventory Optimization & Restock Risk Agent
    """
    inventory_items = db.query(Inventory, Product).join(
        Product, Inventory.product_id == Product.id
    ).all()

    alerts = []
    total_stock_units = 0
    total_inventory_value = 0.0
    critical_count = 0

    for inv, prod in inventory_items:
        total_stock_units += inv.current_stock
        price = prod.price or 0.0
        total_inventory_value += price * inv.current_stock

        is_critical = inv.current_stock == 0
        is_warning = inv.current_stock <= inv.reorder_level

        if is_warning:
            if is_critical:
                critical_count += 1
                severity = "CRITICAL"
                action = f"Immediate restock required! Out of stock for {prod.name}."
            else:
                severity = "WARNING"
                action = f"Stock level ({inv.current_stock}) is at or below reorder threshold ({inv.reorder_level})."

            suggested_reorder = max(10, (inv.reorder_level * 2) - inv.current_stock)

            # Check if there is a recommended supplier for this product
            best_sup = recommend_supplier(db, prod.name)
            recommended_supplier_name = best_sup[0]["name"] if best_sup else "No supplier listed"

            alerts.append({
                "product_id": prod.id,
                "product_name": prod.name,
                "sku": prod.sku,
                "category": prod.category,
                "current_stock": inv.current_stock,
                "reorder_level": inv.reorder_level,
                "severity": severity,
                "suggested_reorder_units": suggested_reorder,
                "recommended_supplier": recommended_supplier_name,
                "action_recommendation": action
            })

    return {
        "total_stock_units": total_stock_units,
        "total_inventory_value": round(total_inventory_value, 2),
        "total_items_tracked": len(inventory_items),
        "low_stock_alerts_count": len(alerts),
        "critical_out_of_stock_count": critical_count,
        "alerts": alerts
    }


def get_supply_chain_summary(db: Session):
    """
    Master Multi-Agent System Overview
    """
    product_count = db.query(Product).count()
    supplier_count = db.query(Supplier).count()
    inventory_summary = get_inventory_intelligence(db)
    sales = db.query(Sale, Product).join(Product, Sale.product_id == Product.id).all()

    total_revenue = sum((prod.price or 0.0) * sale.quantity_sold for sale, prod in sales)
    total_sales_units = sum(sale.quantity_sold for sale, prod in sales)

    # Health score calculation (0 - 100)
    health_score = 100
    if inventory_summary["total_items_tracked"] > 0:
        stockout_ratio = inventory_summary["low_stock_alerts_count"] / inventory_summary["total_items_tracked"]
        health_score -= min(50, int(stockout_ratio * 60))

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
        "critical_out_of_stock_count": inventory_summary["critical_out_of_stock_count"]
    }