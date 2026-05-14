# NigehbaanAI – Crisis Intelligence & Response Orchestrator (CIRO)

> **Google Antigravity Hackathon – Challenge 3**

## Architecture Overview

```
nigehbaan-ai/
├── mobile-app/             # React Native (Expo) – mandatory deliverable
│   └── src/
│       ├── components/     # Map, AlertCards, LogViewer
│       ├── screens/        # Dashboard, SignalInput, ExecutionView
│       └── services/       # API client → FastAPI backend
├── backend/                # FastAPI
│   └── app/
│       ├── api/            # POST /signal  GET /status  GET /incidents
│       ├── core/           # Settings (pydantic-settings + .env)
│       └── database/       # mock_store.py (in-memory), mock_data.py
├── agents/                 # GOOGLE ANTIGRAVITY CORE
│   ├── orchestrator.py     # Detector → Planner → Executor pipeline
│   ├── skills/             # Markdown skill definitions per agent
│   ├── tools/              # Python tools (map_tool, alert_tool)
│   └── traces/             # JSONL agent trace logs (submission evidence)
├── docs/
│   └── README.md           # This file
└── requirements.txt
```

## Antigravity Role

| Component | Antigravity Usage |
|-----------|-------------------|
| `orchestrator.py` | Coordinates three specialist agents (Detector, Planner, Executor) |
| `agents/skills/*.md` | Markdown skill definitions consumed by each agent |
| `agents/traces/trace_log.jsonl` | Full JSONL trace of signal fusion, classification, planning, execution |

### Pipeline

```
Incoming Signal
  └─► Detector  (signal fusion, crisis classification, confidence scoring)
        └─► Planner  (resource allocation, action sequencing, trade-off analysis)
              └─► Executor  (tool calls, stakeholder alerts, impact simulation)
                    └─► Trace log + Incident store
```

## Data Stream Schemas

### POST /api/v1/signal
```json
{
  "source": "social_media | weather | traffic | sensor | field_report",
  "location": "G-10, Islamabad",
  "description": "Streets flooded, water entering homes",
  "severity_hint": "high",
  "timestamp": "2026-05-14T08:00:00Z"
}
```

### Incident Record (stored + returned by GET /status/{id})
```json
{
  "status": "completed",
  "signal_id": "uuid",
  "detection": { "crisis_type": "urban_flooding", "severity": "high", "confidence": 0.82 },
  "plan": { "priority": "P1", "action_plan": ["traffic_rerouting", "public_alert"] },
  "execution": { "executed_actions": [], "stakeholder_notifications": {} }
}
```

## Setup

```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Copy env template and add your Google API key
cp .env.example .env

# 3. Run FastAPI backend
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

# 4. (Mobile) Install and run React Native app
cd mobile-app && npm install && npx expo start
```

## Assumptions & Privacy Note

- All data marked `[SIMULATED]` is synthetic; no personal or sensitive data is used.
- Mock sensor readings are generated locally with no external data collection.
- Location strings are district-level only (no individual addresses).

## Cost / Latency Estimate

| Operation | Estimated Cost | Latency |
|-----------|----------------|---------|
| Signal ingestion | ~0 (in-memory) | < 5 ms |
| Detector (LLM) | ~$0.001/call | 1–3 s |
| Planner (LLM) | ~$0.001/call | 1–3 s |
| Executor (tool calls) | ~0 (mock) | < 50 ms |

## Scalability Discussion

- Replace `mock_store` with Redis for multi-process deployments.
- Swap synchronous stubs with async ADK agent calls for true Antigravity orchestration.
- Queue signals through Pub/Sub or Celery for 10x–100x throughput.

## Baseline Comparison

| Approach | Capability |
|----------|------------|
| Hard-coded rules | Fixed thresholds, no signal fusion, no explanation |
| **NigehbaanAI (Antigravity)** | Multi-source fusion, confidence scoring, explainable decisions, adaptive recovery |

## Demo Video
> Link: _TBD – add YouTube / Drive link before submission_

## Limitations

- No real external API integration in prototype (all simulated).
- Single-process in-memory store (not persistent across restarts).
- Mobile app UI stub pending feature sprint.
