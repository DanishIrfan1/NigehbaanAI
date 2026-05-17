# FastAPI Project Structure Reference

## Table of Contents
1. Small/Microservice — file-type layout (full)
2. Large/Monolith — module-functionality layout (full)
3. main.py patterns
4. Key file responsibilities

---

## 1. Small/Microservice Layout

Best for: single-responsibility services, small teams, <20 endpoints.

```
my-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, lifespan, router includes
│   ├── config.py            # pydantic-settings BaseSettings
│   ├── database.py          # engine, sessionmaker, get_db dependency
│   ├── dependencies.py      # shared Depends() (auth, pagination, etc.)
│   ├── exceptions.py        # global exception handlers
│   ├── middleware.py        # custom middleware classes
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── items.py
│   ├── models/              # SQLAlchemy / SQLModel ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   └── services/            # Business logic — no DB code in routers
│       ├── __init__.py
│       ├── user_service.py
│       └── item_service.py
├── tests/
│   ├── conftest.py
│   ├── test_users.py
│   └── test_items.py
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
├── .env
├── .env.example
├── requirements.txt          # or pyproject.toml if using uv/poetry
└── README.md
```

---

## 2. Large/Monolith Module-Functionality Layout

Best for: teams, multi-domain apps, >20 endpoints. Each module is fully self-contained.

```
my-api/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py             # Global settings
│   ├── database.py           # Shared async engine + session
│   ├── exceptions.py         # Base exception classes
│   │
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py         # /auth/token, /auth/refresh, /auth/logout
│   │   ├── schemas.py        # TokenResponse, LoginRequest
│   │   ├── models.py         # RefreshToken table (if storing)
│   │   ├── service.py        # create_access_token, verify_token
│   │   ├── dependencies.py   # get_current_user, require_admin
│   │   ├── exceptions.py     # InvalidCredentials, TokenExpired
│   │   └── constants.py      # TOKEN_TYPE = "bearer", ALGORITHM = "HS256"
│   │
│   ├── users/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── schemas.py        # UserCreate, UserRead, UserUpdate
│   │   ├── models.py         # User ORM model
│   │   ├── service.py        # UserService class
│   │   ├── dependencies.py   # get_user_service
│   │   └── exceptions.py     # UserNotFound, EmailAlreadyExists
│   │
│   └── posts/                # same structure as users/
│
├── tests/
│   ├── conftest.py           # shared fixtures (client, db, auth_headers)
│   ├── auth/
│   │   └── test_auth.py
│   └── users/
│       └── test_users.py
├── alembic/
├── Dockerfile
└── docker-compose.yml
```

---

## 3. main.py — Full Production Pattern

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import get_settings
from app.database import sessionmanager
from app.exceptions import register_exception_handlers
from app.routers import users, items

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup → yield → Shutdown"""
    settings = get_settings()
    await sessionmanager.init(settings.database_url)
    yield
    await sessionmanager.close()

def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        # Hide docs in production
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
        lifespan=lifespan,
    )

    # Middleware (last added = first executed — order matters!)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handlers
    register_exception_handlers(app)

    # Routers
    api_v1 = APIRouter(prefix="/api/v1")
    api_v1.include_router(users.router, prefix="/users", tags=["users"])
    api_v1.include_router(items.router, prefix="/items", tags=["items"])
    app.include_router(api_v1)

    return app

app = create_app()
```

---

## 4. Key File Responsibilities

| File | Owns |
|---|---|
| `router.py` | HTTP method + path, request/response schema, calls service |
| `service.py` | Business logic, calls repository/ORM, raises domain exceptions |
| `models.py` | SQLAlchemy table definition only |
| `schemas.py` | Pydantic input/output shapes — separate Create/Read/Update |
| `dependencies.py` | Reusable `Depends()` factories for this module |
| `exceptions.py` | Domain-specific exception classes |
| `config.py` | `BaseSettings` — loaded from env, cached with `@lru_cache` |

**Golden rule**: routers only call services; services only call models/DB. Never put business logic or DB queries in router functions.
