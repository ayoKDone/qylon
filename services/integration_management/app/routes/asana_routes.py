from fastapi import APIRouter, Query, Body
from app.controllers.asana_controller import AsanaController
from app.services.asana_service import AsanaOAuthService

router = APIRouter(prefix="/asana", tags=["Asana Integration"])


@router.get("/auth/{user_id}")
async def asana_auth(user_id: str):
    """Start Asana OAuth flow"""
    return {"auth_url": AsanaOAuthService.get_auth_url(user_id)}


@router.get("/callback")
async def asana_callback(code: str = Query(...), state: str = Query(...)):
    """OAuth callback"""
    return await AsanaController.exchange_code_for_tokens(code, state)


@router.post("/task/create")
async def create_task(
    user_id: str = Body(...),
    workspace_id: str = Body(...),
    name: str = Body(...),
    notes: str = Body(""),
    assignee: str = Body(None)
):
    """Create task on Asana"""
    return await AsanaController.create_task(user_id, name, notes, workspace_id, assignee)


@router.get("/task/status/{user_id}/{task_id}")
async def get_task_status(user_id: str, task_id: str):
    """Check task status"""
    return await AsanaController.get_task_status(user_id, task_id)
