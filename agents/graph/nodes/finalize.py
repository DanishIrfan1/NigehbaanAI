"""Persist incident outcomes to mock_store."""

from __future__ import annotations

import datetime

import agents.path_setup  # noqa: F401
from app.database.mock_store import upsert_incident

from agents.config import get_pipeline_stats, log_final_outcome, log_trace
from agents.graph.state import CrisisState
from agents.llm import consume_signal_used_mock_llm


def _base_record(state: CrisisState) -> dict:
    return {
        "signal_id": state["signal_id"],
        "payload": state.get("payload"),
        "degraded_mode": state.get("degraded_mode", False),
        "warnings": state.get("warnings") or [],
        "fallback_sources_used": state.get("fallback_sources_used") or [],
        "duplicate_info": state.get("duplicate_info"),
        "detection": state.get("detection"),
    }


def finalize_complete_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    detection = state.get("detection") or {}
    classification = detection.get("classification", {})
    severity = detection.get("severity", {})
    response = {
        "plan": state.get("plan"),
        "execution": state.get("execution"),
        "notifications": state.get("notifications"),
    }
    impact = state.get("impact") or {}
    stats = get_pipeline_stats()

    result = {
        **_base_record(state),
        "status": "completed",
        "response": response,
        "impact": impact,
        "pipeline_stats": stats,
        "completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
    }

    log_final_outcome(signal_id, {
        "crisis_type": classification.get("crisis_type"),
        "severity": severity.get("severity"),
        "confidence": classification.get("confidence"),
        "actions_executed": len((state.get("execution") or {}).get("executed_actions", [])),
        "final_status": impact.get("crisis_status", {}).get("after", "MANAGED"),
        "degraded_mode": state.get("degraded_mode", False),
        "llm_calls": stats.get("llm_calls", 0),
        "tool_calls": stats.get("tool_calls", 0),
    })

    result["simulated_llm_pipeline"] = consume_signal_used_mock_llm(signal_id)
    upsert_incident(signal_id, result)
    return {"status": "completed"}


def finalize_duplicate_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    log_trace(signal_id, "orchestrator", "duplicate_detected", state.get("duplicate_info") or {})

    result = {
        **_base_record(state),
        "status": "duplicate_detected",
        "degraded_mode": True,
    }
    result["simulated_llm_pipeline"] = consume_signal_used_mock_llm(signal_id)
    upsert_incident(signal_id, result)
    return {"status": "duplicate_detected"}


def finalize_review_node(state: CrisisState) -> dict:
    """Low confidence or insufficient sources — skip response LLM stages."""
    signal_id = state["signal_id"]
    log_trace(signal_id, "orchestrator", "human_review_pending", {
        "human_review_required": state.get("human_review_required"),
        "skip_response": state.get("skip_response"),
    })

    result = {
        **_base_record(state),
        "status": "needs_review",
        "human_review_required": True,
        "response": None,
        "impact": {
            "crisis_status": {"before": "ACTIVE", "after": "PENDING_REVIEW"},
            "note": "Response pipeline skipped pending human review or more sources",
        },
    }
    result["simulated_llm_pipeline"] = consume_signal_used_mock_llm(signal_id)
    upsert_incident(signal_id, result)
    return {"status": "needs_review"}
