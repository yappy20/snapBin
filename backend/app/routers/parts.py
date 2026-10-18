from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/parts", tags=["parts"])


@router.get("", response_model=list[schemas.PartOut])
def list_parts(
    db: Session = Depends(get_db),
    q: str | None = Query(None, description="Search name/mpn/manufacturer/tags"),
    category_id: int | None = None,
    location_id: int | None = None,
    low_stock_only: bool = False,
):
    query = db.query(models.Part)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                models.Part.name.ilike(like),
                models.Part.mpn.ilike(like),
                models.Part.manufacturer.ilike(like),
                models.Part.tags.ilike(like),
                models.Part.description.ilike(like),
            )
        )
    if category_id:
        query = query.filter(models.Part.category_id == category_id)
    if location_id:
        query = query.filter(models.Part.location_id == location_id)
    parts = query.order_by(models.Part.name).all()
    if low_stock_only:
        parts = [p for p in parts if p.quantity <= p.quantity_threshold]
    return parts


@router.get("/{part_id}", response_model=schemas.PartOut)
def get_part(part_id: int, db: Session = Depends(get_db)):
    part = db.get(models.Part, part_id)
    if not part:
        raise HTTPException(404, "Part not found")
    return part


@router.post("", response_model=schemas.PartOut, status_code=201)
def create_part(payload: schemas.PartCreate, db: Session = Depends(get_db)):
    part = models.Part(**payload.model_dump())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@router.put("/{part_id}", response_model=schemas.PartOut)
def update_part(part_id: int, payload: schemas.PartUpdate, db: Session = Depends(get_db)):
    part = db.get(models.Part, part_id)
    if not part:
        raise HTTPException(404, "Part not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(part, k, v)
    db.commit()
    db.refresh(part)
    return part


@router.delete("/{part_id}", status_code=204)
def delete_part(part_id: int, db: Session = Depends(get_db)):
    part = db.get(models.Part, part_id)
    if not part:
        raise HTTPException(404, "Part not found")
    db.delete(part)
    db.commit()


@router.post("/{part_id}/adjust-quantity", response_model=schemas.PartOut)
def adjust_quantity(part_id: int, payload: schemas.QuantityAdjust, db: Session = Depends(get_db)):
    part = db.get(models.Part, part_id)
    if not part:
        raise HTTPException(404, "Part not found")
    new_qty = part.quantity + payload.delta
    if new_qty < 0:
        raise HTTPException(400, f"Cannot go below 0 (current: {part.quantity}, delta: {payload.delta})")
    part.quantity = new_qty
    db.commit()
    db.refresh(part)
    return part
