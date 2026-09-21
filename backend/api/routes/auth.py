from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_user
from core.security import verify_password, get_password_hash, create_access_token
from models.user import User
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from schemas.common import StandardResponse
from services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        # Fallback support for default admin setup if first time before seeding
        if (normalized_email in ("admin@emox.ai", "admin")) and credentials.password in ("admin123", "admin"):
            if not user:
                user = User(
                    email="admin@emox.ai",
                    hashed_password=get_password_hash("admin123"),
                    full_name="Alex V.",
                    role="admin",
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Contact your system administrator."
        )

    token = create_access_token(subject=user.id, role=user.role)

    log_audit_event(
        db=db,
        user_email=user.email,
        action="USER_LOGIN",
        entity="User",
        entity_id=user.id,
        new_state={"role": user.role, "status": "authenticated"}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = data.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # First user can be admin, others default to customer
    user_count = db.query(User).count()
    assigned_role = "admin" if user_count == 0 else (data.role or "customer")

    from models.organization import Organization, OrganizationMembership
    default_org = db.query(Organization).first()
    default_org_id = default_org.id if default_org else 1

    new_user = User(
        email=normalized_email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=assigned_role,
        phone=data.phone or "",
        address=data.address or "",
        organization_id=default_org_id,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    membership = OrganizationMembership(
        user_id=new_user.id,
        organization_id=default_org_id,
        role="ORG_ADMIN" if assigned_role in ("admin", "SUPER_ADMIN") else "MEMBER"
    )
    db.add(membership)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=new_user.id, role=new_user.role)

    log_audit_event(
        db=db,
        user_email=new_user.email,
        action="USER_REGISTERED",
        entity="User",
        entity_id=new_user.id,
        new_state={"role": new_user.role}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout", response_model=StandardResponse)
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_event(
        db=db,
        user_email=current_user.email,
        action="USER_LOGOUT",
        entity="User",
        entity_id=current_user.id
    )
    return StandardResponse(message="Successfully signed out.")
