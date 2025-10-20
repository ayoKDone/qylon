# app/models/asana_model.py
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.models.base import Base


class AsanaIntegration(Base):
    __tablename__ = "asana_integrations"

    user_id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    workspace_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
