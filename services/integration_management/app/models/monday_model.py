from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from app.models.base import Base

class MondayIntegration(Base):
    __tablename__ = "monday_integrations"

    user_id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    account_id = Column(String, nullable=True)   # monday account / workspace id (optional)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
