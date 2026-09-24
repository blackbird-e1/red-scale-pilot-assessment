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


class ReplayEvidence(BaseModel):
    metric: str
    value: float
    timestamp_sec: float | None = None
    duration_sec: float | None = None

class ReplayEvent(BaseModel):
    timestamp_sec: float
    type: str
    label: str
    severity: str | None = None

    competency_id: str | None = None
    competency_name: str | None = None

    behaviour_id: str | None = None
    behaviour_name: str | None = None

    evidence: ReplayEvidence | None = None
class ReplayDataset(BaseModel):
    assessment_id: UUID
    pilot_id: UUID
    source_filename: str | None

    duration_sec: float

    telemetry: list[ReplayTelemetryPoint]

    events: list[ReplayEvent]