import pytest
from sqlalchemy.orm import Session
from app.services.inventory_service import inventory_service
from app.models.inventory import Inventory, InventoryMovement
from app.models.product import Product

def test_reorder_point_calculation():
    # daily_demand = 10, lead_time = 5, safety_stock = 15
    # ROP = 10 * 5 + 15 = 65
    rop = inventory_service.calculate_reorder_point(daily_demand=10.0, lead_time_days=5, safety_stock=15)
    assert rop == 65

def test_safety_stock_sizing():
    # service_level = 0.95 (Z ≈ 1.645), std_dev = 4.0, lead_time = 9 days -> sqrt(9) = 3
    # SS = 1.645 * 4 * 3 = 19.74 -> round = 20
    ss = inventory_service.calculate_safety_stock(lead_time_days=9, demand_std_dev=4.0, service_level=0.95)
    assert ss == 20

def test_inventory_status_aggregation(db_session: Session):
    status_data = inventory_service.get_inventory_status(db_session, organization_id=1)
    assert status_data["total_units"] == 112  # 100 + 12
    assert status_data["low_stock_count"] >= 1  # DISP-OLED-7 has 12 units against ROP 20
    items = {item["sku"]: item for item in status_data["items"]}
    assert "MCU-3200" in items
    assert "DISP-OLED-7" in items
    assert items["DISP-OLED-7"]["status"] in ("Low", "Critical")

def test_inventory_stock_adjustment_creates_movement(db_session: Session):
    inv = db_session.query(Inventory).filter(Inventory.organization_id == 1).first()
    initial_stock = inv.current_stock

    # Perform stock adjustment of +25 units
    updated_inv = inventory_service.adjust_stock(
        db=db_session,
        organization_id=1,
        inventory_id=inv.id,
        quantity_delta=25,
        movement_type="CYCLE_COUNT_ADJUSTMENT",
        reason="Physical audit counted 25 surplus units"
    )

    assert updated_inv.current_stock == initial_stock + 25

    # Verify InventoryMovement record was created
    movement = db_session.query(InventoryMovement).filter(
        InventoryMovement.inventory_id == inv.id
    ).order_by(InventoryMovement.id.desc()).first()
    assert movement is not None
    assert movement.quantity_change == 25
    assert movement.new_stock == initial_stock + 25
    assert movement.movement_type == "CYCLE_COUNT_ADJUSTMENT"
