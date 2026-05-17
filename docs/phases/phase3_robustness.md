# Phase 3 — Robustness & Edge Cases

**Team**: Danish + Umer (Backend)  
**Timeline**: Day 2, First Half (~3-4 hrs)  
**Priority**: 🟡 HIGH — 10% of score + judge favorite

---

## Tasks

### 3.1 Verification Agent (False Alarm Handling)
- [ ] `agents/verifier/verification_agent.py` — LlmAgent that:
  - Receives detection result + new "field verification" signal
  - Determines: is original detection still valid?
  - If FALSE ALARM:
    1. Updates crisis classification (flood → water-main burst)
    2. Retracts public alert via `alert_tool.retract_alert()`
    3. Generates apology/correction message
    4. Notifies utility provider instead
    5. Logs correction in traces
  - Output: corrected classification + retraction actions

**Owner**: Danish  
**Time**: ~1.5 hrs

---

### 3.2 Conflicting Signals Demo Scenario
- [ ] Create mock scenario:
  - Social post: "Streets flooded in G-10!"
  - Field report: "Actually a broken water main, not flooding"
  - Sensor data: Water level normal
- [ ] System initially classifies as flooding (high confidence)
- [ ] Field report arrives → Verification Agent kicks in
- [ ] Classification updated: `urban_flooding → infrastructure_failure`
- [ ] Alert retracted + utility notified
- [ ] Full trace shows: detect → verify → correct → notify

**Owner**: Danish  
**Time**: ~30 min (part of 3.1)

---

### 3.3 Degraded Mode & Fallbacks
- [ ] Wrap every API tool call in try/except:
  - If weather API fails → use last cached data + flag `[DEGRADED]`
  - If traffic API fails → use historical baseline + flag `[ESTIMATED]`
  - If LLM fails → fall back to rule-based classification (old stubs as backup!)
- [ ] Add `degraded_mode` flag in response so UI can show warning
- [ ] Create test: disable weather tool → system still produces a result

**Owner**: Umer  
**Time**: ~1 hr

---

### 3.4 Emergency Call Agent (Creative Feature)
- [ ] `agents/tools/emergency_call_tool.py` — Simulates:
  - Incoming emergency call recording (mock audio transcription)
  - Extracts: location, crisis type, urgency, number of affected
  - Serves as **source-of-truth** signal (highest credibility)
  - Example: "Call from G-10: 'Pani ghar mein aa raha hai, madad chahiye!'"
  - LLM extracts: location=G-10, type=flooding, urgency=critical, language=Urdu
- [ ] Integrate as 4th signal source in ParallelAgent

**Owner**: Umer  
**Time**: ~1 hr

---

### 3.5 Ambulance Rerouting (Creative Feature)
- [ ] Extend `agents/tools/map_tool.py`:
  - `simulate_ambulance_reroute(origin, destination, blocked_roads)`
  - Shows: optimal ambulance route avoiding crisis zone
  - Returns: ETA, distance, route coordinates
- [ ] Resource Planner considers blocked roads when dispatching ambulances
- [ ] Before/after: "Ambulance rerouted via F-10, ETA reduced from 25min to 12min"

**Owner**: Danish  
**Time**: ~30 min

---

## Phase 3 Checkpoint ✅

Can demonstrate:
1. ✅ False alarm → verification → alert retraction
2. ✅ API failure → graceful degradation
3. ✅ Emergency call → LLM extraction → high-priority signal
4. ✅ Ambulance rerouting → ETA improvement
5. ✅ Full traces for all edge cases
