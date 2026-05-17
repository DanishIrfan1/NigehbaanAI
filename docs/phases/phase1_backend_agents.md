# Phase 1 — Backend & Agents Foundation

**Team**: Danish + Umer (Backend)  
**Timeline**: Day 1, First Half (~5-6 hrs)  
**Priority**: 🔴 CRITICAL — Everything else depends on this

---

## Tasks

### 1.1 ADK Setup & Configuration
- [ ] Install/verify `google-adk` and `google-generativeai`
- [ ] Set up `GOOGLE_API_KEY` in `.env`
- [ ] Create `agents/config.py` — centralized model config (`gemini-2.0-flash`)
- [ ] Test basic LlmAgent hello-world to verify SDK works
- [ ] Set up trace logging infrastructure (JSONL writer)

**Owner**: Danish  
**Time**: ~1 hr

---

### 1.2 Signal Ingestion Tools (3 Function Tools)
- [ ] `agents/tools/weather_tool.py` — Returns mock weather data (heavy rain, temperature, humidity)
- [ ] `agents/tools/traffic_tool.py` — Returns mock traffic data (congestion, speed, incidents)
- [ ] `agents/tools/social_tool.py` — Returns mock social posts (with credibility scores, Urdu + English)
- [ ] `agents/tools/emergency_call_tool.py` — **[CREATIVE]** Simulates emergency call transcription as source-of-truth signal

> Each tool = a Python function that returns a dict. The LLM agents will call these tools.

**Owner**: Umer  
**Time**: ~1 hr

---

### 1.3 Core Detection Agents (Signal Fusion → Classification → Severity)
- [ ] `agents/detector/signal_fusion_agent.py` — LlmAgent that:
  - Receives all 3+ signal sources
  - Scores each source's credibility (0-1)
  - Detects contradictions (flood vs water-main)
  - Outputs fused signal assessment
- [ ] `agents/detector/classifier_agent.py` — LlmAgent that:
  - Reads fused signals
  - Classifies: `urban_flooding | heatwave | fire | accident | infrastructure_failure | ...`
  - Outputs confidence score + location
- [ ] `agents/detector/severity_agent.py` — LlmAgent that:
  - Reads classification
  - Estimates: affected radius, population, duration, peak time, spread risk
  - Outputs severity level (low/medium/high/critical)

**Owner**: Danish  
**Time**: ~2 hrs

---

### 1.4 ADK Orchestrator — Wire Detection Pipeline
- [ ] `agents/adk_orchestrator.py` — SequentialAgent composing:
  1. ParallelAgent (3 signal ingestors run concurrently)
  2. Signal Fusion Agent
  3. Crisis Classifier Agent
  4. Severity Predictor Agent
- [ ] Shared session state passes data between agents via `output_key`
- [ ] Every agent step writes to trace log

**Owner**: Danish + Umer pair  
**Time**: ~1 hr

---

### 1.5 Backend API — Connect Orchestrator
- [ ] Update `backend/app/api/signal.py` — Call ADK orchestrator instead of old stubs
- [ ] Add `GET /api/v1/agents/trace/{signal_id}` — Returns streaming trace logs
- [ ] Add `GET /api/v1/crisis/{signal_id}` — Returns detection + classification + severity
- [ ] Test end-to-end: POST signal → detection pipeline → GET results

**Owner**: Umer  
**Time**: ~1 hr

---

## Phase 1 Checkpoint ✅

By end of Phase 1, you should be able to:
```bash
# 1. Start server
uvicorn backend.app.main:app --reload

# 2. Send a crisis signal
curl -X POST http://localhost:8000/api/v1/signal \
  -H "Content-Type: application/json" \
  -d '{"source": "social_media", "location": "G-10, Islamabad", "description": "Streets flooded in G-10! Water entering homes."}'

# 3. Get detection results (after a few seconds)
curl http://localhost:8000/api/v1/crisis/{signal_id}

# 4. See agent traces
curl http://localhost:8000/api/v1/agents/trace/{signal_id}
```

**Expected output**: Real LLM-generated crisis classification with reasoning, not hard-coded stubs.

---

## Dependencies for Frontend Team
After Phase 1, frontend can start consuming:
- `POST /api/v1/signal` → Submit crisis
- `GET /api/v1/crisis/{signal_id}` → Show detection results
- `GET /api/v1/agents/trace/{signal_id}` → Stream agent logs
