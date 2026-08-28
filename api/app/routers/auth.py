from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.auth import GoogleLoginRequest, LoginResponse
from app.services.auth_service import get_or_create_google_user
from app.services.token_service import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/google",
    response_model=LoginResponse,
)
async def google_login(
    credentials: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    try:
        google_user = id_token.verify_oauth2_token(
            credentials.credential,
            requests.Request(),
            settings.google_client_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential.",
        ) from exc

    google_id = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name")
    avatar_url = google_user.get("picture")

    if not google_id or not email or not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account information is incomplete.",
        )

    user = await get_or_create_google_user(
        db=db,
        google_id=google_id,
        email=email,
        name=name,
        avatar_url=avatar_url,
    )

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value,
    )

    return LoginResponse(
        access_token=access_token,
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
    )