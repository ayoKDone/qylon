
# Placeholder for integration tests
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base  # ✅ shared Base used by all models
# from app.models.paystack import PaystackPayment
# from app.models.stripe import Stripepayment
# from app.bot_widget.model import bot_embed, embed_keys
# from app.models.contacts import ContactMessage
# from app.models.facebookpage import FacebookPage
# from app.models.facebook_account import FacebookAccount
# from app.models.facebook_message import FacebookMessage
# from app.models.user_analytics import User
from app.models.bot_config import WidgetSettings

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)

def drop_tables():
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped!")

if __name__ == "__main__":
    #drop_tables()
    create_tables()
    print("Tables created!")
