#!/usr/bin/env bash
# Start NigehbaanAI full stack (backend + Expo) with Docker Compose.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if command -v docker-compose &>/dev/null; then
  COMPOSE=(docker-compose)
elif docker compose version &>/dev/null 2>&1; then
  COMPOSE=(docker compose)
else
  echo "Error: install Docker Compose (docker-compose or docker compose plugin)." >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example — set GOOGLE_API_KEY before running LLM pipelines."
  cp .env.example .env
fi

# Load .env for BACKEND_HOST_PORT / EXPO_PUBLIC_API_URL
set -a
# shellcheck disable=SC1091
source .env 2>/dev/null || true
set +a

port_in_use() {
  local port="$1"
  if command -v ss &>/dev/null; then
    ss -tln 2>/dev/null | grep -q ":${port} "
  else
    lsof -i ":${port}" -sTCP:LISTEN &>/dev/null 2>&1
  fi
}

# Remove stale Created/Exited containers from a previous failed start
"${COMPOSE[@]}" down --remove-orphans 2>/dev/null || true

BACKEND_HOST_PORT="${BACKEND_HOST_PORT:-8000}"

if port_in_use "$BACKEND_HOST_PORT"; then
  if [[ "$BACKEND_HOST_PORT" == "8000" ]]; then
    echo "Port 8000 is already in use (another app or Docker container, e.g. crm_backend)."
  else
    echo "Port ${BACKEND_HOST_PORT} is already in use."
  fi
  if port_in_use 8001; then
    echo "Error: ports 8000 and 8001 are both busy. Set BACKEND_HOST_PORT in .env to a free port." >&2
    echo "Find listeners: ss -tlnp | grep -E ':800[0-9]'" >&2
    exit 1
  fi
  BACKEND_HOST_PORT=8001
  echo "→ Using BACKEND_HOST_PORT=8001 for this run."
  echo "  Add to .env: BACKEND_HOST_PORT=8001"
fi

export BACKEND_HOST_PORT
export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-http://localhost:${BACKEND_HOST_PORT}}"

echo "API:  http://localhost:${BACKEND_HOST_PORT}/health"
echo "Metro: http://localhost:8081"
echo ""

exec "${COMPOSE[@]}" up --build "$@"
