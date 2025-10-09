import os
import httpx

RECALL_API_KEY = os.getenv("RECALL_API_KEY")
WEBHOOK_URL = os.getenv("RECALL_WEBHOOK_URL")


class RecallAIService:
    BASE_URL = "https://api.recall.ai/v1"

    @staticmethod
    async def start_recording(meeting_url: str, user_id: int):
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{RecallAIService.BASE_URL}/bot",
                headers={"Authorization": f"Bearer {RECALL_API_KEY}"},
                json={
                    "meeting_url": meeting_url,
                    "webhook_url": WEBHOOK_URL,
                    "metadata": {"user_id": user_id},
                },
            )
        return resp.json()

    @staticmethod
    async def get_transcript(bot_id: str):
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{RecallAIService.BASE_URL}/transcripts/{bot_id}",
                headers={"Authorization": f"Bearer {RECALL_API_KEY}"},
            )
        return resp.json()
