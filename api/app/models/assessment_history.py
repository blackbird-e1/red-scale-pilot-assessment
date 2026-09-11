from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AssessmentHistoryItem(BaseModel):
    id: UUID
    created_at: datetime
    source_filename: str
    benchmark_id: str
    benchmark_version: str
    risk_score: float
    overall_rating: str