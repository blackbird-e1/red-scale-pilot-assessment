from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment_record import AssessmentRecord
from app.services.graph_similarity import find_similar_assessments


async def find_similar_assessments_for_pilot(
    db: AsyncSession,
    pilot_id: UUID,
    assessment_id: UUID,
    top_k: int = 3,
) -> list[dict]:
    """
    Find historical assessments for a pilot that are
    structurally similar to the requested assessment.
    """

    result = await db.execute(
        select(AssessmentRecord)
        .where(
            AssessmentRecord.pilot_id == pilot_id
        )
        .order_by(
            AssessmentRecord.created_at.asc()
        )
    )

    records = list(result.scalars().all())

    if not records:
        raise ValueError(
            "No assessments found for this pilot."
        )

    assessment_exists = any(
        record.id == assessment_id
        for record in records
    )

    if not assessment_exists:
        raise ValueError(
            "Assessment not found for this pilot."
        )

    return find_similar_assessments(
        records=records,
        assessment_id=assessment_id,
        top_k=top_k,
    )