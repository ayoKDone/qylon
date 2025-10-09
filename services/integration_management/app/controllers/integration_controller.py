# High-level integration endpoints (create meeting, list integrations, etc.)
from fastapi import HTTPException, Depends
from app.middleware.auth_middleware import get_current_user
from app.db import engine
from sqlmodel import Session, select
from app.models import ProviderToken

async def list_user_integrations(user = Depends(get_current_user)):
    with Session(engine) as session:
        tokens = session.exec(select(ProviderToken).where(ProviderToken.user_id == user.id)).all()
        return [{"provider": t.provider, "provider_account_id": t.provider_account_id} for t in tokens]
