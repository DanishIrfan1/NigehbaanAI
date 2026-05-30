# NigehbaanAI Documentation

Welcome to the NigehbaanAI (CIRO) documentation. This index helps you find the right guide depending on what you need.

---

## New to the project?

Read in this order:

1. [Root README](../README.md) — one-page overview and quick start
2. [Architecture](architecture.md) — how the pieces fit together
3. [Getting started](getting-started.md) — run locally with Docker or Python
4. [API reference](api-reference.md) — REST endpoints for integration

---

## Guides

| Guide | Audience | Contents |
|-------|----------|----------|
| [Architecture](architecture.md) | Everyone | End-to-end flow, components, state, LLM design, scalability |
| [Getting started](getting-started.md) | Developers, demo | Docker, env vars, Expo Go on phone, troubleshooting |
| [API reference](api-reference.md) | Frontend, integrators | All `/api/v1` endpoints with schemas |
| [Development](development.md) | Contributors | Tests, scripts, lint, project conventions |
| [Challenge brief](challenge.md) | Judges, reviewers | Hackathon requirements and evaluation criteria |
| [Sonar / quality](SONAR.md) | Maintainers | SonarCloud, ruff, exclusions |

---

## Package-level docs

Each major folder has its own README with file-level detail:

| Package | README | Role |
|---------|--------|------|
| `agents/` | [agents/README.md](../agents/README.md) | LangGraph pipeline, nodes, tools, traces |
| `backend/` | [backend/README.md](../backend/README.md) | FastAPI routes, mock store, settings |
| `mobile-app/` | [mobile-app/README.md](../mobile-app/README.md) | Expo screens, polling, API client |
| `web-app/` | [web-app/README.md](../web-app/README.md) | Vite dashboard (optional) |
| `scripts/` | [scripts/README.md](../scripts/README.md) | Demo scenarios and dev helpers |
| `bruno/` | [bruno/apis.md](../bruno/apis.md) | Bruno collection + API quick ref |

---

## Historical / planning docs

These capture sprint planning and are useful for context, not day-to-day development:

| Document | Description |
|----------|-------------|
| [plan.md](plan.md) | 2-day sprint master plan |
| [NigehbaanAI_Roadmap.md](NigehbaanAI_Roadmap.md) | Product roadmap notes |
| [phases/phase1.md](phases/phase1.md) | Phase 1 — core detection pipeline |
| [phases/phase2.md](phases/phase2.md) | Phase 2 — planning & execution |
| [phases/phase3.md](phases/phase3.md) | Phase 3 — robustness & verification |
| [phases/phase4.md](phases/phase4.md) | Phase 4 — polish & submission |

---

## AI assistant instructions

If you use Cursor or another coding agent, see [AGENTS.md](../AGENTS.md) for key paths, skills under `.agents/skills/`, and project conventions.
