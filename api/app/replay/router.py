# api/app/replay/router.py

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.assessment_record import AssessmentRecord
from app.models.user import User
from app.replay.schemas import ReplayDataset
from app.replay.service import build_replay_dataset


router = APIRouter(
    prefix="/replay",
    tags=["Flight Replay"],
)


@router.get(
    "/{assessment_id}",
    response_model=ReplayDataset,
)
async def get_replay(
    assessment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReplayDataset:

    result = await db.execute(
        select(AssessmentRecord).where(
            AssessmentRecord.id == assessment_id
        )
    )

    record = result.scalar_one_or_none()

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found.",
        )

    if current_user.role.value == "trainee":
        if record.pilot_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own assessment.",
            )

    return build_replay_dataset(record)