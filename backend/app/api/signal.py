"""
POST /signal  – Accept incoming crisis signals and dispatch to the ADK Orchestrator.
"""

from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from app.database.mock_store import upsert_incident

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


class VerifyPayload(BaseModel):
    field_report: str


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/signal", response_model=SignalResponse, status_code=202)
async def ingest_signal(payload: SignalPayload, background_tasks: BackgroundTasks):
    """
    Accepts a crisis signal and queues it for ADK Orchestrator processing.
    Returns immediately with a signal_id; use GET /status/{signal_id} to poll.
    """
    import uuid

    signal_id = str(uuid.uuid4())
    payload_dict = payload.model_dump()

    # Register immediately so GET /status/{id} never races the background worker.
    upsert_incident(
        signal_id,
        {
            "status": "queued",
            "signal_id": signal_id,
            "payload": payload_dict,
        },
    )

    # Use the new ADK orchestrator
    from agents.adk_orchestrator import process_signal

    background_tasks.add_task(process_signal, signal_id, payload_dict)

    return SignalResponse(
        signal_id=signal_id,
        status="queued",
        message="Signal received. ADK Orchestrator processing in background.",
    )


@router.post("/verify/{signal_id}", status_code=202)
async def verify_signal(signal_id: str, payload: VerifyPayload, background_tasks: BackgroundTasks):
    """
    Submit a field report to verify or correct an existing incident.
    Triggers the Verification Agent pipeline in the background.
    """
    from agents.adk_orchestrator import verify_incident

    background_tasks.add_task(verify_incident, signal_id, payload.field_report)

    return {
        "signal_id": signal_id,
        "status": "verifying",
        "message": "Field report received. Verification Agent processing in background.",
    }


@router.post("/scenario/multi-crisis", status_code=202)
async def run_multi_crisis_scenario(background_tasks: BackgroundTasks):
    """
    Queue two simultaneous crisis signals for multi-crisis demo:
    G-10 flooding + F-8 heatwave.
    """
    import uuid
    import time

    from agents.adk_orchestrator import process_signal

    flood_id = str(uuid.uuid4())
    heat_id = str(uuid.uuid4())

    flood_payload = {
        "source": "multi_source",
        "location": "G-10, Islamabad",
        "description": "Streets flooded in G-10! Water entering homes. Need help NOW!",
        "severity_hint": "high",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    }
    heat_payload = {
        "source": "multi_source",
        "location": "F-8, Islamabad",
        "description": "Elderly people collapsing from heat in F-8. Extreme temperatures.",
        "severity_hint": "medium",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": False,
    }

    upsert_incident(
        flood_id,
        {"status": "queued", "signal_id": flood_id, "payload": flood_payload},
    )
    upsert_incident(
        heat_id,
        {"status": "queued", "signal_id": heat_id, "payload": heat_payload},
    )

    background_tasks.add_task(process_signal, flood_id, flood_payload)

    def _delayed_heat():
        time.sleep(2)
        process_signal(heat_id, heat_payload)

    background_tasks.add_task(_delayed_heat)

    return {
        "status": "queued",
        "flood_signal_id": flood_id,
        "heat_signal_id": heat_id,
        "message": "Multi-crisis scenario queued (G-10 flood + F-8 heatwave after 2s).",
    }
