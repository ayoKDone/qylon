from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProviderToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    provider: str  # zoom | google | microsoft
    provider_account_id: Optional[str] = None
    user_id: int = Field(foreign_key="user.id")
    access_token: str
    refresh_token: Optional[str] = None
    scope: Optional[str] = None
    token_type: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
