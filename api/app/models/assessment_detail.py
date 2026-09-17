from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.assessment import (
    BenchmarkResult,
    TelemetryPoint,
    VisualObservation,
)
from app.models.flight_features import FlightFeatures
from app.models.rule_violation import RuleViolation


class AssessmentDetail(BaseModel):
    id: UUID
    pilot_id: UUID
    created_by: UUID
    created_at: datetime

    source_filename: str

    benchmark_id: str
    benchmark_version: str

    features: FlightFeatures

    risk_score: float
    overall_rating: str

    benchmark_results: list[BenchmarkResult]
    violations: list[RuleViolation]
    visual_observations: list[VisualObservation]
    telemetry: list[TelemetryPoint]