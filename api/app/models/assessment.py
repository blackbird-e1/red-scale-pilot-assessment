from typing import Literal

from pydantic import BaseModel, Field

from app.models.flight_features import FlightFeatures
from app.models.rule_violation import RuleViolation


class TelemetryPoint(BaseModel):
    timestamp_sec: float

    altitude_ft: float
    indicated_airspeed_knots: float

    pitch_deg: float
    roll_deg: float

    vertical_speed_fpm: float
    bank_angle_deg: float

    throttle_percent: float


class VisualObservation(BaseModel):
    category: str
    finding: str
    confidence: float = Field(ge=0, le=1)
    source: str


class BenchmarkResult(BaseModel):
    rule_id: str
    rule_name: str
    severity: Literal["low", "medium", "high", "critical"]

    message: str

    expected: str
    actual: str

    benchmark_score: float
    status: str
    deviation: float


class Assessment(BaseModel):
    features: FlightFeatures

    benchmark_results: list[BenchmarkResult]

    violations: list[RuleViolation]

    visual_observations: list[VisualObservation] = Field(
        default_factory=list
    )

    risk_score: float = Field(ge=0, le=100)

    overall_rating: Literal[
        "Excellent",
        "Good",
        "Fair",
        "Poor",
        "Unsafe",
    ]

    telemetry: list[TelemetryPoint]