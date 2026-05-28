"""Hybrid stakeholder notifications: templates + one small LLM for key audiences."""

from __future__ import annotations

import json

from agents.config import log_trace
from agents.graph.state import CrisisState
from agents.llm import invoke_text, parse_json_from_llm


def _template_message(
    audience: str,
    crisis_type: str,
    location: str,
    severity: str,
    action_titles: list[str],
) -> str:
    actions = ", ".join(action_titles[:4]) if action_titles else "coordination in progress"
    templates = {
        "hospital": f"[SIMULATED] Prepare for {crisis_type} at {location}. Severity: {severity}. Actions: {actions}.",
        "utility_company": f"[SIMULATED] Inspect utilities near {location} for {crisis_type}.",
        "transport_authority": f"[SIMULATED] Adjust routes near {location}; blocked corridors possible.",
        "media_command_center": f"[SIMULATED] Official: coordinated response for {crisis_type} at {location}.",
    }
    return templates.get(
        audience,
        f"[SIMULATED] {audience}: {crisis_type} at {location} ({severity}).",
    )


def notify_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    detection = state.get("detection") or {}
    classification = detection.get("classification", {})
    severity = detection.get("severity", {})
    execution = state.get("execution") or {}

    crisis_type = classification.get("crisis_type", "unknown")
    location = classification.get("location", "")
    sev = severity.get("severity", "medium")

    action_titles = [
        a.get("action", "action")
        for a in execution.get("executed_actions", [])
    ]

    log_trace(signal_id, "stakeholder_notifier_agent", "reasoning_start", {
        "task": "hybrid templates + compact LLM for public/emergency",
    })

    notifications: dict[str, str] = {}
    for aud in ("hospital", "utility_company", "transport_authority", "media_command_center"):
        notifications[aud] = _template_message(aud, crisis_type, location, sev, action_titles)

    compact_actions = [
        {"action": a.get("action"), "status": a.get("status")}
        for a in execution.get("executed_actions", [])
    ]
    llm_prompt = (
        f"Crisis: {crisis_type} at {location}, severity {sev}. "
        f"Actions: {json.dumps(compact_actions, separators=(',', ':'))}. "
        "Return JSON only: "
        '{"public":"[SIMULATED] ...","emergency_services":"[SIMULATED] ..."}'
    )

    try:
        text = invoke_text(signal_id, "notify_llm_agent", llm_prompt)
        llm_part = parse_json_from_llm(text)
        notifications["public"] = llm_part.get("public", notifications.get("public", ""))
        notifications["emergency_services"] = llm_part.get(
            "emergency_services",
            notifications.get("emergency_services", ""),
        )
    except (json.JSONDecodeError, TypeError):
        notifications["public"] = _template_message("public", crisis_type, location, sev, action_titles)
        notifications["emergency_services"] = _template_message(
            "emergency_services", crisis_type, location, sev, action_titles
        )

    result = {
        "notifications": notifications,
        "notification_count": len(notifications),
        "priority_audience": "public",
    }

    log_trace(signal_id, "stakeholder_notifier_agent", "notifications_generated", {
        "audiences_notified": list(notifications.keys()),
        "priority_audience": "public",
    })

    return {"notifications": result}
