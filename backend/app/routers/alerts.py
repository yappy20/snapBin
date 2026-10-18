from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("/low-stock", response_model=list[schemas.LowStockAlert])
def low_stock(db: Session = Depends(get_db)):
    parts = db.query(models.Part).all()
    alerts = [
        schemas.LowStockAlert(part=p, shortfall=max(0, p.quantity_threshold - p.quantity))
        for p in parts
        if p.quantity <= p.quantity_threshold
    ]
    alerts.sort(key=lambda a: a.shortfall, reverse=True)
    return alerts
