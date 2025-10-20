import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

# ✅ Explicitly locate .env file relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# ✅ Force load from absolute path
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH, override=True)
    print(f"✅ Loaded .env from: {ENV_PATH}")
else:
    print(f"⚠️ .env not found at: {ENV_PATH}")

class Settings(BaseSettings):
    APP_JWT_SECRET: str
    APP_JWT_ALGORITHM: str = "HS256"
    APP_JWT_EXPIRES_SECONDS: int = 3600

    DATABASE_URL: str

    ZOOM_CLIENT_ID: Optional[str] = None
    ZOOM_CLIENT_SECRET: Optional[str] = None
    ZOOM_REDIRECT_URI: str = "https://40f57a91696f.ngrok-free.app/auth/zoom/callback"

    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "https://40f57a91696f.ngrok-free.app/google/callback"

    RECALL_API_KEY: Optional[str] = None
    RECALL_WEBHOOK_URL: Optional[str] = None

    MS_CLIENT_ID: Optional[str] = None
    MS_CLIENT_SECRET: Optional[str] = None
    MS_REDIRECT_URI: str = "https://40f57a91696f.ngrok-free.app/teams/callback"

    SUPABASE_URL: str
    SUPABASE_KEY: str

    CLICKUP_CLIENT_ID: Optional[str] = None
    CLICKUP_CLIENT_SECRET: Optional[str] = None
    CLICKUP_REDIRECT_URI: str = "https://40f57a91696f.ngrok-free.app/clickup/callback"

    MONDAY_CLIENT_ID: Optional[str] = None
    MONDAY_CLIENT_SECRET: Optional[str] = None
    MONDAY_REDIRECT_URI: str = "https://40f57a91696f.ngrok-free.app/monday/callbacks"

    class Config:
        env_file_encoding = "utf-8"

settings = Settings()

# ✅ Print for debug
print("🔑 MS_CLIENT_ID =", settings.MS_CLIENT_ID)
print("🔑 GOOGLE_CLIENT_ID =", settings.GOOGLE_CLIENT_ID)
print("🔑 CLICKUP_CLIENT_ID =", settings.CLICKUP_CLIENT_ID)
