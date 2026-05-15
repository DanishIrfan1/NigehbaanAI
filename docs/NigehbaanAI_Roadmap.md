# 🚨 NigehbaanAI

**Crisis Intelligence & Response Orchestrator**
React Native (Expo) — Complete Development Roadmap

| Field | Details |
|-------|---------|
| **Developer** | Muhammad Adeel |
| **Role** | Frontend (React Native) |
| **Timeline** | 7 Days · 4–5 hrs/day |
| **Stack** | Expo · TypeScript · Maps |

---

## 📋 Project Overview

NigehbaanAI is an Agentic AI system that detects metropolitan crises (floods, heatwaves, road blockages) in real-time by ingesting multi-source signals, then orchestrates coordinated emergency responses. As the frontend developer, your job is to build the React Native mobile app that makes all this AI reasoning visible, interactive, and demo-ready.

| Component | Your Responsibility | Teammate |
|-----------|-------------------|----------|
| Mobile App (MUST) | All screens, navigation, animations | — |
| API Integration | Consume backend endpoints | Build endpoints |
| Map Simulation | Rerouting animation, markers | — |
| Agent Log UI | Streaming terminal display | — |
| Google Antigravity | Display its outputs | Orchestrate agents |
| Demo Video | Screen recording + voiceover | Backend demo |

---

## ⚙️ Tech Stack

| Package | Purpose | Install Command |
|---------|---------|----------------|
| `expo-router` | File-based navigation | `npx expo install expo-router` |
| `react-native-maps` | Google Maps + markers + polylines | `npx expo install react-native-maps` |
| `react-native-reanimated` | Smooth animations | `npx expo install react-native-reanimated` |
| `react-native-gesture-handler` | Touch interactions | `npx expo install react-native-gesture-handler` |
| `axios` | API calls to backend | `npm install axios` |
| `@expo/vector-icons` | Icons (Ionicons etc.) | Built into Expo |
| `react-native-paper` | UI component base | `npm install react-native-paper` |

---

## 📁 Folder Structure

```
NigehbaanAI/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx              ← HomeScreen
│   ├── crisis.tsx             ← CrisisScreen
│   ├── agent-log.tsx          ← AgentLogScreen
│   ├── map.tsx                ← MapScreen
│   ├── actions.tsx            ← ActionsScreen
│   └── outcome.tsx            ← OutcomeScreen
├── components/
│   ├── CrisisCard.tsx
│   ├── ActionCard.tsx
│   ├── AgentLogItem.tsx
│   ├── SeverityBadge.tsx
│   └── StatCard.tsx
├── services/
│   ├── api.ts
│   └── mock.ts
├── hooks/
│   ├── useCrisisAnalysis.ts
│   └── useAgentLog.ts
└── constants/
    ├── colors.ts
    └── theme.ts
```

---

## 🤝 API Contract (Agree with Teammate — Day 1)

Define these endpoints with your teammate on Day 1. Build with mocks until backend is ready.

| Endpoint | Method | What It Returns |
|----------|--------|----------------|
| `POST /analyze` | POST | Triggers analysis of input signals |
| `GET /crisis/status` | GET | Detected crisis, confidence %, severity |
| `GET /agents/trace` | GET | Array of agent reasoning log lines |
| `GET /actions` | GET | List of recommended + simulated actions |
| `GET /outcome` | GET | Before/after stats (congestion, response time) |

---

## 🗓️ 7-Day Step-by-Step Todo Plan

---

### DAY 1 — Setup & Foundation

**Time:** 4–5 hrs

**GOAL:** Project running, all screens navigable, HomeScreen built

#### Project Initialization

- Initialize Expo project: `npx create-expo-app NigehbaanAI --template blank-typescript`
- Install all packages (see Tech Stack table above)
- Configure expo-router in `app.json` (add scheme, set main to `expo-router/entry`)
- Set up `tsconfig.json` with strict mode
- Add Google Maps API key to `app.json` under `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey`

#### Constants & Theme

- Create `constants/colors.ts` with full dark theme palette
  - Background: `#0A0E1A` | Danger: `#FF3B3B` | Success: `#00D084` | Accent: `#2980B9`
- Create `constants/theme.ts` with font sizes, spacing, border radius

#### Mock Data

- Create `services/mock.ts` with mock responses for all 5 API endpoints
- Include a realistic Urdu crisis scenario: G-10 flooding, 92% confidence, HIGH severity
- Include 4 agent log lines with timestamps and agent names
- Include 3 action cards and before/after stats

#### Navigation & Screens

- Create all 7 screen files in `app/` with placeholder Text only
- Verify navigation works: can tap through all screens
- Set up bottom tab navigator or stack navigator

#### HomeScreen UI

- Build NigehbaanAI logo/header at top
- Add TextInput for crisis signal (multiline, accepts Urdu + English)
- Add 3 toggle switches: Social Media Signal / Weather Alert / Traffic Spike
- Add 'Analyze Crisis' primary button (red, full width)
- Add loading state on button (spinner while 'analyzing')

#### ✅ DAY 1 CHECKPOINT

App opens, all 7 screens navigable, HomeScreen looks polished

