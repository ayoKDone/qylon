from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr

class UserOut(BaseModel):
    id: str  # ✅ changed from int to str
    name: str
    email: EmailStr

    class Config:
        orm_mode = True

class GoogleAuthURL(BaseModel):
    auth_url: str
