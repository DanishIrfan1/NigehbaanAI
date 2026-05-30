# Development Guide

Conventions, testing, scripts, and quality tools for contributors.

---

## Project conventions

| Rule | Detail |
|------|--------|
| Production pipeline | Always `agents/orchestrator.py` — not `scripts/legacy/orchestrator_stub.py` |
| Shared store | Import `app.database.mock_store` from the `backend` package |
| Simulated outputs | Tools and actions must include `[SIMULATED]` — no real emergency APIs |
| Path setup | Agent code imports `agents.path_setup` when it needs `app.*` from outside Docker |
| Background work | FastAPI `BackgroundTasks` for `process_signal` / `verify_incident` |

---

## Running tests

Tests use mocks from `tests/conftest.py` — **no Gemini API key required**.

```bash
# All tests
pytest tests/ -v

# In Docker
make test

# Specific suites
pytest tests/test_phase1_e2e.py -v
pytest tests/test_phase2_e2e.py -v
pytest tests/test_phase3_robustness.py -v
pytest tests/test_baseline.py -v
```

| Test file | Focus |
|-----------|-------|
| `test_phase1_e2e.py` | Ingest, detect, status endpoints |
| `test_phase2_e2e.py` | Plan, execute, notify, outcome |
| `test_phase3_robustness.py` | Degraded mode, duplicates, verify |
| `test_baseline.py` | Stub vs LangGraph comparison |
| `test_sdk_hello.py` | Smoke test |

Set `LLM_MODE=mock` in the environment for deterministic CI runs.

---

## Demo scripts

See [scripts/README.md](../scripts/README.md).

```bash
# All scenarios (flood, multi-crisis, false alarm)
python scripts/run_demo_scenarios.py --scenario all

# Baseline comparison table
python scripts/baseline_comparison.py
```

Scenarios print `signal_id` values suitable for Bruno or the mobile app.

---

## Linting

```bash
make lint
# or: python -m ruff check backend agents tests scripts
```

Config: [`ruff.toml`](../ruff.toml)

---

## SonarCloud

See [SONAR.md](SONAR.md). Project key: `DanishIrfan1_NigehbaanAI`.

```bash
# Requires SONARQUBE_TOKEN and SONARQUBE_ORG in .env
make sonar-scan
```

---

## Docker development

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Backend + mobile services |
| `Dockerfile.backend` | Python deps from `requirements.docker.txt` |
| `Dockerfile.mobile` | Node + Expo |
| `scripts/dev.sh` | Smart startup (port detection, env load) |

`PYTHONPATH` inside backend container: `/app:/app/backend`

Volumes mount the repo at `/app` so code changes apply without rebuild.

---

## Adding an API endpoint

1. Add route in `backend/app/api/signal.py` or `status.py`
2. Wire orchestrator or store as needed
3. Update `GET /api/v1/endpoints` in `backend/app/main.py`
4. Add Bruno `.bru` under `bruno/`
5. Add pytest in `tests/`
6. Document in [api-reference.md](api-reference.md)

Follow the FastAPI skill: [`.agents/skills/fastapi-developer/`](../.agents/skills/fastapi-developer/SKILL.md)

---

## Adding a pipeline node

1. Create node function in `agents/graph/nodes/`
2. Register in `agents/graph/build.py`
3. Extend `CrisisState` in `agents/graph/state.py` if new fields needed
4. Add traces via `agents.config.log_trace`
5. Update [agents/README.md](../agents/README.md)
6. Add tests with mocked LLM

---

## Environment variables (dev)

| Variable | Used by |
|----------|---------|
| `GOOGLE_API_KEY` | `agents/llm.py` |
| `LLM_MODE` | `agents/llm.py` |
| `GEMINI_MODEL_ID` | `agents/config.py` (optional override) |
| `LANGCHAIN_TRACING_V2` | Optional LangSmith |
| `DEBUG` | `backend/app/core/config.py` |

Copy from [`.env.example`](../.env.example).

---

## Git workflow

- Main docs live in `docs/` and package READMEs — update them when behavior changes.
- `AGENTS.md` is for AI assistants; keep key paths in sync.
- Phase docs under `docs/phases/` are historical sprint notes.

---

## Related docs

- [Architecture](architecture.md)
- [Getting started](getting-started.md)
- [API reference](api-reference.md)
- [Agents package](../agents/README.md)
