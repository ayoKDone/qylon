# app/models/google_integrations.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.models.base import Base
from datetime import datetime, timezone

class GoogleIntegration(Base):
    __tablename__ = "google_integrations"

    id = Column(Integer, primary_key=True, autoincrement=True)  # auto-increment integer
    user_id = Column(String, nullable=False)  # string identifier, no foreign key

    # OAuth tokens
    email = Column(String, unique=True, index=True, nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_expiry = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))
