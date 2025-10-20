from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.db import async_session_maker
from app.models.clickup_model import ClickUpIntegration
from app.services.clickup_service import ClickUpOAuthService, ClickUpTaskService
from app.utils.jwt_handler import create_access_token


class ClickUpController:

    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        try:
            tokens = await ClickUpOAuthService.exchange_code(code)

            async with async_session_maker() as session:
                result = await session.execute(
                    select(ClickUpIntegration).where(ClickUpIntegration.user_id == user_id)
                )
                integration = result.scalar_one_or_none()

                if integration:
                    integration.access_token = tokens["access_token"]
                    integration.refresh_token = tokens.get("refresh_token") or integration.refresh_token
                    integration.team_id = tokens.get("team_id")
                    integration.token_expiry = tokens.get("expiry")
                else:
                    integration = ClickUpIntegration(
                        user_id=user_id,
                        email=f"{user_id}@clickup.local",
                        access_token=tokens["access_token"],
                        refresh_token=tokens.get("refresh_token"),
                        team_id=tokens.get("team_id"),
                        token_expiry=tokens.get("expiry"),
                    )
                    session.add(integration)

                await session.commit()

            jwt_token = create_access_token({"sub": user_id, "provider": "clickup"})
            return {
                "message": "ClickUp connected successfully",
                "user_id": user_id,
                "token": jwt_token,
                "team_id": tokens.get("team_id"),
            }

        except IntegrityError:
            raise HTTPException(status_code=400, detail="Duplicate integration.")
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=f"DB error: {e}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"ClickUp OAuth failed: {e}")

    @staticmethod
    async def create_task(user_id: str, list_id: str | None, name: str, description: str = "", assignees: list | None = None):
        try:
            access_token = await ClickUpOAuthService.ensure_valid_token(user_id)

            # Auto-fetch list if not provided
            if not list_id:
                list_id = await ClickUpTaskService.get_user_lists(access_token)

            task = await ClickUpTaskService.create_task(access_token, list_id, name, description, assignees)
            return {"status": "success", "task": task}

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_task_status(user_id: str, task_id: str):
        try:
            access_token = await ClickUpOAuthService.ensure_valid_token(user_id)
            task = await ClickUpTaskService.get_task(access_token, task_id)
            return {"status": "success", "task": task}

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
