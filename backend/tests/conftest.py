import os
import pytest
from datetime import datetime, timezone
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.db.base import Base
import app.models  # ensure models are registered
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from app.models.organization import Organization, OrganizationMembership
from app.models.user import User
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.supplier import Supplier
from app.models.supplier_product import SupplierProduct
from app.models.warehouse import Warehouse
from app.api.deps import get_db
from app.main import app

# In-memory SQLite engine for fast, isolated unit tests
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Seed baseline test organization and users
    org1 = Organization(name="Acme Corp", slug="acme-corp", plan="enterprise", is_active=True)
    org2 = Organization(name="Beta Industries", slug="beta-ind", plan="professional", is_active=True)
    session.add_all([org1, org2])
    session.flush()

    admin_user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Admin User",
        role="SUPER_ADMIN",
        organization_id=org1.id,
        is_active=True
    )
    manager_user = User(
        email="manager@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Manager User",
        role="MANAGER",
        organization_id=org1.id,
        is_active=True
    )
    other_tenant_user = User(
        email="other@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Other Tenant User",
        role="MANAGER",
        organization_id=org2.id,
        is_active=True
    )
    session.add_all([admin_user, manager_user, other_tenant_user])
    session.flush()

    # Seed warehouses
    wh1 = Warehouse(name="Central Depot", code="WH-01", organization_id=org1.id, is_active=True)
    wh2 = Warehouse(name="East Hub", code="WH-02", organization_id=org2.id, is_active=True)
    session.add_all([wh1, wh2])
    session.flush()

    # Seed products
    p1 = Product(
        name="Microcontroller MCU-32",
        sku="MCU-3200",
        category="Semiconductors",
        price=45.0,
        cost_price=22.0,
        reorder_point=25,
        safety_stock=15,
        lead_time_days=5,
        organization_id=org1.id,
        status="active"
    )
    p2 = Product(
        name="Display Panel OLED 7in",
        sku="DISP-OLED-7",
        category="Displays",
        price=65.0,
        cost_price=30.0,
        reorder_point=20,
        safety_stock=10,
        lead_time_days=7,
        organization_id=org1.id,
        status="active"
    )
    p_other = Product(
        name="Competitor Sensor Pack",
        sku="SENS-999",
        category="Sensors",
        price=10.0,
        cost_price=5.0,
        organization_id=org2.id,
        status="active"
    )
    session.add_all([p1, p2, p_other])
    session.flush()

    # Seed inventory
    inv1 = Inventory(
        product_id=p1.id,
        warehouse_id=wh1.id,
        organization_id=org1.id,
        current_stock=100,
        reserved_stock=10,
        reorder_level=25,
        safety_stock=15,
        status="in_stock"
    )
    inv2 = Inventory(
        product_id=p2.id,
        warehouse_id=wh1.id,
        organization_id=org1.id,
        current_stock=12,  # Low stock below ROP
        reserved_stock=2,
        reorder_level=20,
        safety_stock=10,
        status="low_stock"
    )
    session.add_all([inv1, inv2])
    session.flush()

    # Seed supplier
    sup = Supplier(
        name="Apex Silicon Corp",
        organization_id=org1.id,
        quality_score=95.0,
        reliability_score=92.0,
        delivery_days=5,
        status="active"
    )
    session.add(sup)
    session.flush()

    sp = SupplierProduct(
        supplier_id=sup.id,
        product_id=p1.id,
        unit_cost=21.50,
        lead_time_days=5,
        is_preferred=True
    )
    session.add(sp)
    session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_headers(db_session: Session) -> dict:
    admin = db_session.query(User).filter(User.email == "admin@test.com").first()
    token = create_access_token(data={"sub": str(admin.id), "org_id": admin.organization_id, "role": admin.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def manager_headers(db_session: Session) -> dict:
    mgr = db_session.query(User).filter(User.email == "manager@test.com").first()
    token = create_access_token(data={"sub": str(mgr.id), "org_id": mgr.organization_id, "role": mgr.role})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def other_tenant_headers(db_session: Session) -> dict:
    user = db_session.query(User).filter(User.email == "other@test.com").first()
    token = create_access_token(data={"sub": str(user.id), "org_id": user.organization_id, "role": user.role})
    return {"Authorization": f"Bearer {token}"}
