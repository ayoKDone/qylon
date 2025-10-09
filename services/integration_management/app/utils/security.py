from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.config import settings
import os

# ---------------------------
# Constants
# ---------------------------
JWT_SECRET_KEY = os.getenv("APP_JWT_SECRET", "supersecret")
ALGORITHM = os.getenv("APP_JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("APP_JWT_EXPIRE", "60"))

# ---------------------------
# Password Hashing
# ---------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# ---------------------------
# JWT Creation
# ---------------------------
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ==============================
# 🔐 JWT Utilities
# ==============================

def create_app_jwt(data: dict, expires_seconds: int = None) -> str:
    """
    Create a signed JWT for the app (e.g., to authenticate users or integrations).
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        seconds=expires_seconds or settings.APP_JWT_EXPIRES_SECONDS
    )
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode, settings.APP_JWT_SECRET, algorithm=settings.APP_JWT_ALGORITHM
    )
    return encoded_jwt


def decode_app_jwt(token: str) -> dict:
    """
    Decode and verify a JWT.
    """
    try:
        payload = jwt.decode(
            token, settings.APP_JWT_SECRET, algorithms=[settings.APP_JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
