from sqlalchemy import Column, String, DateTime
from app.db.base import Base

class UserIntegration(Base):
    __tablename__ = "user_integrations"

    id = Column(String, primary_key=True)
    user_id = Column(String, index=True)
    provider = Column(String)  # zoom / google / teams
    access_token = Column(String)
    refresh_token = Column(String)
    expires_at = Column(DateTime)
