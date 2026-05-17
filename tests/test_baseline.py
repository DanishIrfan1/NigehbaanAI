"""
Baseline comparison: legacy stub orchestrator vs ADK pipeline.
"""

from __future__ import annotations

import json
import pathlib
import sys

import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from agents.orchestrator import process_signal as stub_process
from agents.adk_orchestrator import process_signal as adk_process
import sys
from pathlib import Path
_backend = Path(__file__).resolve().parents[1] / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))
from app.database.mock_store import incident_store, reset_resource_ledger


@pytest.mark.usefixtures("mock_llm_agents")
def test_baseline_stub_vs_adk():
    reset_resource_ledger()
    payload = {
        "location": "G-10, Islamabad",
        "description": "Streets flooded with water everywhere",
    }

    stub_id = "baseline-stub"
    adk_id = "baseline-adk"

    stub_process(stub_id, payload)
    adk_process(adk_id, payload)

    stub = incident_store[stub_id]
    adk = incident_store[adk_id]

    assert stub["status"] == "completed"
    assert adk["status"] == "completed"
    assert stub["detection"]["crisis_type"] == "urban_flooding"
    assert adk["detection"]["classification"]["crisis_type"] == "urban_flooding"
    # ADK path has richer structure
    assert "impact" in adk
    assert "response" in adk
