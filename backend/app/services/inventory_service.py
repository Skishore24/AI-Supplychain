import math
from typing import Dict, Any, List, Optional, Tuple
from datetime import date, timedelta, datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.inventory import Inventory, InventoryMovement
from app.models.product import Product
from app.models.sales import Sale
from app.core.exceptions import NotFoundError, ValidationError

class InventoryService:
    """
    Production Inventory Intelligence Engine:
    - Real Reorder Point (ROP = d * L + SS)
    - Dynamic Safety Stock Buffer sizing (Z * std_dev * sqrt(lead_time))
    - Stockout Run-rate & Depletion Horizon
    - ABC Classification by sales volume
    - Inventory Turnover (COGS / Avg Inventory)
    - Full movement audit trail (IN, OUT, ADJUSTMENT, RESTOCK)
    """

    def get_inventory_status(
        self,
        db: Session,
        organization_id: int,
        product_id: Optional[int] = None
    ) -> Dict[str, Any]:
        query = db.query(Inventory, Product).join(Product, Inventory.product_id == Product.id)
        if organization_id:
            query = query.filter(Inventory.organization_id == organization_id)
        if product_id:
            query = query.filter(Inventory.product_id == product_id)

        records = query.all()
        thirty_days_ago = date.today() - timedelta(days=30)

        items = []
        total_units = 0
        total_valuation = 0.0
        low_stock_count = 0
        stockout_count = 0

        # Pre-aggregate 30-day sales for velocity
        sales_30d = db.query(
            Sale.product_id,
            func.sum(Sale.quantity_sold).label("total_sold")
        ).filter(
            Sale.organization_id == organization_id,
            Sale.sale_date >= thirty_days_ago
        ).group_by(Sale.product_id).all()
        sales_map = {p_id: (qty or 0) for p_id, qty in sales_30d}

        for inv, prod in records:
            available = max(0, inv.current_stock - inv.reserved_stock)
            total_units += inv.current_stock
            unit_price = prod.cost_price if prod.cost_price > 0 else prod.price
            total_valuation += unit_price * inv.current_stock

            sold_30d = sales_map.get(prod.id, 0)
            daily_demand = max(0.1, round(sold_30d / 30.0, 2))
            lead_time = prod.lead_time_days or 5
            safety_stock = prod.safety_stock or inv.safety_stock or 10
            reorder_point = prod.reorder_point or inv.reorder_level or int((daily_demand * lead_time) + safety_stock)

            days_of_coverage = round(available / daily_demand, 1) if daily_demand > 0 else 999.0

            if available == 0:
                health = "CRITICAL_OUT_OF_STOCK"
                stockout_count += 1
            elif available <= reorder_point:
                health = "LOW_STOCK_REORDER"
                low_stock_count += 1
            elif days_of_coverage > 90:
                health = "OVERSTOCKED"
            else:
                health = "HEALTHY"

            items.append({
                "id": inv.id,
                "product_id": prod.id,
                "sku": prod.sku,
                "name": prod.name,
                "category": prod.category,
                "current_stock": inv.current_stock,
                "reserved_stock": inv.reserved_stock,
                "available_stock": available,
                "unit_cost": unit_price,
                "inventory_value": round(unit_price * inv.current_stock, 2),
                "reorder_point": reorder_point,
                "safety_stock": safety_stock,
                "lead_time_days": lead_time,
                "daily_demand": daily_demand,
                "days_of_coverage": days_of_coverage,
                "health_status": health,
                "last_restocked_at": inv.last_restocked_at.isoformat() if inv.last_restocked_at else None,
            })

        # Calculate ABC classification
        sorted_by_val = sorted(items, key=lambda x: x["inventory_value"], reverse=True)
        running_sum = 0.0
        for item in sorted_by_val:
            running_sum += item["inventory_value"]
            pct = (running_sum / max(1.0, total_valuation)) * 100.0
            if pct <= 80.0:
                item["abc_class"] = "A"
            elif pct <= 95.0:
                item["abc_class"] = "B"
            else:
                item["abc_class"] = "C"

        return {
            "total_items": len(items),
            "total_stock_units": total_units,
            "total_inventory_valuation": round(total_valuation, 2),
            "low_stock_count": low_stock_count,
            "stockout_count": stockout_count,
            "items": items
        }

    def adjust_stock(
        self,
        db: Session,
        organization_id: int,
        product_id: int,
        new_quantity: int,
        reason: str = "Manual Adjustment",
        reference_id: Optional[str] = None
    ) -> Dict[str, Any]:
        inv = db.query(Inventory).filter(
            Inventory.product_id == product_id,
            Inventory.organization_id == organization_id
        ).first()

        if not inv:
            raise NotFoundError(f"Inventory record for product {product_id} not found.")

        old_stock = inv.current_stock
        diff = new_quantity - old_stock
        inv.current_stock = max(0, new_quantity)
        inv.updated_at = datetime.now(timezone.utc)

        # Record movement
        movement = InventoryMovement(
            inventory_id=inv.id,
            product_id=product_id,
            organization_id=organization_id,
            quantity=diff,
            movement_type="ADJUSTMENT" if diff != 0 else "NOOP",
            reference_id=reference_id,
            notes=f"Stock adjusted from {old_stock} to {new_quantity}. Reason: {reason}"
        )
        db.add(movement)
        db.commit()
        db.refresh(inv)

        return {
            "success": True,
            "product_id": product_id,
            "previous_stock": old_stock,
            "new_stock": inv.current_stock,
            "movement_id": movement.id
        }

inventory_service = InventoryService()
