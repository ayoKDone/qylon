import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from app.models.base import Base  # import the single shared Base

# Load env
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path, override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or "asyncpg" not in DATABASE_URL:
    raise ValueError("DATABASE_URL must be set and use asyncpg for async operations")

# Async engine & session
engine = create_async_engine(DATABASE_URL, echo=True, future=True)
async_session_maker = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session_maker() as session:
        yield session

# Async table creation with optional drop
async def create_tables_async(drop_existing: bool = False):
    from app.models.user import User
    from app.models.zoom_model import ZoomIntegration
    from app.models.google_integrations import GoogleIntegration
    from app.models.team_model import TeamsIntegration
    from app.models.google_meet import GoogleMeetingTranscript

    async with engine.begin() as conn:
        if drop_existing:
            print("⚠️ Dropping all tables...")
            await conn.run_sync(Base.metadata.drop_all)
            print("✅ All tables dropped.")
        print("📦 Creating tables (if they do not exist)...")
        await conn.run_sync(Base.metadata.create_all)
        print("✅ All tables created (or already existed)")

if __name__ == "__main__":
    # Set drop_existing=True to drop all tables first
    asyncio.run(create_tables_async(drop_existing=True))
