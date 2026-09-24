from enum import Enum

from pydantic import BaseModel


class BehaviourStatus(str, Enum):
    OBSERVED = "observed"
    ATTENTION = "attention"
    DEVIATION = "deviation"


class BehaviourSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class EvidenceItem(BaseModel):
    metric: str
    value: float
    timestamp_sec: float | None = None
    duration_sec: float | None = None


class BehaviourFinding(BaseModel):
    behaviour_id: str
    behaviour_name: str
    status: BehaviourStatus
    severity: BehaviourSeverity
    evidence: list[EvidenceItem]
    explanation: str


class CompetencyFinding(BaseModel):
    competency_id: str
    competency_name: str
    findings: list[BehaviourFinding]


class BenchmarkAssessment(BaseModel):
    benchmark_id: str
    benchmark_version: str
    competencies: list[CompetencyFinding]