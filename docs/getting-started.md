# Getting Started

This guide covers running NigehbaanAI locally with Docker (recommended) or bare Python.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose (`docker compose` or `docker-compose`)
- Optional: Python 3.11+ and Node 18+ for non-Docker development
- Optional: [Expo Go](https://expo.dev/go) on a physical phone for mobile testing
- Optional: Google AI API key for live LLM calls ([Gemini API](https://ai.google.dev/))

---

## 1. Clone and configure

```bash
git clone <repo-url>
cd NigehbaanAI
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | For live LLM | Gemini API key; skip if `LLM_MODE=mock` |
| `LLM_MODE` | No | `mock` \| `auto` (default) \| `real` |
| `BACKEND_HOST_PORT` | No | Host port for API (default `8000`) |
| `EXPO_PUBLIC_API_URL` | For mobile | Backend URL the app calls |
| `REACT_NATIVE_PACKAGER_HOSTNAME` | For phone | Your PC's LAN IP for Expo Go |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | For web map | Maps JavaScript API key |

---

## 2. Start with Docker (recommended)

```bash
./scripts/dev.sh
# equivalent: make up-build
```

This starts:

| Container | Port | Role |
|-----------|------|------|
| `nigehbaan-backend` | 8000 (or `BACKEND_HOST_PORT`) | FastAPI + agents |
| `nigehbaan-mobile` | 8081, 19000, 19001 | Expo Metro bundler |

**Verify:**

```bash
make health
# or: curl http://localhost:8000/health
```

Open:

- API docs: http://localhost:8000/docs
- Mobile/web preview: http://localhost:8081

Source is bind-mounted — edit `backend/`, `agents/`, or `mobile-app/` without rebuilding. Rebuild only when dependencies change:

```bash
make rebuild
```

---

## 3. Submit your first signal

**curl:**

```bash
curl -X POST http://localhost:8000/api/v1/signal \
  -H "Content-Type: application/json" \
  -d '{
    "location": "G-10, Islamabad",
    "description": "Streets flooded, water entering homes",
    "severity_hint": "high",
    "enable_weather": true,
    "enable_traffic": true,
    "enable_social": true,
    "enable_emergency_call": true
  }'
```

**Poll status** (replace `{id}`):

```bash
curl http://localhost:8000/api/v1/status/{id}
```

**Python script (no server):**

```bash
python scripts/run_demo_scenarios.py --scenario 1
```

---

## 4. Expo Go on a physical phone

Phones cannot reach `localhost` on your computer. Use your LAN IP:

```bash
hostname -I | awk '{print $1}'   # e.g. 192.168.100.11
```

In `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.100.11:8000
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.100.11
```

Restart the stack:

```bash
make down && ./scripts/dev.sh
```

Scan the QR code in Expo Go. Ensure phone and PC are on the same Wi‑Fi.

---

## 5. Web map (optional)

The Map tab on Expo web uses Google Maps JavaScript API:

1. Enable **Maps JavaScript API** in Google Cloud Console.
2. Create/restrict a key (HTTP referrers: `http://localhost:8081/*`, your LAN URL).
3. Set `EXPO_PUBLIC_GOOGLE_MAPS_KEY` in `.env` and restart Expo.

Native maps (`react-native-maps`) work in Expo Go; web uses a separate `Map.web.tsx` implementation.

---

## 6. Local development (without Docker)

**Backend + agents:**

```bash
pip install -r requirements.txt
cp .env.example .env
cd backend && uvicorn app.main:app --reload --port 8000
```

Ensure repo root and `backend/` are on `PYTHONPATH` (Docker sets this automatically).

**Mobile (separate terminal):**

```bash
cd mobile-app
npm install
EXPO_PUBLIC_API_URL=http://localhost:8000 npx expo start
```

**Web dashboard (optional):**

```bash
cd web-app
npm install
npm run dev
```

---

## 7. Useful Make commands

| Command | Description |
|---------|-------------|
| `make up` | Start containers |
| `make up-build` | Build and start |
| `make down` | Stop containers |
| `make logs` | Follow container logs |
| `make test` | Run pytest in backend container |
| `make health` | Curl `/health` |
| `make backend-only` | API only (run Expo on host) |
| `make lint` | ruff check |
| `make sonar-scan` | SonarCloud analysis |

---

## Troubleshooting

### Port 8000 already in use

Another service may be bound to 8000. Either stop it or set in `.env`:

```env
BACKEND_HOST_PORT=8001
EXPO_PUBLIC_API_URL=http://localhost:8001
```

`./scripts/dev.sh` may auto-detect and switch ports.

### Pipeline hangs at LLM step

- Check `GOOGLE_API_KEY` and Gemini quota.
- Set `LLM_MODE=mock` to run without API calls.
- With `LLM_MODE=auto`, quota errors fall back to deterministic mocks.

### Incidents disappear after restart

Expected — data is in-memory. Use demo scripts to regenerate, or submit new signals.

### Stale Docker containers

```bash
make down
docker compose up --build
```

### Tests fail locally

Tests mock the LLM — no API key needed:

```bash
pytest tests/ -v
# or in Docker: make test
```

---

## Next steps

- [Architecture](architecture.md) — understand the full flow
- [API reference](api-reference.md) — integrate a client
- [Development guide](development.md) — tests, demos, conventions
- [Agents package](../agents/README.md) — LangGraph internals
