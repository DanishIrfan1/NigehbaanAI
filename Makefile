# Use docker-compose or "docker compose" depending on installation
COMPOSE := $(shell command -v docker-compose >/dev/null 2>&1 && echo docker-compose || echo "docker compose")

.PHONY: up down logs rebuild test shell-backend shell-mobile health backend-only up-build

up:
	$(COMPOSE) up

up-build:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

rebuild:
	$(COMPOSE) build --no-cache

test:
	$(COMPOSE) exec -w /app backend pytest tests/test_phase1_e2e.py tests/test_phase2_e2e.py tests/test_phase3_robustness.py tests/test_baseline.py -v

shell-backend:
	$(COMPOSE) exec backend bash

shell-mobile:
	$(COMPOSE) exec mobile sh

health:
	@port=$${BACKEND_HOST_PORT:-8000}; \
	if [ -f .env ]; then set -a; . ./.env; set +a; fi; \
	port=$${BACKEND_HOST_PORT:-8000}; \
	curl -sf "http://localhost:$$port/health" | python3 -m json.tool

backend-only:
	$(COMPOSE) up backend
