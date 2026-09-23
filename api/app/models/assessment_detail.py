from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.benchmark.models import BenchmarkAssessment
from app.models.assessment import (
    TelemetryPoint,
    VisualObservation,
)
from app.models.flight_features import FlightFeatures


class AssessmentDetail(BaseModel):
    id: UUID
    pilot_id: UUID
    created_by: UUID
    created_at: datetime

    source_filename: str

    benchmark_id: str
    benchmark_version: str

    features: FlightFeatures

    risk_score: float | None = None
    overall_rating: str | None = None

    benchmark: BenchmarkAssessment

    visual_observations: list[VisualObservation]
    telemetry: list[TelemetryPoint]