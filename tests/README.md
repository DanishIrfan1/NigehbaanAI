# Tests

pytest suite for the API and LangGraph pipeline. **LLM calls are mocked** — no Gemini API key required.

---

## Running

```bash
pytest tests/ -v

# In Docker
make test
```

---

## Layout

| File | Coverage |
|------|----------|
| `conftest.py` | Shared fixtures, LLM mocks, store reset |
| `test_phase1_e2e.py` | Signal ingest, detection, status |
| `test_phase2_e2e.py` | Plan, execute, notify, outcome |
| `test_phase3_robustness.py` | Degraded mode, duplicates, verification |
| `test_baseline.py` | Stub vs LangGraph comparison |
| `test_sdk_hello.py` | Smoke test |

---

## Conventions

- Set `LLM_MODE=mock` for deterministic runs
- Tests reset `incident_store` / resource ledger via conftest
- Use FastAPI `TestClient` for HTTP endpoints
- Direct `process_signal()` calls for pipeline-only tests

See [Development guide](../docs/development.md).
