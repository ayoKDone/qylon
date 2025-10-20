# app/services/asana_service.py
import httpx
from datetime import datetime, timedelta
from app.config import settings
import asyncio


class AsanaOAuthService:
    AUTH_URL = "https://app.asana.com/-/oauth_authorize"
    TOKEN_URL = "https://app.asana.com/-/oauth_token"
    API_BASE_URL = "https://app.asana.com/api/1.0"

    @staticmethod
    def get_auth_url(user_id: str):
        """Generate Asana OAuth URL"""
        return (
            f"{AsanaOAuthService.AUTH_URL}"
            f"?client_id={settings.ASANA_CLIENT_ID}"
            f"&redirect_uri={settings.ASANA_REDIRECT_URI}"
            f"&response_type=code"
            f"&state={user_id}"
        )

    @staticmethod
    async def exchange_code(code: str):
        """Exchange Asana OAuth code for tokens"""
        data = {
            "grant_type": "authorization_code",
            "client_id": settings.ASANA_CLIENT_ID,
            "client_secret": settings.ASANA_CLIENT_SECRET,
            "redirect_uri": settings.ASANA_REDIRECT_URI,
            "code": code,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(AsanaOAuthService.TOKEN_URL, data=data)

        if resp.status_code != 200:
            raise Exception(f"Asana token exchange failed: {resp.text}")

        token_data = resp.json()
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token"),
            "expiry": datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600)),
        }


class AsanaTaskService:
    API_BASE = "https://app.asana.com/api/1.0"

    @staticmethod
    async def create_task(access_token: str, workspace_id: str, name: str, notes: str = "", assignee: str = None, retries=3):
        """Create Asana task with retry and error handling."""
        payload = {
            "data": {
                "workspace": workspace_id,
                "name": name,
                "notes": notes
            }
        }
        if assignee:
            payload["data"]["assignee"] = assignee

        for attempt in range(1, retries + 1):
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        f"{AsanaTaskService.API_BASE}/tasks",
                        headers={"Authorization": f"Bearer {access_token}"},
                        json=payload,
                        timeout=10
                    )

                if resp.status_code == 429:
                    await asyncio.sleep(2 ** attempt)
                    continue  # exponential backoff for rate limits

                if resp.status_code >= 400:
                    raise Exception(resp.text)

                return resp.json()

            except Exception as e:
                if attempt == retries:
                    raise Exception(f"Task creation failed after {retries} retries: {e}")
                await asyncio.sleep(2 ** attempt)

    @staticmethod
    async def get_task_status(access_token: str, task_id: str):
        """Fetch the current status of a specific task."""
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{AsanaTaskService.API_BASE}/tasks/{task_id}",
                headers={"Authorization": f"Bearer {access_token}"},
            )
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch Asana task status: {resp.text}")
        return resp.json()

    @staticmethod
    async def refresh_access_token(refresh_token: str):
        """Refresh expired Asana token."""
        data = {
            "grant_type": "refresh_token",
            "client_id": settings.ASANA_CLIENT_ID,
            "client_secret": settings.ASANA_CLIENT_SECRET,
            "refresh_token": refresh_token,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(AsanaOAuthService.TOKEN_URL, data=data)

        if resp.status_code != 200:
            raise Exception(f"Token refresh failed: {resp.text}")

        data = resp.json()
        return {
            "access_token": data["access_token"],
            "refresh_token": data.get("refresh_token"),
            "expiry": datetime.utcnow() + timedelta(seconds=data.get("expires_in", 3600)),
        }
