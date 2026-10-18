"""AI-powered component recognition: upload/capture a photo, get back
structured candidate identifications (optionally matched to existing stock)."""
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app import models, schemas
from app.ai import get_ai_provider
from app.ai.matcher import find_best_match
from app.config import get_settings
from app.database import get_db

router = APIRouter(prefix="/api/scan", tags=["scan"])

ALLOWED_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


async def _save_and_identify(image: UploadFile, db: Session, source: str) -> schemas.ScanResult:
    settings = get_settings()
    ext = ALLOWED_TYPES.get(image.content_type, "jpg")
    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_dir = Path(settings.resolved_upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / filename

    contents = await image.read()
    dest.write_bytes(contents)
    image_url = f"/uploads/{filename}"

    provider = get_ai_provider(settings)
    result = await provider.identify(contents, image.content_type or "image/jpeg")

    candidates: list[schemas.ScanCandidate] = []
    for raw in result.candidates:
        matched_part, score = find_best_match(db, raw)
        candidates.append(
            schemas.ScanCandidate(
                name=raw.name,
                manufacturer=raw.manufacturer,
                mpn=raw.mpn,
                category=raw.category,
                value=raw.value,
                package=raw.package,
                description=raw.description,
                confidence=raw.confidence,
                matched_part_id=matched_part.id if matched_part else None,
            )
        )

    log = models.ScanLog(
        image_url=image_url,
        ai_provider=result.provider,
        raw_response=result.raw_response[:8000],
        matched_part_id=candidates[0].matched_part_id if candidates else None,
        confidence=candidates[0].confidence if candidates else None,
        source=source,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return schemas.ScanResult(image_url=image_url, provider=result.provider, candidates=candidates, scan_log_id=log.id)


@router.post("", response_model=schemas.ScanResult)
async def scan_image(image: UploadFile = File(...), db: Session = Depends(get_db)):
    return await _save_and_identify(image, db, source="web")
