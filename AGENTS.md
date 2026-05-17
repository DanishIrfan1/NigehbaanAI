# NigehbaanAI – Agent Instructions

Crisis Intelligence & Response Orchestrator (CIRO). Production pipeline: `agents/adk_orchestrator.py`. API: `backend/app/main.py`.

## Agent Skills

Read and follow the relevant skill when working in that area. Skills live under [`agents/skills/`](agents/skills/).

| Skill | Path | Use when |
|-------|------|----------|
| **Crisis Detector** | [`agents/skills/detector.md`](agents/skills/detector.md) | Signal fusion, credibility scoring, contradiction detection, crisis classification, severity prediction (`agents/detector/`) |
| **Response Planner** | [`agents/skills/planner.md`](agents/skills/planner.md) | Resource allocation, multi-crisis trade-offs, action sequencing, side effects (`agents/planner/resource_agent.py`) |
| **Action Executor** | [`agents/skills/executor.md`](agents/skills/executor.md) | Tool execution, stakeholder notifications, before/after impact, false-alarm retraction (`agents/executor/`) |
| **FastAPI Developer** | [`agents/skills/fastapi/fastapi-developer/SKILL.md`](agents/skills/fastapi/fastapi-developer/SKILL.md) | FastAPI routes, Pydantic schemas, background tasks, pytest+httpx tests (`backend/app/`) |
| **Bruno Collection Generator** | [`agents/skills/bruno-collection-generator/SKILL.md`](agents/skills/bruno-collection-generator/SKILL.md) | Generate or update Bruno `.bru` files from API routes (`bruno/`) |

### FastAPI skill references

- [`agents/skills/fastapi/fastapi-developer/references/project-structure.md`](agents/skills/fastapi/fastapi-developer/references/project-structure.md)
- [`agents/skills/fastapi/fastapi-developer/references/testing.md`](agents/skills/fastapi/fastapi-developer/references/testing.md)
- [`agents/skills/fastapi/fastapi-developer/references/auth.md`](agents/skills/fastapi/fastapi-developer/references/auth.md)
- [`agents/skills/fastapi/fastapi-developer/references/alembic.md`](agents/skills/fastapi/fastapi-developer/references/alembic.md)

## Key paths

| Area | Path |
|------|------|
| Orchestrator | `agents/adk_orchestrator.py` |
| ADK wrapper (`USE_ADK=true`) | `agents/adk_pipeline.py` |
| Robustness / degraded mode | `agents/robustness/degraded.py` |
| Tools | `agents/tools/` |
| Traces (submission) | `agents/traces/trace_log.jsonl` |
| Demo scripts | `scripts/run_demo_scenarios.py`, `scripts/baseline_comparison.py` |
| Tests | `tests/` (use `tests/conftest.py` mocks for LLM-free runs) |

## Conventions

- Use `app.database.mock_store` imports from the `backend/` package (same store as FastAPI).
- Mark simulated outputs `[SIMULATED]`; do not call real emergency or SMS APIs in the prototype.
- Legacy `agents/orchestrator.py` is deprecated (baseline comparison only).

<!-- agent-ninja-START -->
## Installed project skills

- `agents/skills/detector.md`
- `agents/skills/planner.md`
- `agents/skills/executor.md`
- `agents/skills/fastapi/fastapi-developer/SKILL.md`
- `agents/skills/bruno-collection-generator/SKILL.md`
<!-- agent-ninja-END -->
