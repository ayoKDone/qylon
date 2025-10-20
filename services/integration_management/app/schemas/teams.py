from pydantic import BaseModel, EmailStr

class TeamsAuthURL(BaseModel):
    auth_url: str


class TeamsUser(BaseModel):
    id: str
    email: EmailStr

    class Config:
        orm_mode = True
