from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.db import async_session_maker
from app.models.monday_model import MondayIntegration
from app.services.monday_service import MondayOAuthService, MondayTaskService
from app.utils.jwt_handler import create_access_token


class MondayController:

    @staticmethod
    async def exchange_code_for_tokens(code: str, user_id: str):
        try:
            tokens = await MondayOAuthService.exchange_code(code)

            async with async_session_maker() as session:
                result = await session.execute(select(MondayIntegration).where(MondayIntegration.user_id == user_id))
                integration = result.scalar_one_or_none()

                if integration:
                    integration.access_token = tokens["access_token"]
                    integration.refresh_token = tokens.get("refresh_token") or integration.refresh_token
                    integration.token_expiry = tokens.get("expiry")
                else:
                    integration = MondayIntegration(
                        user_id=user_id,
                        email=f"{user_id}@monday.local",
                        access_token=tokens["access_token"],
                        refresh_token=tokens.get("refresh_token"),
                        token_expiry=tokens.get("expiry"),
                    )
                    session.add(integration)

                await session.commit()

            jwt_token = create_access_token({"sub": user_id, "provider": "monday"})
            return {"message": "Monday connected successfully", "user_id": user_id, "token": jwt_token}

        except IntegrityError:
            raise HTTPException(status_code=400, detail="Duplicate integration.")
        except SQLAlchemyError as e:
            raise HTTPException(status_code=500, detail=f"DB error: {e}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Monday OAuth failed: {e}")

    @staticmethod
    async def create_item(user_id: str, board_id: int | None, group_id: str | None, item_name: str, column_values: str | None = None):
        """
        Create an item (task) on a board.
        If board_id is not provided, try to auto-detect first accessible board.
        """
        try:
            access_token = await MondayOAuthService.ensure_valid_token(user_id)

            if not board_id:
                board_id = await MondayTaskService.get_first_board(access_token)

            # create item
            created = await MondayTaskService.create_item(access_token, int(board_id), group_id, item_name, column_values)
            return {"status": "success", "item": created}

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def get_item(user_id: str, item_id: str):
        try:
            access_token = await MondayOAuthService.ensure_valid_token(user_id)
            item = await MondayTaskService.get_item(access_token, item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            return {"status": "success", "item": item}

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
