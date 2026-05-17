# Phase 2 - Planning + Execution (Response Pipeline + Integration)

Team: Backend (Danish, Umer) / Frontend (Adeel, FE Dev)
Timeline: Day 1-2
Priority: Critical

Status
- Backend and Agents: Completed (functional); challenge-hardening in Phase 3–4
- Frontend Integration: Not started

Objectives
- Generate resource plans and execute actions with measurable impact.
- Produce stakeholder notifications with traceable reasoning.
- Connect UI to real backend responses.

Backend and Agents
- [x] Resource Planner Agent with tradeoff reasoning and reserves.
- [x] Action Executor Agent with tool calls (rerouting and alerts).
- [x] Stakeholder Notifier Agent for 6 audiences.
- [x] Orchestrator stage 3 wired: plan -> execute -> notify.
- [x] Impact assessment computed for outcomes.
- [x] Multi-crisis support using active incident context.
- [x] API endpoints for actions and outcome.
- [x] Trace logging for planning and execution stages.
- [x] Enforce `DEFAULT_RESOURCES` caps in planner post-processing.
- [x] Multi-crisis scenario helper: POST /api/v1/scenario/multi-crisis.
- [x] Per-action impact: merge action_agent tool results into outcome.
- [x] E2E test: signal -> poll status until completed.
- [x] Add POST /verify to GET /api/v1/endpoints catalog.

Frontend Integration
- [ ] Update API base to /api/v1 and use signal_id-driven flow.
- [ ] Replace mock data in Crisis, Logs, Actions, Outcome with live calls.
- [ ] Poll /status or /crisis until detection is ready.
- [ ] Add loading skeletons, error states, and retry handling.
- [ ] Display plan rationale and multi-crisis tradeoffs (optional).
- [ ] Validate the full flow on device with backend running.

APIs available after Phase 2
- GET /api/v1/actions/{signal_id}
- GET /api/v1/outcome/{signal_id}
- POST /api/v1/scenario/multi-crisis

Checkpoint
- Signal -> Detection -> Plan -> Actions -> Notifications -> Outcome visible in UI.
