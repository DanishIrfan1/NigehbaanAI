"""
NigehbaanAI – FastAPI entry point.

Mounts all API routers and exposes health + readiness endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import signal, status
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Crisis Intelligence & Response Orchestrator API",
    version="0.2.0",
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
    return {"status": "ok", "service": "nigehbaan-ai", "version": "0.2.0"}


@app.get("/api/v1/endpoints", tags=["Health"])
async def list_endpoints():
    """List all available API endpoints for frontend integration."""
    return {
        "endpoints": {
            "POST /api/v1/signal": "Submit a crisis signal for analysis",
            "GET /api/v1/status/{signal_id}": "Full status of a processed signal",
            "GET /api/v1/crisis/{signal_id}": "Detection results (classification + severity)",
            "GET /api/v1/agents/trace/{signal_id}": "Agent reasoning trace logs",
            "GET /api/v1/actions/{signal_id}": "Executed response actions",
            "GET /api/v1/outcome/{signal_id}": "Before/after impact assessment",
            "GET /api/v1/incidents": "List all tracked incidents",
            "POST /api/v1/verify/{signal_id}": "Submit field report for verification / false alarm",
            "POST /api/v1/scenario/multi-crisis": "Queue G-10 flood + F-8 heatwave demo signals",
        }
    }
