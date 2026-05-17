# Phase 2 - Planning + Execution (Response Pipeline + Integration)

Team: Backend (Danish, Umer) / Frontend (Adeel, FE Dev)
Timeline: Day 1-2
Priority: Critical

Status
- Backend and Agents: Completed
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

Checkpoint
- Signal -> Detection -> Plan -> Actions -> Notifications -> Outcome visible in UI.
