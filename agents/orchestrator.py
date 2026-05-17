"""
NigehbaanAI – Legacy Stub Orchestrator (DEPRECATED)

**Do not use in production.** The API uses agents.adk_orchestrator instead.
This module is retained for baseline_comparison.py only.

Coordinates three specialist agents:
  1. Detector  – fuses signals and classifies the crisis
  2. Planner   – selects response actions given resource constraints
  3. Executor  – simulates actions and generates stakeholder notifications

All agent reasoning traces are appended to agents/traces/trace_log.jsonl
for submission evidence  [cite: 391].
"""

from __future__ import annotations

import json
import datetime
import pathlib

import agents.path_setup  # noqa: F401

from app.database.mock_store import upsert_incident
from agents.tools.map_tool import simulate_rerouting
from agents.tools.alert_tool import send_alert

TRACE_FILE = pathlib.Path(__file__).parent / "traces" / "trace_log.jsonl"
TRACE_FILE.parent.mkdir(exist_ok=True)


# ── Helpers ──────────────────────────────────────────────────────────────────

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


def _load_skill(name: str) -> str:
    """Read a Markdown skill definition."""
    path = pathlib.Path(__file__).parent / "skills" / f"{name}.md"
    return path.read_text(encoding="utf-8")


# ── Stub agent calls (wire real Antigravity SDK in next sprint) ───────────────

def _run_detector(signal_id: str, payload: dict) -> dict:
    """
    Detector agent: classifies crisis type, severity, and confidence.
    Currently a deterministic stub; replace with ADK agent call.
    """
    description = payload.get("description", "").lower()
    location = payload.get("location", "Unknown")

    # Naive classification – real version will use LLM + multi-signal fusion
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
    """
    Planner agent: selects response actions given resource constraints.
    """
    crisis = detection["crisis_type"]
    severity = detection["severity"]

    action_plan = []
    resources_allocated = {}

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
    """
    Executor agent: fires simulated tools and returns impact assessment.
    """
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


# ── Public entry point ────────────────────────────────────────────────────────

def process_signal(signal_id: str, payload: dict) -> None:
    """
    Main orchestration pipeline invoked as a background task by FastAPI.

    Pipeline:
      payload → Detector → Planner → Executor → store result
    """
    _log_trace(signal_id, "orchestrator", "signal_received", {"payload": payload})

    # Update store: processing
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
