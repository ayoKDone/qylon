import httpx
from fastapi import HTTPException
from app.config import settings

class ZoomOAuthService:
    AUTH_URL = "https://zoom.us/oauth/authorize"
    TOKEN_URL = "https://zoom.us/oauth/token"
    USER_URL = "https://api.zoom.us/v2/users/me"

    @staticmethod
    def get_auth_url(user_id: str):
        client_id = settings.ZOOM_CLIENT_ID
        redirect_uri = settings.ZOOM_REDIRECT_URI
        return (
            f"{ZoomOAuthService.AUTH_URL}"
            f"?response_type=code"
            f"&client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&state={user_id}"
        )

    @staticmethod
    async def exchange_code_for_token(code: str):
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.ZOOM_REDIRECT_URI,
        }
        auth = (settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET)

        async with httpx.AsyncClient() as client:
            resp = await client.post(ZoomOAuthService.TOKEN_URL, data=data, auth=auth)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Zoom token error: {resp.text}")
            return resp.json()

    @staticmethod
    async def get_user_info(access_token: str):
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            resp = await client.get(ZoomOAuthService.USER_URL, headers=headers)
            try:
                resp.raise_for_status()
            except httpx.HTTPStatusError:
                raise HTTPException(status_code=resp.status_code, detail=f"Zoom API error: {resp.text}")
            return resp.json()


class ZoomMeetingService:
    @staticmethod
    async def get_upcoming_meetings(integration, meeting_type: str = "upcoming"):
        """Fetch Zoom meetings from API."""
        if meeting_type not in ("upcoming", "scheduled"):
            raise HTTPException(status_code=400, detail="Invalid meeting type")

        url = f"https://api.zoom.us/v2/users/me/meetings?type={meeting_type}"
        headers = {"Authorization": f"Bearer {integration.access_token}"}

        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            try:
                resp.raise_for_status()
            except httpx.HTTPStatusError:
                raise HTTPException(status_code=resp.status_code, detail=f"Zoom API error: {resp.text}")

        data = resp.json()
        return data.get("meetings", [])
