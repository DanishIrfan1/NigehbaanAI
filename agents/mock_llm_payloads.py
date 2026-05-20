"""
Deterministic JSON payloads for LLM agents when LLM_MODE=mock or API fallback.

Single source of truth — tests import from here to avoid drift with production mocks.
"""

from __future__ import annotations

import json
from typing import Any

MOCK_FUSION: dict[str, Any] = {
    "fused_summary": "Heavy rain and flooding reports in G-10 with traffic congestion.",
    "overall_urgency": "high",
    "credibility_scores": {"weather": 0.95, "traffic": 0.9, "social": 0.6},
    "contradictions": [{"sources": ["social"], "detail": "water main vs flood"}],
    "recommended_action": "Deploy rescue teams",
}

MOCK_CLASSIFICATION: dict[str, Any] = {
    "crisis_type": "urban_flooding",
    "location": "G-10, Islamabad",
    "confidence": 0.92,
    "alternative_hypothesis": "infrastructure_failure",
    "geolocation_confidence": 0.88,
    "requires_field_verification": False,
}

MOCK_SEVERITY: dict[str, Any] = {
    "severity": "high",
    "affected_radius_km": 2.5,
    "affected_population": 15000,
    "expected_duration_hrs": 6,
    "peak_impact_time": "2026-05-18T14:00:00Z",
    "spread_risk": "medium",
    "uncertainty_range": "±20%",
}

MOCK_PLAN: dict[str, Any] = {
    "priority": "P1",
    "action_plan": [
        {
            "step": 1,
            "action": "traffic_rerouting",
            "description": "Reroute traffic away from G-10",
            "resources_needed": {"police_units": 2},
            "expected_duration_min": 30,
            "success_criteria": "Traffic flow restored on alternate corridors",
            "side_effects": ["evacuation congestion"],
            "fallback": "manual traffic control",
        },
        {
            "step": 2,
            "action": "ambulance_reroute",
            "description": "Reroute ambulances via alternate path",
            "resources_needed": {"ambulances": 2},
            "expected_duration_min": 20,
            "success_criteria": "Ambulances reach incident zone",
            "side_effects": [],
            "fallback": "air ambulance",
        },
        {
            "step": 3,
            "action": "public_alert",
            "description": "Issue public flood alert",
            "resources_needed": {},
            "expected_duration_min": 10,
            "success_criteria": "Broadcast acknowledged",
            "side_effects": ["panic"],
            "fallback": "staged alerting",
        },
    ],
    "total_resources_committed": {"ambulances": 2, "police_units": 2, "rescue_teams": 3},
    "resources_remaining": {},
    "rationale": "High severity flooding requires immediate response.",
    "multi_crisis_tradeoffs": "",
    "ambulance_routing_note": "Use I-8 bypass",
    "reserve_maintained_pct": 10,
}

# Keys must match stakeholder_notifier_agent prompt (snake_case audiences).
MOCK_NOTIFICATIONS: dict[str, Any] = {
    "notifications": {
        "public": "[SIMULATED] Stay indoors; avoid flooded roads in G-10.",
        "emergency_services": "[SIMULATED] Dispatch rescue units; staging at Kashmir Highway.",
        "hospital": "[SIMULATED] Prepare trauma beds; expect water-related injuries.",
        "utility_company": "[SIMULATED] Inspect water mains and power substations near G-10.",
        "transport_authority": "[SIMULATED] Reroute buses; suspend low-lying routes.",
        "media_command_center": "[SIMULATED] Official statement: coordinated response in progress.",
    },
    "notification_count": 6,
    "priority_audience": "public",
}

MOCK_VERIFICATION: dict[str, Any] = {
    "verification_status": "corrected",
    "is_retraction_needed": True,
    "corrected_crisis_type": "infrastructure_failure",
    "correction_reason": "Field verification confirms water main burst only",
    "confidence_after_verification": 0.91,
}

_AGENT_TO_PAYLOAD: dict[str, dict[str, Any]] = {
    "signal_fusion_agent": MOCK_FUSION,
    "crisis_classifier_agent": MOCK_CLASSIFICATION,
    "severity_predictor_agent": MOCK_SEVERITY,
    "resource_planner_agent": MOCK_PLAN,
    "stakeholder_notifier_agent": MOCK_NOTIFICATIONS,
    "verification_agent": MOCK_VERIFICATION,
}


def mock_llm_json_for_agent(agent_name: str) -> str:
    """Return JSON string matching the given agent's expected LLM output shape."""
    payload = _AGENT_TO_PAYLOAD.get(agent_name)
    if payload is None:
        return json.dumps(
            {
                "error": "unknown_agent",
                "agent_name": agent_name,
                "detail": "No mock payload registered for this agent.",
            }
        )
    return json.dumps(payload)
