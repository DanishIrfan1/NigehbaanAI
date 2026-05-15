# Frontend Phase 2 — Integration, Polish & Demo

**Team**: Adeel + Frontend Dev  
**Timeline**: Day 2 (~8-10 hrs total)  
**Priority**: 🟡 HIGH

---

## Tasks

### F2.1 API Integration (~2 hrs)
- [ ] Replace all mock data with real API calls:
  - HomeScreen: `POST /signal` on button press
  - CrisisScreen: `GET /crisis/{signal_id}`
  - AgentLogScreen: `GET /agents/trace/{signal_id}` (poll every 2s)
  - ActionsScreen: `GET /actions/{signal_id}`
  - OutcomeScreen: `GET /outcome/{signal_id}`
- [ ] Add error handling: if API fails → fall back to mock silently
- [ ] Add loading skeletons on each screen
- [ ] Add retry button on error
- [ ] Test full flow with real backend 3 times

**Owner**: Adeel  

---

### F2.2 Multi-Crisis View (Bonus Points) (~1.5 hrs)
- [ ] Dashboard-style screen showing 2 simultaneous crises:
  - G-10 Flooding (HIGH, red card)
  - F-8 Heatwave (MEDIUM, orange card)
- [ ] Resource split visualization:
  - Bar chart or pie showing allocation
  - "3 rescue teams → G-10, 2 field teams → F-8"
- [ ] Tap each crisis card → navigate to its detail flow

**Owner**: Frontend Dev  

---

### F2.3 False Alarm / Correction UI (~1 hr)
- [ ] After regular flow, show "New Field Report" button
- [ ] Tapping triggers verification agent
- [ ] CrisisScreen updates:
  - Old badge: ~~FLOOD~~ (strikethrough)
  - New badge: WATER MAIN BURST
  - Confidence drops from 92% → 35%
- [ ] Alert retraction notification appears
- [ ] Toast: "Alert corrected — Utility team notified"

**Owner**: Frontend Dev  

---

### F2.4 Emergency Call Screen (Creative) (~1 hr)
- [ ] Simulated call recording UI:
  - Waveform animation (fake audio visualization)
  - Live transcription appearing: "Pani ghar mein aa raha hai..."
  - Extracted info card: Location, Crisis Type, Urgency
- [ ] This shows the "emergency number as source-of-truth" feature

**Owner**: Adeel  

---

### F2.5 Splash Screen & App Identity (~30 min)
- [ ] NigehbaanAI logo with entrance animation
- [ ] Tagline: "Agentic Crisis Intelligence for Smart Cities"
- [ ] Auto-navigate to HomeScreen after 2.5s
- [ ] App name set to "NigehbaanAI" (not "Expo App")

**Owner**: Frontend Dev  

---

### F2.6 Real Device Testing (~1 hr)
- [ ] Test on real Android phone via Expo Go
- [ ] Fix overflow/cutoff issues
- [ ] SafeAreaView everywhere
- [ ] All text readable (contrast, size)
- [ ] Status bar doesn't overlap
- [ ] Test with backend running on same network

**Owner**: All Frontend  

---

### F2.7 Demo Video Recording (~2 hrs)
- [ ] Record full flow on real device:

| Time | Screen | What to Show |
|------|--------|-------------|
| 0:00-0:30 | Intro | App name, problem, what CIRO does |
| 0:30-1:00 | HomeScreen | Type Urdu + toggle signals + Analyze |
| 1:00-1:30 | CrisisScreen | Detection results, confidence, severity |
| 1:30-2:15 | AgentLogScreen | Agent reasoning streaming live |
| 2:15-2:45 | MapScreen | Crisis pin + reroute + ambulance |
| 2:45-3:15 | ActionsScreen | Cards flipping to DONE |
| 3:15-3:30 | OutcomeScreen | Stats + MANAGED banner |
| 3:30-4:00 | Multi-Crisis | Two crises + resource split |
| 4:00-4:30 | False Alarm | Correction flow |
| 4:30-5:00 | Emergency Call | Call recording + extraction |

- [ ] Add voiceover explaining each screen
- [ ] Edit with captions

**Owner**: All team  

---

## Phase 2 Checkpoint ✅

**App is demo-ready on real device. Video recorded. Submitted! 🚀**
