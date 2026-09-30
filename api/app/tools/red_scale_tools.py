import json
from uuid import UUID

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment_record import AssessmentRecord
from app.models.user import User, UserRole
from app.services.pilot_dna import build_pilot_dna
from app.replay.service import build_replay_dataset

def _build_evidence_payload(
    record: AssessmentRecord,
) -> dict:
    """
    Build a provenance-aware representation of an assessment.

    The deterministic benchmark is authoritative.

    Legacy risk_score and overall_rating fields are retained only
    for compatibility and must not be treated as a second,
    authoritative assessment result.
    """

    benchmark = record.benchmark or {}

    findings = []

    for competency in benchmark.get(
        "competencies",
        [],
    ):
        competency_id = competency.get(
            "competency_id"
        )

        competency_name = competency.get(
            "competency_name"
        )

        for finding in competency.get(
            "findings",
            [],
        ):
            findings.append(
                {
                    "competency_id": competency_id,
                    "competency_name": competency_name,
                    "behaviour_id": finding.get(
                        "behaviour_id"
                    ),
                    "behaviour_name": finding.get(
                        "behaviour_name"
                    ),
                    "status": finding.get(
                        "status"
                    ),
                    "severity": finding.get(
                        "severity"
                    ),
                    "explanation": finding.get(
                        "explanation"
                    ),
                    "evidence": finding.get(
                        "evidence",
                        [],
                    ),
                }
            )

    return {
        "assessment": {
            "id": str(record.id),
            "pilot_id": str(record.pilot_id),
            "created_at": record.created_at.isoformat(),
            "source_filename": record.source_filename,
        },

        "benchmark": {
            "id": record.benchmark_id,
            "version": record.benchmark_version,
            "source": (
                "persisted deterministic "
                "Red Scale benchmark result"
            ),
            "findings": findings,
        },

        "flight_features": {
            "duration_sec": record.duration_sec,
            "max_altitude_ft": record.max_altitude_ft,
            "min_altitude_ft": record.min_altitude_ft,
            "max_speed_knots": record.max_speed_knots,
            "avg_speed_knots": record.avg_speed_knots,
            "max_pitch_deg": record.max_pitch_deg,
            "min_pitch_deg": record.min_pitch_deg,
            "max_roll_deg": record.max_roll_deg,
            "min_roll_deg": record.min_roll_deg,
            "max_bank_angle_deg": (
                record.max_bank_angle_deg
            ),
            "max_climb_rate_fpm": (
                record.max_climb_rate_fpm
            ),
            "max_descent_rate_fpm": (
                record.max_descent_rate_fpm
            ),
            "avg_throttle_percent": (
                record.avg_throttle_percent
            ),
        },

        "visual_observations": (
            record.visual_observations
        ),

        "evidence_scope": {
            "deterministic_findings": True,
            "visual_observations_are_supplementary": True,

            "legacy_risk_score": (
                record.risk_score
            ),

            "legacy_overall_rating": (
                record.overall_rating
            ),

            "legacy_fields_are_not_authoritative": True,
        },
    }


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
    async def get_assessment(
        assessment_id: str,
    ) -> str:
        """
        Retrieve a Red Scale flight assessment by
        assessment ID.

        Use this tool when the user asks about a
        specific flight assessment, its findings,
        benchmark results, flight features, evidence,
        or visual observations.

        The deterministic benchmark stored in Red Scale
        is authoritative.

        Do not create a new score or reinterpret the
        benchmark as a new assessment.
        """

        try:
            parsed_id = UUID(assessment_id)

        except ValueError:
            return json.dumps(
                {
                    "error": (
                        "Invalid assessment ID."
                    )
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
                    "error": (
                        "Assessment not found."
                    )
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
                            "Assessment not found "
                            "or not accessible."
                        )
                    }
                )

        # ---------------------------------------------------------
        # Return evidence
        # ---------------------------------------------------------

        return json.dumps(
            _build_evidence_payload(record),
            default=str,
        )

    @tool
    async def get_my_assessment_history() -> str:
        """
        Retrieve the authenticated trainee's
        assessment history.

        Use this tool when the user asks about:

        - latest flight
        - previous assessments
        - assessment history
        - performance across flights
        - discovering an assessment ID

        This tool returns persisted Red Scale records.
        """

        if current_user.role != UserRole.TRAINEE:
            return json.dumps(
                {
                    "error": (
                        "This tool is available "
                        "for trainee assessment "
                        "history."
                    )
                }
            )

        result = await db.execute(
            select(AssessmentRecord)
            .where(
                AssessmentRecord.pilot_id
                == current_user.id
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

                    "created_at": (
                        record.created_at.isoformat()
                    ),

                    "source_filename": (
                        record.source_filename
                    ),

                    "benchmark": {
                        "id": record.benchmark_id,
                        "version": (
                            record.benchmark_version
                        ),
                    },

                    "legacy_summary": {
                        "risk_score": (
                            record.risk_score
                        ),
                        "overall_rating": (
                            record.overall_rating
                        ),
                    },

                    "features": {
                        "duration_sec": (
                            record.duration_sec
                        ),
                        "max_speed_knots": (
                            record.max_speed_knots
                        ),
                        "max_bank_angle_deg": (
                            record.max_bank_angle_deg
                        ),
                        "max_descent_rate_fpm": (
                            record.max_descent_rate_fpm
                        ),
                    },
                }
            )

        return json.dumps(
            {
                "assessment_count": (
                    len(assessments)
                ),
                "assessments": assessments,
            },
            default=str,
        )

    @tool
    async def get_my_pilot_dna() -> str:
        """
        Retrieve the authenticated trainee's deterministic Pilot DNA.

        Use this tool when the user asks about:

        - whether they are improving
        - recurring weaknesses
        - recurring behaviours
        - performance trends
        - changes across flights
        - longitudinal pilot performance

        Pilot DNA is derived from persisted Red Scale assessment
        history using the deterministic Pilot DNA service.

        Do not calculate trends, recurring behaviours, or scores
        independently. Treat the returned Pilot DNA as authoritative.
        """

        if current_user.role != UserRole.TRAINEE:
            return json.dumps(
                {
                    "error": (
                        "Pilot DNA is available "
                        "for trainee assessment history."
                    )
                }
            )

        result = await db.execute(
            select(AssessmentRecord)
            .where(
                AssessmentRecord.pilot_id
                == current_user.id
            )
            .order_by(
                AssessmentRecord.created_at.asc()
            )
        )

        records = result.scalars().all()

        if not records:
            return json.dumps(
                {
                    "pilot_id": str(current_user.id),
                    "assessment_count": 0,
                    "pilot_dna": None,
                    "message": (
                        "No assessment history is available "
                        "to build Pilot DNA."
                    ),
                }
            )

        try:
            pilot_dna = build_pilot_dna(records)

        except Exception as exc:
            return json.dumps(
                {
                    "error": (
                        "Unable to build Pilot DNA."
                    ),
                    "details": str(exc),
                }
            )

        return json.dumps(
            {
                "pilot_id": str(current_user.id),
                "assessment_count": len(records),
                "pilot_dna": pilot_dna,
                "source": (
                    "deterministic Red Scale "
                    "Pilot DNA service"
                ),
            },
            default=str,
        )

    @tool
    async def get_replay_evidence(
        assessment_id: str,
    ) -> str:
        """
        Retrieve replay evidence for a specific flight assessment.

        Use this tool when the user asks:

        - why a finding occurred
        - what happened during a flagged event
        - what the aircraft was doing at the time of a finding
        - for telemetry or replay evidence
        - for the flight context around a benchmark finding

        The deterministic benchmark remains authoritative.

        This tool provides replay evidence and telemetry context.
        It does not create or recalculate assessment findings.
        """

        try:
            parsed_id = UUID(assessment_id)

        except ValueError:
            return json.dumps(
                {
                    "error": (
                        "Invalid assessment ID."
                    )
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
                    "error": (
                        "Assessment not found."
                    )
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
                            "Assessment not found "
                            "or not accessible."
                        )
                    }
                )

        # ---------------------------------------------------------
        # Build replay dataset
        # ---------------------------------------------------------

        try:
            replay = build_replay_dataset(record)

        except Exception as exc:
            return json.dumps(
                {
                    "error": (
                        "Unable to build replay evidence."
                    ),
                    "details": str(exc),
                }
            )

        # ---------------------------------------------------------
        # Build compact telemetry context around each event
        # ---------------------------------------------------------

        telemetry = replay.telemetry

        events = []

        for event in replay.events:

            timestamp = event.timestamp_sec

            nearby_points = sorted(
                telemetry,
                key=lambda point: abs(
                    point.timestamp_sec - timestamp
                ),
            )[:5]

            nearby_points.sort(
                key=lambda point: point.timestamp_sec,
            )

            events.append(
                {
                    "timestamp_sec": event.timestamp_sec,
                    "type": event.type,
                    "label": event.label,
                    "severity": event.severity,
                    "competency_id": (
                        event.competency_id
                    ),
                    "competency_name": (
                        event.competency_name
                    ),
                    "behaviour_id": (
                        event.behaviour_id
                    ),
                    "behaviour_name": (
                        event.behaviour_name
                    ),
                    "evidence": (
                        event.evidence.model_dump()
                        if event.evidence
                        else None
                    ),
                    "telemetry_context": [
                        point.model_dump()
                        for point in nearby_points
                    ],
                }
            )

        return json.dumps(
            {
                "assessment_id": str(
                    replay.assessment_id
                ),
                "pilot_id": str(
                    replay.pilot_id
                ),
                "source_filename": (
                    replay.source_filename
                ),
                "duration_sec": (
                    replay.duration_sec
                ),
                "event_count": len(events),
                "events": events,
                "source": (
                    "deterministic Red Scale "
                    "replay evidence"
                ),
            },
            default=str,
        )


    return [
        get_my_assessment_history,
        get_assessment,
        get_my_pilot_dna,
        get_replay_evidence,
    ]