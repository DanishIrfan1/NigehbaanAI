# Phase 3 - Robustness + Edge Cases

Team: Backend (Danish, Umer) / Frontend (Adeel, FE Dev)
Timeline: Day 2
Priority: High

Status
- Backend and Agents: Completed
- Frontend: Not started

Objectives
- Handle false alarms and corrections safely.
- Support degraded mode and fallback behavior.
- Showcase creative features (emergency call, ambulance reroute).

Backend and Agents
- [x] Verification Agent for false alarm correction.
- [x] Verification endpoint: POST /api/v1/verify/{signal_id}.
- [x] Emergency call tool and ingestion as 4th signal source.
- [x] Fix `retract_alert` invocation + store `alert_id` from `send_alert` for retraction.
- [x] Degraded mode module: agents/robustness/degraded.py with explicit flags.
- [x] Respect `enable_*` flags: skipped source logs source_degraded trace.
- [x] `simulate_ambulance_reroute` in map_tool.py and planner/executor wiring.
- [x] Duplicate-incident detection in orchestrator.
- [x] GET /api/v1/status/{id} exposes degraded_mode, warnings, verification.
- [x] Tests: tests/test_phase3_robustness.py.

Frontend
- [ ] Field report input and correction UI on Crisis screen.
- [ ] Degraded mode banner when backend flags warnings.
- [ ] Emergency call screen or visual component.
- [ ] Ambulance reroute visualization on map.

Checkpoint
- Demo: false alarm correction OR degraded mode in a single run, with traces.
