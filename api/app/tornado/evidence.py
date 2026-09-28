from pydantic import BaseModel, Field


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