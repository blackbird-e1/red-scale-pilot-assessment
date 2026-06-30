from typing import Literal

from pydantic import BaseModel


class RuleViolation(BaseModel):
    rule_id: str
    rule_name: str
    severity: Literal["low", "medium", "high", "critical"]

    message: str

    expected: str
    actual: str