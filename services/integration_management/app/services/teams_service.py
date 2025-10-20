import httpx
from datetime import datetime, timedelta
from app.config import settings


class TeamsOAuthService:
    AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    USERINFO_URL = "https://graph.microsoft.com/v1.0/me"

    SCOPES = [
        "openid",
        "User.Read",
        "Calendars.Read",
        "offline_access",
        "email",
    ]

    @staticmethod
    def get_auth_url(user_id: str):
        """
        Build the Microsoft OAuth authorization URL with correct scopes.
        """
        scope_str = " ".join(TeamsOAuthService.SCOPES)
        return (
            f"{TeamsOAuthService.AUTH_URL}"
            f"?client_id={settings.MS_CLIENT_ID}"
            f"&response_type=code"
            f"&redirect_uri={settings.MS_REDIRECT_URI}"
            f"&scope={scope_str}"
            f"&response_mode=query"
            f"&state={user_id}"
        )

    @staticmethod
    async def exchange_code(code: str):
        """
        Exchange OAuth code for access and refresh tokens.
        """
        data = {
            "code": code,
            "client_id": settings.MS_CLIENT_ID,
            "client_secret": settings.MS_CLIENT_SECRET,
            "redirect_uri": settings.MS_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(TeamsOAuthService.TOKEN_URL, data=data)

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
        """
        Retrieve basic user info from Microsoft Graph API.
        """
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                TeamsOAuthService.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch user info: {resp.text}")
        return resp.json()


# ✅ Add this section — required for calendar events
class TeamsCalendarService:
    GRAPH_EVENTS_URL = "https://graph.microsoft.com/v1.0/me/events"

    @staticmethod
    async def get_all_events(integration):
        """
        Retrieve all calendar events for a user from Microsoft Graph.
        """
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                TeamsCalendarService.GRAPH_EVENTS_URL,
                headers={"Authorization": f"Bearer {integration.access_token}"},
                params={"$top": 50, "$orderby": "start/dateTime ASC"},
            )

        # Handle expired token
        if resp.status_code == 401 and integration.refresh_token:
            new_tokens = await TeamsCalendarService.refresh_access_token(integration)
            return await TeamsCalendarService.get_all_events(new_tokens)

        if resp.status_code != 200:
            raise Exception(f"Failed to fetch calendar events: {resp.text}")

        return resp.json().get("value", [])

    @staticmethod
    async def refresh_access_token(integration):
        """
        Refresh an expired Microsoft OAuth access token.
        """
        data = {
            "client_id": settings.MS_CLIENT_ID,
            "client_secret": settings.MS_CLIENT_SECRET,
            "refresh_token": integration.refresh_token,
            "grant_type": "refresh_token",
            "redirect_uri": settings.MS_REDIRECT_URI,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(TeamsOAuthService.TOKEN_URL, data=data)

        if resp.status_code != 200:
            raise Exception(f"Failed to refresh token: {resp.text}")

        data = resp.json()
        integration.access_token = data["access_token"]
        integration.token_expiry = datetime.utcnow() + timedelta(seconds=data.get("expires_in", 3600))
        return integration
