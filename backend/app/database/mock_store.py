"""
In-memory incident store (mock database).

Replaces a real DB for the hackathon prototype.
Keys  → signal_id (str)
Values → IncidentRecord dict
"""

from typing import Any

# Shared mutable dict – single process only (sufficient for prototype)
incident_store: dict[str, Any] = {}


def upsert_incident(signal_id: str, data: dict) -> None:
    """Create or update an incident record."""
    incident_store[signal_id] = data


def get_incident(signal_id: str) -> dict | None:
    return incident_store.get(signal_id)
