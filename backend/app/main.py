"""
NigehbaanAI – FastAPI entry point.

Mounts all API routers and exposes health + readiness endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import signal, status
from app.core.config import settings

app = FastAPI(
    title="NigehbaanAI – CIRO Backend",
    description="Crisis Intelligence & Response Orchestrator API",
    version="0.1.0",
)

# ── CORS (open for hackathon; tighten for production) ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(signal.router, prefix="/api/v1", tags=["Signal"])
app.include_router(status.router, prefix="/api/v1", tags=["Status"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "nigehbaan-ai"}
