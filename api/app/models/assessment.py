from typing import Literal

from pydantic import BaseModel, Field

from app.benchmark.models import BenchmarkAssessment
from app.models.flight_features import FlightFeatures


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


class Assessment(BaseModel):
    features: FlightFeatures

    benchmark: BenchmarkAssessment

    visual_observations: list[VisualObservation] = Field(
        default_factory=list
    )

    # Temporary compatibility fields.
    # These will be replaced when the new risk model is implemented.
    risk_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    overall_rating: (
        Literal[
            "Excellent",
            "Good",
            "Fair",
            "Poor",
            "Unsafe",
        ]
        | None
    ) = None

    telemetry: list[TelemetryPoint]