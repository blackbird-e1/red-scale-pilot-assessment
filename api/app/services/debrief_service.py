import json

from groq import AsyncGroq

from app.config import settings
from app.models.assessment import Assessment
from app.models.debrief import DebriefResponse


DEBRIEF_SYSTEM_PROMPT = """
You are Red Scale, an AI Pilot Debrief & Assessment System.

Your task is to explain a deterministic flight assessment.

The assessment data supplied by the backend is authoritative.

You MUST:

1. Never invent violations.
2. Never invent aircraft, pilot, mission, weather, or operational context.
3. Only discuss violations explicitly provided.
4. Base findings on the supplied flight features.
5. Provide practical aviation-training recommendations.
6. Use professional post-flight debrief language.
7. Return ONLY valid JSON matching the requested schema.

Do NOT state or infer any risk score or overall rating.
The backend will provide those values separately.

If violations are present:
- Explain the actual violations.
- Mention their severity.
- Reference the expected and actual values.
- Explain why they matter.
- Give targeted recommendations.

If there are no violations:
- State that no configured SOP violations were detected.
- Focus on positive flight characteristics and maintaining performance.
""".strip()


def _build_assessment_payload(assessment: Assessment) -> dict:
    return {
        "features": assessment.features.model_dump(),
        "violations": [
            violation.model_dump()
            for violation in assessment.violations
        ],
    }


async def generate_debrief(
    assessment: Assessment,
) -> DebriefResponse:

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
                    "deterministic assessment data.\n\n"
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
        raise RuntimeError(
            "Groq returned an empty debrief response."
        )

    generated = DebriefResponse.model_validate(
        json.loads(content)
    )

    # -------------------------------------------------------------
    # Enforce deterministic assessment facts.
    # Groq is responsible only for interpretation.
    # -------------------------------------------------------------

    if assessment.violations:
        areas_of_concern = []

        for violation in assessment.violations:
            areas_of_concern.append(
                (
                    f"{violation.rule_name} "
                    f"({violation.severity}): "
                    f"{violation.message} "
                    f"Expected {violation.expected}; "
                    f"actual {violation.actual}."
                )
            )

        generated.areas_of_concern = areas_of_concern

    else:
        generated.areas_of_concern = [
            "No configured SOP violations were detected."
        ]

    return generated