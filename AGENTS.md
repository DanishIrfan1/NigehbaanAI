# NigehbaanAI – Agent Instructions

Crisis Intelligence & Response Orchestrator (CIRO). Production pipeline: LangGraph in [`agents/orchestrator.py`](agents/orchestrator.py). API: [`backend/app/main.py`](backend/app/main.py).

## Agent Skills

Read and follow the relevant skill when working in that area. Canonical skills live under [`.agents/skills/`](.agents/skills/) (pointers in [`.cursor/skills/`](.cursor/skills/)).

| Skill | Path | Use when |
|-------|------|----------|
| **Crisis Detector** | [`.agents/skills/crisis-detector/SKILL.md`](.agents/skills/crisis-detector/SKILL.md) | Merged detect node, signal compression (`agents/graph/nodes/detect.py`) |
| **Response Planner** | [`.agents/skills/response-planner/SKILL.md`](.agents/skills/response-planner/SKILL.md) | Resource planning (`agents/graph/nodes/plan.py`) |
| **Action Executor** | [`.agents/skills/action-executor/SKILL.md`](.agents/skills/action-executor/SKILL.md) | Execute, notify, impact, verification (`agents/graph/nodes/`, `agents/graph/verification.py`) |
| **FastAPI Developer** | [`.agents/skills/fastapi-developer/SKILL.md`](.agents/skills/fastapi-developer/SKILL.md) | FastAPI routes, Pydantic schemas, background tasks, pytest+httpx tests (`backend/app/`) |
| **Bruno Collection Generator** | [`.agents/skills/bruno-collection-generator/SKILL.md`](.agents/skills/bruno-collection-generator/SKILL.md) | Generate or update Bruno `.bru` files from API routes (`bruno/`) |

### FastAPI skill references

- [`.agents/skills/fastapi-developer/references/project-structure.md`](.agents/skills/fastapi-developer/references/project-structure.md)
- [`.agents/skills/fastapi-developer/references/testing.md`](.agents/skills/fastapi-developer/references/testing.md)
- [`.agents/skills/fastapi-developer/references/auth.md`](.agents/skills/fastapi-developer/references/auth.md)
- [`.agents/skills/fastapi-developer/references/alembic.md`](.agents/skills/fastapi-developer/references/alembic.md)

## Key paths

| Area | Path |
|------|------|
| Orchestrator | `agents/orchestrator.py` |
| LangGraph | `agents/graph/` (`build.py`, nodes, verification subgraph) |
| Graph services | `agents/graph/services/` (actions, resources) |
| LLM (structured) | `agents/llm.py` (Gemini via `langchain-google-genai`) |
| Robustness / degraded mode | `agents/robustness/degraded.py` |
| Tools | `agents/tools/` |
| Traces | `agents/traces/trace_log.jsonl` |
| Demo scripts | `scripts/run_demo_scenarios.py`, `scripts/baseline_comparison.py` |
| Legacy baseline stub | `scripts/legacy/orchestrator_stub.py` |
| Tests | `tests/` (use `tests/conftest.py` mocks for LLM-free runs) |

## Conventions

- Use `app.database.mock_store` imports from the `backend/` package (same store as FastAPI).
- Mark simulated outputs `[SIMULATED]`; do not call real emergency or SMS APIs in the prototype.
- Use `agents/orchestrator.py` for production; `scripts/legacy/orchestrator_stub.py` is baseline comparison only.

<!-- agent-ninja-START -->
## Installed project skills

- `.agents/skills/crisis-detector/SKILL.md`
- `.agents/skills/response-planner/SKILL.md`
- `.agents/skills/action-executor/SKILL.md`
- `.agents/skills/fastapi-developer/SKILL.md`
- `.agents/skills/bruno-collection-generator/SKILL.md`
<!-- agent-ninja-END -->
