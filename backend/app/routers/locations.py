from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/locations", tags=["locations"])


@router.get("", response_model=list[schemas.LocationOut])
def list_locations(db: Session = Depends(get_db)):
    counts = dict(
        db.query(models.Part.location_id, func.count(models.Part.id))
        .group_by(models.Part.location_id)
        .all()
    )
    locations = db.query(models.Location).order_by(models.Location.name).all()
    out = []
    for loc in locations:
        item = schemas.LocationOut.model_validate(loc)
        item.part_count = counts.get(loc.id, 0)
        out.append(item)
    return out


@router.post("", response_model=schemas.LocationOut, status_code=201)
def create_location(payload: schemas.LocationCreate, db: Session = Depends(get_db)):
    loc = models.Location(**payload.model_dump())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


@router.put("/{location_id}", response_model=schemas.LocationOut)
def update_location(location_id: int, payload: schemas.LocationCreate, db: Session = Depends(get_db)):
    loc = db.get(models.Location, location_id)
    if not loc:
        raise HTTPException(404, "Location not found")
    for k, v in payload.model_dump().items():
        setattr(loc, k, v)
    db.commit()
    db.refresh(loc)
    return loc


@router.delete("/{location_id}", status_code=204)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    loc = db.get(models.Location, location_id)
    if not loc:
        raise HTTPException(404, "Location not found")
    db.delete(loc)
    db.commit()
