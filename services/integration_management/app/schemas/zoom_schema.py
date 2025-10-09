from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class ZoomIntegration(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str
    access_token: str
    refresh_token: str
    expires_at: datetime
    scope: Optional[str] = None
