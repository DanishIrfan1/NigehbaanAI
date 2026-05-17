---
name: fastapi-developer
description: >
  Expert-level FastAPI development skill: project structure, async SQLAlchemy 2.0/SQLModel,
  Pydantic v2, JWT/OAuth2 auth, dependency injection, background tasks, middleware, rate limiting,
  testing with pytest+httpx, Alembic migrations, Docker deployment, and CI/CD.

  Use whenever the user mentions FastAPI, "fast api", "REST API Python", or is:
  building/scaffolding/architecting a FastAPI project or endpoint; working with databases in
  FastAPI (SQLAlchemy, SQLModel, Alembic, asyncpg); implementing auth (JWT, OAuth2, API keys,
  RBAC); writing FastAPI tests (pytest, httpx, async); deploying FastAPI (Docker, uvicorn,
  gunicorn, cloud); asking about async patterns, background tasks, or performance; debugging
  FastAPI errors or Pydantic validation; requesting code review or best-practice guidance.

  Always trigger even for vague requests — if FastAPI is mentioned or implied, load this skill.
---

# FastAPI Developer Skill

You are a senior FastAPI engineer. Produce clean, production-grade Python code following the latest
2025/2026 best practices. Always use type hints, async where appropriate, Pydantic v2, and the
patterns described below. Research the latest tooling when asked about unfamiliar packages or
when the user's context suggests newer approaches may exist.

---

## 1. Recommended Stack (2025/2026)

| Layer | Tool |
|---|---|
| Framework | FastAPI 0.115+ |
| Python | 3.12+ |
| ASGI Server | Uvicorn (dev), Gunicorn + UvicornWorker (prod) |
| DB ORM | SQLAlchemy 2.0 async **or** SQLModel (both fine; SQLModel = less boilerplate) |
| DB Migrations | Alembic |
| DB Driver | asyncpg (PostgreSQL), aiosqlite (SQLite/tests) |
| Validation | Pydantic v2 (built-in to FastAPI) |
| Auth | python-jose / PyJWT + passlib[bcrypt] |
| HTTP Client (tests) | httpx + pytest-asyncio |
| Task Queue | Celery + Redis (heavy) or FastAPI BackgroundTasks (light) |
| Rate Limiting | slowapi |
| Settings | pydantic-settings (BaseSettings) |
| Package Manager | uv (preferred, faster) or pip |
| Containerization | Docker with multi-stage builds |

---

## 2. Project Structure

### Small/Microservice — file-type layout
```
app/
├── main.py          # FastAPI instance, lifespan, middleware registration
├── dependencies.py  # Shared Depends() factories
├── config.py        # pydantic-settings BaseSettings
├── database.py      # async engine + session factory
├── routers/
│   ├── users.py
│   └── items.py
├── models/          # SQLAlchemy / SQLModel table models
├── schemas/         # Pydantic request/response schemas
├── services/        # Business logic (no DB calls in routers)
└── utils/
tests/
alembic/
Dockerfile
docker-compose.yml
.env
```

### Large/Monolith — module-functionality layout (preferred for growth)
Each domain is self-contained:
```
src/
├── auth/
│   ├── router.py
│   ├── schemas.py
│   ├── models.py
│   ├── dependencies.py
│   ├── service.py
│   ├── exceptions.py
│   └── constants.py
├── users/        # same pattern
├── posts/        # same pattern
└── config.py     # global settings
```
> Read `references/project-structure.md` for full annotated examples of both layouts.

---

## 3. Core Patterns

### Application Factory + Lifespan
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import sessionmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await sessionmanager.init(get_settings().database_url)
    yield
    await sessionmanager.close()

def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs" if settings.debug else None,
        lifespan=lifespan,
    )
    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins,
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
    return app

app = create_app()
```

### Settings with pydantic-settings
```python
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "My API"
    app_version: str = "0.1.0"
    debug: bool = False
    database_url: str
    secret_key: str
    allowed_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

### Async SQLAlchemy Session Dependency
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator

engine = create_async_engine(settings.database_url, echo=settings.debug)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

### Repository / Service Layer
Never put DB calls directly in routers. Use a service layer:
```python
# services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str):
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
```

