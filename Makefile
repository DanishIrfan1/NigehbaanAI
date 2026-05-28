# Use docker-compose or "docker compose" depending on installation
COMPOSE := $(shell command -v docker-compose >/dev/null 2>&1 && echo docker-compose || echo "docker compose")

.PHONY: up down logs rebuild test shell-backend shell-mobile health backend-only up-build sonar-scan lint

lint:
	python -m ruff check backend agents tests scripts 2>/dev/null || echo "Install ruff: pip install ruff"

sonar-scan:
	@echo "Uses .env or shell vars: SONARQUBE_TOKEN/SONARQUBE_ORG/SONARQUBE_URL"
	@set -a; [ -f .env ] && . ./.env; set +a; 	SONAR_TOKEN=$${SONAR_TOKEN:-$${SONARQUBE_TOKEN}}; 	SONAR_ORGANIZATION=$${SONAR_ORGANIZATION:-$${SONARQUBE_ORG}}; 	SONAR_HOST_URL=$${SONAR_HOST_URL:-$${SONARQUBE_URL:-https://sonarcloud.io}}; 	if [ -z "$$SONAR_TOKEN" ] || [ -z "$$SONAR_ORGANIZATION" ]; then 		echo "Missing SONAR token/org. Set SONARQUBE_TOKEN and SONARQUBE_ORG in .env or shell."; exit 1; 	fi; 	docker run --rm -e SONAR_HOST_URL="$$SONAR_HOST_URL" -e SONAR_TOKEN="$$SONAR_TOKEN" 		-v "$(CURDIR):/usr/src" -w /usr/src 		sonarsource/sonar-scanner-cli 		-Dsonar.projectKey=DanishIrfan1_NigehbaanAI 		-Dsonar.organization=$$SONAR_ORGANIZATION

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