---

### DAY 2 — Crisis Detection + Agent Log Screens

**Time:** 4–5 hrs

**GOAL:** The two most judge-impressive screens complete and animated

#### CrisisCard Component

- Create `components/CrisisCard.tsx`
- Display: crisis title, location, detected situation type
- Add confidence percentage with animated progress bar (reanimated)
- Create SeverityBadge component: HIGH (red), MEDIUM (orange), LOW (yellow)
- Add impact list (bullet points: Traffic blocked, Vehicles stranded, etc.)
- Add FadeIn + SlideUp entrance animation on mount

#### CrisisScreen

- Use CrisisCard component with mock data
- Add 'View Agent Reasoning' button → navigates to AgentLogScreen
- Add 'See Response Plan' button → navigates to MapScreen
- Add crisis timestamp and source signals section at bottom

#### AgentLogScreen

- Dark terminal-style background (`#0A0E1A`)
- Create AgentLogItem component: `[timestamp] AgentName: message`
- Implement streaming effect: lines appear one by one using `setInterval` (1500ms gap)
- Color-code agents: Detector (blue), Analyzer (yellow), Planner (orange), Executor (green)
- Auto-scroll FlatList to bottom as new lines appear
- Add LIVE indicator (blinking dot) while streaming
- Add 'Proceed to Map' button that appears after all logs are shown

#### ✅ DAY 2 CHECKPOINT

Crisis detected → agent logs stream in real time. Core demo flow alive!

---

### DAY 3 — Map Screen

**Time:** 4–5 hrs

**GOAL:** The visual wow moment — crisis pin drops + reroute animates live

#### MapScreen Setup

- Install and configure `react-native-maps` with Google Maps provider
- Set initial camera to Islamabad (lat: 33.6844, lng: 73.0479, zoom: 13)
- Center map on crisis location automatically on mount

#### Crisis Marker

- Add red custom Marker at crisis location (G-10 coordinates)
- Add pulsing animation around marker using reanimated (scale 1→1.5, opacity 1→0, loop)
- Add Callout popup: 'Urban Flooding | G-10 | HIGH'

#### Route Animation

- Define `blockedRoute` as array of coordinates (mock data — red path)
- Define `alternateRoute` as array of coordinates (mock data — green path)
- Draw `blockedRoute` immediately with red Polyline, strokeWidth 4, dashed
- Animate `alternateRoute`: push coordinates one by one via `setInterval` (100ms each)
- This gives the 'route being drawn live' effect — your money shot!

#### Map Legend & UI

- Add bottom legend bar: 🔴 Blocked Route  🟢 Alternate Route  📍 Crisis Zone
- Add crisis info card overlay at top: location name + severity badge
- Add 'View Actions' button at bottom → navigates to ActionsScreen

#### ✅ DAY 3 CHECKPOINT

Map opens, crisis pin pulses, route draws itself in green. Judges love this.

---

### DAY 4 — Actions + Outcome Screens

**Time:** 4–5 hrs

**GOAL:** Complete end-to-end demo flow working with mock data

#### ActionCard Component

- Create `components/ActionCard.tsx`
- States: PENDING (gray) → EXECUTING (orange, spinner) → DONE (green, checkmark)
- Auto-transition each card: card 1 at 1s, card 2 at 2.5s, card 3 at 4s
- Show action icon, title, description, and status badge on each card

#### ActionsScreen

- Card 1: 🗺️ Traffic Rerouting — 'Alt route via F-10 now active'
- Card 2: 🚑 Emergency Dispatch — '2 rescue units dispatched to G-10'
- Card 3: 📢 Public Alert — '4,200 users notified via app + SMS'
- Add 'View Outcome' button after all cards reach DONE state

#### OutcomeScreen

- Create StatCard component: label, before value (red), after value (green), % change
- Traffic Congestion: 87% → 23% (−64%)
- Response Time: N/A → 8 min
- Citizens Alerted: 0 → 4,200
- Crisis Status: ACTIVE → MANAGED
- Add animated number count-up on values when screen mounts
- Add large **CRISIS MANAGED** banner at bottom in green

#### Full Flow Polish

- Test complete flow: Home → Crisis → Agent Log → Map → Actions → Outcome
- Fix any navigation or layout bugs
- Apply consistent dark theme across all screens
- Add screen-to-screen transition animations

#### ✅ DAY 4 CHECKPOINT

Complete mock demo flow works end-to-end. You can record a full demo right now!

---

### DAY 5 — Backend API Integration

**Time:** 4–5 hrs

**GOAL:** Replace mock data with real teammate APIs — one screen at a time

#### Services Layer

- Create `services/api.ts` with all 5 axios calls
- Add `BASE_URL` constant pointing to teammate's server
- Wrap all calls in try/catch — on error, fall back to `mock.ts` silently
- Add request timeout of 10s to all calls

#### Screen-by-Screen Integration

- **HomeScreen:** `POST /analyze` on button press, pass text + toggle states
- **CrisisScreen:** `GET /crisis/status`, replace mock crisis object
- **AgentLogScreen:** `GET /agents/trace`, stream real log lines
- **ActionsScreen:** `GET /actions`, render real action cards
- **OutcomeScreen:** `GET /outcome`, display real before/after stats

