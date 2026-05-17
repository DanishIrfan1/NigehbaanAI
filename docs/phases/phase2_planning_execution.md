# Phase 2 — Planning & Execution Agents

**Team**: Danish + Umer (Backend)  
**Timeline**: Day 1, Second Half (~4-5 hrs)  
**Priority**: 🔴 CRITICAL — Core demo flow

---

## Tasks

### 2.1 Resource Planner Agent
- [ ] `agents/planner/resource_agent.py` — LlmAgent that:
  - Receives crisis detection + available resources (from mock_data.py)
  - Allocates: ambulances, police, rescue teams, drones, shelters
  - Handles multi-crisis: splits resources between G-10 flood + F-8 heatwave
  - Shows trade-off reasoning: "Allocated 3 rescue teams to G-10 because severity=high, leaving 2 for F-8"
  - **[CREATIVE]** Considers ambulance rerouting for blocked roads
  - Keeps 10% reserve as per skill rules
  - Output: ordered action plan with resources, priorities, fallbacks

**Owner**: Umer  
**Time**: ~1.5 hrs

---

### 2.2 Action Executor Agent
- [ ] `agents/executor/action_agent.py` — LlmAgent + tools that:
  - Executes each action from the plan by calling tools:
    - `map_tool.simulate_rerouting()` for traffic rerouting
    - `alert_tool.send_alert()` for public/hospital/transport alerts
  - Records **before state** and **after state** for each action
  - Calculates response time improvement %
  - **[CREATIVE]** Simulates ambulance route optimization
  - Handles tool failures gracefully (try/except → fallback)

**Owner**: Danish  
**Time**: ~1.5 hrs

---

### 2.3 Stakeholder Notification Agent
- [ ] `agents/executor/notification_agent.py` — LlmAgent that:
  - Generates tailored messages for 6 audiences:
    1. 🏠 Public — "Flash flood alert for G-10. Move to higher ground."
    2. 🚑 Emergency Services — Priority dispatch details
    3. 🏥 Hospital — Prepare beds, trauma team
    4. ⚡ Utility Company — Water-main inspection
    5. 🚌 Transport Authority — Bus rerouting
    6. 📺 Media / Command Center — Incident status
  - Messages are **LLM-generated** (not templates!) — judges will notice
  - Supports Urdu + English

**Owner**: Umer  
**Time**: ~1 hr

---

### 2.4 Wire Full Orchestrator Pipeline
- [ ] Update `agents/adk_orchestrator.py` to add:
  - Resource Planner Agent (after severity prediction)
  - Action Executor Agent (after planning)
  - Stakeholder Notification Agent (after execution)
- [ ] Full pipeline: Ingest → Fuse → Classify → Predict → Plan → Execute → Notify
- [ ] All steps write traces to JSONL

**Owner**: Danish  
**Time**: ~30 min

---

### 2.5 Multi-Crisis Coordination Demo
- [ ] Create scenario: G-10 flood AND F-8 heatwave arrive within 30 min
- [ ] Planner must show: "Prioritizing G-10 (severity=high) over F-8 (severity=medium)"
- [ ] Resource split visible in traces
- [ ] Test with 2 POST /signal calls

**Owner**: Danish + Umer  
**Time**: ~30 min

---

### 2.6 Backend API — Actions & Outcome Endpoints
- [ ] `GET /api/v1/actions/{signal_id}` — List of executed actions with status
- [ ] `GET /api/v1/outcome/{signal_id}` — Before/after stats:
  - Traffic congestion: 87% → 23%
  - Response time: N/A → 8 min
  - Citizens alerted: 0 → 4,200
  - Crisis status: ACTIVE → MANAGED

**Owner**: Umer  
**Time**: ~30 min

---

## Phase 2 Checkpoint ✅

Full demo flow works:
```
Signal → Detection → Severity → Resource Plan → Actions → Notifications → Outcome
```

New APIs available for frontend:
- `GET /api/v1/actions/{signal_id}` → Action cards
- `GET /api/v1/outcome/{signal_id}` → Before/after stats
- `GET /api/v1/agents/trace/{signal_id}` → Full agent reasoning trace
