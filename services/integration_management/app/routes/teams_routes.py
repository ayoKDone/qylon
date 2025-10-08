# app/routes/teams_routes.py
from fastapi import APIRouter
from app.controllers.teams_controller import TeamsController

router = APIRouter(prefix="/teams", tags=["Teams Integration"])

@router.get("/auth/{user_id}")
async def teams_auth(user_id: str):
    from app.services.teams_service import TeamsOAuthService
    return {"auth_url": TeamsOAuthService.get_auth_url(user_id)}

@router.get("/callback")
async def teams_callback(code: str, state: str):
    user_id = state
    return await TeamsController.exchange_code_for_tokens(code, user_id)

@router.get("/meetings/{user_id}")
async def get_upcoming_meetings(user_id: str):
    return await TeamsController.fetch_upcoming_meetings(user_id)
