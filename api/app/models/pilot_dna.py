from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RecurringBehaviour(BaseModel):
    behaviour_id: str
    behaviour_name: str
    occurrences: int
    total_assessments: int
    severity: str
    percentage: float


class PilotDNA(BaseModel):
    pilot_id: UUID

    assessment_count: int

    latest_risk: float | None = None
    average_risk: float | None = None
    risk_trend: str
    risk_history: list[float]

    strengths: list[str]
    weaknesses: list[str]

    recurring_behaviours: list[RecurringBehaviour]

    latest_assessment_date: datetime | None = None