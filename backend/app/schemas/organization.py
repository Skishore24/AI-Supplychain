from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class OrganizationBase(BaseModel):
    name: str
    slug: str
    plan: str = "professional"
    is_active: bool = True
    settings: Optional[str] = "{}"

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    is_active: Optional[bool] = None
    settings: Optional[str] = None

class OrganizationOut(OrganizationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OrganizationSwitchRequest(BaseModel):
    organization_id: int
