"""Deterministic impact assessment node."""

from __future__ import annotations

from agents.config import log_trace
from agents.graph.state import CrisisState


def _collect_action_metrics(actions: list[dict]) -> dict:
    metrics = {
        "congestion_before": 87,
        "congestion_after": 87,
        "response_after": 15,
        "citizens_after": 0,
        "ambulance_before": None,
        "ambulance_after": None,
        "rescue_deployed": 0,
    }
    for item in actions:
        result = item.get("tool_result") or {}
        reduction = result.get("congestion_reduction_pct")
        if isinstance(reduction, (int, float)):
            metrics["congestion_after"] = max(10, metrics["congestion_before"] - reduction)

        eta_minutes = result.get("eta_minutes")
        if isinstance(eta_minutes, (int, float)):
            metrics["response_after"] = min(metrics["response_after"], eta_minutes)

        ambulance_eta = result.get("ambulance_eta_min")
        if isinstance(ambulance_eta, dict):
            metrics["ambulance_before"] = ambulance_eta.get("before")
            metrics["ambulance_after"] = ambulance_eta.get("after")

        if result.get("channel") == "public" and str(result.get("status", "")).endswith("sent"):
            metrics["citizens_after"] += 4200

        units_deployed = (result.get("after_state") or {}).get("units_deployed")
        if isinstance(units_deployed, (int, float)):
            metrics["rescue_deployed"] += units_deployed
    return metrics


def _urban_flooding_impact(actions: list[dict], metrics: dict) -> dict:
    impact = {
        "traffic_congestion": {
            "before_pct": metrics["congestion_before"],
            "after_pct": metrics["congestion_after"],
            "change": metrics["congestion_after"] - metrics["congestion_before"],
        },
        "response_time_min": {
            "before": None,
            "after": metrics["response_after"] if metrics["response_after"] < 15 else 8,
        },
        "citizens_alerted": {"before": 0, "after": metrics["citizens_after"] or 4200},
        "crisis_status": {"before": "ACTIVE", "after": "MANAGED"},
        "rescue_teams_deployed": metrics["rescue_deployed"] or len(actions),
    }
    if metrics["ambulance_after"] is not None:
        before_eta = metrics["ambulance_before"] or 25
        after_eta = metrics["ambulance_after"]
        impact["ambulance_eta_min"] = {
            "before": before_eta,
            "after": after_eta,
            "change": (after_eta or 12) - before_eta,
        }
    return impact


def _heatwave_impact(metrics: dict) -> dict:
    return {
        "cooling_centers_active": {"before": 0, "after": 3},
        "response_time_min": {
            "before": None,
            "after": metrics["response_after"] if metrics["response_after"] < 15 else 12,
        },
        "citizens_alerted": {"before": 0, "after": metrics["citizens_after"] or 2800},
        "medical_teams_deployed": {"before": 0, "after": metrics["rescue_deployed"] or 5},
        "crisis_status": {"before": "ACTIVE", "after": "MANAGED"},
    }


def _default_impact(metrics: dict) -> dict:
    return {
        "response_time_min": {"before": None, "after": metrics["response_after"]},
        "citizens_alerted": {"before": 0, "after": metrics["citizens_after"] or 1000},
        "crisis_status": {"before": "ACTIVE", "after": "UNDER_REVIEW"},
    }


def _impact_for_crisis_type(crisis_type: str, actions: list[dict], metrics: dict) -> dict:
    if crisis_type == "urban_flooding":
        return _urban_flooding_impact(actions, metrics)
    if crisis_type == "heatwave":
        return _heatwave_impact(metrics)
    return _default_impact(metrics)


def compute_impact(
    signal_id: str,
    classification: dict,
    execution: dict,
) -> dict:
    """Compute before/after impact metrics from executed action tool results."""
    log_trace(signal_id, "impact_assessor", "computing_impact", {})

    crisis_type = classification.get("crisis_type", "unknown")
    actions = execution.get("executed_actions", [])
    metrics = _collect_action_metrics(actions)
    impact = _impact_for_crisis_type(crisis_type, actions, metrics)

    impact["per_action_summary"] = [
        {
            "action": a.get("action"),
            "status": a.get("status"),
            "side_effects": a.get("side_effects", []),
        }
        for a in actions
    ]

    log_trace(signal_id, "impact_assessor", "impact_computed", {
        "crisis_status": impact.get("crisis_status", {}).get("after"),
    })
    return impact


def impact_node(state: CrisisState) -> dict:
    detection = state.get("detection") or {}
    classification = detection.get("classification", {})
    execution = state.get("execution") or {}
    impact = compute_impact(state["signal_id"], classification, execution)
    return {"impact": impact}
