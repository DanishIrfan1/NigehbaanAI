"""
GET /status/{signal_id}  – Poll orchestrator result for a processed signal.
GET /incidents           – List all active incidents.
"""

from fastapi import APIRouter, HTTPException
from backend.app.database.mock_store import incident_store

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
