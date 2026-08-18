from fastapi import APIRouter, HTTPException, status

from app.models.auth import LoginRequest, LoginResponse
from app.services.auth_service import authenticate_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
)
async def login(credentials: LoginRequest) -> LoginResponse:
    user = authenticate_user(
        username=credentials.username,
        password=credentials.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    return LoginResponse(
        authenticated=True,
        username=user["username"],
        role=user["role"],
    )