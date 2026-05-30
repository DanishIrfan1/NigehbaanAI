# NigehbaanAI

**Crisis Intelligence & Response Orchestrator (CIRO)** — an agentic system that fuses multi-source signals, detects crises, plans resource allocation, simulates coordinated response actions, and recovers from false alarms.

Built for **Google Antigravity Hackathon — Challenge 3**.

---

## What it does

1. **Ingest** — Pulls simulated weather, traffic, social, and emergency-call data for a location.
2. **Detect** — One LLM pass fuses sources, classifies crisis type, and predicts severity.
3. **Plan & execute** — Allocates constrained resources (ambulances, police, rescue) and runs simulated actions (reroutes, alerts, dispatch).
4. **Notify & assess** — Tailored stakeholder messages and before/after impact metrics.
5. **Verify** — Field reports can confirm, correct, or retract a false alarm.

All external integrations are **`[SIMULATED]`** — no real emergency or SMS APIs in this prototype.

---

## Quick start

```bash
cp .env.example .env          # add GOOGLE_API_KEY (optional with LLM_MODE=mock)
./scripts/dev.sh              # or: make up-build
```

| Service | URL |
|---------|-----|
| API | http://localhost:8000 |
| Swagger docs | http://localhost:8000/docs |
| Expo (mobile / web preview) | http://localhost:8081 |

Submit a test signal:

```bash
curl -X POST http://localhost:8000/api/v1/signal \
  -H "Content-Type: application/json" \
  -d '{"location":"G-10, Islamabad","description":"Streets flooded, water entering homes","severity_hint":"high"}'
```

Poll status with the returned `signal_id`: `GET /api/v1/status/{signal_id}`.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Agent pipeline | Python, [LangGraph](https://langchain-ai.github.io/langgraph/), Gemini via `langchain-google-genai` |
| API | FastAPI, Pydantic v2 |
| Mobile (mandatory) | React Native, Expo, Expo Router |
| Web dashboard (optional) | React, Vite, TypeScript |
| Data | In-memory `mock_store` (prototype) |
| Dev / deploy | Docker Compose, Make |

---

## Documentation

| Document | Description |
|----------|-------------|
| [**Documentation index**](docs/README.md) | Start here — links to all guides |
| [Architecture](docs/architecture.md) | System design, data flow, components |
| [Getting started](docs/getting-started.md) | Docker, env vars, phone testing, troubleshooting |
| [API reference](docs/api-reference.md) | REST endpoints, request/response schemas |
| [Development guide](docs/development.md) | Tests, demos, scripts, code quality |
| [Agents package](agents/README.md) | LangGraph pipeline, nodes, tools, LLM modes |
| [Backend](backend/README.md) | FastAPI app structure |
| [Mobile app](mobile-app/README.md) | Expo screens, API integration |
| [Web dashboard](web-app/README.md) | Vite React dashboard |
| [Hackathon challenge](docs/challenge.md) | Original problem statement |
| [Implementation phases](docs/phases/) | Sprint notes (phase 1–4) |
| [Sonar / code quality](docs/SONAR.md) | Linting and SonarCloud setup |

For AI coding assistants working in this repo, see [AGENTS.md](AGENTS.md).

---

## Repository layout

```
NigehbaanAI/
├── agents/           # LangGraph crisis pipeline (production runtime)
├── backend/          # FastAPI REST API
├── mobile-app/       # Expo React Native app (mandatory deliverable)
├── web-app/          # Optional React dashboard
├── tests/            # pytest (LLM mocked via conftest)
├── scripts/          # Demo scenarios, dev helpers
├── bruno/            # Bruno API collection
├── docs/             # Project documentation
└── .agents/skills/   # Cursor agent skills (not runtime code)
```

---

## Demo scenarios

```bash
# Run all scripted scenarios (no HTTP server required)
python scripts/run_demo_scenarios.py --scenario all

# Compare legacy keyword stub vs LangGraph pipeline
python scripts/baseline_comparison.py
```

Or trigger the multi-crisis API: `POST /api/v1/scenario/multi-crisis` (G-10 flood + F-8 heatwave).

---

## Assumptions & limitations

- **Privacy:** District-level locations only (e.g. G-10, F-8); no personal addresses.
- **Persistence:** Incidents live in memory — restart clears data.
- **LLM:** ~2–3 Gemini calls per signal; use `LLM_MODE=mock` for offline/CI.
- **Scale:** Designed for demo; see [architecture](docs/architecture.md#scalability) for production notes.

---

## License

Hackathon prototype — see repository for team attribution.
