# Web Dashboard — React + Vite

**Optional** browser dashboard for NigehbaanAI. Mirrors the mobile app flow: submit signals, view crisis status, agent logs, actions, and alerts.

Not required for the hackathon deliverable (mobile app is mandatory) but useful for demos on a laptop without Expo Go.

---

## Stack

| Technology | Role |
|------------|------|
| Vite | Dev server and build |
| React 19 | UI |
| TypeScript | Types |
| React Router | Client routing |
| Zustand | App state (`src/store/useAppStore.ts`) |

---

## Project layout

```
web-app/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx    # Signal input + overview
│   │   ├── CrisisMap.tsx    # Map view
│   │   ├── Logs.tsx         # Agent traces
│   │   ├── Actions.tsx      # Response actions
│   │   ├── Alerts.tsx       # Notifications
│   │   ├── Settings.tsx
│   │   └── Profile.tsx
│   ├── routes/AppRoutes.tsx
│   ├── layouts/MainLayout.tsx
│   ├── components/ui/       # Button, Card, Sidebar, …
│   ├── store/useAppStore.ts
│   ├── types/index.ts
│   └── mockData/            # Fallback mock data for offline UI dev
├── index.html
└── vite.config.ts
```

---

## Running

**Standalone (API must be running separately):**

```bash
cd web-app
npm install
npm run dev
```

Default Vite port is usually **5173**. Point the app at the backend in Settings or via env if configured.

**Note:** The primary Docker setup runs the **mobile-app** Expo server on port 8081, not this Vite app. For full-stack Docker demos, use the Expo web preview at http://localhost:8081, or run `web-app` manually against `http://localhost:8000`.

---

## API integration

The dashboard calls the same REST API as the mobile app:

| Action | Endpoint |
|--------|----------|
| Submit signal | `POST /api/v1/signal` |
| Poll status | `GET /api/v1/status/{id}` |
| Traces | `GET /api/v1/agents/trace/{id}` |
| Actions | `GET /api/v1/actions/{id}` |
| Outcome | `GET /api/v1/outcome/{id}` |

See [API reference](../docs/api-reference.md).

---

## Routes

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/map` | Crisis map |
| `/logs` | Agent reasoning log |
| `/actions` | Executed actions |
| `/alerts` | Stakeholder notifications |
| `/settings` | Configuration |
| `/profile` | Profile placeholder |

---

## Build

```bash
npm run build    # output to dist/
npm run preview  # preview production build
```

---

## Docs

- [Mobile app](../mobile-app/README.md) — primary client (Expo)
- [Getting started](../docs/getting-started.md)
- [Architecture](../docs/architecture.md)
