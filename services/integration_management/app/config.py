# app/config.py

from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


class Settings(BaseSettings):
    # ==============================
    # 🔐 App JWT Configuration
    # ==============================
    APP_JWT_SECRET: str
    APP_JWT_ALGORITHM: str = "HS256"
    APP_JWT_EXPIRES_SECONDS: int = 3600

    # ==============================
    # 🗄️ Database (Postgres)
    # ==============================
    DATABASE_URL: str  # Required, loaded from .env


    # ==============================
    # 🎥 Zoom Integration
    # ==============================
    ZOOM_CLIENT_ID: Optional[str] = None
    ZOOM_CLIENT_SECRET: Optional[str] = None
    ZOOM_REDIRECT_URI: str = "https://40f57a91696f.ngrok-free.app/auth/zoom/callback"

    # ==============================
    # 📅 Google Integration
    # ==============================
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "https://40f57a91696f.ngrok-free.app/google/callback"

    # ==============================
    # 🤖 Recall.ai Integration
    # ==============================
    RECALL_API_KEY: Optional[str] = None
    RECALL_WEBHOOK_URL: Optional[str] = None

    # ==============================
    # 💻 Microsoft (Azure / Teams)
    # ==============================
    MS_CLIENT_ID: Optional[str] = None
    MS_CLIENT_SECRET: Optional[str] = None
    MS_REDIRECT_URI: str = "http://localhost:3009/auth/microsoft/callback"

    # ==============================
    # 🟢 Supabase
    # ==============================
    SUPABASE_URL: str
    SUPABASE_KEY: str

    class Config:
        env_file_encoding = "utf-8"  # No explicit env_file needed


# ==============================
# Create settings instance
# ==============================
settings = Settings()
