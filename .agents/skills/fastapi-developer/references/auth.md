# FastAPI Authentication Reference — JWT + OAuth2 + RBAC

## Table of Contents
1. Complete JWT implementation
2. Refresh token pattern
3. Password hashing
4. RBAC (role-based access)
5. API key auth

---

## 1. Complete JWT Implementation

### Dependencies
```
pip install python-jose[cryptography] passlib[bcrypt] pydantic-settings
```

### auth/service.py
```python
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
```

### auth/dependencies.py
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.users.service import UserService
from .service import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await UserService(db).get_by_id(int(user_id))
    if not user or not user.is_active:
        raise credentials_exception
    return user
```

### auth/router.py
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.users.service import UserService
from .service import verify_password, create_access_token, create_refresh_token
from .schemas import TokenResponse

router = APIRouter()

@router.post("/token", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await UserService(db).get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
```

---

## 2. Refresh Token Pattern

```python
@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = await UserService(db).get_by_id(int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Rotate: issue new tokens
    new_access = create_access_token({"sub": str(user.id)})
    new_refresh = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=new_access, refresh_token=new_refresh)
```

---

## 3. RBAC — Role-Based Access

```python
from enum import Enum
from fastapi import Depends, HTTPException, status

class Role(str, Enum):
    USER = "user"
    ADMIN = "admin"

def require_role(*roles: Role):
    async def checker(current_user = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return checker

# Usage in router:
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    _admin = Depends(require_role(Role.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    ...
```

---

## 4. API Key Authentication

```python
from fastapi.security import APIKeyHeader
from fastapi import Security

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key
```

---

## Security Checklist

- [ ] Passwords hashed with bcrypt (never stored plaintext)
- [ ] Access tokens expire in 15–60 minutes
- [ ] Refresh tokens expire in 7 days, rotated on use
- [ ] SECRET_KEY is ≥32 random bytes, loaded from env
- [ ] HTTPS enforced in production (terminate at Nginx/LB)
- [ ] `/docs` and `/redoc` disabled in production
- [ ] Rate limiting on `/auth/token` endpoint (slowapi)
- [ ] CORS origins explicitly whitelisted (not `*`) in production
