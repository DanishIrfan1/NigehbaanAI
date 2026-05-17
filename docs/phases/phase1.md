# Phase 1 - Foundation (Detection + Core UI)

Team: Backend (Danish, Umer) / Frontend (Adeel, FE Dev)
Timeline: Day 1
Priority: Critical

Status
- Backend and Agents: Completed
- Frontend (mock UI flow): In progress

Objectives
- Detection pipeline with trace logging and stable APIs.
- Core mobile screens with mock data to demo the flow.
- Shared vocabulary for crisis type, severity, and location.

Backend and Agents
- [x] ADK and Gemini configuration in agents/config.py.
- [x] Trace logging (JSONL) for every agent step.
- [x] Signal tools: weather, traffic, social, emergency call.
- [x] Detection agents: signal fusion, classifier, severity predictor.
- [x] Orchestrator stage 1-2 (ingest -> detect) wired end to end.
- [x] API endpoints for signal ingest and detection results.
- [x] E2E test coverage for Phase 1 flow.

Frontend (Mock UI Flow)
- [x] Expo + TypeScript app with expo-router, react-native-paper, maps, reanimated.
- [x] App shell with tab navigation and dark theme.
- [x] Home/Dashboard input with social, weather, traffic toggles.
- [ ] Emergency call toggle on Home/Dashboard.
- [x] Analyze button with loading state.
- [x] Crisis screen UI with CrisisCard and mock data.
- [x] Agent log screen with streaming effect and LIVE indicator.
- [x] Map screen with crisis marker, blocked route, animated alternate route.
- [ ] Ambulance marker animation on map.
- [x] Actions screen with ActionCard and auto transitions.
- [x] Outcome screen with stat cards and managed banner.
- [x] Mock data provider in src/services/mock.ts.

APIs available after Phase 1
- POST /api/v1/signal
- GET /api/v1/status/{signal_id}
- GET /api/v1/crisis/{signal_id}
- GET /api/v1/agents/trace/{signal_id}
- GET /api/v1/incidents

Checkpoint
- Backend: detection pipeline returns classification, severity, and traces.
- Frontend: full mock flow works (Home -> Crisis -> Logs -> Map -> Actions -> Outcome).

Dependencies and Notes
- Frontend Phase 2 will align API client to /api/v1 endpoints and use signal_id.
