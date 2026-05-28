"""Merged detection node: fusion + classification + severity in one LLM call."""

from __future__ import annotations

import json

import agents.path_setup  # noqa: F401
from app.database.mock_store import incident_store

from agents.config import log_task_plan, log_trace
from agents.graph.schemas import DetectionResult, detection_to_dict
from agents.graph.state import CrisisState
from agents.llm import invoke_structured
from agents.robustness.degraded import detect_duplicate

CONFIDENCE_THRESHOLD = 0.5
MIN_SOURCES_FOR_RESPONSE = 2

DETECT_PROMPT = """You are the NigehbaanAI Detection Agent. Perform signal fusion, crisis classification, and severity prediction in ONE pass.

## Signal digest (compact — do not invent data beyond this):
{digest}

## Tasks
1. Fusion: score source credibility, detect contradictions, fused_summary, weighted_urgency.
2. Classification: crisis_type (urban_flooding|heatwave|fire|accident|infrastructure_failure|power_outage|disease_cluster|protest|unknown), location, confidence 0-1.
3. Severity: severity level, affected_radius_km, affected_population_estimate, expected_duration_hrs, spread_risk.

If confidence < 0.5 use crisis_type unknown and requires_field_verification true.
"""


def detect_node(state: CrisisState) -> dict:
    signal_id = state["signal_id"]
    digest = state.get("signal_digest") or {}
    location = state.get("location", "")
    payload = state.get("payload") or {}

    log_task_plan(signal_id, "detection", ["merged detect: fusion + classify + severity"])
    log_trace(signal_id, "signal_fusion_agent", "reasoning_start", {"task": "merged_detection"})
    log_trace(signal_id, "crisis_classifier_agent", "reasoning_start", {"task": "merged_detection"})
    log_trace(signal_id, "severity_predictor_agent", "reasoning_start", {"task": "merged_detection"})

    prompt = DETECT_PROMPT.format(digest=json.dumps(digest, separators=(",", ":")))
    result = invoke_structured(signal_id, "detect_agent", prompt, DetectionResult)
    detection = detection_to_dict(result)

    fusion = detection["fusion"]
    classification = detection["classification"]
    severity = detection["severity"]

    log_trace(signal_id, "signal_fusion_agent", "fusion_complete", {
        "overall_confidence": fusion.get("overall_confidence"),
        "weighted_urgency": fusion.get("weighted_urgency"),
        "fused_summary": (fusion.get("fused_summary") or "")[:200],
    })
    log_trace(signal_id, "crisis_classifier_agent", "classification_complete", {
        "crisis_type": classification.get("crisis_type"),
        "confidence": classification.get("confidence"),
    })
    log_trace(signal_id, "severity_predictor_agent", "prediction_complete", {
        "severity": severity.get("severity"),
        "affected_population": severity.get("affected_population_estimate"),
    })

    duplicate_info = None
    if not payload.get("disable_duplicate_detection", False):
        duplicate_info = detect_duplicate(
            location,
            classification.get("crisis_type"),
            incident_store,
            signal_id,
        )
    warnings_add: list[str] = []
    if duplicate_info:
        warnings_add.append(f"duplicate_incident: may overlap with {duplicate_info['duplicate_of']}")

    confidence = float(classification.get("confidence") or 0)
    active_count = digest.get("active_source_count", 4)
    human_review = confidence < CONFIDENCE_THRESHOLD
    skip_response = human_review or active_count < MIN_SOURCES_FOR_RESPONSE

    if human_review:
        warnings_add.append(f"low_confidence: {confidence:.2f} — human review recommended")
    if active_count < MIN_SOURCES_FOR_RESPONSE:
        warnings_add.append(
            f"degraded_mode: only {active_count} active sources — response pipeline skipped"
        )

    updates: dict = {
        "detection": detection,
        "duplicate_info": duplicate_info,
        "human_review_required": human_review,
        "skip_response": skip_response,
        "status": "planning",
    }
    if warnings_add:
        updates["warnings"] = warnings_add
    if duplicate_info:
        updates["degraded_mode"] = True

    return updates
