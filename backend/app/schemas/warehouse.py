from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class WarehouseCreate(BaseModel):
    name: str
    code: str
    location: Optional[str] = "Central Hub"
    capacity: Optional[int] = 50000

class WarehouseResponse(BaseModel):
    id: int
    name: str
    code: str
    location: str
    capacity: int
    created_at: datetime

    class Config:
        from_attributes = True
