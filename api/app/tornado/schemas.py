from pydantic import BaseModel, Field


class TornadoTelemetryPoint(BaseModel):
    timestamp_sec: float

    position_x_m: float
    position_y_m: float
    position_z_m: float

    velocity_x_ms: float
    velocity_y_ms: float
    velocity_z_ms: float

    roll_deg: float
    pitch_deg: float
    yaw_deg: float

    angular_velocity_x_rads: float
    angular_velocity_y_rads: float
    angular_velocity_z_rads: float

    control_roll: float
    control_pitch: float
    control_thrust: float
    control_yaw: float


class TornadoReferencePoint(BaseModel):
    timestamp_sec: float

    position_x_m: float
    position_y_m: float
    position_z_m: float


class TornadoEvidence(BaseModel):
    metric: str
    value: float
    unit: str
    timestamp_sec: float | None = None
    description: str


class TornadoEvent(BaseModel):
    timestamp_sec: float
    type: str
    severity: str
    description: str
    evidence: list[TornadoEvidence] = Field(default_factory=list)

class TornadoTrajectoryPoint(BaseModel):
    timestamp_sec: float
    x_m: float
    y_m: float
    z_m: float


class TornadoTrajectoryDeviation(BaseModel):
    timestamp_sec: float
    error_m: float


class TornadoTrajectory(BaseModel):
    actual: list[TornadoTrajectoryPoint]
    reference: list[TornadoTrajectoryPoint]
    deviation: list[TornadoTrajectoryDeviation]

class TornadoAssessmentResult(BaseModel):
    flight_id: str
    duration_sec: float
    trajectory: TornadoTrajectory
    metrics: dict
    events: list[TornadoEvent] = Field(default_factory=list)
    
class TornadoFlight(BaseModel):
    flight_id: str
    telemetry: list[TornadoTelemetryPoint]
    reference: list[TornadoReferencePoint]

    duration_sec: float = Field(ge=0)