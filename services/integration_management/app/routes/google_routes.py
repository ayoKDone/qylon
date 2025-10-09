from fastapi import APIRouter
from app.controllers.google_controller import GoogleController

router = APIRouter(prefix="/google", tags=["Google Integrations"])

@router.get("/auth/{user_id}")
async def google_auth(user_id: str):
    from app.services.google_service import GoogleOAuthService
    return {"auth_url": GoogleOAuthService.get_auth_url(user_id=user_id)}

@router.get("/callback")
async def google_callback(code: str, state: str):
    user_id = state
    return await GoogleController.exchange_code_for_tokens(code, user_id)

@router.get("/calendar/{user_id}")
async def get_calendar_events(user_id: str):
    return await GoogleController.fetch_all_calendar_events(user_id)

@router.post("/recall/webhook")
async def recall_webhook(payload: dict):
    from app.services.recall_ai_service import RecallAIService
    bot_id = payload.get("data", {}).get("bot_id")
    text = payload.get("data", {}).get("text", "")
    user_id = payload.get("data", {}).get("metadata", {}).get("user_id")
    if bot_id and user_id:
        await GoogleController.save_transcript(bot_id, text, user_id)
    return {"status": "ok"}


# Step 5: Get transcript by bot_id
@router.get("/transcripts/{bot_id}/{user_id}")
async def get_transcript(bot_id: str, user_id: str):
    return await GoogleController.get_transcript(bot_id, user_id)
