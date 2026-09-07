import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.deps import get_db, require_admin_or_manager
from models.category import Category
from models.user import User
from schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from schemas.common import StandardResponse

router = APIRouter(prefix="/categories", tags=["Product Categories"])

def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    return re.sub(r'[\s_-]+', '-', s)

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()

@router.post("/", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    slug = slugify(data.name)
    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists.")

    cat = Category(
        name=data.name.strip(),
        slug=slug,
        description=data.description or "",
        image_url=data.image_url or ""
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(
    cat_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")
    if data.name:
        cat.name = data.name.strip()
        cat.slug = slugify(data.name)
    if data.description is not None:
        cat.description = data.description
    if data.image_url is not None:
        cat.image_url = data.image_url
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{cat_id}", response_model=StandardResponse)
def delete_category(
    cat_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin_or_manager)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")
    db.delete(cat)
    db.commit()
    return StandardResponse(message="Category deleted successfully.")
