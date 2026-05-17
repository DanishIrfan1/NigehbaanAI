"""
POST /signal  – Accept incoming crisis signals and dispatch to the ADK Orchestrator.
"""

from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

router = APIRouter()


# ── Request / Response schemas ───────────────────────────────────────────────

class SignalPayload(BaseModel):
    source: str = "multi_source"  # e.g. "social_media", "weather", "traffic", "sensor"
    location: str = "G-10, Islamabad"
    description: str = ""
    severity_hint: str = "unknown"  # low | medium | high | unknown
    timestamp: str | None = None    # ISO-8601; None = server time
    enable_weather: bool = True
    enable_traffic: bool = True
    enable_social: bool = True
    enable_emergency_call: bool = True


class SignalResponse(BaseModel):
    signal_id: str
    status: str
    message: str


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/signal", response_model=SignalResponse, status_code=202)
async def ingest_signal(payload: SignalPayload, background_tasks: BackgroundTasks):
    """
    Accepts a crisis signal and queues it for ADK Orchestrator processing.
    Returns immediately with a signal_id; use GET /status/{signal_id} to poll.
    """
    import uuid

    signal_id = str(uuid.uuid4())

    # Use the new ADK orchestrator
    from agents.adk_orchestrator import process_signal

    background_tasks.add_task(process_signal, signal_id, payload.model_dump())

    return SignalResponse(
        signal_id=signal_id,
        status="queued",
        message="Signal received. ADK Orchestrator processing in background.",
    )
