# Backend — FastAPI API

The backend exposes the REST API and hosts the in-memory incident store. It does **not** contain the LangGraph pipeline — that lives in [`agents/`](../agents/README.md) and is invoked via background tasks.

---

## Layout

```
backend/
└── app/
    ├── main.py              # FastAPI app, CORS, router mount, /health
    ├── core/
    │   └── config.py        # Settings from .env (APP_NAME, DEBUG, …)
    ├── api/
    │   ├── signal.py        # POST /signal, /verify, /scenario/multi-crisis
    │   └── status.py        # GET /status, /crisis, /trace, /actions, /outcome, /incidents
    └── database/
        ├── mock_store.py    # incident_store + resource_ledger
        └── mock_data.py     # Seed / helper data (if used)
```

---

## Entry point

[`app/main.py`](app/main.py):

- Mounts routers at `/api/v1`
- Open CORS for hackathon demos
- `GET /health` — liveness
- `GET /api/v1/endpoints` — route discovery for frontends

Run locally:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

In Docker, `working_dir` is `/app/backend` with `PYTHONPATH=/app:/app/backend`.

---

## Signal API ([`api/signal.py`](app/api/signal.py))

| Endpoint | Behavior |
|----------|----------|
| `POST /signal` | Creates UUID, upserts `queued` record, runs `process_signal` in background |
| `POST /verify/{id}` | Runs `verify_incident` in background |
| `POST /scenario/multi-crisis` | Queues G-10 + F-8 demo payloads |

Request/response models are Pydantic v2 (`SignalPayload`, `SignalResponse`, `VerifyPayload`).

---

## Status API ([`api/status.py`](app/api/status.py))

All read from `incident_store`:

| Endpoint | Returns |
|----------|---------|
| `GET /status/{id}` | Full incident dict |
| `GET /crisis/{id}` | Detection subset |
| `GET /agents/trace/{id}` | Traces via `agents.config.get_traces` |
| `GET /actions/{id}` | Execution + plan rationale |
| `GET /outcome/{id}` | Impact + notifications |
| `GET /incidents` | All values in store |

Returns `404` if `signal_id` is unknown. Partial responses while pipeline is running include a `message` field.

---

## Data layer ([`database/mock_store.py`](app/database/mock_store.py))

| Symbol | Purpose |
|--------|---------|
| `incident_store` | `dict[signal_id, record]` — all incident fields |
| `resource_ledger` | Shared pool for multi-crisis (ambulances, police, …) |
| `upsert_incident()` | Create/update; auto-sets `completed_at` |
| `reset_resource_ledger()` | Reset caps (tests, demos) |

**Not persistent** — container restart clears data.

The agent pipeline writes to the same `incident_store` during `finalize_*` nodes.

---

## Configuration ([`core/config.py`](app/core/config.py))

Loads from environment / `.env`:

- `APP_NAME`, `DEBUG`
- Used by FastAPI metadata only; LLM settings are in `agents/config.py`

---

## Integration with agents

```python
from agents.orchestrator import process_signal, verify_incident
```

Import happens inside route handlers to avoid circular imports at module load. The orchestrator:

1. Builds initial `CrisisState`
2. Invokes compiled LangGraph
3. Merges result into `incident_store`

---

## Testing

Tests import `app` with repo root on path (see `tests/conftest.py`):

```bash
pytest tests/test_phase1_e2e.py -v
```

Use `TestClient` from `httpx` / Starlette against `app.main:app`.

---

## Docs

- [API reference](../docs/api-reference.md)
- [Architecture](../docs/architecture.md)
- [Getting started](../docs/getting-started.md)
