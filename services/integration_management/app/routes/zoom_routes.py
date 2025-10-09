from fastapi import APIRouter, Query
from app.controllers.zoom_controller import ZoomController

router = APIRouter(prefix="/auth/zoom", tags=["Zoom Integrations"])

@router.get("/auth/{user_id}")
async def zoom_auth(user_id: str):
    from app.services.zoom_services import ZoomOAuthService
    return {"auth_url": ZoomOAuthService.get_auth_url(user_id)}

@router.get("/callback")
async def zoom_callback(code: str, state: str):
    user_id = state
    return await ZoomController.exchange_code_for_tokens(code, user_id)

@router.get("/meetings/{user_id}")
async def get_upcoming_meetings(
    user_id: str, meeting_type: str = Query("upcoming", description="upcoming or scheduled")
):
    return await ZoomController.fetch_upcoming_meetings(user_id, meeting_type)
