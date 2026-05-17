"""Shared pytest fixtures for NigehbaanAI tests."""

from __future__ import annotations

import json
import pathlib
import sys

import pytest

_REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_REPO_ROOT))
sys.path.insert(0, str(_REPO_ROOT / "backend"))

from dotenv import load_dotenv
load_dotenv(_REPO_ROOT / ".env")


MOCK_FUSION = {
    "fused_summary": "Heavy rain and flooding reports in G-10 with traffic congestion.",
    "overall_urgency": "high",
    "credibility_scores": {"weather": 0.95, "traffic": 0.9, "social": 0.6},
    "contradictions": [{"sources": ["social"], "detail": "water main vs flood"}],
    "recommended_action": "Deploy rescue teams",
}

MOCK_CLASSIFICATION = {
    "crisis_type": "urban_flooding",
    "location": "G-10, Islamabad",
    "confidence": 0.92,
    "alternative_hypothesis": "infrastructure_failure",
    "geolocation_confidence": 0.88,
    "requires_field_verification": False,
}

MOCK_SEVERITY = {
    "severity": "high",
    "affected_radius_km": 2.5,
    "affected_population": 15000,
    "expected_duration_hrs": 6,
    "peak_impact_time": "2026-05-18T14:00:00Z",
    "spread_risk": "medium",
    "uncertainty_range": "±20%",
}

MOCK_PLAN = {
    "priority": "P1",
    "action_plan": [
        {
            "step": 1,
            "action": "traffic_rerouting",
            "description": "Reroute traffic away from G-10",
            "resources_needed": {"police_units": 2},
            "side_effects": ["evacuation congestion"],
            "fallback": "manual traffic control",
        },
        {
            "step": 2,
            "action": "ambulance_reroute",
            "description": "Reroute ambulances via alternate path",
            "resources_needed": {"ambulances": 2},
            "side_effects": [],
            "fallback": "air ambulance",
        },
        {
            "step": 3,
            "action": "public_alert",
            "description": "Issue public flood alert",
            "resources_needed": {},
            "side_effects": ["panic"],
            "fallback": "staged alerting",
        },
    ],
    "total_resources_committed": {"ambulances": 2, "police_units": 2, "rescue_teams": 3},
    "rationale": "High severity flooding requires immediate response.",
    "multi_crisis_tradeoffs": "",
    "ambulance_routing_note": "Use I-8 bypass",
}

MOCK_NOTIFICATIONS = {
    "notifications": {
        "public": "Stay indoors",
        "emergency_services": "Dispatch to G-10",
        "hospital": "Prepare beds",
        "utility": "Check water main",
        "transport": "Reroute buses",
        "media": "Official statement",
    },
    "notification_count": 6,
}

MOCK_VERIFICATION = {
    "verification_status": "corrected",
    "is_retraction_needed": True,
    "corrected_crisis_type": "infrastructure_failure",
    "correction_reason": "Field verification confirms water main burst only",
    "confidence_after_verification": 0.91,
}


@pytest.fixture(autouse=True)
def reset_stores():
    """Clear incident store and resource ledger before each test."""
    import sys
    from pathlib import Path
    _backend = Path(__file__).resolve().parents[1] / "backend"
    if str(_backend) not in sys.path:
        sys.path.insert(0, str(_backend))
    from app.database.mock_store import incident_store, reset_resource_ledger
    incident_store.clear()
    reset_resource_ledger()
    yield
    incident_store.clear()
    reset_resource_ledger()


def _mock_plan(sid, c, s, active=None):
    """Return plan with resources enforced without LLM."""
    from agents.planner.resource_agent import enforce_resource_caps
    plan = dict(MOCK_PLAN)
    return enforce_resource_caps(plan)


@pytest.fixture
def mock_llm_agents(monkeypatch):
    """Patch LLM agents at orchestrator import sites."""
    targets = {
        "agents.adk_orchestrator.run_signal_fusion": lambda sid, signals: MOCK_FUSION,
        "agents.adk_orchestrator.run_classifier": lambda sid, fusion, signals: MOCK_CLASSIFICATION,
        "agents.adk_orchestrator.run_severity_predictor": lambda sid, classification, signals: MOCK_SEVERITY,
        "agents.adk_orchestrator.run_resource_planner": _mock_plan,
        "agents.adk_orchestrator.run_stakeholder_notifier": lambda sid, c, s, e: dict(MOCK_NOTIFICATIONS),
        "agents.adk_orchestrator.run_verification_agent": lambda sid, det, report: dict(MOCK_VERIFICATION),
    }
    for target, fn in targets.items():
        monkeypatch.setattr(target, fn)
