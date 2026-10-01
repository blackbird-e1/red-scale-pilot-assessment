from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.trainer_request import (
    TrainerRequest,
    TrainerRequestStatus,
)
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/trainer-requests",
    tags=["Trainer Requests"],
)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_trainer_request(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.TRAINEE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only trainees can request trainer access.",
        )

    result = await db.execute(
        select(TrainerRequest).where(
            TrainerRequest.user_id == current_user.id,
            TrainerRequest.status == TrainerRequestStatus.PENDING,
        )
    )

    existing_request = result.scalar_one_or_none()

    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a pending trainer access request.",
        )

    trainer_request = TrainerRequest(
        user_id=current_user.id,
        status=TrainerRequestStatus.PENDING,
    )

    db.add(trainer_request)
    await db.commit()
    await db.refresh(trainer_request)

    return {
        "id": str(trainer_request.id),
        "status": trainer_request.status.value,
        "created_at": trainer_request.created_at,
    }


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
)
async def get_my_trainer_request(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerRequest)
        .where(TrainerRequest.user_id == current_user.id)
        .order_by(TrainerRequest.created_at.desc())
    )

    trainer_request = result.scalars().first()

    if not trainer_request:
        return {
            "has_request": False,
            "request": None,
        }

    return {
        "has_request": True,
        "request": {
            "id": str(trainer_request.id),
            "status": trainer_request.status.value,
            "created_at": trainer_request.created_at,
            "reviewed_at": trainer_request.reviewed_at,
        },
    }