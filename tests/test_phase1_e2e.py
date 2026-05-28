"""
Test: End-to-end Phase 1 verification.

Verifies:
  - All signal ingestion tools return valid data (Task 1.2)
  - LangGraph detection schema validates (Task 1.3)
  - LangGraph orchestrator is importable and wired correctly (Task 1.4)
  - FastAPI endpoints respond correctly (Task 1.5)

Run: pytest tests/test_phase1_e2e.py -v
"""

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


# ── Task 1.3: LangGraph detection ─────────────────────────────────────────────

class TestLangGraphDetection:
    """Verify merged detection schema and graph compile."""

    def test_detection_schema_mock_payload(self):
        from agents.graph.schemas import DetectionResult
        from agents.mock_llm_payloads import MOCK_DETECTION

        result = DetectionResult.model_validate(MOCK_DETECTION)
        assert result.classification.crisis_type == "urban_flooding"
        assert result.severity.severity == "high"
        print("✅ DetectionResult validates mock payload")

    def test_main_graph_compiles(self):
        from agents.graph.build import compile_main_graph

        graph = compile_main_graph()
        assert graph is not None
        print("✅ LangGraph main pipeline compiles")


# ── Task 1.4: LangGraph orchestrator ─────────────────────────────────────────

class TestOrchestratorWiring:
    """Verify the orchestrator is importable."""

    def test_orchestrator_importable(self):
        from agents.orchestrator import process_signal

        assert callable(process_signal)
        print("✅ agents.orchestrator.process_signal is importable")

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
