from sqlalchemy.future import select
from fastapi import HTTPException
from app.db import async_session_maker
from app.models.team_model import TeamsIntegration
from app.services.teams_service import TeamsOAuthService, TeamsMeetingService
from datetime import datetime

class TeamsController:
    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        token_data = await TeamsOAuthService.exchange_code_for_token(code)
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_at = token_data.get("expires_at")

        async with async_session_maker() as session:
            result = await session.execute(
                select(TeamsIntegration).where(TeamsIntegration.user_id == user_id)
            )
            integration = result.scalar_one_or_none()

            if integration:
                integration.access_token = access_token
                integration.refresh_token = refresh_token or integration.refresh_token
                integration.token_expiry = expires_at
            else:
                integration = TeamsIntegration(
                    user_id=user_id,
                    access_token=access_token,
                    refresh_token=refresh_token,
                    token_expiry=expires_at
                )
                session.add(integration)

            await session.commit()

        return {"user_id": user_id, "status": "connected"}

    @staticmethod
    async def fetch_upcoming_meetings(user_id: str):
        async with async_session_maker() as session:
            result = await session.execute(
                select(TeamsIntegration).where(TeamsIntegration.user_id == user_id)
            )
            integration = result.scalar_one_or_none()

        if not integration or not integration.access_token:
            raise HTTPException(status_code=401, detail="Missing Teams integration for this user_id")

        meetings = await TeamsMeetingService.get_upcoming_meetings(integration.access_token)
        return {"total_meetings": len(meetings), "meetings": meetings}