#### Loading & Error States

- Add skeleton loaders on CrisisScreen and OutcomeScreen
- Add spinner on HomeScreen button while `/analyze` is pending
- Never show blank screens — always show mock if API fails
- Add 'Retry' button on error states

#### End-to-End Test

- Run full flow with real backend at least 3 times
- Check for timing issues (agent logs may be slow — add skeleton while loading)
- Verify Urdu input works correctly through the API

#### ✅ DAY 5 CHECKPOINT

App works with real AI backend. Agent logs are real. Crisis detection is live.

---

### DAY 6 — Polish + Real Device Testing

**Time:** 4–5 hrs

**GOAL:** Demo-ready on real phone. No bugs. Looks professional.

#### Splash Screen

- Add NigehbaanAI logo + animated entrance (scale from 0.5 to 1)
- Add tagline: 'Agentic Crisis Intelligence for Smart Cities'
- Auto-navigate to HomeScreen after 2.5 seconds

#### UI Polish

- Check all screens on a real Android/iOS device via Expo Go
- Fix any overflow, cutoff, or font size issues on smaller screens
- Ensure status bar doesn't overlap content (use SafeAreaView everywhere)
- Add haptic feedback on main button press (`expo-haptics`)
- Smooth all transitions with reanimated FadeIn/SlideUp

#### Optional: Web Dashboard

- [Optional] Initialize a React + Vite web app in `/web` folder
- [Optional] Build Crisis Dashboard card (reuse same component logic)
- [Optional] Build Agent Log panel (same streaming logic)
- [Optional] This takes ~2 hours and impresses judges significantly

#### Final Checks

- App doesn't crash on any screen during demo flow
- All text is readable (contrast, font size)
- Mock fallback works if backend goes down mid-demo
- App name shows as 'NigehbaanAI' (not 'Expo App') on device

#### ✅ DAY 6 CHECKPOINT

App runs smoothly on real device. You're ready to record.

---

### DAY 7 — Demo Video + Documentation + Submit

**Time:** 4–5 hrs

**GOAL:** Submit a polished demo video, README, and working app

#### Demo Video Script (3–5 min)

| Time | Screen | What to Show & Say |
|------|--------|-------------------|
| 0:00–0:30 | Intro | App name, problem statement, what CIRO does |
| 0:30–1:00 | HomeScreen | Type Urdu input + toggle all 3 signals + hit Analyze |
| 1:00–1:45 | CrisisScreen | Detected: Urban Flooding, 92% confidence, HIGH severity |
| 1:45–2:30 | AgentLogScreen | 4 agents reasoning in real time, streaming logs |
| 2:30–3:15 | MapScreen | Crisis pin + reroute animation drawing live |
| 3:15–3:45 | ActionsScreen | 3 cards flipping Pending → Executing → Done |
| 3:45–4:00 | OutcomeScreen | 87% → 23% congestion, CRISIS MANAGED banner |

#### Recording

- Record screen on phone (Android: built-in recorder, iOS: Control Center)
- Record at least 2 takes — use the cleaner one
- Add voiceover explaining each screen (can be recorded separately)
- Edit with CapCut or DaVinci Resolve — add text captions on key moments

#### README Documentation

- Write system architecture section (frontend ↔ backend ↔ Antigravity)
- List all tools and APIs used
- Explain how Google Antigravity is used by teammate for orchestration
- Add setup instructions (how to run the Expo app)
- Add assumptions made (simulated APIs, mock datasets)
- Add screenshots of all screens

#### Final Submission

- Push all code to GitHub (NigehbaanAI repo)
- Upload demo video to YouTube/Drive and add link to README
- Double check: mobile app runs, demo video is 3–5 min, README complete
- Submit! 🚀

#### ✅ SUBMITTED!

You built a fully working Agentic Crisis Response mobile app in 7 days.

---

## ⚡ Quick Reference Summary

| Day | Focus | Key Deliverable | Time |
|-----|-------|----------------|------|
| Day 1 | Setup & Foundation | Project runs, HomeScreen done | 4–5 hrs |
| Day 2 | Crisis + Agent Log | Core demo flow alive | 4–5 hrs |
| Day 3 | Map Screen | Rerouting animation working | 4–5 hrs |
| Day 4 | Actions + Outcome | Full mock flow complete | 4–5 hrs |
| Day 5 | API Integration | Real backend connected | 4–5 hrs |
| Day 6 | Polish + Testing | Demo-ready on real device | 4–5 hrs |
| Day 7 | Video + Docs | Submitted ✅ | 4–5 hrs |

---

## 🏆 3 Golden Rules

| # | Rule | Why |
|---|------|-----|
| 1 | **Mock first, integrate later** | Never block your UI work waiting on backend. Build with mocks, swap calls on Day 5. |
| 2 | **Demo flow is sacred** | The 7-screen sequence must work flawlessly every time. Edge cases don't matter, the demo does. |
| 3 | **Animations > static UI** | A FadeIn entrance and a streaming log makes judges think it's 10x more sophisticated than it is. |
