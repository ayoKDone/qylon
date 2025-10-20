from fastapi import APIRouter, Query, Path, HTTPException
from app.services.monday_service import MondayOAuthService
from app.controllers.monday_controller import MondayController

router = APIRouter(prefix="/monday", tags=["Monday Integration"])
FRONTEND_DASHBOARD_URL = "http://localhost:3000/dashboard"

@router.get("/auth/{user_id}")
async def monday_auth(user_id: str):
    """Return monday OAuth URL to redirect user."""
    return {"auth_url": MondayOAuthService.get_auth_url(user_id)}

@router.get("/callbacks")
async def monday_callback(code: str = Query(...), state: str = Query(...)):
    """Handle OAuth callback (code, state=user_id)"""
    return await MondayController.exchange_code_for_tokens(code, state)

@router.post("/item/create")
async def create_item(
    user_id: str = Query(...),
    board_id: int | None = Query(None),
    group_id: str | None = Query(None),
    item_name: str = Query(...),
    column_values: str | None = Query(None),
):
    try:
        return await MondayController.create_item(user_id, board_id, group_id, item_name, column_values)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/item/{item_id}")
async def get_item(user_id: str = Query(...), item_id: str = Path(...)):
    try:
        return await MondayController.get_item(user_id, item_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
