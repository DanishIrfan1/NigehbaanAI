"""Verification subgraph for false alarms and corrections."""

from __future__ import annotations

import json

from langgraph.graph import END, StateGraph

import agents.path_setup  # noqa: F401
from app.database.mock_store import incident_store, upsert_incident

from agents.config import log_trace
from agents.graph.schemas import VerificationOutput
from agents.graph.state import CrisisState
from agents.llm import invoke_structured
from agents.tools.alert_tool import retract_alert

VERIFY_PROMPT = """You are the Verification Agent for NigehbaanAI.

Original detection (compact):
{detection}

Field report: "{field_report}"

Determine if the report CONFIRMS, CONTRADICTS, or CORRECTS the detection.
Set verification_status to confirmed|corrected|false_alarm.
Set is_retraction_needed if public alerts should be withdrawn.
If corrected/false_alarm, set corrected_crisis_type and correction_reason.
"""


def verify_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    field_report = state.get("field_report", "")
    record = incident_store.get(signal_id, {})
    original_detection = record.get("detection", {})

    log_trace(signal_id, "verification_agent", "reasoning_start", {
        "task": "Verify incident validity against field report",
    })

    det_compact = {
        "classification": original_detection.get("classification"),
        "severity": original_detection.get("severity"),
        "fusion_summary": (original_detection.get("fusion") or {}).get("fused_summary"),
    }
    prompt = VERIFY_PROMPT.format(
        detection=json.dumps(det_compact, separators=(",", ":")),
        field_report=field_report[:500],
    )
    result = invoke_structured(signal_id, "verification_agent", prompt, VerificationOutput)
    verification = result.model_dump()

    if verification.get("corrected_crisis_type") is None and verification.get("new_type"):
        verification["corrected_crisis_type"] = verification["new_type"]
    if not verification.get("correction_reason") and verification.get("reasoning"):
        verification["correction_reason"] = verification["reasoning"][:300]

    log_trace(signal_id, "verification_agent", "verification_complete", {
        "status": verification.get("verification_status"),
        "retraction_needed": verification.get("is_retraction_needed"),
    })

    return {"verification": verification}


def retract_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    verification = state.get("verification") or {}
    record = incident_store.get(signal_id, {})

    if not verification.get("is_retraction_needed"):
        return {"retraction_result": None}

    log_trace(signal_id, "orchestrator", "executing_retraction", {})
    alert_ids = (
        record.get("response", {})
        .get("execution", {})
        .get("alert_ids", [])
    )
    original_alert_id = alert_ids[0] if alert_ids else f"alert-{signal_id[:8]}"
    classification = (record.get("detection") or {}).get("classification", {})
    retraction_result = retract_alert(
        original_alert_id=original_alert_id,
        location=classification.get("location", ""),
        corrected_type=verification.get("corrected_crisis_type", "infrastructure_failure"),
        reason=verification.get("correction_reason", state.get("field_report", "")),
    )
    return {"retraction_result": retraction_result}


def persist_verification_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    verification = state.get("verification") or {}
    record = incident_store.get(signal_id, {})
    if not record:
        log_trace(signal_id, "orchestrator", "verification_error", {"error": "Incident not found"})
        return {}

    status = record.get("status")
    if verification.get("verification_status") == "false_alarm":
        status = "false_alarm"
    elif verification.get("verification_status") == "corrected":
        status = "corrected"

    record.update({
        "status": status,
        "verification": verification,
        "retraction_result": state.get("retraction_result"),
        "last_field_report": state.get("field_report"),
    })

    log_trace(signal_id, "orchestrator", "verification_pipeline_complete", {
        "new_status": status,
        "verification_status": verification.get("verification_status"),
    })
    upsert_incident(signal_id, record)
    return {"status": status}


def _route_after_verify(state: CrisisState) -> str:
    if (state.get("verification") or {}).get("is_retraction_needed"):
        return "retract"
    return "persist"


def build_verification_graph():
    graph = StateGraph(CrisisState)
    graph.add_node("verify", verify_node)
    graph.add_node("retract", retract_node)
    graph.add_node("persist", persist_verification_node)
    graph.set_entry_point("verify")
    graph.add_conditional_edges(
        "verify",
        _route_after_verify,
        {"retract": "retract", "persist": "persist"},
    )
    graph.add_edge("retract", "persist")
    graph.add_edge("persist", END)
    return graph.compile()
