# Scripts

Utility scripts for local development, demos, and baseline comparison. These run **outside** the FastAPI server (direct Python imports).

---

## Layout

```
scripts/
├── dev.sh                      # Start Docker stack (port detection, env)
├── run_demo_scenarios.py       # End-to-end demo scenarios
├── baseline_comparison.py      # Legacy stub vs LangGraph
└── legacy/
    └── orchestrator_stub.py    # Keyword-only baseline (NOT production)
```

---

## `dev.sh`

Recommended way to start the development stack:

```bash
./scripts/dev.sh
```

- Loads `.env`
- Detects if port 8000 is busy (may switch to 8001)
- Runs `docker compose up --build`

Equivalent: `make up-build`

---

## `run_demo_scenarios.py`

Runs the LangGraph pipeline directly (no HTTP). Prints `signal_id` values for Bruno or manual API polling.

```bash
python scripts/run_demo_scenarios.py --scenario 1    # G-10 flood happy path
python scripts/run_demo_scenarios.py --scenario 2    # Multi-crisis
python scripts/run_demo_scenarios.py --scenario 3    # False alarm + verify
python scripts/run_demo_scenarios.py --scenario all
```

Requires:

- Repo root on `PYTHONPATH` (script adds paths automatically)
- `.env` loaded (optional `GOOGLE_API_KEY`; use `LLM_MODE=mock` for offline)

---

## `baseline_comparison.py`

Compares the legacy keyword stub with the LangGraph pipeline on the same inputs:

```bash
python scripts/baseline_comparison.py
```

Useful for hackathon "baseline comparison" deliverable. The stub lives in `scripts/legacy/orchestrator_stub.py` — **do not use in production**.

---

## Make targets

| Target | Script / action |
|--------|-----------------|
| `make up-build` | `./scripts/dev.sh` / compose |
| `make test` | pytest in backend container |
| `make sonar-scan` | SonarCloud Docker scanner |

See [Development guide](../docs/development.md).
