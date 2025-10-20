from pydantic import BaseModel, Field
from typing import Optional, List

class ClickUpTaskCreateRequest(BaseModel):
    user_id: str = Field(..., description="Local user id for which integration is stored")
    list_id: str = Field(..., description="ClickUp list id to create task in")
    name: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    assignees: Optional[List[int]] = Field(None, description="List of ClickUp user ids to assign")
