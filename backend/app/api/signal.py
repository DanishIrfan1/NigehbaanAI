"""
POST /signal  – Accept incoming crisis signals and dispatch to the Orchestrator.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

router = APIRouter()


# ── Request / Response schemas ───────────────────────────────────────────────

class SignalPayload(BaseModel):
    source: str          # e.g. "social_media", "weather", "traffic", "sensor"
    location: str        # e.g. "G-10, Islamabad"
    description: str
    severity_hint: str = "unknown"  # low | medium | high | unknown
    timestamp: str | None = None    # ISO-8601; None = server time


class SignalResponse(BaseModel):
    signal_id: str
    status: str
    message: str


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/signal", response_model=SignalResponse, status_code=202)
async def ingest_signal(payload: SignalPayload, background_tasks: BackgroundTasks):
    """
    Accepts a crisis signal and queues it for Orchestrator processing.
    Returns immediately with a signal_id; use GET /status/{signal_id} to poll.
    """
    import uuid, datetime

    signal_id = str(uuid.uuid4())

    # Lazy import avoids circular dependency at startup
    from agents.orchestrator import process_signal  # noqa: F401

    background_tasks.add_task(process_signal, signal_id, payload.model_dump())

    return SignalResponse(
        signal_id=signal_id,
        status="queued",
        message="Signal received. Orchestrator processing in background.",
    )
