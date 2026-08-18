import json

from groq import AsyncGroq

from app.config import settings
from app.models.assessment import Assessment
from app.models.debrief import DebriefResponse


DEBRIEF_SYSTEM_PROMPT = """
You are Red Scale, an AI Pilot Debrief & Assessment System.

Your job is to explain a deterministic flight assessment to a pilot,
instructor, or flight analyst.

IMPORTANT RULES:

1. The supplied assessment is authoritative.
2. NEVER calculate, modify, reinterpret, or override the risk score.
3. NEVER modify the overall rating.
4. NEVER invent a violation.
5. Only discuss violations explicitly present in the assessment.
6. Recommendations must be grounded in the supplied assessment.
    Do not infer aircraft design limits, structural limits, passenger effects,
    loss-of-control risk, fuel consumption, engine stress, or other physical
    consequences unless those facts are explicitly provided in the assessment.
    Treat configured SOP thresholds as operational assessment thresholds,
    not as aircraft certification or structural limits.
7. Use the flight features to provide useful context.
8. If there are no violations, explicitly state that no configured
   SOP violations were detected.
9. Do not claim that a parameter violated an SOP unless the supplied
   violations establish that fact.
10. Do not invent aircraft type, mission type, pilot identity,
    environmental conditions, or operational context.
11. Keep the language professional and suitable for an aviation
    training debrief.
12. Return ONLY the requested structured JSON.

The output must contain:

- summary
- key_findings
- areas_of_concern
- recommendations
""".strip()


def _build_assessment_payload(assessment: Assessment) -> dict:
    return {
        "features": assessment.features.model_dump(),
        "violations": [
            violation.model_dump()
            for violation in assessment.violations
        ],
        "risk_score": assessment.risk_score,
        "overall_rating": assessment.overall_rating,
    }


async def generate_debrief(assessment: Assessment) -> DebriefResponse:
    client = AsyncGroq(
        api_key=settings.groq_api_key,
    )

    payload = _build_assessment_payload(assessment)

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": DEBRIEF_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": (
                    "Generate a mission debrief from the following "
                    "deterministic assessment.\n\n"
                    f"{json.dumps(payload, indent=2)}"
                ),
            },
        ],
        temperature=0.2,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "flight_debrief",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "string",
                        },
                        "key_findings": {
                            "type": "array",
                            "items": {
                                "type": "string",
                            },
                        },
                        "areas_of_concern": {
                            "type": "array",
                            "items": {
                                "type": "string",
                            },
                        },
                        "recommendations": {
                            "type": "array",
                            "items": {
                                "type": "string",
                            },
                        },
                    },
                    "required": [
                        "summary",
                        "key_findings",
                        "areas_of_concern",
                        "recommendations",
                    ],
                    "additionalProperties": False,
                },
            },
        },
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError("Groq returned an empty debrief response.")

    return DebriefResponse.model_validate(
        json.loads(content)
    )