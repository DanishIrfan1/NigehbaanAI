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
├── .agents/skills/         # Cursor agent skills (canonical)
├── agents/                 # LangGraph runtime (Python package)
│   ├── orchestrator.py     # Production entry (graph.invoke)
│   ├── graph/              # nodes, services, verification subgraph
│   ├── tools/              # weather, traffic, social, emergency, map, alert
│   ├── robustness/         # degraded mode, fallbacks, duplicates
│   └── traces/             # trace_log.jsonl
├── scripts/
│   ├── legacy/orchestrator_stub.py  # baseline comparison only
│   ├── run_demo_scenarios.py
│   └── baseline_comparison.py
└── tests/
```

## LangGraph role

| Component | Role |
|-----------|------|
| `orchestrator.py` | LangGraph pipeline with JSONL traces |
| `agents/graph/` | Node graph (ingest → compress → detect → plan → execute → notify → impact) |
| Gemini 2.0 Flash | LLM reasoning for fusion, classification, planning, notifications (`LLM_MODE` controls mock / auto fallback — see below) |
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
  "simulated_llm_pipeline": false,
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
| Web preview (browser) | http://localhost:8081 — Map tab uses **Google Maps JavaScript API** when `EXPO_PUBLIC_GOOGLE_MAPS_KEY` is set (or `app.json` Android Maps key as fallback). Restrict the key by HTTP referrer. Full `react-native-maps` remains on native / Expo Go only. |

**Web bundling:** `react-native-maps` is not web-compatible. The Map route re-exports from `src/screens/Map.web.tsx` / `Map.native.tsx` so Metro does not pull maps into the web bundle. Source is bind-mounted. Edit `backend/`, `agents/`, or `mobile-app/` — no image rebuild. Rebuild only when dependencies change:

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

### Docker runtime notes

- Docker uses `requirements.docker.txt`. LLM pipeline uses Gemini via `langchain-google-genai` (and `google-generativeai`).
- Incident data is in-memory; restarting the backend container clears incidents.
- If a previous start failed, run `make down` before `make up` to clear stale containers.

### LLM modes (`agents/llm.py`)

| `LLM_MODE` | Behavior |
|------------|----------|
| `mock` | Never calls Gemini; deterministic JSON from `agents/mock_llm_payloads.py`. |
| `auto` | **Default** (see `.env.example`). Calls Gemini; on quota / 429 / invalid key / permission errors, falls back to the same mocks and sets `simulated_llm_pipeline` on the incident. |
| `real` | Fail on LLM errors (production-style). |

Optional: `GEMINI_MODEL_ID` overrides the GenerativeModel name (default `gemini-2.0-flash` in `agents/config.py`). All HTTP endpoints behave the same; traces include `llm_call_mock_mode` or `llm_call_fallback_mock` when mocks run.

### Web map API key

For the browser Map tab, enable **Maps JavaScript API** on the same or a dedicated Google Cloud key. In Cloud Console → Credentials → key restrictions → **HTTP referrers**, add `http://localhost:8081/*` and your LAN Expo URL (e.g. `http://192.168.1.10:8081/*`). Set `EXPO_PUBLIC_GOOGLE_MAPS_KEY` in `.env` and restart Expo so the value is inlined at bundle time. The app loads the official Maps JS script directly (no extra React map package required for Expo web).

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
- LLM outputs use `GOOGLE_API_KEY` when `LLM_MODE` is `auto` or `real`; `LLM_MODE=mock` or exhausted quota with `auto` completes the pipeline with deterministic data (see table above).
- The pipeline is implemented with LangGraph; there is no ADK wrapper layer.

## Demo Video
> Link: _TBD – add before submission_
