import sys
from pathlib import Path
import pytest
from datetime import datetime, timezone

backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from db.session import SessionLocal
from models.organization import Organization, OrganizationMembership
from models.user import User
from models.product import Product
from core.security import get_password_hash
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_organization_creation_and_membership():
    db = SessionLocal()
    try:
        # Create test organization
        test_slug = f"test-corp-{int(datetime.now().timestamp())}"
        org = Organization(
            name="Test Corporation",
            slug=test_slug,
            plan="professional",
            is_active=True
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        assert org.id is not None
        assert org.slug == test_slug

        # Create user and assign membership
        test_email = f"user_{int(datetime.now().timestamp())}@testcorp.com"
        user = User(
            email=test_email,
            hashed_password=get_password_hash("password123"),
            full_name="Test Member",
            role="MANAGER",
            organization_id=org.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        membership = OrganizationMembership(
            user_id=user.id,
            organization_id=org.id,
            role="MANAGER"
        )
        db.add(membership)
        db.commit()

        # Verify relationship
        retrieved_org = db.query(Organization).filter(Organization.id == org.id).first()
        assert len(retrieved_org.memberships) >= 1
        assert retrieved_org.memberships[0].user_id == user.id
    finally:
        db.close()

def test_tenant_data_scoping():
    db = SessionLocal()
    try:
        # Create Org A and Org B
        ts = int(datetime.now().timestamp())
        org_a = Organization(name="Org A", slug=f"org-a-{ts}", plan="starter")
        org_b = Organization(name="Org B", slug=f"org-b-{ts}", plan="starter")
        db.add_all([org_a, org_b])
        db.commit()

        # Product in Org A
        prod_a = Product(
            name=f"Org A Widget {ts}",
            sku=f"SKU-A-{ts}",
            category="Components",
            price=100.0,
            cost_price=60.0,
            organization_id=org_a.id
        )
        # Product in Org B
        prod_b = Product(
            name=f"Org B Widget {ts}",
            sku=f"SKU-B-{ts}",
            category="Components",
            price=200.0,
            cost_price=120.0,
            organization_id=org_b.id
        )
        db.add_all([prod_a, prod_b])
        db.commit()

        # Query scoped to Org A
        org_a_products = db.query(Product).filter(Product.organization_id == org_a.id).all()
        org_a_skus = [p.sku for p in org_a_products]
        assert prod_a.sku in org_a_skus
        assert prod_b.sku not in org_a_skus
    finally:
        db.close()

def test_versioned_api_v1_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["api_version"] == "v1"
    assert data["status"] == "healthy"

def test_legacy_api_alias_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_security_headers_present():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-frame-options") == "DENY"
