from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True
