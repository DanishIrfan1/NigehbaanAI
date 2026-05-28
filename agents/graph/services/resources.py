"""Resource allocation caps against the shared ledger."""

from __future__ import annotations

from typing import Any

import agents.path_setup  # noqa: F401
from app.database.mock_store import commit_resources, get_ledger_snapshot

from agents.config import DEFAULT_RESOURCES


def enforce_resource_caps(plan: dict[str, Any]) -> dict[str, Any]:
    """
    Cap LLM resource commitments against DEFAULT_RESOURCES with 10% reserve.
    Deducts from shared ledger via mock_store.commit_resources.
    """
    committed = dict(plan.get("total_resources_committed") or {})
    capped: dict[str, int] = {}

    for resource, total in DEFAULT_RESOURCES.items():
        reserve = max(1, int(total * 0.10))
        max_alloc = total - reserve
        requested = int(committed.get(resource, 0))
        capped[resource] = min(requested, max_alloc)

    actual = commit_resources(capped)
    remaining = get_ledger_snapshot()

    plan["total_resources_committed"] = actual
    plan["resources_remaining"] = remaining
    plan["reserve_maintained_pct"] = 10
    if sum(actual.values()) < sum(capped.values()):
        plan["resource_cap_note"] = "Allocations capped to available pool and 10% reserve"

    return plan
