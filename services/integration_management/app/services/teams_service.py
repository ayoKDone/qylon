import httpx
from fastapi import HTTPException
from datetime import datetime, timedelta
from app.config import settings

class TeamsOAuthService:
    AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

    @staticmethod
    def get_auth_url(user_id: str):
        return (
            f"{TeamsOAuthService.AUTH_URL}"
            f"?client_id={settings.MS_CLIENT_ID}"
            f"&response_type=code"
            f"&redirect_uri={settings.MS_REDIRECT_URI}"
            f"&response_mode=query"
            f"&scope=Calendars.Read offline_access"
            f"&state={user_id}"
        )

    @staticmethod
    async def exchange_code_for_token(code: str):
        data = {
            "client_id": settings.MS_CLIENT_ID,
            "scope": "Calendars.Read offline_access",
            "code": code,
            "redirect_uri": settings.MS_REDIRECT_URI,
            "grant_type": "authorization_code",
            "client_secret": settings.MS_CLIENT_SECRET,
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(TeamsOAuthService.TOKEN_URL, data=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Teams token error: {resp.text}")
            token_data = resp.json()
            # calculate expiry datetime
            token_data["expires_at"] = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))
            return token_data


class TeamsMeetingService:
    @staticmethod
    async def get_upcoming_meetings(access_token: str):
        url = "https://graph.microsoft.com/v1.0/me/events?$orderby=start/dateTime&$top=50"
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            try:
                resp.raise_for_status()
            except httpx.HTTPStatusError:
                raise HTTPException(status_code=resp.status_code, detail=f"Teams API error: {resp.text}")

        data = resp.json()
        return data.get("value", [])
