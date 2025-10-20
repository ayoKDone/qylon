import httpx
from datetime import datetime, timedelta
from app.config import settings
from app.db import async_session_maker
from app.models.monday_model import MondayIntegration
from sqlalchemy.future import select

GRAPHQL_URL = "https://api.monday.com/v2"
OAUTH_AUTHORIZE = "https://auth.monday.com/oauth2/authorize"
OAUTH_TOKEN = "https://auth.monday.com/oauth2/token"

class MondayOAuthService:
    SCOPES = "boards:public,boards:write,users:read"  # adjust scopes as needed

    @staticmethod
    def get_auth_url(user_id: str) -> str:
        """
        Generate Monday OAuth URL. user will be redirected there to authorize.
        """
        # response_type=code required; include scopes
        return (
            f"{OAUTH_AUTHORIZE}"
            f"?client_id={settings.MONDAY_CLIENT_ID}"
            f"&redirect_uri={settings.MONDAY_REDIRECT_URI}"
            f"&state={user_id}"
            f"&response_type=code"
            f"&scope={MondayOAuthService.SCOPES}"
        )

    @staticmethod
    async def exchange_code(code: str):
        """
        Exchange authorization code for access + refresh tokens.
        """
        data = {
            "client_id": settings.MONDAY_CLIENT_ID,
            "client_secret": settings.MONDAY_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.MONDAY_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(OAUTH_TOKEN, data=data)
        if resp.status_code != 200:
            raise Exception(f"[Monday OAuth] Token exchange failed: {resp.status_code} → {resp.text}")

        d = resp.json()
        # expected keys: access_token, refresh_token, expires_in (seconds)
        access_token = d.get("access_token")
        refresh_token = d.get("refresh_token")
        expires_in = d.get("expires_in") or 3600
        if not access_token:
            raise Exception("[Monday OAuth] access_token missing")

        # Optionally fetch account info (viewer) to get account id / email
        # We'll return tokens and expiry
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expiry": datetime.utcnow() + timedelta(seconds=int(expires_in)),
        }

    @staticmethod
    async def refresh_access_token(refresh_token: str):
        """
        Refresh Monday OAuth token.
        """
        if not refresh_token:
            raise Exception("[Monday OAuth] No refresh token available.")

        data = {
            "client_id": settings.MONDAY_CLIENT_ID,
            "client_secret": settings.MONDAY_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(OAUTH_TOKEN, data=data)
        if resp.status_code != 200:
            raise Exception(f"[Monday OAuth] Refresh failed: {resp.status_code} → {resp.text}")

        d = resp.json()
        access_token = d.get("access_token")
        expires_in = d.get("expires_in") or 3600
        if not access_token:
            raise Exception("[Monday OAuth] refresh returned no access token")

        return {"access_token": access_token, "expiry": datetime.utcnow() + timedelta(seconds=int(expires_in))}

    @staticmethod
    async def ensure_valid_token(user_id: str) -> str:
        """
        Ensure stored token is valid; refresh if expired. Returns valid access_token.
        """
        async with async_session_maker() as session:
            result = await session.execute(select(MondayIntegration).where(MondayIntegration.user_id == user_id))
            integration = result.scalar_one_or_none()

            if not integration:
                raise Exception(f"[Monday OAuth] No integration for user {user_id}")

            if not integration.token_expiry or integration.token_expiry < datetime.utcnow():
                if not integration.refresh_token:
                    raise Exception("[Monday OAuth] token expired and no refresh_token")
                new = await MondayOAuthService.refresh_access_token(integration.refresh_token)
                integration.access_token = new["access_token"]
                integration.token_expiry = new["expiry"]
                await session.merge(integration)
                await session.commit()

            return integration.access_token


class MondayTaskService:
    """
    Uses Monday GraphQL v2 API via POST to GRAPHQL_URL.
    """

    @staticmethod
    async def _graphql(access_token: str, query: str, variables: dict | None = None):
        headers = {"Authorization": access_token, "Content-Type": "application/json"}
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(GRAPHQL_URL, json=payload, headers=headers)
        # raise for status handled by caller
        return resp

    @staticmethod
    async def create_item(access_token: str, board_id: int, group_id: str | None, item_name: str, column_values: str | None = None):
        """
        Create an item on a board. `column_values` must be JSON string per monday API.
        """
        # Build mutation
        q = """
        mutation ($boardId: Int!, $itemName: String!, $groupId: String, $columnVals: JSON) {
            create_item (board_id: $boardId, item_name: $itemName, group_id: $groupId, column_values: $columnVals) {
                id
            }
        }
        """
        vars = {"boardId": board_id, "itemName": item_name, "groupId": group_id, "columnVals": column_values}
        resp = await MondayTaskService._graphql(access_token, q, vars)
        if resp.status_code not in (200, 201):
            raise Exception(f"[Monday Task] Creation failed: {resp.status_code} → {resp.text}")
        j = resp.json()
        if j.get("errors"):
            raise Exception(f"[Monday Task] GraphQL error: {j['errors']}")
        return j["data"]["create_item"]

    @staticmethod
    async def get_item(access_token: str, item_id: str):
        """
        Fetch item details by item id.
        """
        q = """
        query ($id: [ID]!) {
            items (ids: $id) {
                id
                name
                board { id name }
                group { id title }
                column_values { id text }
            }
        }
        """
        vars = {"id": [int(item_id)]}
        resp = await MondayTaskService._graphql(access_token, q, vars)
        if resp.status_code != 200:
            raise Exception(f"[Monday Task] Fetch failed: {resp.status_code} → {resp.text}")
        j = resp.json()
        if j.get("errors"):
            raise Exception(f"[Monday Task] GraphQL error: {j['errors']}")
        items = j.get("data", {}).get("items", [])
        return items[0] if items else None

    @staticmethod
    async def get_first_board(access_token: str):
        """
        Helper: fetch first accessible board id for current user.
        We'll query `me` to get boards.
        """
        q = """
        query {
            me {
                id
                name
                boards (limit: 50) {
                    id
                    name
                    board_kind
                }
            }
        }
        """
        resp = await MondayTaskService._graphql(access_token, q)
        if resp.status_code != 200:
            raise Exception(f"[Monday Task] Failed to fetch me/boards: {resp.status_code} → {resp.text}")
        j = resp.json()
        if j.get("errors"):
            raise Exception(f"[Monday Task] GraphQL error: {j['errors']}")
        boards = j.get("data", {}).get("me", {}).get("boards", [])
        if not boards:
            raise Exception("[Monday Task] No boards available for user")
        return boards[0]["id"]
