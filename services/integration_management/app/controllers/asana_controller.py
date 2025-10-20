# app/controllers/asana_controller.py
from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.db import async_session_maker
from app.models.asana_model import AsanaIntegration
from app.services.asana_service import AsanaOAuthService, AsanaTaskService
from app.utils.jwt_handler import create_access_token


class AsanaController:
    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        """Exchange Asana OAuth code for tokens and store/update in DB."""
        try:
            tokens = await AsanaOAuthService.exchange_code(code)

            async with async_session_maker() as session:
                result = await session.execute(select(AsanaIntegration).where(AsanaIntegration.user_id == user_id))
                integration = result.scalar_one_or_none()

                if integration:
                    integration.access_token = tokens["access_token"]
                    integration.refresh_token = tokens["refresh_token"]
                    integration.token_expiry = tokens["expiry"]
                else:
                    integration = AsanaIntegration(
                        user_id=user_id,
                        email=f"{user_id}@asanauser.com",
                        access_token=tokens["access_token"],
                        refresh_token=tokens["refresh_token"],
                        token_expiry=tokens["expiry"]
                    )
                    session.add(integration)

                await session.commit()

            jwt_token = create_access_token({"sub": user_id})
            return {"user_id": user_id, "status": "connected", "token": jwt_token}

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Asana OAuth failed: {str(e)}")

    @staticmethod
    async def create_task(user_id: str, name: str, notes: str, workspace_id: str, assignee: str = None):
        """Create task and sync Asana status."""
        async with async_session_maker() as session:
            result = await session.execute(select(AsanaIntegration).where(AsanaIntegration.user_id == user_id))
            integration = result.scalar_one_or_none()

            if not integration:
                raise HTTPException(status_code=404, detail="Asana integration not found for user")

        try:
            task = await AsanaTaskService.create_task(
                access_token=integration.access_token,
                workspace_id=workspace_id,
                name=name,
                notes=notes,
                assignee=assignee,
            )
            return {"status": "success", "task": task}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_task_status(user_id: str, task_id: str):
        """Fetch task status from Asana."""
        async with async_session_maker() as session:
            result = await session.execute(select(AsanaIntegration).where(AsanaIntegration.user_id == user_id))
            integration = result.scalar_one_or_none()

        if not integration:
            raise HTTPException(status_code=404, detail="Integration not found")

        try:
            status = await AsanaTaskService.get_task_status(integration.access_token, task_id)
            return {"task_status": status}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
