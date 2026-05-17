"""
Test: End-to-end Phase 1 verification.

Verifies:
  - All signal ingestion tools return valid data (Task 1.2)
  - Detector agent modules are importable (Task 1.3)
  - ADK Orchestrator is importable and wired correctly (Task 1.4)
  - FastAPI endpoints respond correctly (Task 1.5)

Run: pytest tests/test_phase1_e2e.py -v
"""

import os
import sys
import pathlib

import pytest

# Ensure repo root is on the path
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv
load_dotenv(pathlib.Path(__file__).resolve().parents[1] / ".env")


# ── Task 1.2: Signal Ingestion Tools ─────────────────────────────────────────

class TestSignalTools:
    """Verify all 4 signal ingestion tools return structured data."""

    def test_weather_tool(self):
        from agents.tools.weather_tool import fetch_weather

        result = fetch_weather("G-10, Islamabad")
        assert result["source"] == "weather_api"
        assert result["credibility"] == 0.95
        assert "condition" in result
        assert "rainfall_mm_per_hour" in result
        print(f"✅ Weather tool: {result['condition']}")

    def test_traffic_tool(self):
        from agents.tools.traffic_tool import fetch_traffic

        result = fetch_traffic("G-10, Islamabad")
        assert result["source"] == "traffic_api"
        assert result["credibility"] == 0.90
        assert "congestion_level" in result
        assert "incident_flag" in result
        print(f"✅ Traffic tool: congestion={result['congestion_level']}")

    def test_social_tool(self):
        from agents.tools.social_tool import fetch_social_posts

        result = fetch_social_posts("G-10, Islamabad")
        assert result["source"] == "social_media"
        assert result["post_count"] > 0
        assert "posts" in result
        assert "has_contradictions" in result
        print(f"✅ Social tool: {result['post_count']} posts, contradictions={result['has_contradictions']}")

    def test_emergency_call_tool(self):
        from agents.tools.emergency_call_tool import fetch_emergency_call

        result = fetch_emergency_call("G-10, Islamabad")
        assert result["source"] == "emergency_call_1122"
        assert result["credibility"] == 0.98
        assert result["has_call"] is True
        assert "raw_transcription" in result
        print(f"✅ Emergency call tool: call_id={result['call_id']}")

    def test_emergency_call_no_data(self):
        """Verify tool returns graceful empty response for unknown locations."""
        from agents.tools.emergency_call_tool import fetch_emergency_call

        result = fetch_emergency_call("Unknown Area")
        assert result["has_call"] is False
        print("✅ Emergency call tool: no-data handled gracefully")


# ── Task 1.3: Detector Agent Modules ─────────────────────────────────────────

class TestDetectorModules:
    """Verify the 3 detector agents are importable with correct signatures."""

    def test_signal_fusion_agent_importable(self):
        from agents.detector.signal_fusion_agent import run_signal_fusion
        import inspect

        sig = inspect.signature(run_signal_fusion)
        params = list(sig.parameters.keys())
        assert "signal_id" in params
        assert "signals" in params
        print("✅ signal_fusion_agent.run_signal_fusion is importable")

    def test_classifier_agent_importable(self):
        from agents.detector.classifier_agent import run_classifier
        import inspect

        sig = inspect.signature(run_classifier)
        params = list(sig.parameters.keys())
        assert "signal_id" in params
        assert "fusion_result" in params
        assert "signals" in params
        print("✅ classifier_agent.run_classifier is importable")

    def test_severity_agent_importable(self):
        from agents.detector.severity_agent import run_severity_predictor
        import inspect

        sig = inspect.signature(run_severity_predictor)
        params = list(sig.parameters.keys())
        assert "signal_id" in params
        assert "classification" in params
        assert "signals" in params
        print("✅ severity_agent.run_severity_predictor is importable")

    def test_detector_package_exports(self):
        """Verify the detector package re-exports all agents."""
        from agents.detector import run_signal_fusion, run_classifier, run_severity_predictor

        assert callable(run_signal_fusion)
        assert callable(run_classifier)
        assert callable(run_severity_predictor)
        print("✅ agents.detector package exports all 3 agents")


# ── Task 1.4: ADK Orchestrator ───────────────────────────────────────────────

class TestOrchestratorWiring:
    """Verify the orchestrator is importable and wired to detector agents."""

    def test_orchestrator_importable(self):
        from agents.adk_orchestrator import process_signal

        assert callable(process_signal)
        print("✅ adk_orchestrator.process_signal is importable")

    def test_config_loaded(self):
        from agents.config import MODEL_ID, GOOGLE_API_KEY, log_trace, get_traces

        assert MODEL_ID == "gemini-2.0-flash"
        assert callable(log_trace)
        assert callable(get_traces)
        print(f"✅ Config: model={MODEL_ID}, API key={'set' if GOOGLE_API_KEY else 'NOT SET'}")


# ── Task 1.5: FastAPI Endpoints ──────────────────────────────────────────────

class TestFastAPIEndpoints:
    """Verify all Phase 1 API endpoints are registered and respond."""

    @pytest.fixture
    def client(self):
        from httpx import AsyncClient, ASGITransport
        # Import with the correct module path
        sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "backend"))
        from app.main import app
        transport = ASGITransport(app=app)
        return AsyncClient(transport=transport, base_url="http://test")

    @pytest.mark.asyncio
    async def test_health(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        print("✅ GET /health → 200")

    @pytest.mark.asyncio
    async def test_post_signal(self, client):
        resp = await client.post("/api/v1/signal", json={
            "source": "social_media",
            "location": "G-10, Islamabad",
            "description": "Test signal",
        })
        assert resp.status_code == 202
        data = resp.json()
        assert "signal_id" in data
        assert data["status"] == "queued"
        print(f"✅ POST /api/v1/signal → 202, signal_id={data['signal_id']}")

    @pytest.mark.asyncio
    async def test_crisis_endpoint_404(self, client):
        resp = await client.get("/api/v1/crisis/nonexistent-id")
        assert resp.status_code == 404
        print("✅ GET /api/v1/crisis/nonexistent → 404")

    @pytest.mark.asyncio
    async def test_trace_endpoint_404(self, client):
        resp = await client.get("/api/v1/agents/trace/nonexistent-id")
        assert resp.status_code == 404
        print("✅ GET /api/v1/agents/trace/nonexistent → 404")

    @pytest.mark.asyncio
    async def test_endpoints_list(self, client):
        resp = await client.get("/api/v1/endpoints")
        assert resp.status_code == 200
        data = resp.json()
        endpoints = data["endpoints"]
        assert "POST /api/v1/signal" in endpoints
        assert "GET /api/v1/crisis/{signal_id}" in endpoints
        assert "GET /api/v1/agents/trace/{signal_id}" in endpoints
        print(f"✅ GET /api/v1/endpoints → {len(endpoints)} endpoints listed")
