"""
In-memory incident store (mock database).

Replaces a real DB for the hackathon prototype.
Keys  → signal_id (str)
Values → IncidentRecord dict
"""

from __future__ import annotations

import copy
import datetime
from typing import Any

from agents.config import DEFAULT_RESOURCES

# Shared mutable dict – single process only (sufficient for prototype)
incident_store: dict[str, Any] = {}

# Shared resource pool across simultaneous crises
resource_ledger: dict[str, int] = copy.deepcopy(DEFAULT_RESOURCES)


def reset_resource_ledger() -> None:
    """Reset ledger to defaults (used in tests and demo scripts)."""
    global resource_ledger
    resource_ledger = copy.deepcopy(DEFAULT_RESOURCES)


def upsert_incident(signal_id: str, data: dict) -> None:
    """Create or update an incident record."""
    if data.get("status") == "completed" and "completed_at" not in data:
        data = {**data, "completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")}
    incident_store[signal_id] = data


def get_incident(signal_id: str) -> dict | None:
    return incident_store.get(signal_id)


def commit_resources(committed: dict[str, int]) -> dict[str, int]:
    """
    Deduct committed resources from the shared ledger.
    Returns actual committed amounts (capped by availability).
    """
    actual: dict[str, int] = {}
    for resource, amount in committed.items():
        if not isinstance(amount, (int, float)):
            continue
        need = int(amount)
        available = resource_ledger.get(resource, 0)
        take = min(need, available)
        if take > 0:
            resource_ledger[resource] = available - take
            actual[resource] = take
    return actual


def get_ledger_snapshot() -> dict[str, int]:
    return dict(resource_ledger)
