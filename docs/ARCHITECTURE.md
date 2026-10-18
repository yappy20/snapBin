# Architecture

## Overview

SnapBin ships as a **single deployable service**: one Docker image contains
both the FastAPI backend and the built React frontend, so it deploys to
Railway (or Render, Fly.io, a VPS) as one web service with one URL — no
separate frontend host, no CORS to configure, no second port to expose.

```
                      ┌────────────────────────────────────┐
  Browser (Scan tab) ─┤  FastAPI (serves everything)        │
  Raspberry Pi camera ┤   /api/*        → REST API          │──── SQLite (Postgres-ready)
  ESP32-CAM           ┤   /uploads/*    → uploaded photos    │──── AI provider (Anthropic / OpenAI vision)
  Any HTTP client      │   /* (else)     → React SPA build    │──── Mouser API / supplier search links
                      └────────────────────────────────────┘
                                   ↑
                        one container, one volume
                     (SQLite file + uploaded photos)
```

## How the merge works

`Dockerfile` is a two-stage build: stage 1 (`node:20-slim`) runs
`npm run build` on `frontend/`, producing a static `dist/`; stage 2
(`python:3.11-slim`) copies that `dist/` into the backend image as
`frontend_dist/`. `app/main.py` mounts `frontend_dist/assets` at `/assets`
and adds a catch-all route that serves `index.html` for any path that isn't
`/api/*` or `/uploads/*` — the standard way to make a client-side-routed SPA
(React Router) work behind a single backend. In local dev, run the backend
and `npm run dev` separately (Vite proxies `/api` and `/uploads` to
`localhost:8000`) so you get hot reload; `frontend_dist/` simply doesn't
exist yet in that mode, so the catch-all route is skipped entirely.

## Backend (`backend/`)

- **FastAPI** app (`app/main.py`) exposing a REST API under `/api/*`.
- **SQLAlchemy** models (`app/models.py`): `Part`, `Category`, `Location`
  (self-referential, for nested cabinets/drawers/bins), `Project`, `BOMItem`,
  `ScanLog`.
- **SQLite by default**, stored under `DATA_DIR` (a mounted volume in
  production so it survives redeploys). Swap in Postgres by setting
  `DATABASE_URL` directly — the SQLAlchemy layer doesn't care.
- **AI recognition** (`app/ai/`): `AIProvider` is an abstract base class with
  one method, `identify(image_bytes, mime_type) -> IdentifyResult`.
  `AnthropicProvider` and `OpenAIProvider` implement it against each
  vendor's vision API; `get_ai_provider()` picks one based on `AI_PROVIDER` +
  whichever API key is set, falling back to a `NoOpProvider` that returns no
  candidates (so the rest of the app still works with zero AI configured).
- **Matching** (`app/ai/matcher.py`): fuzzy-matches an AI-identified
  candidate against existing inventory (exact MPN match, or name/value
  similarity above a threshold) so the Scan flow can offer "add to existing
  stock" instead of always creating a duplicate part.
- **Enrichment** (`app/enrichment/`): optional Mouser Search API lookup for
  datasheets/specs/pricing, plus zero-config supplier search-link generation
  (Mouser, DigiKey, LCSC, Octopart) that always works even without any API
  key.
- **Capture ingestion** (`app/routers/capture.py`): a second entry point into
  the same scan pipeline, protected by a shared-secret header, so any device
  on your network can feed it photos without going through the browser.

## Frontend (`frontend/`)

React + TypeScript + Vite + Tailwind CSS. No heavyweight state library —
each page fetches what it needs via `src/api/client.ts`, a thin typed
wrapper over `fetch`. Pages: Dashboard, Inventory (search/filter grid),
Scan (webcam capture + AI candidate review), Part Detail (edit/adjust
stock/find datasheet), Locations, Projects (BOM + stock consumption),
Settings (read-only view of what's configured).

## Data model notes

- `Part.quantity_threshold` drives the low-stock alerts (`/api/alerts/low-stock`)
  — set it per part based on how fast you burn through that component.
- `Location` and `Category` are both self-referential trees (`parent_id`),
  so you can model "Cabinet → Drawer → Bin" as deep as you want, or keep it
  flat.
- `BOMItem` links a `Project` to `Part`s with a required quantity;
  `POST /projects/{id}/consume` atomically deducts stock for every line item
  (and refuses if any line is short, so you never end up with a partially
  consumed build).
- `ScanLog` keeps the raw AI response for every scan — useful for debugging
  misidentifications or later fine-tuning your prompt.

## Extending it

- **New AI provider**: implement `AIProvider` in `app/ai/`, register it in
  `get_ai_provider()`.
- **New supplier integration**: add a module under `app/enrichment/` similar
  to `mouser.py`.
- **Barcode/QR scanning**: the Scan page already captures a still frame from
  the webcam; a barcode-decoding library (e.g. `zxing` via a JS port) could
  run client-side on that same frame before falling back to AI recognition.
- **Multi-user auth**: none is built in (this is designed for a single
  household/workshop). If you need it, FastAPI has straightforward
  dependency-injection hooks for adding an auth layer in front of the
  routers.
