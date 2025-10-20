from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.db import async_session_maker
from app.models.team_model import TeamsIntegration
from app.services.teams_service import TeamsOAuthService, TeamsCalendarService
from app.utils.jwt_handler import create_access_token


class TeamsController:
    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        """
        Exchange Microsoft OAuth code for tokens and store/update in TeamsIntegration.
        Then generate JWT for frontend authentication.
        """
        try:
            tokens = await TeamsOAuthService.exchange_code(code)
            user_info = await TeamsOAuthService.get_user_info(tokens["access_token"])
            email = user_info.get("mail") or user_info.get("userPrincipalName")

            async with async_session_maker() as session:
                # ✅ Check if email already exists for another user
                email_check = await session.execute(
                    select(TeamsIntegration).where(TeamsIntegration.email == email)
                )
                existing_email = email_check.scalar_one_or_none()

                if existing_email and existing_email.user_id != user_id:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Email '{email}' already exists for another integration."
                    )

                # ✅ Find or create integration
                result = await session.execute(
                    select(TeamsIntegration).where(TeamsIntegration.user_id == user_id)
                )
                integration = result.scalar_one_or_none()

                if integration:
                    integration.access_token = tokens["access_token"]
                    integration.refresh_token = tokens.get("refresh_token") or integration.refresh_token
                    integration.token_expiry = tokens["expiry"]
                    integration.email = email
                else:
                    integration = TeamsIntegration(
                        user_id=user_id,
                        email=email,
                        access_token=tokens["access_token"],
                        refresh_token=tokens.get("refresh_token"),
                        token_expiry=tokens["expiry"],
                    )
                    session.add(integration)

                await session.commit()

            # ✅ Create JWT token for frontend
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
            raise HTTPException(status_code=400, detail="Email already exists in Teams integration.")
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")

    @staticmethod
    async def fetch_all_calendar_events(email: str):
        """
        Fetch all events from Microsoft Teams Calendar for a given email.
        """
        async with async_session_maker() as session:
            result = await session.execute(
                select(TeamsIntegration).where(TeamsIntegration.email == email)
            )
            integration = result.scalar_one_or_none()

        if not integration or not integration.access_token:
            raise HTTPException(status_code=404, detail="Microsoft Teams integration not found for this email")

        # ✅ Fetch events
        events = await TeamsCalendarService.get_all_events(integration)

        return {"events": events, "total_events": len(events)}
