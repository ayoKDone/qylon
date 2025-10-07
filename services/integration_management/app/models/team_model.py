# app/models/team_model.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.models.base import Base
from datetime import datetime, timezone

class TeamsIntegration(Base):
    __tablename__ = "teams_integrations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_expiry = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))
