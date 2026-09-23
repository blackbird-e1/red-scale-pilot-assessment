from pydantic import BaseModel


class EvidenceItem(BaseModel):
    metric: str
    value: float
    timestamp_sec: float | None = None
    duration_sec: float | None = None


class BehaviourFinding(BaseModel):
    behaviour_id: str
    behaviour_name: str
    status: str
    severity: str
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