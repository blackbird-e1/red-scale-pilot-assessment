from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.services.token_service import decode_access_token


security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = decode_access_token(token)

        subject = payload.get("sub")

        if not subject:
            raise ValueError("Missing token subject.")

        user_id = UUID(subject)

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(
        select(User).where(User.id == user_id)
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def require_trainer(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.TRAINER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Trainer access required.",
        )

    return current_user


async def require_trainee(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.TRAINEE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Trainee access required.",
        )

    return current_user