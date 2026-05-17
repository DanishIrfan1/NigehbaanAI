# Frontend Phase 1 — App Foundation & Core Screens

**Team**: Adeel + Frontend Dev  
**Timeline**: Day 1 (~8-10 hrs total)  
**Priority**: 🔴 CRITICAL

---

## API Base URL
```
http://<backend-ip>:8000/api/v1
```

## Available Endpoints (from Backend Phase 1-2)

| Endpoint | Method | Returns |
|----------|--------|---------|
| `POST /signal` | POST | `{ signal_id, status: "queued" }` |
| `GET /crisis/{signal_id}` | GET | Detection + classification + severity |
| `GET /agents/trace/{signal_id}` | GET | Array of agent reasoning log entries |
| `GET /actions/{signal_id}` | GET | List of executed actions with status |
| `GET /outcome/{signal_id}` | GET | Before/after stats |

---

## Tasks

### F1.1 Project Setup (~1 hr)
- [ ] Initialize Expo project with TypeScript
- [ ] Install: expo-router, react-native-maps, reanimated, gesture-handler, axios, paper
- [ ] Configure navigation (expo-router)
- [ ] Set up dark theme constants:
  - Background: `#0A0E1A`
  - Danger: `#FF3B3B`
  - Success: `#00D084`
  - Accent: `#2980B9`
- [ ] Create `services/api.ts` with all endpoint calls
- [ ] Create `services/mock.ts` with fallback mock data

**Owner**: Adeel  

---

### F1.2 HomeScreen (~1.5 hrs)
- [ ] NigehbaanAI logo header
- [ ] TextInput for crisis signal (multiline, Urdu + English)
- [ ] 4 toggle switches:
  - 📱 Social Media Signal
  - 🌧️ Weather Alert
  - 🚗 Traffic Spike
  - 📞 Emergency Call (creative feature!)
- [ ] "Analyze Crisis" button (red, full width)
- [ ] Loading spinner while analyzing
- [ ] On success: navigate to CrisisScreen with signal_id

**Owner**: Adeel  

---

### F1.3 CrisisScreen (~1.5 hrs)
- [ ] CrisisCard component:
  - Crisis title + location
  - Confidence % with animated progress bar
  - SeverityBadge: HIGH (red), MEDIUM (orange), LOW (yellow)
  - Impact list (bullet points)
  - Source signals section
- [ ] FadeIn + SlideUp animations
- [ ] Buttons: "View Agent Reasoning" → AgentLogScreen, "See Response Plan" → MapScreen
- [ ] Poll `GET /crisis/{signal_id}` until results arrive

**Owner**: Frontend Dev  

---

### F1.4 AgentLogScreen (~1.5 hrs)
- [ ] Dark terminal-style background
- [ ] Agent log entries: `[timestamp] AgentName: message`
- [ ] Streaming effect: lines appear one by one (1500ms gap)
- [ ] Color-coded agents:
  - 🔵 Signal Fusion (blue)
  - 🟡 Classifier (yellow)
  - 🟠 Planner (orange)
  - 🟢 Executor (green)
  - 🔴 Verifier (red)
- [ ] LIVE indicator (blinking dot) while streaming
- [ ] Auto-scroll to bottom
- [ ] "Proceed to Map" button after all logs shown

**Owner**: Frontend Dev  

---

### F1.5 MapScreen (~2 hrs)
- [ ] Google Maps centered on Islamabad (33.6844, 73.0479)
- [ ] Crisis marker at G-10 with pulsing animation
- [ ] Blocked route (red dashed polyline)
- [ ] Alternate route (green animated polyline — draws itself!)
- [ ] **Ambulance marker** moving along optimal route (creative!)
- [ ] Callout popup: "Urban Flooding | G-10 | HIGH"
- [ ] Bottom legend: 🔴 Blocked  🟢 Alternate  📍 Crisis  🚑 Ambulance
- [ ] "View Actions" button → ActionsScreen

**Owner**: Adeel  

---

### F1.6 ActionsScreen (~1 hr)
- [ ] ActionCard component with states: PENDING → EXECUTING → DONE
- [ ] Auto-transition cards sequentially (1s, 2.5s, 4s)
- [ ] Cards:
  1. 🗺️ Traffic Rerouting — "Alt route via F-10 now active"
  2. 🚑 Emergency Dispatch — "2 rescue units dispatched to G-10"
  3. 📢 Public Alert — "4,200 users notified"
  4. 🏥 Hospital Alert — "Emergency beds prepared at PIMS"
- [ ] "View Outcome" button after all DONE

**Owner**: Frontend Dev  

---

### F1.7 OutcomeScreen (~1 hr)
- [ ] StatCard: label, before (red), after (green), % change
- [ ] Animated number count-up
- [ ] Stats:
  - Traffic Congestion: 87% → 23% (−64%)
  - Response Time: N/A → 8 min
  - Citizens Alerted: 0 → 4,200
  - Ambulance ETA: 25 min → 12 min (creative!)
  - Crisis Status: ACTIVE → MANAGED
- [ ] "CRISIS MANAGED" banner (green)

**Owner**: Adeel  

---

## Phase 1 Checkpoint ✅

Complete mock demo flow: Home → Crisis → Agent Log → Map → Actions → Outcome  
All screens polished with dark theme + animations
