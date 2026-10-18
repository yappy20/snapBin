# Single-service build: compiles the React frontend, then bakes the static
# build into the FastAPI backend image. One container serves everything —
# the API under /api, uploaded photos under /uploads, and the UI for
# everything else. This is the image Railway (or any other PaaS/VPS) runs.

# ---- Stage 1: build the frontend ----
FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: backend + baked-in frontend ----
FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /frontend/dist ./frontend_dist

# Local default; on Railway set DATA_DIR to your mounted volume's path
# (e.g. /app/data) via an environment variable instead of rebuilding.
RUN mkdir -p /app/data
ENV DATA_DIR=/app/data
ENV PORT=8000

EXPOSE 8000

# Railway injects $PORT; this falls back to 8000 for `docker run` elsewhere.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
