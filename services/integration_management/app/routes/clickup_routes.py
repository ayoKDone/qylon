from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from app.controllers.google_controller import GoogleController

router = APIRouter(prefix="/google", tags=["Google Integrations"])

FRONTEND_DASHBOARD_URL = "http://localhost:3000/dashboard"  # change for production

@router.get("/auth/{user_id}")
async def google_auth(user_id: str):
    from app.services.google_service import GoogleOAuthService
    return {"auth_url": GoogleOAuthService.get_auth_url(user_id=user_id)}

@router.get("/callback")
async def google_callback(code: str, state: str):
    user_id = state
    result = await GoogleController.exchange_code_for_tokens(code, user_id)

    email = result["email"]
    token = result["token"]

    redirect_url = f"{FRONTEND_DASHBOARD_URL}?token={token}&email={email}"
    return RedirectResponse(url=redirect_url)

@router.get("/calendar/{email}")
async def get_calendar_events(email: str):
    """
    Fetch upcoming Google Calendar events (future meetings only).
    """
    return await GoogleController.fetch_all_calendar_events(email)

@router.post("/recall/webhook")
async def recall_webhook(payload: dict):
    bot_id = payload.get("data", {}).get("bot_id")
    text = payload.get("data", {}).get("text", "")
    user_id = payload.get("data", {}).get("metadata", {}).get("user_id")
    if bot_id and user_id:
        await GoogleController.save_transcript(bot_id, text, user_id)
    return {"status": "ok"}

@router.get("/transcripts/{bot_id}/{user_id}")
async def get_transcript(bot_id: str, user_id: str):
    return await GoogleController.get_transcript(bot_id, user_id)
