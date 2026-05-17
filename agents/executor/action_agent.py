"""
Action Executor Agent — Tool execution and response simulation.

Executes response actions using specific tools (e.g., rerouting, alerts)
and records the status and results of each action.

Part of the NigehbaanAI Stage 3 response pipeline.
"""

from __future__ import annotations

from typing import Any

from agents.config import log_trace
from agents.tools.map_tool import simulate_rerouting
from agents.tools.alert_tool import send_alert


def run_action_executor(
    signal_id: str,
    classification: dict[str, Any],
    plan: dict[str, Any],
) -> dict:
    """
    Execute response actions using tools and record before/after states.

    Args:
        signal_id: Unique identifier for this crisis.
        classification: Dict from Classifier Agent.
        plan: Dict from Resource Planner Agent.

    Returns:
        Dict with list of executed actions and their results.
    """
    log_trace(signal_id, "action_executor_agent", "execution_start", {
        "action_count": len(plan.get("action_plan", [])),
    })

    executed_actions = []
    for action_item in plan.get("action_plan", []):
        action_name = action_item.get("action", "unknown")
        log_trace(signal_id, "action_executor_agent", f"executing_{action_name}", {
            "step": action_item.get("step"),
            "description": action_item.get("description", ""),
        })

        tool_result = None
        try:
            if "rerouting" in action_name.lower() or "traffic" in action_name.lower():
                tool_result = simulate_rerouting(classification.get("location", ""))
            elif "alert" in action_name.lower() or "public" in action_name.lower():
                tool_result = send_alert(
                    channel="public",
                    location=classification.get("location", ""),
                    crisis_type=classification.get("crisis_type", "unknown"),
                    severity=classification.get("confidence", 0),
                )
            elif "hospital" in action_name.lower() or "medical" in action_name.lower():
                tool_result = send_alert(
                    channel="hospital",
                    location=classification.get("location", ""),
                    crisis_type=classification.get("crisis_type", "unknown"),
                    severity=classification.get("confidence", 0),
                )
            elif "dispatch" in action_name.lower() or "rescue" in action_name.lower():
                tool_result = {
                    "status": "[SIMULATED] dispatched",
                    "units": action_item.get("resources_needed", {}),
                    "location": classification.get("location", ""),
                    "eta_minutes": 8,
                }
            else:
                tool_result = {
                    "status": "[SIMULATED] executed",
                    "action": action_name,
                    "detail": action_item.get("description", "Simulated action"),
                }
        except Exception as e:
            tool_result = {"status": "error", "error": str(e)}

        executed_actions.append({
            "step": action_item.get("step"),
            "action": action_name,
            "description": action_item.get("description", ""),
            "status": "completed" if tool_result and "error" not in tool_result else "failed",
            "tool_result": tool_result,
            "resources_used": action_item.get("resources_needed", {}),
        })

        log_trace(signal_id, "action_executor_agent", f"{action_name}_result", {
            "status": executed_actions[-1]["status"],
        })

    log_trace(signal_id, "action_executor_agent", "execution_complete", {
        "total_actions": len(executed_actions),
        "successful": sum(1 for a in executed_actions if a["status"] == "completed"),
        "failed": sum(1 for a in executed_actions if a["status"] == "failed"),
    })

    return {"executed_actions": executed_actions}
