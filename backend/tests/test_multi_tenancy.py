import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.product import Product
from app.repositories.product_repo import ProductRepository

def test_tenant_isolation_product_query(client: TestClient, admin_headers: dict, other_tenant_headers: dict):
    # Tenant 1 (Acme Corp) queries products
    res1 = client.get("/api/v1/products/", headers=admin_headers)
    assert res1.status_code == 200
    skus_tenant_1 = [p["sku"] for p in res1.json()]
    assert "MCU-3200" in skus_tenant_1
    assert "DISP-OLED-7" in skus_tenant_1
    # Tenant 1 must NOT see Tenant 2 product
    assert "SENS-999" not in skus_tenant_1

    # Tenant 2 (Beta Industries) queries products
    res2 = client.get("/api/v1/products/", headers=other_tenant_headers)
    assert res2.status_code == 200
    skus_tenant_2 = [p["sku"] for p in res2.json()]
    assert "SENS-999" in skus_tenant_2
    # Tenant 2 must NOT see Tenant 1 products
    assert "MCU-3200" not in skus_tenant_2
    assert "DISP-OLED-7" not in skus_tenant_2

def test_tenant_cross_access_prohibited(db_session: Session):
    repo = ProductRepository()
    
    # Query with org_id=1
    prods_org1 = repo.get_all(db_session, organization_id=1)
    skus_1 = [p.sku for p in prods_org1]
    assert "MCU-3200" in skus_1
    assert "SENS-999" not in skus_1

    # Query with org_id=2
    prods_org2 = repo.get_all(db_session, organization_id=2)
    skus_2 = [p.sku for p in prods_org2]
    assert "SENS-999" in skus_2
    assert "MCU-3200" not in skus_2
