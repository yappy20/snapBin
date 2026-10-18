from fastapi import APIRouter

from app import schemas
from app.config import get_settings
from app.enrichment import mouser
from app.enrichment.suppliers import supplier_links

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=schemas.SettingsOut)
def read_settings():
    s = get_settings()
    ai_configured = bool(
        (s.ai_provider == "anthropic" and s.anthropic_api_key)
        or (s.ai_provider == "openai" and s.openai_api_key)
    )
    return schemas.SettingsOut(
        ai_provider=s.ai_provider if ai_configured else "none",
        ai_configured=ai_configured,
        mouser_configured=bool(s.mouser_api_key),
        capture_key_is_default=(s.capture_api_key == "change-me"),
    )


@router.get("/supplier-links")
def get_supplier_links(q: str):
    return supplier_links(q)


@router.get("/enrich")
async def enrich(q: str):
    """Look up a part by name/MPN via Mouser (if configured) and always
    include no-key-required supplier search links as a fallback/companion."""
    s = get_settings()
    result = await mouser.search_part(q, s.mouser_api_key) if s.mouser_api_key else None
    return {"mouser_result": result, "supplier_links": supplier_links(q)}
