from pydantic import BaseModel, Field
from typing import Optional, List

class MondayItemCreateRequest(BaseModel):
    user_id: str = Field(..., description="Local user id for which integration is stored")
    board_id: Optional[int] = Field(None, description="Monday board ID to create item in")
    group_id: Optional[str] = Field(None, description="Group id on the board (e.g. 'topics')")
    item_name: str = Field(..., description="Item (task) name")
    column_values: Optional[str] = Field(None, description="JSON string for column values")
    assignees: Optional[List[int]] = Field(None, description="list of monday user ids to assign")

class MondayItemResponse(BaseModel):
    id: str
    name: Optional[str] = None
    board_id: Optional[int] = None
    group_id: Optional[str] = None
