from sqlalchemy.future import select
from fastapi import HTTPException
from app.db import async_session_maker
from app.models.zoom_model import ZoomIntegration
from app.services.zoom_services import ZoomMeetingService, ZoomOAuthService

class ZoomController:
    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        # Exchange code for access/refresh tokens
        token_data = await ZoomOAuthService.exchange_code_for_token(code)
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in")

        # Fetch Zoom user info to get email
        user_info = await ZoomOAuthService.get_user_info(access_token)
        email = user_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Failed to fetch email from Zoom API")

        # Store or update in database
        async with async_session_maker() as session:
            result = await session.execute(
                select(ZoomIntegration).where(ZoomIntegration.user_id == user_id)
            )
            integration = result.scalar_one_or_none()

            if integration:
                integration.access_token = access_token
                integration.refresh_token = refresh_token or integration.refresh_token
                integration.email = email
            else:
                integration = ZoomIntegration(
                    user_id=user_id,
                    email=email,
                    access_token=access_token,
                    refresh_token=refresh_token,
                )
                session.add(integration)

            await session.commit()

        return {"user_id": user_id, "email": email, "status": "connected"}

    @staticmethod
    async def fetch_upcoming_meetings(user_id: str, meeting_type: str = "upcoming"):
        async with async_session_maker() as session:
            result = await session.execute(
                select(ZoomIntegration).where(ZoomIntegration.user_id == user_id)
            )
            integration = result.scalar_one_or_none()

        if not integration or not integration.access_token:
            raise HTTPException(status_code=401, detail="Missing Zoom integration for this user_id")

        meetings = await ZoomMeetingService.get_upcoming_meetings(integration, meeting_type)
        return {"total_meetings": len(meetings), "meetings": meetings}
