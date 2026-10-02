from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import require_admin
from app.models.trainer_request import (
    TrainerRequest,
    TrainerRequestStatus,
)
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/trainer-requests",
    status_code=status.HTTP_200_OK,
)
async def get_trainer_requests(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerRequest)
        .order_by(TrainerRequest.created_at.desc())
    )

    requests = result.scalars().all()

    return [
        {
            "id": str(request.id),
            "user_id": str(request.user_id),
            "status": request.status.value,
            "created_at": request.created_at,
            "reviewed_at": request.reviewed_at,
            "reviewed_by": (
                str(request.reviewed_by)
                if request.reviewed_by
                else None
            ),
        }
        for request in requests
    ]

@router.get(
    "/trainers",
    status_code=status.HTTP_200_OK,
)
async def get_trainers(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .where(User.role == UserRole.TRAINER)
        .order_by(User.name.asc())
    )

    trainers = result.scalars().all()

    return [
        {
            "id": str(trainer.id),
            "name": trainer.name,
            "email": trainer.email,
            "role": trainer.role.value,
        }
        for trainer in trainers
    ]

@router.post(
    "/users/{user_id}/demote",
    status_code=status.HTTP_200_OK,
)
async def demote_trainer(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.role != UserRole.TRAINER:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only trainers can be demoted.",
        )

    user.role = UserRole.TRAINEE

    await db.commit()
    await db.refresh(user)

    return {
        "message": "Trainer demoted to trainee.",
        "user_id": str(user.id),
        "role": user.role.value,
    }

@router.post(
    "/trainer-requests/{request_id}/approve",
    status_code=status.HTTP_200_OK,
)
async def approve_trainer_request(
    request_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerRequest).where(
            TrainerRequest.id == request_id
        )
    )

    trainer_request = result.scalar_one_or_none()

    if not trainer_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainer request not found.",
        )

    if trainer_request.status != TrainerRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Trainer request has already been reviewed.",
        )

    user_result = await db.execute(
        select(User).where(
            User.id == trainer_request.user_id
        )
    )

    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with trainer request not found.",
        )

    user.role = UserRole.TRAINER

    trainer_request.status = TrainerRequestStatus.APPROVED
    trainer_request.reviewed_at = datetime.now(timezone.utc)
    trainer_request.reviewed_by = current_user.id

    await db.commit()

    return {
        "message": "Trainer request approved.",
        "user_id": str(user.id),
        "role": user.role.value,
        "request_id": str(trainer_request.id),
        "status": trainer_request.status.value,
    }


@router.post(
    "/trainer-requests/{request_id}/reject",
    status_code=status.HTTP_200_OK,
)
async def reject_trainer_request(
    request_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerRequest).where(
            TrainerRequest.id == request_id
        )
    )

    trainer_request = result.scalar_one_or_none()

    if not trainer_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainer request not found.",
        )

    if trainer_request.status != TrainerRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Trainer request has already been reviewed.",
        )

    trainer_request.status = TrainerRequestStatus.REJECTED
    trainer_request.reviewed_at = datetime.now(timezone.utc)
    trainer_request.reviewed_by = current_user.id

    await db.commit()

    return {
        "message": "Trainer request rejected.",
        "request_id": str(trainer_request.id),
        "status": trainer_request.status.value,
    }