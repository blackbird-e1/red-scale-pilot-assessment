from pydantic import BaseModel, Field


class DebriefResponse(BaseModel):
    summary: str

    key_findings: list[str] = Field(default_factory=list)

    areas_of_concern: list[str] = Field(default_factory=list)

    recommendations: list[str] = Field(default_factory=list)