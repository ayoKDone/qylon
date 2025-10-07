from sqlmodel import SQLModel, Field
from datetime import datetime
import uuid

class TeamsIntegration(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str
    access_token: str
    refresh_token: str
    expires_at: datetime
    tenant_id: str
