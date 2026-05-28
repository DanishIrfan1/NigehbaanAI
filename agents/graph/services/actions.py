"""Execute response plan steps via simulated tools."""

from __future__ import annotations

from typing import Any

from agents.config import log_trace
from agents.tools.alert_tool import send_alert
from agents.tools.map_tool import simulate_ambulance_reroute, simulate_rerouting


def _severity_label(classification: dict[str, Any]) -> str:
    conf = classification.get("confidence", 0.5)
    if isinstance(conf, str):
        return conf
    if conf >= 0.85:
        return "critical"
    if conf >= 0.7:
        return "high"
    if conf >= 0.5:
        return "medium"
    return "low"


def _dispatch_tool_result(
    action_name: str,
    action_item: dict[str, Any],
    location: str,
    crisis_type: str,
    severity: str,
    blocked_roads: list[str],
) -> dict[str, Any]:
    name_lower = action_name.lower()
    if "ambulance" in name_lower:
        return simulate_ambulance_reroute(location, blocked_roads)
    if "rerouting" in name_lower or "traffic" in name_lower:
        return simulate_rerouting(location)
    if "hospital" in name_lower or "medical" in name_lower:
        return send_alert(
            channel="hospital",
            location=location,
            crisis_type=crisis_type,
            severity=severity,
        )
    if "alert" in name_lower or "public" in name_lower:
        return send_alert(
            channel="public",
            location=location,
            crisis_type=crisis_type,
            severity=severity,
        )
    if "utility" in name_lower:
        return send_alert(
            channel="utility",
            location=location,
            crisis_type=crisis_type,
            severity=severity,
        )
    if "transport" in name_lower:
        return send_alert(
            channel="transport_authority",
            location=location,
            crisis_type=crisis_type,
            severity=severity,
        )
    if "dispatch" in name_lower or "rescue" in name_lower:
        return {
            "status": "[SIMULATED] dispatched",
            "units": action_item.get("resources_needed", {}),
            "location": location,
            "eta_minutes": 8,
            "before_state": {"units_deployed": 0},
            "after_state": {
                "units_deployed": sum(
                    int(v)
                    for v in (action_item.get("resources_needed") or {}).values()
                    if isinstance(v, (int, float))
                )
            },
        }
    return {
        "status": "[SIMULATED] executed",
        "action": action_name,
        "detail": action_item.get("description", "Simulated action"),
    }


def run_action_executor(
    signal_id: str,
    classification: dict[str, Any],
    plan: dict[str, Any],
) -> dict:
    """Execute response actions using tools and record results."""
    log_trace(signal_id, "action_executor_agent", "execution_start", {
        "action_count": len(plan.get("action_plan", [])),
    })

    location = classification.get("location", "")
    crisis_type = classification.get("crisis_type", "unknown")
    severity = _severity_label(classification)
    blocked_roads = plan.get("blocked_roads") or []

    executed_actions: list[dict] = []
    alert_ids: list[str] = []

    for action_item in plan.get("action_plan", []):
        action_name = action_item.get("action", "unknown")
        log_trace(signal_id, "action_executor_agent", "tool_call", {
            "action": action_name,
            "step": action_item.get("step"),
        })

        tool_result = None
        try:
            tool_result = _dispatch_tool_result(
                action_name,
                action_item,
                location,
                crisis_type,
                severity,
                blocked_roads,
            )
        except (TypeError, ValueError, KeyError, OSError) as exc:
            tool_result = {"status": "error", "error": str(exc)}

        if tool_result and tool_result.get("alert_id"):
            alert_ids.append(tool_result["alert_id"])

        executed_actions.append({
            "step": action_item.get("step"),
            "action": action_name,
            "description": action_item.get("description", ""),
            "status": "completed" if tool_result and "error" not in tool_result else "failed",
            "tool_result": tool_result,
            "resources_used": action_item.get("resources_needed", {}),
            "side_effects": action_item.get("side_effects", []),
        })

        log_trace(signal_id, "action_executor_agent", "agent_observation", {
            "action": action_name,
            "status": executed_actions[-1]["status"],
        })

    log_trace(signal_id, "action_executor_agent", "execution_complete", {
        "total_actions": len(executed_actions),
        "successful": sum(1 for a in executed_actions if a["status"] == "completed"),
        "failed": sum(1 for a in executed_actions if a["status"] == "failed"),
        "alert_ids": alert_ids,
    })

    return {"executed_actions": executed_actions, "alert_ids": alert_ids}
