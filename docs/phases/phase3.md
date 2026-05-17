# Phase 3 - Robustness + Edge Cases

Team: Backend (Danish, Umer) / Frontend (Adeel, FE Dev)
Timeline: Day 2
Priority: High

Status
- Backend and Agents: Partial
- Frontend: Not started

Objectives
- Handle false alarms and corrections safely.
- Support degraded mode and fallback behavior.
- Showcase creative features (emergency call, ambulance reroute).

Backend and Agents
- [x] Verification Agent for false alarm correction.
- [x] Verification endpoint: POST /api/v1/verify/{signal_id}.
- [x] Emergency call tool and ingestion as 4th signal source.
- [ ] Degraded mode and fallback logic with explicit flags.
- [ ] Ambulance reroute tool (simulate_ambulance_reroute) and planner usage.
- [ ] Tests for false alarm and degraded mode paths.

Frontend
- [ ] Field report input and correction UI on Crisis screen.
- [ ] Degraded mode banner when backend flags warnings.
- [ ] Emergency call screen or visual component.
- [ ] Ambulance reroute visualization on map.

Checkpoint
- Demo: false alarm correction OR degraded mode in a single run, with traces.
