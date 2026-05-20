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


from agents.mock_llm_payloads import (
    MOCK_CLASSIFICATION,
    MOCK_FUSION,
    MOCK_NOTIFICATIONS,
    MOCK_PLAN,
    MOCK_SEVERITY,
    MOCK_VERIFICATION,
)

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
