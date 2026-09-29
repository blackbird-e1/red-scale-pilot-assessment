import json
from uuid import UUID

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment_record import AssessmentRecord
from app.models.user import User, UserRole


def build_red_scale_tools(
    db: AsyncSession,
    current_user: User,
):
    """
    Build authenticated Red Scale tools for the current user.

    Tools are created per request so they have access to:
    - the authenticated user
    - the current database session

    The tools are read-only.
    """

    @tool
    async def get_assessment(assessment_id: str) -> str:
        """
        Retrieve a Red Scale flight assessment by assessment ID.

        Use this tool when the user asks about a specific flight
        assessment, its findings, risk, benchmark results, flight
        features, evidence, or visual observations.

        The deterministic assessment stored in Red Scale is
        authoritative and must not be modified or reinterpreted
        as a new assessment.
        """

        try:
            parsed_id = UUID(assessment_id)
        except ValueError:
            return json.dumps(
                {
                    "error": "Invalid assessment ID."
                }
            )

        result = await db.execute(
            select(AssessmentRecord).where(
                AssessmentRecord.id == parsed_id
            )
        )

        record = result.scalar_one_or_none()

        if record is None:
            return json.dumps(
                {
                    "error": "Assessment not found."
                }
            )

        # ---------------------------------------------------------
        # Authorization
        # ---------------------------------------------------------

        if current_user.role == UserRole.TRAINEE:
            if record.pilot_id != current_user.id:
                return json.dumps(
                    {
                        "error": (
                            "Assessment not found or not accessible."
                        )
                    }
                )

        # ---------------------------------------------------------
        # Return authoritative assessment evidence
        # ---------------------------------------------------------

        assessment = {
            "id": str(record.id),
            "pilot_id": str(record.pilot_id),
            "created_at": record.created_at.isoformat(),
            "source_filename": record.source_filename,
            "benchmark_id": record.benchmark_id,
            "benchmark_version": record.benchmark_version,
            "risk_score": record.risk_score,
            "overall_rating": record.overall_rating,
            "features": {
                "duration_sec": record.duration_sec,
                "max_altitude_ft": record.max_altitude_ft,
                "min_altitude_ft": record.min_altitude_ft,
                "max_speed_knots": record.max_speed_knots,
                "avg_speed_knots": record.avg_speed_knots,
                "max_pitch_deg": record.max_pitch_deg,
                "min_pitch_deg": record.min_pitch_deg,
                "max_roll_deg": record.max_roll_deg,
                "min_roll_deg": record.min_roll_deg,
                "max_bank_angle_deg": record.max_bank_angle_deg,
                "max_climb_rate_fpm": record.max_climb_rate_fpm,
                "max_descent_rate_fpm": record.max_descent_rate_fpm,
                "avg_throttle_percent": record.avg_throttle_percent,
            },
            "benchmark": record.benchmark,
            "visual_observations": record.visual_observations,
        }

        return json.dumps(
            assessment,
            default=str,
        )

    @tool
    async def get_my_assessment_history() -> str:
        """
        Retrieve the authenticated trainee's assessment history.

        Use this tool when the user asks about their latest flight,
        previous assessments, assessment history, performance across
        flights, or when an assessment ID needs to be discovered.

        The returned assessment records are authoritative Red Scale
        records.
        """

        if current_user.role != UserRole.TRAINEE:
            return json.dumps(
                {
                    "error": (
                        "This tool is available for trainee assessment "
                        "history."
                    )
                }
            )

        result = await db.execute(
            select(AssessmentRecord)
            .where(
                AssessmentRecord.pilot_id == current_user.id
            )
            .order_by(
                AssessmentRecord.created_at.desc()
            )
        )

        records = result.scalars().all()

        assessments = []

        for record in records:
            assessments.append(
                {
                    "id": str(record.id),
                    "created_at": record.created_at.isoformat(),
                    "source_filename": record.source_filename,
                    "benchmark_id": record.benchmark_id,
                    "benchmark_version": record.benchmark_version,
                    "risk_score": record.risk_score,
                    "overall_rating": record.overall_rating,
                    "duration_sec": record.duration_sec,
                    "max_speed_knots": record.max_speed_knots,
                    "max_bank_angle_deg": record.max_bank_angle_deg,
                    "max_descent_rate_fpm": record.max_descent_rate_fpm,
                }
            )

        return json.dumps(
            {
                "assessment_count": len(assessments),
                "assessments": assessments,
            },
            default=str,
        )

    return [
        get_my_assessment_history,
        get_assessment,
    ]