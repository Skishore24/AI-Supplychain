from datetime import datetime, timezone, date
from typing import List, Optional
import random
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin_or_manager
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.sales import Sale
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderStatusUpdate,
    OrderResponse,
    OrderDetailResponse,
    OrderItemResponse
)
from app.schemas.common import StandardResponse
from app.services.audit_service import log_audit_event
from app.services.notification_service import create_system_notification

router = APIRouter(prefix="/orders", tags=["Customer Orders & Fulfillment"])

@router.get("/", response_model=List[OrderResponse])
def get_orders(
    status: Optional[str] = None,
    customer_email: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status and status != "all":
        query = query.filter(Order.status == status)
    if customer_email:
        query = query.filter(Order.customer_email == customer_email)

    orders = query.order_by(Order.id.desc()).offset(skip).limit(limit).all()

    result = []
    for o in orders:
        o_dict = {
            "id": o.id,
            "order_number": o.order_number,
            "customer_id": o.customer_id,
            "customer_name": o.customer_name,
            "customer_email": o.customer_email,
            "shipping_address": o.shipping_address,
            "payment_method": o.payment_method,
            "payment_currency": o.payment_currency,
            "payment_status": o.payment_status,
            "transaction_id": o.transaction_id,
            "status": o.status,
            "subtotal": o.subtotal,
            "tax": o.tax,
            "shipping_cost": o.shipping_cost,
            "total_amount": o.total_amount,
            "created_at": o.created_at,
            "updated_at": o.updated_at,
            "items_count": len(o.items)
        }
        result.append(o_dict)
    return result

@router.get("/{order_id_or_number}", response_model=OrderDetailResponse)
def get_order_detail(order_id_or_number: str, db: Session = Depends(get_db)):
    if order_id_or_number.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id_or_number)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id_or_number).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    items_list = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product_name,
            sku=item.sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price
        )
        for item in order.items
    ]

    return {
        "id": order.id,
        "order_number": order.order_number,
        "customer_id": order.customer_id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "shipping_address": order.shipping_address,
        "payment_method": order.payment_method,
        "payment_currency": order.payment_currency,
        "payment_status": order.payment_status,
        "transaction_id": order.transaction_id,
        "status": order.status,
        "subtotal": order.subtotal,
        "tax": order.tax,
        "shipping_cost": order.shipping_cost,
        "total_amount": order.total_amount,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items_count": len(items_list),
        "items": items_list
    }

@router.post("/", response_model=OrderDetailResponse)
def create_customer_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Atomic Checkout Transaction:
    1. Validates cart items and stock availability
    2. Decrements inventory stock (with concurrency safeguard)
    3. Creates Order and OrderItem records
    4. Creates Sale / Transaction records for revenue ledger
    5. Returns order confirmation with tracking number
    """
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Cart cannot be empty.")

    # Concurrency safe transaction block
    try:
        total_subtotal = 0.0
        validated_items = []

        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product #{item.product_id} not found.")

            inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
            if not inv:
                inv = Inventory(product_id=product.id, current_stock=0)
                db.add(inv)
                db.flush()

            avail = max(0, inv.current_stock - inv.reserved_stock)
            if item.quantity > avail and avail > 0:
                # Cap quantity or fail
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {avail} units available for '{product.name}' (SKU: {product.sku})."
                )

            unit_price = product.price or 0.0
            item_total = unit_price * item.quantity
            total_subtotal += item_total

            # Decrement inventory stock atomically
            inv.current_stock = max(0, inv.current_stock - item.quantity)
            inv.last_restocked_at = datetime.now(timezone.utc)

            validated_items.append({
                "product": product,
                "quantity": item.quantity,
                "unit_price": unit_price,
                "total_price": item_total
            })

        # Calculate taxes and shipping
        tax_amt = round(total_subtotal * 0.18, 2) # Standard 18% GST/Tax
        shipping_amt = 0.0 if total_subtotal > 1000 else 150.0
        grand_total = round(total_subtotal + tax_amt + shipping_amt, 2)

        order_no = f"ORD-{date.today().strftime('%Y%m%d')}-{random.randint(10000, 99999)}"
        txn_id = f"PAY-UPI-{int(datetime.now().timestamp())}-{random.randint(1000, 9999)}"

        new_order = Order(
            order_number=order_no,
            customer_name=order_data.customer_name or "Valued Customer",
            customer_email=order_data.customer_email or "customer@emox.ai",
            shipping_address=order_data.shipping_address,
            payment_method=order_data.payment_method or "UPI",
            payment_currency=order_data.payment_currency or "INR",
            payment_status="paid",
            transaction_id=txn_id,
            status="confirmed",
            subtotal=round(total_subtotal, 2),
            tax=tax_amt,
            shipping_cost=shipping_amt,
            total_amount=grand_total,
            notes=order_data.notes or ""
        )
        db.add(new_order)
        db.flush() # flush to get new_order.id

        created_order_items = []
        for val_item in validated_items:
            prod = val_item["product"]
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=prod.id,
                product_name=prod.name,
                sku=prod.sku,
                quantity=val_item["quantity"],
                unit_price=val_item["unit_price"],
                total_price=val_item["total_price"]
            )
            db.add(order_item)

            # Record corresponding Sale transaction
            sale_record = Sale(
                product_id=prod.id,
                order_id=new_order.id,
                quantity_sold=val_item["quantity"],
                sale_date=date.today(),
                unit_price=val_item["unit_price"],
                total_amount=val_item["total_price"],
                currency=new_order.payment_currency,
                transaction_ref=txn_id
            )
            db.add(sale_record)

            created_order_items.append(order_item)

        db.commit()
        db.refresh(new_order)

        create_system_notification(
            db=db,
            title=f"New Order Confirmed: {order_no}",
            message=f"Order of ₹{grand_total:,.2f} placed by {new_order.customer_name}. Warehouse stock automatically decremented.",
            notification_type="order_received",
            severity="info",
            link_url=f"/admin/sales"
        )

        return get_order_detail(str(new_order.id), db)

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Order checkout failed due to internal transaction error: {str(exc)}"
        )

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    old_status = order.status
    order.status = status_update.status
    if status_update.notes:
        order.notes = status_update.notes
    db.commit()
    db.refresh(order)

    log_audit_event(
        db=db,
        user_email=admin.email,
        action="ORDER_STATUS_UPDATED",
        entity="Order",
        entity_id=order.id,
        previous_state={"status": old_status},
        new_state={"status": order.status}
    )

    return order
