# api/app/replay/schemas.py

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReplayTelemetryPoint(BaseModel):
    timestamp_sec: float

    altitude_ft: float
    indicated_airspeed_knots: float

    pitch_deg: float
    roll_deg: float

    vertical_speed_fpm: float
    bank_angle_deg: float

    throttle_percent: float


class ReplayEvent(BaseModel):
    timestamp_sec: float
    type: str
    label: str
    severity: str | None = None


class ReplayDataset(BaseModel):
    assessment_id: UUID
    pilot_id: UUID
    source_filename: str | None

    duration_sec: float

    telemetry: list[ReplayTelemetryPoint]

    events: list[ReplayEvent]