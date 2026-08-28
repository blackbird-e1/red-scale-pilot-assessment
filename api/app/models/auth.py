from pydantic import BaseModel

from app.models.user import UserRole


class GoogleLoginRequest(BaseModel):
    credential: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: str
    role: UserRole