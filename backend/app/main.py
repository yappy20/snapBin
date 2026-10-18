from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, engine
from app.routers import alerts, capture, categories, locations, parts, projects, scan, settings as settings_router

settings = get_settings()

Base.metadata.create_all(bind=engine)
Path(settings.resolved_upload_dir).mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="SnapBin API",
    description="Open-source AI-assisted inventory system for electronic components.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploaded part photos (persisted under the volume / data dir).
app.mount("/uploads", StaticFiles(directory=settings.resolved_upload_dir), name="uploads")

app.include_router(parts.router)
app.include_router(categories.router)
app.include_router(locations.router)
app.include_router(projects.router)
app.include_router(scan.router)
app.include_router(capture.router)
app.include_router(alerts.router)
app.include_router(settings_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Serve the built React frontend from this same service, so SnapBin deploys
# as a single web app with one URL (API under /api, uploads under /uploads,
# everything else is the SPA). The frontend build is copied into
# `frontend_dist/` at image-build time; in local dev (no build present) this
# section is a no-op and you'd run `npm run dev` separately instead.
# ---------------------------------------------------------------------------
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend_dist"

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        # Never swallow API/upload routes that somehow fall through.
        requested = FRONTEND_DIST / full_path
        if full_path and requested.is_file():
            return FileResponse(requested)
        return FileResponse(FRONTEND_DIST / "index.html")
