from fastapi import APIRouter, HTTPException, status

from app.models.assessment import Assessment
from app.models.debrief import DebriefResponse
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
) -> DebriefResponse:
    """
    Generate an AI mission debrief from a deterministic assessment.
    """

    try:
        return await generate_debrief(assessment)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate AI debrief.",
        ) from exc