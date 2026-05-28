"""
Phase 2 E2E: full pipeline with mocked LLM agents.
"""

from __future__ import annotations


import pytest

from agents.orchestrator import process_signal
import sys
from pathlib import Path
_backend = Path(__file__).resolve().parents[1] / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))
from app.database.mock_store import incident_store


@pytest.mark.usefixtures("mock_llm_agents")
def test_full_pipeline_completes():
    signal_id = "test-phase2-e2e"
    payload = {
        "location": "G-10, Islamabad",
        "description": "Streets flooded in G-10",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    }

    process_signal(signal_id, payload)

    record = incident_store[signal_id]
    assert record["status"] == "completed"
    assert record["detection"]["classification"]["crisis_type"] == "urban_flooding"
    assert record["response"]["plan"]["priority"] == "P1"
    assert len(record["response"]["execution"]["executed_actions"]) >= 1
    assert record["impact"]["crisis_status"]["after"] == "MANAGED"
    assert "ambulance_eta_min" in record["impact"]


@pytest.mark.asyncio
@pytest.mark.usefixtures("mock_llm_agents")
async def test_api_poll_until_complete():
    from httpx import AsyncClient, ASGITransport
    from app.main import app

    signal_id = "test-api-poll"
    payload = {
        "location": "G-10, Islamabad",
        "description": "Flooding test",
        "enable_weather": True,
        "enable_traffic": True,
        "enable_social": True,
        "enable_emergency_call": True,
    }
    process_signal(signal_id, payload)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        crisis = await client.get(f"/api/v1/crisis/{signal_id}")
        assert crisis.status_code == 200
        data = crisis.json()
        assert data["classification"]["crisis_type"] == "urban_flooding"

        actions = await client.get(f"/api/v1/actions/{signal_id}")
        assert actions.status_code == 200
        assert len(actions.json()["actions"]) >= 1

        outcome = await client.get(f"/api/v1/outcome/{signal_id}")
        assert outcome.status_code == 200
        assert outcome.json()["impact"]["crisis_status"]["after"] == "MANAGED"
