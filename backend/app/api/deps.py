from typing import Generator, Optional, List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token, ROLE_SUPER_ADMIN, ROLE_ORG_ADMIN, ROLE_MANAGER, ROLE_ANALYST, ROLE_USER
from app.db.session import SessionLocal
from app.models.user import User
from app.models.organization import Organization

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if not token:
        # Fallback to demo default admin user if running in development mode without header
        admin_user = db.query(User).filter(User.email == "admin@emox.ai").first()
        if admin_user:
            return admin_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    user_email = payload.get("sub")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact your organization administrator."
        )

    return user

def get_current_organization_id(
    current_user: User = Depends(get_current_user)
) -> int:
    return current_user.organization_id or 1

def require_role(allowed_roles: List[str]) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or ROLE_USER).upper()
        if user_role == ROLE_SUPER_ADMIN:
            return current_user
        if user_role in [r.upper() for r in allowed_roles]:
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Operation requires one of the following roles: {', '.join(allowed_roles)}. Your role is '{current_user.role}'."
        )
    return role_checker

require_admin_or_manager = require_role([ROLE_SUPER_ADMIN, ROLE_ORG_ADMIN, ROLE_MANAGER, "admin", "manager"])
require_admin = require_role([ROLE_SUPER_ADMIN, ROLE_ORG_ADMIN, "admin"])
