from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from db.session import get_db
from core.deps import get_current_user
from models.user import User
from models.organization import Organization, OrganizationMembership

router = APIRouter(prefix="/organizations", tags=["Organizations"])

class OrganizationCreate(BaseModel):
    name: str
    slug: str
    plan: Optional[str] = "starter"

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None

class MemberAdd(BaseModel):
    user_id: int
    role: str = "MEMBER"

class MemberResponse(BaseModel):
    id: int
    user_id: int
    organization_id: int
    email: str
    full_name: str
    role: str
    created_at: datetime

class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    is_active: bool
    created_at: datetime

@router.get("", response_model=List[OrganizationResponse])
def list_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List organizations. Super admins see all; other users see organizations they are members of.
    """
    if getattr(current_user, "role", "").upper() in ["SUPER_ADMIN", "ADMIN"]:
        orgs = db.query(Organization).filter(Organization.is_active == True).all()
    else:
        memberships = db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == current_user.id
        ).all()
        org_ids = [m.organization_id for m in memberships]
        if current_user.organization_id and current_user.organization_id not in org_ids:
            org_ids.append(current_user.organization_id)
        orgs = db.query(Organization).filter(Organization.id.in_(org_ids)).all() if org_ids else []
    
    return [
        OrganizationResponse(
            id=o.id,
            name=o.name,
            slug=o.slug,
            plan=o.plan,
            is_active=o.is_active,
            created_at=o.created_at
        )
        for o in orgs
    ]

@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new organization and assign current user as ORG_ADMIN.
    """
    existing = db.query(Organization).filter(Organization.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Organization with slug '{payload.slug}' already exists.")
    
    org = Organization(
        name=payload.name,
        slug=payload.slug,
        plan=payload.plan or "starter",
        is_active=True
    )
    db.add(org)
    db.flush()

    membership = OrganizationMembership(
        user_id=current_user.id,
        organization_id=org.id,
        role="ORG_ADMIN"
    )
    db.add(membership)
    db.commit()
    db.refresh(org)

    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        plan=org.plan,
        is_active=org.is_active,
        created_at=org.created_at
    )

@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        plan=org.plan,
        is_active=org.is_active,
        created_at=org.created_at
    )

@router.get("/{org_id}/members", response_model=List[MemberResponse])
def list_organization_members(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memberships = db.query(OrganizationMembership).filter(
        OrganizationMembership.organization_id == org_id
    ).all()

    results = []
    for m in memberships:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            results.append(MemberResponse(
                id=m.id,
                user_id=u.id,
                organization_id=m.organization_id,
                email=u.email,
                full_name=u.full_name or u.email,
                role=m.role,
                created_at=m.created_at
            ))
    return results

@router.post("/{org_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def add_organization_member(
    org_id: int,
    payload: MemberAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    target_user = db.query(User).filter(User.id == payload.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_mem = db.query(OrganizationMembership).filter(
        OrganizationMembership.organization_id == org_id,
        OrganizationMembership.user_id == payload.user_id
    ).first()

    if existing_mem:
        existing_mem.role = payload.role
        db.commit()
        db.refresh(existing_mem)
        return MemberResponse(
            id=existing_mem.id,
            user_id=target_user.id,
            organization_id=org_id,
            email=target_user.email,
            full_name=target_user.full_name,
            role=existing_mem.role,
            created_at=existing_mem.created_at
        )

    new_mem = OrganizationMembership(
        user_id=payload.user_id,
        organization_id=org_id,
        role=payload.role
    )
    db.add(new_mem)
    db.commit()
    db.refresh(new_mem)

    return MemberResponse(
        id=new_mem.id,
        user_id=target_user.id,
        organization_id=org_id,
        email=target_user.email,
        full_name=target_user.full_name,
        role=new_mem.role,
        created_at=new_mem.created_at
    )
