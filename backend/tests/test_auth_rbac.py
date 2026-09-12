import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password

def test_login_success(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@test.com"
    assert data["user"]["role"] == "SUPER_ADMIN"

def test_login_invalid_password(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "wrongpassword"}
    )
    assert response.status_code in (401, 400)

def test_register_new_user(client: TestClient, db_session: Session):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "SecurePassword123!",
            "full_name": "New Employee",
            "role": "customer"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "newuser@test.com"

    # Verify password was hashed in DB
    user = db_session.query(User).filter(User.email == "newuser@test.com").first()
    assert user is not None
    assert user.hashed_password != "SecurePassword123!"
    assert verify_password("SecurePassword123!", user.hashed_password)

def test_current_user_profile(client: TestClient, manager_headers: dict):
    response = client.get("/api/v1/auth/me", headers=manager_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "manager@test.com"
    assert data["role"] == "MANAGER"

def test_unauthenticated_request_blocked(client: TestClient):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
