"""
NigehbaanAI – Legacy Stub Orchestrator (DEPRECATED)

Retained for baseline comparisons only. Production uses LangGraph via
agents/orchestrator.py.
"""

from __future__ import annotations

import datetime
import json
import pathlib

import agents.path_setup  # noqa: F401

from app.database.mock_store import upsert_incident
from agents.tools.alert_tool import send_alert
from agents.tools.map_tool import simulate_rerouting

_REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
TRACE_FILE = _REPO_ROOT / "agents" / "traces" / "trace_log.jsonl"
TRACE_FILE.parent.mkdir(exist_ok=True)


def _log_trace(signal_id: str, agent: str, event: str, data: dict) -> None:
    """Append a structured trace entry (JSONL) for submission."""
    entry = {
        "ts": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "signal_id": signal_id,
        "agent": agent,
        "event": event,
        **data,
    }
    with TRACE_FILE.open("a") as f:
        f.write(json.dumps(entry) + "\n")


def _run_detector(signal_id: str, payload: dict) -> dict:
    """Deterministic stub classification (legacy baseline)."""
    description = payload.get("description", "").lower()
    location = payload.get("location", "Unknown")

    if any(k in description for k in ["flood", "water", "rain"]):
        crisis_type = "urban_flooding"
        severity = "high"
        confidence = 0.82
    elif any(k in description for k in ["heat", "hot", "temperature"]):
        crisis_type = "heatwave"
        severity = "medium"
        confidence = 0.74
    elif any(k in description for k in ["fire", "blaze"]):
        crisis_type = "fire"
        severity = "high"
        confidence = 0.88
    else:
        crisis_type = "unknown"
        severity = "low"
        confidence = 0.30

    result = {
        "crisis_type": crisis_type,
        "location": location,
        "severity": severity,
        "confidence": confidence,
        "affected_population_estimate": 5000,
        "expected_duration_hrs": 4,
    }
    _log_trace(signal_id, "detector", "classification_result", result)
    return result


def _run_planner(signal_id: str, detection: dict) -> dict:
    """Select response actions given resource constraints (legacy baseline)."""
    crisis = detection["crisis_type"]
    severity = detection["severity"]

    if crisis == "urban_flooding":
        action_plan = ["traffic_rerouting", "rescue_dispatch", "public_alert", "hospital_notify"]
        resources_allocated = {"rescue_teams": 3, "police_units": 4, "ambulances": 2}
    elif crisis == "heatwave":
        action_plan = ["medical_outreach", "shelter_activation", "public_alert"]
        resources_allocated = {"ambulances": 3, "field_teams": 5, "shelters": 2}
    else:
        action_plan = ["public_alert", "field_investigation"]
        resources_allocated = {"field_teams": 2}

    plan = {
        "action_plan": action_plan,
        "resources_allocated": resources_allocated,
        "priority": "P1" if severity == "high" else "P2",
        "rationale": f"Crisis type '{crisis}' with severity '{severity}' triggers standard protocol.",
    }
    _log_trace(signal_id, "planner", "action_plan_selected", plan)
    return plan


def _run_executor(signal_id: str, detection: dict, plan: dict) -> dict:
    """Fire simulated tools and return impact assessment (legacy baseline)."""
    results = []

    for action in plan["action_plan"]:
        if action == "traffic_rerouting":
            r = simulate_rerouting(detection["location"])
            results.append({"action": action, "outcome": r})
        elif action == "public_alert":
            r = send_alert(
                channel="public",
                location=detection["location"],
                crisis_type=detection["crisis_type"],
                severity=detection["severity"],
            )
            results.append({"action": action, "outcome": r})
        elif action == "hospital_notify":
            r = send_alert(
                channel="hospital",
                location=detection["location"],
                crisis_type=detection["crisis_type"],
                severity=detection["severity"],
            )
            results.append({"action": action, "outcome": r})
        else:
            results.append({"action": action, "outcome": {"status": "simulated", "detail": "stub"}})

    execution = {"executed_actions": results}
    _log_trace(signal_id, "executor", "actions_executed", execution)
    return execution


def process_signal(signal_id: str, payload: dict) -> None:
    """Legacy baseline pipeline: payload → Detector → Planner → Executor → store."""
    _log_trace(signal_id, "orchestrator", "signal_received", {"payload": payload})
    upsert_incident(signal_id, {"status": "processing", "payload": payload})

    try:
        detection = _run_detector(signal_id, payload)
        plan = _run_planner(signal_id, detection)
        execution = _run_executor(signal_id, detection, plan)

        result = {
            "status": "completed",
            "signal_id": signal_id,
            "detection": detection,
            "plan": plan,
            "execution": execution,
        }
        _log_trace(signal_id, "orchestrator", "pipeline_complete", {"result": result})
        upsert_incident(signal_id, result)
    except (KeyError, TypeError, ValueError, OSError) as exc:
        error = {"status": "error", "signal_id": signal_id, "error": str(exc)}
        _log_trace(signal_id, "orchestrator", "pipeline_error", error)
        upsert_incident(signal_id, error)

