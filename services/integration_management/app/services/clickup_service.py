import httpx
from datetime import datetime, timedelta
from app.config import settings
from app.db import async_session_maker
from app.models.clickup_model import ClickUpIntegration
from sqlalchemy.future import select


class ClickUpOAuthService:
    AUTH_URL = "https://app.clickup.com/api"
    TOKEN_URL = "https://api.clickup.com/api/v2/oauth/token"
    API_BASE = "https://api.clickup.com/api/v2"

    @staticmethod
    def get_auth_url(user_id: str):
        return (
            f"https://app.clickup.com/api"
            f"?client_id={settings.CLICKUP_CLIENT_ID}"
            f"&redirect_uri={settings.CLICKUP_REDIRECT_URI}"
            f"&state={user_id}"
        )

    @staticmethod
    async def exchange_code(code: str):
        payload = {
            "client_id": settings.CLICKUP_CLIENT_ID,
            "client_secret": settings.CLICKUP_CLIENT_SECRET,
            "code": code,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(ClickUpOAuthService.TOKEN_URL, data=payload)
            if resp.status_code != 200:
                raise Exception(f"[ClickUp OAuth] Token exchange failed: {resp.status_code} → {resp.text}")

            data = resp.json()
            access_token = data.get("access_token")
            refresh_token = data.get("refresh_token")
            if not access_token:
                raise Exception("[ClickUp OAuth] Missing access token in response.")

            # Fetch user info (team_id optional)
            user_url = f"{ClickUpOAuthService.API_BASE}/user"
            user_resp = await client.get(user_url, headers={"Authorization": f"Bearer {access_token}"})
            if user_resp.status_code != 200:
                raise Exception(f"[ClickUp OAuth] Failed to fetch user info: {user_resp.status_code} → {user_resp.text}")

            user_info = user_resp.json()
            team_id = None
            try:
                user_obj = user_info.get("user", {})
                teams = user_obj.get("teams") or user_obj.get("team_ids") or []
                if isinstance(teams, list) and len(teams) > 0:
                    team_id = teams[0].get("id") if isinstance(teams[0], dict) else teams[0]
            except Exception:
                team_id = None

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "team_id": team_id,
            "expiry": datetime.utcnow() + timedelta(days=30),
        }

    @staticmethod
    async def refresh_access_token(refresh_token: str):
        if not refresh_token:
            raise Exception("[ClickUp OAuth] No refresh token found.")

        payload = {
            "client_id": settings.CLICKUP_CLIENT_ID,
            "client_secret": settings.CLICKUP_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(ClickUpOAuthService.TOKEN_URL, data=payload)
            if resp.status_code != 200:
                raise Exception(f"[ClickUp OAuth] Refresh failed: {resp.status_code} → {resp.text}")

            data = resp.json()
            access_token = data.get("access_token")
            if not access_token:
                raise Exception("[ClickUp OAuth] Missing access token after refresh.")

        return {
            "access_token": access_token,
            "expiry": datetime.utcnow() + timedelta(days=30),
        }

    @staticmethod
    async def ensure_valid_token(user_id: str) -> str:
        async with async_session_maker() as session:
            result = await session.execute(
                select(ClickUpIntegration).where(ClickUpIntegration.user_id == user_id)
            )
            integration = result.scalar_one_or_none()

            if not integration:
                raise Exception(f"[ClickUp OAuth] No ClickUp integration found for user {user_id}.")

            if not integration.token_expiry or integration.token_expiry < datetime.utcnow():
                if not integration.refresh_token:
                    raise Exception("[ClickUp OAuth] Access token expired and no refresh token available.")

                new_tokens = await ClickUpOAuthService.refresh_access_token(integration.refresh_token)
                integration.access_token = new_tokens["access_token"]
                integration.token_expiry = new_tokens["expiry"]

                await session.merge(integration)
                await session.commit()

            return integration.access_token


class ClickUpTaskService:
    API_BASE = ClickUpOAuthService.API_BASE

    @staticmethod
    async def create_task(access_token: str, list_id: str, name: str, description: str = "", assignees: list | None = None):
        url = f"{ClickUpTaskService.API_BASE}/list/{list_id}/task"
        payload = {"name": name, "description": description}
        if assignees:
            payload["assignees"] = assignees

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers={"Authorization": f"Bearer {access_token}"})

        if resp.status_code not in [200, 201]:
            raise Exception(f"[ClickUp Task] Creation failed: {resp.status_code} → {resp.text}")

        return resp.json()

    @staticmethod
    async def get_task(access_token: str, task_id: str):
        url = f"{ClickUpTaskService.API_BASE}/task/{task_id}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers={"Authorization": f"Bearer {access_token}"})

        if resp.status_code != 200:
            raise Exception(f"[ClickUp Task] Fetch failed: {resp.status_code} → {resp.text}")

        return resp.json()

    @staticmethod
    async def get_user_lists(access_token: str):
        """
        Fetch all lists the user has access to.
        Returns first list by default.
        """
        # Fetch spaces first
        url = f"{ClickUpTaskService.API_BASE}/team"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(f"{ClickUpTaskService.API_BASE}/team", headers={"Authorization": f"Bearer {access_token}"})
            if resp.status_code != 200:
                raise Exception(f"[ClickUp Task] Failed to fetch teams: {resp.status_code} → {resp.text}")
            teams = resp.json().get("teams", [])

        # Try to fetch first list in first team
        for team in teams:
            team_id = team.get("id")
            url = f"{ClickUpTaskService.API_BASE}/team/{team_id}/task?archived=false"
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(url, headers={"Authorization": f"Bearer {access_token}"})
                if resp.status_code == 200:
                    tasks = resp.json().get("tasks", [])
                    if tasks:
                        return tasks[0].get("list", {}).get("id")
        # Fallback if nothing found
        raise Exception("[ClickUp Task] Could not auto-detect a list. Please provide list_id.")
