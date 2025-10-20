import httpx
from datetime import datetime, timedelta, timezone
from app.config import settings


class GoogleOAuthService:
    AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"
    CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

    SCOPES = [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ]

    # ---------- AUTH FLOW ----------
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
            "expiry": datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600)),
        }

    @staticmethod
    async def refresh_access_token(refresh_token: str):
        data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(GoogleOAuthService.TOKEN_URL, data=data)
        if resp.status_code != 200:
            raise Exception(f"Failed to refresh token: {resp.text}")

        data = resp.json()
        data["expiry"] = datetime.now(timezone.utc) + timedelta(seconds=data.get("expires_in", 3600))
        return data

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


# ---------- CALENDAR SERVICE ----------
class GoogleCalendarService:
    @staticmethod
    async def get_all_events(integration):
        """
        Fetch upcoming (future) Google Calendar events for the user.
        Returns only future events with title, time, and meet link.
        """
        access_token = integration.access_token

        # Refresh token if expired
        if integration.token_expiry and integration.token_expiry < datetime.now(timezone.utc):
            tokens = await GoogleOAuthService.refresh_access_token(integration.refresh_token)
            access_token = tokens["access_token"]
            integration.access_token = access_token
            integration.token_expiry = tokens["expiry"]

        # Use current UTC time as minimum to only get future events
        now_utc = datetime.utcnow().replace(tzinfo=timezone.utc).isoformat()

        params = {
            "singleEvents": True,
            "orderBy": "startTime",
            "timeMin": now_utc,
            "maxResults": 50,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                GoogleOAuthService.CALENDAR_EVENTS_URL,
                headers={"Authorization": f"Bearer {access_token}"},
                params=params,
            )

        if resp.status_code != 200:
            raise Exception(f"Failed to fetch events: {resp.text}")

        events = resp.json().get("items", [])

        upcoming_events = []
        for e in events:
            start = e.get("start", {}).get("dateTime") or e.get("start", {}).get("date")
            end = e.get("end", {}).get("dateTime") or e.get("end", {}).get("date")
            summary = e.get("summary", "No Title")
            meet_link = e.get("hangoutLink")
            html_link = e.get("htmlLink")

            if not start:
                continue

            try:
                start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                if start_dt < datetime.now(timezone.utc):
                    continue  # skip past events
            except Exception:
                pass

            upcoming_events.append({
                "title": summary,
                "start_time": start,
                "end_time": end,
                "meet_link": meet_link,
                "calendar_url": html_link,
                "event_id": e.get("id"),
            })

        return upcoming_events
