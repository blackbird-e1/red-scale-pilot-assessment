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


class Assessment(BaseModel):
    features: FlightFeatures

    violations: list[RuleViolation]

    risk_score: float = Field(ge=0, le=100)

    overall_rating: Literal[
        "Excellent",
        "Good",
        "Fair",
        "Poor",
        "Unsafe",
    ]

    telemetry: list[TelemetryPoint]