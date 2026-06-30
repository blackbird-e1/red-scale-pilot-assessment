from pydantic import BaseModel

from app.models.flight_features import FlightFeatures
from app.models.rule_violation import RuleViolation


class Assessment(BaseModel):
    features: FlightFeatures

    violations: list[RuleViolation]

    risk_score: float

    overall_rating: str