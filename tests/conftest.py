"""Shared pytest fixtures for NigehbaanAI tests."""

from __future__ import annotations

import pathlib
import sys

import pytest

_REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_REPO_ROOT))
sys.path.insert(0, str(_REPO_ROOT / "backend"))

from dotenv import load_dotenv
load_dotenv(_REPO_ROOT / ".env")


from agents.mock_llm_payloads import (
    MOCK_PLAN,
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
    from agents.graph.services.resources import enforce_resource_caps
    plan = dict(MOCK_PLAN)
    return enforce_resource_caps(plan)


@pytest.fixture(autouse=True)
def llm_mock_mode(monkeypatch):
    """Use deterministic mocks for all LangGraph LLM nodes in tests."""
    monkeypatch.setenv("LLM_MODE", "mock")


@pytest.fixture
def mock_llm_agents():
    """Kept for backward compatibility; autouse llm_mock_mode enables LLM mocks."""
    yield
