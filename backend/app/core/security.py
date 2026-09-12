from datetime import datetime, timedelta, timezone
from typing import Optional, Any, List
import bcrypt
import jwt
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# RBAC Standard Roles
ROLE_SUPER_ADMIN = "SUPER_ADMIN"
ROLE_ORG_ADMIN = "ORG_ADMIN"
ROLE_MANAGER = "MANAGER"
ROLE_ANALYST = "ANALYST"
ROLE_USER = "USER"

ROLES_HIERARCHY = {
    ROLE_SUPER_ADMIN: 100,
    ROLE_ORG_ADMIN: 80,
    ROLE_MANAGER: 60,
    ROLE_ANALYST: 40,
    ROLE_USER: 20,
    "admin": 80,       # Backwards-compat
    "manager": 60,     # Backwards-compat
    "customer": 20,    # Backwards-compat
    "user": 20,        # Backwards-compat
}

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

def create_access_token(
    subject: Any, 
    role: str = ROLE_USER, 
    organization_id: Optional[int] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "org_id": organization_id,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please re-authenticate.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid security credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def check_role_permission(user_role: str, allowed_roles: List[str]) -> bool:
    """Check if the user's role is in the allowed list or has super admin privileges."""
    normalized_role = user_role.upper() if user_role else ROLE_USER
    if normalized_role == ROLE_SUPER_ADMIN:
        return True
    return any(normalized_role == r.upper() for r in allowed_roles)
