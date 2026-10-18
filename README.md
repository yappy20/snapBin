# SnapBin

An open-source, self-hosted inventory system for electronic components. Point
a camera (webcam, phone, Raspberry Pi, or an $8 ESP32-CAM) at a part, and
SnapBin's AI identifies it and offers to file it into your inventory —
tracking quantity, bin location, datasheets, reorder links, and which of
your projects need it.

SnapBin deploys as **one web app with one URL** — the React UI and the
FastAPI backend ship in a single container, so there's no separate frontend
host and no CORS to configure.

## Features

- **AI photo recognition** — snap a photo of a resistor, IC, connector,
  whatever, and get back a structured guess (name, manufacturer, value,
  package, confidence) instead of typing it all in by hand. Pluggable
  between Claude and GPT-4o vision, or run with none configured and use
  SnapBin as a plain manual inventory tool.
- **Quantity & bin/location tracking** — nest cabinets → drawers → bins as
  deep as you want; every part has a physical home.
- **Low-stock alerts** — set a per-part threshold and see everything running
  low on the dashboard.
- **Datasheet & reorder links** — one-click search links to Mouser, DigiKey,
  LCSC, and Octopart on every part; optional Mouser API integration
  auto-fills datasheet URLs and pricing.
- **Projects & BOMs** — attach parts to a project's bill of materials, see
  shortages before you start soldering, and deduct stock in one click when
  you build.
- **Bring your own camera** — the web UI uses your browser's webcam from any
  device; a Raspberry Pi or ESP32-CAM can act as a dedicated capture station
  over the same API. See [`docs/HARDWARE.md`](docs/HARDWARE.md).
- **Self-hosted, MIT licensed** — your data stays on infrastructure you
  control.

## Deploy to Railway (recommended)

Railway gives you Docker builds, a persistent volume, and a public HTTPS URL
with no extra setup.

1. Push this repo to GitHub (or use the Railway CLI to deploy from a local
   folder).
2. On [railway.app](https://railway.app), create a new project → **Deploy
   from GitHub repo**, and pick this repo. Railway detects `Dockerfile`
   automatically (`railway.json` pins the builder explicitly).
3. **Add a volume**: in the service's Settings → Volumes, add a volume
   mounted at `/app/data`. This is where the SQLite database and uploaded
   photos live — without it, every redeploy wipes your inventory.
4. **Set environment variables** on the service (Settings → Variables):
   ```
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   CAPTURE_API_KEY=<a long random string>
   DATA_DIR=/app/data
   ```
   (`PORT` is injected by Railway automatically — don't set it yourself.)
5. Deploy. Railway gives you a public URL (`https://<your-service>.up.railway.app`)
   — open it and you're live. Add a custom domain under Settings → Networking
   if you want one.

To seed sample data on first deploy, open a shell on the service (Railway's
"Connect" tab) and run `python -m app.seed` once — or just start adding
parts through the UI.

## Deploy anywhere else (Render, Fly.io, a VPS)

The same `Dockerfile` works on any platform that can build and run a
container with a persistent volume:

- **Render**: New → Web Service → connect this repo, set the same env vars
  as above, add a persistent disk mounted at `/app/data`.
- **Fly.io**: `fly launch` (it'll detect the Dockerfile), then
  `fly volumes create snapbin_data` and mount it at `/app/data` in
  `fly.toml`, then `fly deploy`.
- **Your own VPS/NAS**: `docker compose up --build -d` using the included
  `docker-compose.yml` (copy `.env.example` to `.env` first). Put a reverse
  proxy like Caddy or nginx in front for HTTPS and a real domain.

## Local development

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # edit as needed; loaded relative to backend/
python -m app.seed           # optional: populate sample data so the UI isn't empty
uvicorn app.main:app --reload
```

Frontend (separate terminal):

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — Vite proxies `/api` and `/uploads` to the
backend at `localhost:8000` automatically (see `vite.config.ts`). This gives
you hot reload; the merged single-container build is only assembled at
Docker build time (see `docs/ARCHITECTURE.md`).

## Configuring AI recognition

SnapBin needs a vision-capable model to identify components from photos.
Set these as environment variables (in `.env` locally, or your platform's
dashboard in production):

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

or

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Without either key set, SnapBin runs fine as a manual inventory tool — the
Scan page will just say no provider is configured and let you add parts by
hand. The **Settings** page in the app shows exactly what's active.

## Repo layout

```
Dockerfile       Single-service build: frontend build baked into the backend image
railway.json     Railway build/deploy config
backend/         FastAPI + SQLAlchemy API (Python)
frontend/        React + Vite + Tailwind UI (TypeScript)
hardware/        Capture-station client code for Raspberry Pi / ESP32-CAM
docs/            Architecture and hardware setup guides
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the pieces fit
  together, and how to extend them (new AI providers, new supplier
  integrations, etc).
- [`docs/HARDWARE.md`](docs/HARDWARE.md) — setting up a webcam, Raspberry Pi,
  or ESP32-CAM capture station.

## Contributing

Issues and pull requests are welcome. The codebase is intentionally small
and readable — `AIProvider` and the supplier-enrichment modules in
particular are designed to be easy to extend without touching the rest of
the app.

## License

MIT — see [`LICENSE`](LICENSE).
