# ── Stage 1: Build React frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps --prefer-offline
COPY client/ ./
RUN npm run build

# ── Stage 2: Python backend + built frontend ───────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Install Python deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend into backend's static folder
COPY --from=frontend-build /app/client/dist ./client/dist

# Expose port (Render / Railway / Fly read $PORT)
ENV PORT=5000
ENV FLASK_DEBUG=false
EXPOSE 5000

# Run with gunicorn (2 workers, suitable for free-tier containers)
CMD ["sh", "-c", "gunicorn -w 2 -b 0.0.0.0:${PORT} backend.app:app"]
