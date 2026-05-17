"""
GET /status/{signal_id}  – Poll orchestrator result for a processed signal.
GET /incidents           – List all active incidents.
GET /crisis/{signal_id}  – Get detection results (classification + severity).
GET /agents/trace/{signal_id} – Get agent reasoning trace logs.
GET /actions/{signal_id} – Get executed actions.
GET /outcome/{signal_id} – Get before/after impact stats.
"""

from fastapi import APIRouter, HTTPException

from app.database.mock_store import incident_store

router = APIRouter()


@router.get("/status/{signal_id}")
async def get_signal_status(signal_id: str):
    """Return the current processing state and result for a given signal_id."""
    record = incident_store.get(signal_id)
    if not record:
        raise HTTPException(status_code=404, detail="Signal ID not found.")
    return record


@router.get("/incidents")
async def list_incidents():
    """Return all tracked incidents (active and resolved)."""
    return {"incidents": list(incident_store.values())}


@router.get("/crisis/{signal_id}")
async def get_crisis_detection(signal_id: str):
    """Return the detection results: fusion, classification, severity."""
    record = incident_store.get(signal_id)
    if not record:
        raise HTTPException(status_code=404, detail="Signal ID not found.")

    detection = record.get("detection")
    if not detection:
        return {
            "signal_id": signal_id,
            "status": record.get("status", "processing"),
            "message": "Detection not yet complete. Pipeline is still running.",
        }

    return {
        "signal_id": signal_id,
        "status": record.get("status"),
        "classification": detection.get("classification", {}),
        "severity": detection.get("severity", {}),
        "fusion": detection.get("fusion", {}),
    }


@router.get("/agents/trace/{signal_id}")
async def get_agent_traces(signal_id: str):
    """Return all agent reasoning traces for a signal."""
    from agents.config import get_traces

    traces = get_traces(signal_id)
    if not traces:
        record = incident_store.get(signal_id)
        if not record:
            raise HTTPException(status_code=404, detail="Signal ID not found.")
        return {
            "signal_id": signal_id,
            "trace_count": 0,
            "traces": [],
            "message": "No traces yet. Pipeline may still be starting.",
        }

    return {
        "signal_id": signal_id,
        "trace_count": len(traces),
        "traces": traces,
    }


@router.get("/actions/{signal_id}")
async def get_actions(signal_id: str):
    """Return the executed response actions for a signal."""
    record = incident_store.get(signal_id)
    if not record:
        raise HTTPException(status_code=404, detail="Signal ID not found.")

    response = record.get("response", {})
    execution = response.get("execution", {})
    plan = response.get("plan", {})

    if not execution:
        return {
            "signal_id": signal_id,
            "status": record.get("status", "processing"),
            "message": "Actions not yet executed. Pipeline is still running.",
            "actions": [],
        }

    return {
        "signal_id": signal_id,
        "status": "completed",
        "priority": plan.get("priority", "P2"),
        "actions": execution.get("executed_actions", []),
        "plan_rationale": plan.get("rationale", ""),
        "multi_crisis_tradeoffs": plan.get("multi_crisis_tradeoffs", ""),
    }


@router.get("/outcome/{signal_id}")
async def get_outcome(signal_id: str):
    """Return the before/after impact assessment for a signal."""
    record = incident_store.get(signal_id)
    if not record:
        raise HTTPException(status_code=404, detail="Signal ID not found.")

    impact = record.get("impact")
    response = record.get("response", {})
    notifications = response.get("notifications", {})

    if not impact:
        return {
            "signal_id": signal_id,
            "status": record.get("status", "processing"),
            "message": "Impact assessment not yet complete.",
        }

    return {
        "signal_id": signal_id,
        "status": "completed",
        "impact": impact,
        "notifications": notifications.get("notifications", {}),
        "notification_count": notifications.get("notification_count", 0),
    }
