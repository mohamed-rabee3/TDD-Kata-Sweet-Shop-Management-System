from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from typing import Optional

from app import database, models, schemas, dependencies

router = APIRouter(
    prefix="/sweets",
    tags=["Sweets"]
)

# 1. Create Sweet (Admin Only)
@router.post("/", response_model=schemas.SweetResponse, status_code=status.HTTP_201_CREATED)
def create_sweet(
    sweet: schemas.SweetCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(dependencies.get_current_admin)
):
    new_sweet = models.Sweet(**sweet.model_dump())
    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)
    return new_sweet

# 2. Update Sweet (Admin Only)
@router.put("/{sweet_id}", response_model=schemas.SweetResponse)
def update_sweet(
    sweet_id: int,
    sweet_update: schemas.SweetUpdate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(dependencies.get_current_admin)
):
    sweet = db.query(models.Sweet).filter(models.Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Update fields that are provided
    update_data = sweet_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sweet, key, value)
        
    db.commit()
    db.refresh(sweet)
    return sweet

# 3. Delete Sweet (Admin Only)
@router.delete("/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet(
    sweet_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(dependencies.get_current_admin)
):
    sweet = db.query(models.Sweet).filter(models.Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
        
    db.delete(sweet)
    db.commit()
    return None

# 4. Restock Sweet (Admin Only)
@router.post("/{sweet_id}/restock", response_model=schemas.SweetResponse)
def restock_sweet(
    sweet_id: int,
    restock: schemas.SweetRestock,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(dependencies.get_current_admin)
):
    sweet = db.query(models.Sweet).filter(models.Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    if restock.amount <= 0:
        raise HTTPException(status_code=400, detail="Restock amount must be positive")

    sweet.quantity += restock.amount
    db.commit()
    db.refresh(sweet)
    return sweet


# 5. Search Sweets (Public)
# URL: /api/sweets/search?q=...&category=...
@router.get("/search", response_model=List[schemas.SweetResponse])
def search_sweets(
    q: Optional[str] = None,
    category: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Sweet)
    
    if q:
        # ILIKE is case-insensitive (sqlite supports it natively or via lower())
        query = query.filter(models.Sweet.name.ilike(f"%{q}%"))
    
    if category:
        query = query.filter(models.Sweet.category.ilike(f"%{category}%"))
        
    if price_min is not None:
        query = query.filter(models.Sweet.price >= price_min)
        
    if price_max is not None:
        query = query.filter(models.Sweet.price <= price_max)
        
    return query.all()

# 6. List All Sweets (Public)
@router.get("/", response_model=List[schemas.SweetResponse])
def read_sweets(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db)
):
    sweets = db.query(models.Sweet).offset(skip).limit(limit).all()
    return sweets