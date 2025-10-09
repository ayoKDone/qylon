import httpx
from datetime import datetime, timedelta
from app.config import settings

class GoogleOAuthService:
    AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"

    SCOPES = [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ]

    @staticmethod
    def get_auth_url(user_id: str):
        client_id = settings.GOOGLE_CLIENT_ID
        redirect_uri = settings.GOOGLE_REDIRECT_URI
        scope_str = " ".join(GoogleOAuthService.SCOPES)
        return (
            f"{GoogleOAuthService.AUTH_URL}"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&response_type=code"
            f"&scope={scope_str}"
            f"&access_type=offline"
            f"&prompt=consent"
            f"&state={user_id}"
        )

    @staticmethod
    async def exchange_code(code: str):
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(GoogleOAuthService.TOKEN_URL, data=data)
        if resp.status_code != 200:
            raise Exception(f"Failed to exchange code: {resp.text}")

        data = resp.json()
        return {
            "access_token": data["access_token"],
            "refresh_token": data.get("refresh_token"),
            "expiry": datetime.utcnow() + timedelta(seconds=data.get("expires_in", 3600)),
        }

    @staticmethod
    async def get_user_info(access_token: str):
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                GoogleOAuthService.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch user info: {resp.text}")
        return resp.json()


class GoogleCalendarService:
    @staticmethod
    async def get_all_events(integration):
        """
        Fetch all upcoming events from Google Calendar, including manual meetings.
        """
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                headers={"Authorization": f"Bearer {integration.access_token}"},
                params={"maxResults": 50, "singleEvents": True, "orderBy": "startTime"},
            )
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch calendar events: {resp.text}")
        return resp.json().get("items", [])
