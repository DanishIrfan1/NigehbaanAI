# NigehbaanAI – Crisis Intelligence & Response Orchestrator (CIRO)

> **Google Antigravity Hackathon – Challenge 3**

## Architecture Overview

```
nigehbaan-ai/
├── mobile-app/             # React Native (Expo) – mandatory deliverable
├── backend/                # FastAPI REST API
│   └── app/
│       ├── api/            # signal.py, status.py
│       ├── core/           # Settings (.env)
│       └── database/       # mock_store.py (incidents + resource ledger)
├── agents/                 # GOOGLE ANTIGRAVITY / ADK CORE
│   ├── adk_orchestrator.py # Production pipeline (ingest → detect → respond)
│   ├── adk_pipeline.py     # google-adk wrapper (USE_ADK=true)
│   ├── orchestrator.py     # DEPRECATED stub (baseline comparison only)
│   ├── detector/           # fusion, classifier, severity
│   ├── planner/            # resource_agent
│   ├── executor/           # action_agent, notifier_agent
│   ├── verifier/           # verification_agent
│   ├── robustness/         # degraded mode, fallbacks, duplicates
│   ├── tools/              # weather, traffic, social, emergency, map, alert
│   └── traces/             # trace_log.jsonl (submission evidence)
├── scripts/
│   ├── run_demo_scenarios.py
│   └── baseline_comparison.py
└── tests/
```

## Antigravity / ADK Role

| Component | Role |
|-----------|------|
| `adk_orchestrator.py` | Sequential multi-agent pipeline with JSONL traces |
| `adk_pipeline.py` | google-adk SDK wrapper (`USE_ADK=true`) |
| Gemini 2.0 Flash | LLM reasoning for fusion, classification, planning, notifications |
| `agents/traces/trace_log.jsonl` | workplan, task_plan, tool_call, agent_observation, final_outcome |

### Pipeline

```
POST /signal
  └─► Stage 1: Ingest (weather, traffic, social, emergency call)
        └─► Stage 2: Fuse → Classify → Severity
              └─► Stage 3: Plan → Execute → Notify → Impact
                    └─► incident_store + trace_log.jsonl

POST /verify/{id}  → Verification Agent → alert retraction
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/signal` | Submit crisis signal |
| POST | `/api/v1/verify/{signal_id}` | Field report / false alarm correction |
| POST | `/api/v1/scenario/multi-crisis` | Queue G-10 + F-8 demo |
| GET | `/api/v1/status/{signal_id}` | Full record (includes `degraded_mode`, `warnings`) |
| GET | `/api/v1/crisis/{signal_id}` | Detection results |
| GET | `/api/v1/agents/trace/{signal_id}` | Agent traces |
| GET | `/api/v1/actions/{signal_id}` | Executed actions |
| GET | `/api/v1/outcome/{signal_id}` | Impact assessment |
| GET | `/api/v1/incidents` | All incidents |

## Data Stream Schemas

### POST /api/v1/signal
```json
{
  "source": "multi_source",
  "location": "G-10, Islamabad",
  "description": "Streets flooded, water entering homes",
  "severity_hint": "high",
  "enable_weather": true,
  "enable_traffic": true,
  "enable_social": true,
  "enable_emergency_call": true,
  "simulate_api_failure": "weather"
}
```

### Incident Record (GET /status/{id})
```json
{
  "status": "completed",
  "signal_id": "uuid",
  "degraded_mode": false,
  "warnings": [],
  "fallback_sources_used": [],
  "detection": {
    "fusion": {},
    "classification": { "crisis_type": "urban_flooding", "confidence": 0.92 },
    "severity": { "severity": "high" }
  },
  "response": {
    "plan": {},
    "execution": { "executed_actions": [], "alert_ids": [] },
    "notifications": {}
  },
  "impact": { "crisis_status": { "before": "ACTIVE", "after": "MANAGED" } }
}
```

## Setup

### Docker (recommended — one command, live reload)

Requires [Docker](https://docs.docker.com/get-docker/) and Docker Compose (`docker-compose` or `docker compose` plugin).

```bash
cp .env.example .env          # set GOOGLE_API_KEY
./scripts/dev.sh              # or: make up-build
```

| Service | URL |
|---------|-----|
| API health | http://localhost:8000/health (or **8001** if 8000 is busy — see below) |
| API docs | http://localhost:8000/docs |
| Expo Metro | http://localhost:8081 |

**Live reload:** Source is bind-mounted. Edit `backend/`, `agents/`, or `mobile-app/` — no image rebuild. Rebuild only when dependencies change:

```bash
make rebuild                  # after requirements.docker.txt or package.json changes
```

**Useful commands:**

```bash
make down                     # stop containers
make logs                     # follow logs
make test                     # pytest inside backend container
make backend-only             # API only (run Expo on host if needed)
make health                   # curl /health
```

**Expo Go on a physical phone:** Set in `.env`:

```
EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8000
```

Phones cannot use `localhost` — use the machine IP where Docker publishes port 8000.

**Port 8000 already in use?** Another project (e.g. `crm_backend`) may be using it. `./scripts/dev.sh` auto-switches to **8001** and prints the URL. To fix permanently, add to `.env`:

```
BACKEND_HOST_PORT=8001
EXPO_PUBLIC_API_URL=http://localhost:8001
```

**Notes:**

- Docker uses `requirements.docker.txt` (no `google-adk` — pip conflict). LLM pipeline uses `google-generativeai`.
- Incident data is in-memory; restarting the backend container clears incidents.
- If a previous start failed, run `make down` before `make up` to clear stale containers.

### Local (without Docker)

```bash
pip install -r requirements.txt
cp .env.example .env
# Set GOOGLE_API_KEY=your-key

cd backend && uvicorn app.main:app --reload --port 8000

# Run demo scenarios
python scripts/run_demo_scenarios.py --scenario all

# Baseline comparison (stub vs ADK)
python scripts/baseline_comparison.py

# Tests (mocked LLM — no API key required)
pytest tests/ -v
```

## Cost / Latency Estimate

| Operation | Est. cost | Latency |
|-----------|-----------|---------|
| Signal ingest (4 mocks) | $0 | < 50 ms |
| LLM agents (5–6 calls) | ~$0.005–0.01/run | 5–20 s total |
| Tool execution | $0 | < 100 ms |
| Full pipeline | ~$0.01 | 10–30 s |

At 10x scale: replace `mock_store` with Redis; queue via Celery. At 100x: shard by city, cache tool responses, batch LLM calls.

## Baseline Comparison

| Approach | Capability |
|----------|------------|
| Legacy `orchestrator.py` (keyword rules) | Fixed if/else, no fusion, no verification |
| **NigehbaanAI ADK pipeline** | 4-source fusion, credibility, multi-crisis tradeoffs, per-action simulation, false-alarm recovery, degraded mode |

Run: `python scripts/baseline_comparison.py`

## Assumptions & Privacy

- All external data is `[SIMULATED]` / synthetic.
- Locations are district-level (G-10, F-8) — no personal addresses.
- No real SMS, maps, or emergency APIs in prototype.

## Limitations

- In-memory store (not persistent across restarts).
- LLM outputs require `GOOGLE_API_KEY` for live runs; tests use mocks.
- google-adk 0.1.0 wrapper delegates to sequential pipeline until full ADK graph migration.

## Demo Video
> Link: _TBD – add before submission_