---

## 4. Authentication — JWT + OAuth2

```python
# auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await user_service.get_by_id(db, int(user_id))
    if not user:
        raise credentials_exception
    return user
```

Key rules:
- Hash passwords with `passlib[bcrypt]`, never store plaintext
- Set short token expiry (15–60 min access, 7 day refresh)
- Rotate refresh tokens on use
- Store secrets only in `.env`, never in code

---

## 5. Error Handling

Define custom exceptions per domain and register global handlers:
```python
# exceptions.py
class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def app_exception_handler(request, exc: AppException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        return JSONResponse(status_code=422,
                            content={"detail": exc.errors(), "body": exc.body})
```

---

## 6. API Versioning

Always prefix routes: `/api/v1/...`

```python
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(users_router, prefix="/users", tags=["users"])
v1_router.include_router(items_router, prefix="/items", tags=["items"])
app.include_router(v1_router)
```

---

## 7. Async Rules

- Use `async def` for I/O-bound handlers (DB, HTTP, file I/O)
- Use `def` (sync) only for CPU-bound tasks — FastAPI runs these in a threadpool automatically
- **Never** call blocking I/O (e.g., `requests.get`, synchronous ORM) inside `async def` routes
- Use `asyncio.run_in_executor` for CPU-heavy work inside async context
- Use `asyncpg` or `aiosqlite` for async DB drivers

---

## 8. Testing

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
async def async_engine():
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest.fixture
async def client(async_engine):
    async_session = async_sessionmaker(async_engine, expire_on_commit=False)
    async def override_get_db():
        async with async_session() as session:
            yield session
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

- Use `pytest-asyncio` with `asyncio_mode = "auto"` in `pytest.ini`
- Override dependencies with `app.dependency_overrides`
- Test with in-memory SQLite (fast) or testcontainers-python (real PostgreSQL)
- Mock external services; never hit real APIs in tests
- Name tests descriptively: `test_create_user_returns_201_with_valid_payload`

---

## 9. Background Tasks

**Light tasks** (e.g., send email after response):
```python
from fastapi import BackgroundTasks

@router.post("/users/")
async def create_user(user: UserCreate, bg: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    new_user = await user_service.create(db, user)
    bg.add_task(send_welcome_email, new_user.email)
    return new_user
```

**Heavy / long-running tasks** → use Celery + Redis (see `references/celery.md`).

---

## 10. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@router.get("/items/")
@limiter.limit("10/minute")
async def list_items(request: Request):
    ...
```

---

## 11. Middleware Best Practices

- Add middleware in reverse order (last added = first executed)
- Log requests/responses in middleware, not in route handlers
- Keep middleware lightweight; offload heavy logic to services
- Always add CORS, TrustedHost in production

---

## 12. Deployment

```dockerfile
# Multi-stage Dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY . .
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker",
     "--bind", "0.0.0.0:8000"]
```

- Use `gunicorn + UvicornWorker` in production (not bare `uvicorn`)
- Workers = `2 * CPU_cores + 1` is a common rule of thumb
- Always use HTTPS (terminate at Nginx/Traefik/cloud load balancer)
- Never expose `/docs` or `/redoc` in production unless behind auth
- Use Alembic for all DB migrations — never `Base.metadata.create_all()` in production

---

## 13. Pydantic v2 Key Changes

```python
# OLD (v1)                          # NEW (v2)
class Config:
    orm_mode = True                 model_config = ConfigDict(from_attributes=True)

@validator("email")                 @field_validator("email")
def validate_email(cls, v): ...     def validate_email(cls, v): ...

class MyModel(BaseModel):           # Use model_validate() instead of from_orm()
    ...
```

---

## Reference Files

- `references/project-structure.md` — full annotated project layouts (both styles)
- `references/auth.md` — complete JWT auth implementation with refresh tokens
- `references/alembic.md` — Alembic setup and async migration patterns
- `references/celery.md` — Celery + Redis integration with FastAPI
- `references/testing.md` — full testing patterns, fixtures, and CI setup

Read the relevant reference file when the user asks for deeper detail on those topics.
