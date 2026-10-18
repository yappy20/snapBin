"""Ingestion endpoint for standalone hardware capture stations (Raspberry Pi,
ESP32-CAM, or any device that can POST a JPEG over HTTP). Protected by a
shared-secret header so a capture station on your LAN can't be abused by
anything else on the network.

See /docs/HARDWARE.md and /hardware/ for example client code.
"""
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import schemas
from app.config import get_settings
from app.database import get_db
from app.routers.scan import _save_and_identify

router = APIRouter(prefix="/api/capture", tags=["capture"])


@router.post("", response_model=schemas.ScanResult)
async def capture_image(
    image: UploadFile = File(...),
    x_capture_key: str | None = Header(None),
    db: Session = Depends(get_db),
):
    settings = get_settings()
    if not x_capture_key or x_capture_key != settings.capture_api_key:
        raise HTTPException(401, "Invalid or missing X-Capture-Key header")
    return await _save_and_identify(image, db, source="capture-station")
