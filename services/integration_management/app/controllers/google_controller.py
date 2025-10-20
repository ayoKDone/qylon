from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import datetime, timezone

from app.db import async_session_maker
from app.models.google_integrations import GoogleIntegration
from app.models.google_meet import GoogleMeetingTranscript
from app.services.google_service import GoogleOAuthService, GoogleCalendarService
from app.utils.jwt_handler import create_access_token


class GoogleController:
    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        """
        Exchange Google OAuth code for tokens and store/update in GoogleIntegration.
        Then generate JWT for frontend authentication.
        """
        try:
            tokens = await GoogleOAuthService.exchange_code(code)
            user_info = await GoogleOAuthService.get_user_info(tokens["access_token"])
            email = user_info.get("email")

            async with async_session_maker() as session:
                # ✅ Check if email already exists for another user
                email_check = await session.execute(
                    select(GoogleIntegration).where(GoogleIntegration.email == email)
                )
                existing_email = email_check.scalar_one_or_none()

                if existing_email and existing_email.user_id != user_id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Email '{email}' is already connected to another user."
                    )

                # ✅ Find or create integration for this user
                result = await session.execute(
                    select(GoogleIntegration).where(GoogleIntegration.user_id == user_id)
                )
                integration = result.scalar_one_or_none()

                if integration:
                    integration.access_token = tokens["access_token"]
                    integration.refresh_token = tokens.get("refresh_token") or integration.refresh_token
                    integration.token_expiry = tokens["expiry"]
                    integration.email = email
                else:
                    integration = GoogleIntegration(
                        user_id=user_id,
                        email=email,
                        access_token=tokens["access_token"],
                        refresh_token=tokens.get("refresh_token"),
                        token_expiry=tokens["expiry"],
                    )
                    session.add(integration)

                await session.commit()

            # ✅ Create JWT token for frontend login
            jwt_token = create_access_token({"sub": user_id, "email": email})

            return {
                "user_id": user_id,
                "email": email,
                "status": "connected",
                "token": jwt_token
            }

        except HTTPException:
            raise
        except IntegrityError:
            raise HTTPException(
                status_code=400,
                detail="Email already exists in the Google integration database."
            )
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")

    # ✅ Fetch only UPCOMING (future) Google Calendar events
    @staticmethod
    async def fetch_all_calendar_events(email: str):
        """
        Fetch upcoming Google Calendar events (future only) for a given email.
        Automatically refreshes token if expired.
        """
        async with async_session_maker() as session:
            result = await session.execute(
                select(GoogleIntegration).where(GoogleIntegration.email == email)
            )
            integration = result.scalar_one_or_none()

            if not integration or not integration.access_token:
                raise HTTPException(status_code=404, detail="Google integration not found for this email")

            try:
                events = await GoogleCalendarService.get_all_events(integration)
            except Exception as e:
                if "Invalid Credentials" in str(e) or "401" in str(e):
                    try:
                        new_tokens = await GoogleOAuthService.refresh_access_token(integration.refresh_token)
                        integration.access_token = new_tokens["access_token"]
                        integration.token_expiry = new_tokens["expiry"]
                        await session.commit()

                        events = await GoogleCalendarService.get_all_events(integration)
                    except Exception as refresh_err:
                        raise HTTPException(
                            status_code=401,
                            detail=f"Access token expired and refresh failed: {str(refresh_err)}"
                        )
                else:
                    raise HTTPException(status_code=500, detail=f"Failed to fetch calendar events: {str(e)}")

        # ✅ Filter upcoming/future events only
        now = datetime.now(timezone.utc)
        future_events = []

        for e in events:
            if not e.get("start"):
                continue

            start = e["start"].get("dateTime") or e["start"].get("date")
            end = e["end"].get("dateTime") or e["end"].get("date")

            try:
                event_time = datetime.fromisoformat(start.replace("Z", "+00:00"))
                if event_time < now:
                    continue
            except Exception:
                continue

            future_events.append({
                "title": e.get("summary", "No Title"),
                "start_time": start,
                "end_time": end,
                "meet_link": e.get("hangoutLink"),
                "event_id": e.get("id")
            })

        return {
            "email": email,
            "total_upcoming": len(future_events),
            "events": future_events
        }

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
