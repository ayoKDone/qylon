from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from app.controllers.teams_controller import TeamsController

router = APIRouter(prefix="/teams", tags=["Microsoft Teams Integrations"])

FRONTEND_DASHBOARD_URL = "http://localhost:3000/dashboard"  # frontend dev

@router.get("/auth/{user_id}")
async def teams_auth(user_id: str):
    """
    Generate Microsoft OAuth authorization URL for user.
    """
    from app.services.teams_service import TeamsOAuthService
    return {"auth_url": TeamsOAuthService.get_auth_url(user_id=user_id)}


@router.get("/callback")
async def teams_callback(code: str, state: str):
    """
    Handle Microsoft OAuth callback, exchange code for tokens, and redirect to frontend.
    """
    user_id = state
    result = await TeamsController.exchange_code_for_tokens(code, user_id)

    email = result["email"]
    token = result["token"]

    # ✅ Redirect user to frontend dashboard with token & email
    redirect_url = f"{FRONTEND_DASHBOARD_URL}?token={token}&email={email}"
    return RedirectResponse(url=redirect_url)


@router.get("/calendar/{email}")
async def get_calendar_events(email: str):
    """
    Fetch Teams calendar events using the user's email (not user_id).
    """
    return await TeamsController.fetch_all_calendar_events(email)
