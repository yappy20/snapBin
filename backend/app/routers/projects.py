from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).order_by(models.Project.created_at.desc()).all()


@router.post("", response_model=schemas.ProjectOut, status_code=201)
def create_project(payload: schemas.ProjectCreate, db: Session = Depends(get_db)):
    project = models.Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    db.delete(project)
    db.commit()


@router.post("/{project_id}/bom-items", response_model=schemas.ProjectOut, status_code=201)
def add_bom_item(project_id: int, payload: schemas.BOMItemCreate, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    part = db.get(models.Part, payload.part_id)
    if not part:
        raise HTTPException(404, "Part not found")

    existing = (
        db.query(models.BOMItem)
        .filter(models.BOMItem.project_id == project_id, models.BOMItem.part_id == payload.part_id)
        .first()
    )
    if existing:
        existing.quantity_required = payload.quantity_required
    else:
        db.add(models.BOMItem(project_id=project_id, part_id=payload.part_id, quantity_required=payload.quantity_required))
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}/bom-items/{item_id}", response_model=schemas.ProjectOut)
def remove_bom_item(project_id: int, item_id: int, db: Session = Depends(get_db)):
    item = db.get(models.BOMItem, item_id)
    if not item or item.project_id != project_id:
        raise HTTPException(404, "BOM item not found")
    db.delete(item)
    db.commit()
    project = db.get(models.Project, project_id)
    return project


@router.post("/{project_id}/consume", response_model=schemas.ProjectOut)
def consume_bom(project_id: int, db: Session = Depends(get_db)):
    """Deduct each BOM line's required quantity from inventory stock.

    Fails atomically (no partial deduction) if any part has insufficient stock.
    """
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    shortages = []
    for item in project.bom_items:
        if item.part.quantity < item.quantity_required:
            shortages.append(f"{item.part.name}: need {item.quantity_required}, have {item.part.quantity}")
    if shortages:
        raise HTTPException(400, "Insufficient stock: " + "; ".join(shortages))

    for item in project.bom_items:
        item.part.quantity -= item.quantity_required
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}/shortages")
def project_shortages(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return [
        {
            "part_id": item.part.id,
            "part_name": item.part.name,
            "required": item.quantity_required,
            "have": item.part.quantity,
            "shortfall": max(0, item.quantity_required - item.part.quantity),
        }
        for item in project.bom_items
        if item.part.quantity < item.quantity_required
    ]
