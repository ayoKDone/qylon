from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    # UUID / string primary key
    id = Column(String, primary_key=True)  # store strings like "ayo"

    # Email and password
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    # # Relationships
    # google_integration = relationship("GoogleIntegration", back_populates="user", uselist=False)
    # zoom_integration = relationship("ZoomIntegration", back_populates="user", uselist=False)
    # teams_integration = relationship("TeamsIntegration", back_populates="user", uselist=False)
    # meeting_transcripts = relationship("GoogleMeetingTranscript", back_populates="user")
