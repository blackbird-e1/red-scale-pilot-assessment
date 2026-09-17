from fastapi import APIRouter, Depends, HTTPException, status
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.auth import (
    GoogleLoginRequest,
    LoginResponse,
    TraineeResponse,
)
from app.models.user import User, UserRole
from app.services.auth_service import get_or_create_google_user
from app.services.token_service import create_access_token
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.auth import get_current_user, require_trainer

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


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "avatar_url": current_user.avatar_url,
        "role": current_user.role.value,
    }

@router.get(
    "/trainees",
    response_model=list[TraineeResponse],
    status_code=status.HTTP_200_OK,
)
async def get_trainees(
    current_user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
) -> list[TraineeResponse]:
    result = await db.execute(
        select(User)
        .where(User.role == UserRole.TRAINEE)
        .order_by(User.name)
    )

    trainees = result.scalars().all()

    return [
        TraineeResponse(
            id=str(trainee.id),
            name=trainee.name,
            email=trainee.email,
        )
        for trainee in trainees
    ]