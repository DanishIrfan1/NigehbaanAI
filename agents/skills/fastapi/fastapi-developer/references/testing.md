# FastAPI Testing Reference

## Table of Contents
1. Setup & config
2. Core conftest.py (async SQLAlchemy)
3. Writing tests
4. Auth in tests
5. Mocking external services
6. Coverage & CI

---

## 1. Setup

```
pip install pytest pytest-asyncio httpx aiosqlite
```

**pytest.ini** or **pyproject.toml**:
```ini
[pytest]
asyncio_mode = auto
```

---

## 2. conftest.py — Async SQLAlchemy + httpx

```python
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import get_db
from app.models import Base  # import all models so tables are created

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def db_session(engine) -> AsyncSession:
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        yield session

@pytest.fixture
async def client(db_session) -> AsyncClient:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
async def auth_headers(client) -> dict:
    """Register + login, return Authorization headers."""
    await client.post("/api/v1/users/", json={"email": "test@example.com", "password": "secret123"})
    resp = await client.post("/api/v1/auth/token",
                             data={"username": "test@example.com", "password": "secret123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

---

## 3. Writing Tests

```python
# tests/test_users.py
import pytest

async def test_create_user_returns_201(client):
    response = await client.post("/api/v1/users/", json={
        "email": "user@example.com",
        "password": "strongpassword"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "user@example.com"
    assert "password" not in data  # never leak password

async def test_create_user_duplicate_email_returns_409(client):
    payload = {"email": "dup@example.com", "password": "pass"}
    await client.post("/api/v1/users/", json=payload)
    response = await client.post("/api/v1/users/", json=payload)
    assert response.status_code == 409

async def test_get_me_unauthenticated_returns_401(client):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401

async def test_get_me_authenticated(client, auth_headers):
    response = await client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
```

---

## 4. Mocking External Services

```python
from unittest.mock import AsyncMock, patch

async def test_send_email_called_after_registration(client):
    with patch("app.services.email.send_email", new_callable=AsyncMock) as mock_send:
        response = await client.post("/api/v1/users/", json={
            "email": "new@example.com", "password": "pass123"
        })
        assert response.status_code == 201
        mock_send.assert_called_once()

async def test_external_api_error_returns_502(client):
    with patch("app.services.payment.charge_card",
               side_effect=Exception("Payment gateway down")):
        response = await client.post("/api/v1/orders/", json={"amount": 100})
        assert response.status_code == 502
```

---

## 5. Parametrized Tests

```python
import pytest

@pytest.mark.parametrize("email,password,expected_status", [
    ("valid@example.com", "strongpass", 201),
    ("not-an-email", "strongpass", 422),
    ("valid@example.com", "short", 422),
    ("", "strongpass", 422),
])
async def test_user_creation_validation(client, email, password, expected_status):
    response = await client.post("/api/v1/users/", json={"email": email, "password": password})
    assert response.status_code == expected_status
```

---

## 6. Coverage & CI (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt
      - run: pytest --cov=app --cov-report=xml --cov-fail-under=80
```

**Best practices:**
- Aim for 80%+ coverage minimum; 90%+ for critical paths
- Test happy paths AND error cases
- Each test should be independent (no shared state between tests)
- Use `scope="session"` for expensive fixtures (DB engine), `scope="function"` for sessions
- Use testcontainers-python for integration tests against real PostgreSQL
