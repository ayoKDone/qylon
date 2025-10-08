from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError
from app.db import async_session_maker
from app.models.google_integrations import GoogleIntegration
from app.models.google_meet import GoogleMeetingTranscript
from app.services.google_service import GoogleOAuthService, GoogleCalendarService

class GoogleController:
    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        """
        Exchange Google OAuth code for tokens and store/update in GoogleIntegration.
        """
        try:
            tokens = await GoogleOAuthService.exchange_code(code)
            user_info = await GoogleOAuthService.get_user_info(tokens["access_token"])

            async with async_session_maker() as session:
                result = await session.execute(
                    select(GoogleIntegration).where(GoogleIntegration.user_id == user_id)
                )
                integration = result.scalar_one_or_none()

                if integration:
                    integration.access_token = tokens["access_token"]
                    integration.refresh_token = tokens.get("refresh_token") or integration.refresh_token
                    integration.token_expiry = tokens["expiry"]
                    integration.email = user_info["email"]
                else:
                    integration = GoogleIntegration(
                        user_id=user_id,
                        email=user_info["email"],
                        access_token=tokens["access_token"],
                        refresh_token=tokens.get("refresh_token"),
                        token_expiry=tokens["expiry"],
                    )
                    session.add(integration)

                await session.commit()

            return {"user_id": user_id, "email": user_info["email"], "status": "connected"}

        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")

    @staticmethod
    async def fetch_all_calendar_events(user_id: str):
        """
        Fetch all events from Google Calendar for a given user_id.
        Includes manual meetings and regular events.
        """
        async with async_session_maker() as session:
            result = await session.execute(
                select(GoogleIntegration).where(GoogleIntegration.user_id == user_id)
            )
            integration = result.scalar_one_or_none()

        if not integration or not integration.access_token:
            raise HTTPException(status_code=404, detail="Google integration not found for this user_id")

        # Fetch events
        events = await GoogleCalendarService.get_all_events(integration)

        # Extract hangout links if present
        meet_links = [e.get("hangoutLink") for e in events if e.get("hangoutLink")]

        return {"meet_links": meet_links, "total_links": len(meet_links)}

    @staticmethod
    async def save_transcript(bot_id: str, transcript_text: str, user_id: str):
        async with async_session_maker() as session:
            transcript = GoogleMeetingTranscript(
                bot_id=bot_id,
                transcript_text=transcript_text,
                user_id=user_id,
            )
            session.add(transcript)
            await session.commit()
        return {"bot_id": bot_id, "status": "saved"}

    @staticmethod
    async def get_transcript(bot_id: str, user_id: str):
        async with async_session_maker() as session:
            result = await session.execute(
                select(GoogleMeetingTranscript).where(
                    GoogleMeetingTranscript.bot_id == bot_id,
                    GoogleMeetingTranscript.user_id == user_id,
                )
            )
            transcript = result.scalar_one_or_none()
            if not transcript:
                raise HTTPException(status_code=404, detail="Transcript not found")
        return transcript
