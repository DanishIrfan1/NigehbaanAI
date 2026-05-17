"""
Phase 3: robustness — degraded mode, false alarm, retract, duplicate detection.
"""

from __future__ import annotations

import pytest

from agents.adk_orchestrator import process_signal, verify_incident
from agents.robustness.degraded import assess_ingestion, detect_duplicate
import sys
from pathlib import Path
_backend = Path(__file__).resolve().parents[1] / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))
from app.database.mock_store import incident_store


@pytest.mark.usefixtures("mock_llm_agents")
def test_degraded_mode_when_weather_disabled():
    signal_id = "test-degraded"
    payload = {
        "location": "G-10, Islamabad",
        "description": "Flooding",
        "enable_weather": False,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    }
    process_signal(signal_id, payload)
    record = incident_store[signal_id]
    assert record["degraded_mode"] is True
    assert any("weather" in w for w in record.get("warnings", []))


@pytest.mark.usefixtures("mock_llm_agents")
def test_api_failure_fallback():
    signal_id = "test-fallback"
    payload = {
        "location": "G-10, Islamabad",
        "description": "Flooding",
        "simulate_api_failure": "weather",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    }
    process_signal(signal_id, payload)
    record = incident_store[signal_id]
    assert record["status"] == "completed"
    assert "weather" in record.get("fallback_sources_used", []) or record.get("degraded_mode")


@pytest.mark.usefixtures("mock_llm_agents")
def test_false_alarm_retraction():
    signal_id = "test-retract"
    payload = {
        "location": "G-10, Islamabad",
        "description": "Flooding reported",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    }
    process_signal(signal_id, payload)
    verify_incident(signal_id, "Field team confirms broken water main only, not flooding.")

    record = incident_store[signal_id]
    assert record["status"] in ("corrected", "false_alarm")
    assert record.get("retraction_result", {}).get("status") == "[SIMULATED] retracted"
    assert record["verification"]["is_retraction_needed"] is True


@pytest.mark.usefixtures("mock_llm_agents")
def test_ambulance_reroute_in_actions():
    signal_id = "test-ambulance"
    process_signal(signal_id, {
        "location": "G-10, Islamabad",
        "description": "Flooding with blocked roads",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    })
    actions = incident_store[signal_id]["response"]["execution"]["executed_actions"]
    ambulance_actions = [a for a in actions if "ambulance" in a.get("action", "").lower()]
    assert len(ambulance_actions) >= 1
    assert "ambulance_eta_min" in ambulance_actions[0]["tool_result"]


def test_assess_ingestion_warnings():
    signals = {
        "weather": {"status": "skipped", "credibility": 0},
        "traffic": {"source": "traffic_api", "credibility": 0.9},
        "social": {"source": "social", "credibility": 0.6},
        "emergency_call": {"source": "emergency", "credibility": 0.98},
    }
    flags = {"enable_weather": False, "enable_traffic": True, "enable_social": True, "enable_emergency_call": True}
    _, warnings, _ = assess_ingestion(signals, flags, [])
    assert any("weather" in w for w in warnings)


def test_duplicate_detection():
    incident_store["existing-1"] = {
        "status": "completed",
        "payload": {"location": "G-10, Islamabad"},
        "detection": {"classification": {"crisis_type": "urban_flooding"}},
        "completed_at": "2099-01-01T00:00:00Z",
    }
    dup = detect_duplicate("G-10, Islamabad", "urban_flooding", incident_store, "new-signal")
    assert dup is not None
    assert dup["duplicate_of"] == "existing-1"
