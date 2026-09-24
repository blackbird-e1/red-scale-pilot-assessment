from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AssessmentRecord(Base):
    __tablename__ = "assessment_records"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    # The trainee/pilot whose flight was assessed.
    pilot_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # The trainer who created the assessment.
    created_by: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    source_filename: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Benchmark identity is stored so historical assessments
    # remain tied to the benchmark that produced them.
    benchmark_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    benchmark_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    # ---------------------------------------------------------
    # Flight features
    # ---------------------------------------------------------

    duration_sec: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    max_altitude_ft: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    min_altitude_ft: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    max_speed_knots: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    avg_speed_knots: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    max_pitch_deg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    min_pitch_deg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    max_roll_deg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    min_roll_deg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    max_bank_angle_deg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    max_climb_rate_fpm: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    max_descent_rate_fpm: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    avg_throttle_percent: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # ---------------------------------------------------------
    # Assessment output
    # ---------------------------------------------------------

    # The new benchmark produces competency, behaviour,
    # and evidence findings. The complete structure is stored
    # as JSON so the benchmark can evolve without requiring
    # a new relational column for every finding.
    benchmark: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    # Temporary compatibility fields.
    # These are retained until the API/database migration is
    # completely finished.
    risk_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    overall_rating: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # Legacy benchmark data.
    # Keep these columns temporarily so existing database rows
    # remain readable during the migration.
    benchmark_results: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    violations: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    visual_observations: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    telemetry: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
    )