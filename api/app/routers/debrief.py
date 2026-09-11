from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.models.assessment import Assessment
from app.models.debrief import DebriefResponse
from app.models.user import User
from app.services.debrief_service import generate_debrief


router = APIRouter(
    prefix="/debrief",
    tags=["Debrief"],
)


@router.post(
    "",
    response_model=DebriefResponse,
    status_code=status.HTTP_200_OK,
)
async def create_debrief(
    assessment: Assessment,
    current_user: User = Depends(get_current_user),
) -> DebriefResponse:
    """
    Generate an AI mission debrief from a deterministic assessment.

    Only authenticated users can generate debriefs.
    """

    try:
        return await generate_debrief(assessment)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate AI debrief.",
        ) from exc