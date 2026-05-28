"""Resource planning node with compact prompts."""

from __future__ import annotations

import datetime
import json

import agents.path_setup  # noqa: F401
from app.database.mock_store import incident_store

from agents.config import DEFAULT_RESOURCES, log_trace
from agents.graph.schemas import ResponsePlan
from agents.graph.state import CrisisState
from agents.llm import invoke_structured
from agents.graph.services.resources import enforce_resource_caps

PLAN_PROMPT = """You are the Resource Planner for NigehbaanAI. Allocate emergency resources.

Crisis: {crisis_type} at {location} | confidence {confidence} | severity {severity}
Digest: {digest}
Active incidents: {active}
Resources (max): ambulances={ambulances}, police={police}, rescue={rescue}, water_tankers={tankers}
Rules: 10% reserve; include public_alert; note trade-offs if multiple crises; side_effects per action.
Blocked roads: {blocked}
"""


def _parse_completed_at(value: str | None) -> datetime.datetime | None:
    if not value:
        return None
    try:
        return datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _is_recently_completed(record: dict, now: datetime.datetime, minutes: int = 30) -> bool:
    completed_at = _parse_completed_at(record.get("completed_at"))
    if completed_at is None:
        return False
    return (now - completed_at).total_seconds() <= minutes * 60


def _is_active_incident(record: dict, now: datetime.datetime) -> bool:
    status = record.get("status", "")
    if status in {"processing", "analyzing", "planning", "executing"}:
        return True
    if status == "completed":
        return _is_recently_completed(record, now)
    return False


def _incident_summary(key: str, value: dict) -> dict:
    det = value.get("detection", {})
    classification = det.get("classification", det)
    sev = det.get("severity", {})
    return {
        "signal_id": key,
        "type": classification.get("crisis_type"),
        "severity": sev.get("severity") if isinstance(sev, dict) else sev,
        "status": value.get("status", ""),
    }


def _blocked_roads(raw: object) -> list[str]:
    if not isinstance(raw, list):
        return []
    return [str(item) for item in raw]


def _get_active_incidents(signal_id: str) -> list[dict]:
    now = datetime.datetime.now(datetime.timezone.utc)
    results = []
    for key, value in incident_store.items():
        if key == signal_id:
            continue
        if not _is_active_incident(value, now):
            continue
        results.append(_incident_summary(key, value))
    return results


def plan_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    detection = state.get("detection") or {}
    classification = detection.get("classification", {})
    severity = detection.get("severity", {})
    digest = state.get("signal_digest") or {}

    signals_raw = state.get("signals_raw") or {}
    blocked = _blocked_roads((signals_raw.get("traffic") or {}).get("blocked_roads"))

    active = _get_active_incidents(signal_id)
    log_trace(signal_id, "resource_planner_agent", "reasoning_start", {
        "task": "Allocate resources (compact prompt)",
    })

    prompt = PLAN_PROMPT.format(
        crisis_type=classification.get("crisis_type"),
        location=classification.get("location"),
        confidence=classification.get("confidence"),
        severity=severity.get("severity"),
        digest=json.dumps(digest, separators=(",", ":"))[:800],
        active=json.dumps(active, separators=(",", ":")),
        ambulances=DEFAULT_RESOURCES["ambulances"],
        police=DEFAULT_RESOURCES["police_units"],
        rescue=DEFAULT_RESOURCES["rescue_teams"],
        tankers=DEFAULT_RESOURCES["water_tankers"],
        blocked=blocked[:3],
    )

    result = invoke_structured(signal_id, "resource_planner_agent", prompt, ResponsePlan)
    plan = enforce_resource_caps(result.model_dump())
    if blocked:
        plan["blocked_roads"] = blocked

    log_trace(signal_id, "resource_planner_agent", "plan_complete", {
        "priority": plan.get("priority"),
        "action_count": len(plan.get("action_plan", [])),
    })

    return {"plan": plan, "status": "executing"}
