# app/models/google_meet.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.models.base import Base
from datetime import datetime, timezone

class GoogleMeetingTranscript(Base):
    __tablename__ = "google_meeting_transcripts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    bot_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)  # string identifier

    transcript_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
