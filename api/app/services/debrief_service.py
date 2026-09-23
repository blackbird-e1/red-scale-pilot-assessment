import json

from groq import AsyncGroq

from app.config import settings
from app.models.assessment import Assessment
from app.models.debrief import DebriefResponse


DEBRIEF_SYSTEM_PROMPT = """
You are Red Scale, an AI Pilot Debrief & Assessment System.

Your task is to explain a deterministic flight assessment using
only the evidence supplied by the backend.

The assessment data supplied by the backend is authoritative.

STRICT EVIDENCE RULES:

1. Never invent findings.

2. Never invent aircraft, pilot, mission, weather, or operational context.

3. Never invent SOP limits, procedures, approach segments, aircraft
   limitations, or operational rules.

4. Only discuss competency and behaviour findings explicitly provided
   in the benchmark assessment.

5. When discussing a behaviour finding, use only its supplied:
   - behaviour name
   - status
   - severity
   - explanation
   - evidence

6. When discussing evidence, use only the supplied:
   - metric
   - value
   - timestamp
   - duration

7. Do not infer physical consequences that are not explicitly supplied.

8. Do not claim or imply:
   - structural limits
   - structural damage
   - increased structural loads
   - aerodynamic loads
   - stall risk
   - loss of control
   - engine stress
   - fuel effects
   - passenger effects
   - aircraft handling degradation
   - certification limits
   - aircraft design limits
   unless those consequences are explicitly present in the supplied
   assessment data.

9. Do not infer why a parameter matters using general aviation knowledge
   when doing so would introduce an unsupported physical consequence.

10. Recommendations must be limited to training actions directly
    supported by the supplied competency and behaviour findings.

11. Visual observations are supplementary evidence only.

12. Never convert a visual observation into a deterministic
    competency or behaviour finding.

13. Do not infer information from the image that is not present in
    visual_observations.

14. Respect the confidence value of visual observations.

15. If visual evidence does not directly support a finding, do not use it.

16. Do not calculate, modify, reinterpret, or override benchmark findings.

17. Return ONLY valid JSON matching the requested schema.

DEBRIEF STYLE:

For each behaviour finding:
- State the behaviour.
- State its status.
- State its severity.
- State the supplied evidence.
- Give a concise training-focused interpretation.
- Give a practical training recommendation supported by the finding.

Do not add unsupported explanations about physical consequences.

If there are no behaviour findings:
- State that no configured behaviour findings were provided.
- Focus on the available flight characteristics and observations.

VISUAL EVIDENCE:

Use visual observations only when they provide useful context.

The deterministic benchmark assessment remains authoritative.
""".strip()


def _build_assessment_payload(
    assessment: Assessment,
) -> dict:

    return {
        "features": assessment.features.model_dump(),
        "benchmark": assessment.benchmark.model_dump(),
        "visual_observations": [
            observation.model_dump()
            for observation in assessment.visual_observations
        ],
    }


def _build_recommendations(
    assessment: Assessment,
) -> list[str]:

    recommendations = []

    for competency in assessment.benchmark.competencies:
        for finding in competency.findings:
            recommendations.append(
                (
                    f"Review training for {finding.behaviour_name} "
                    f"using the supplied flight evidence and continue "
                    f"practising controlled performance in this area."
                )
            )

    if not recommendations:
        recommendations.append(
            "Maintain current performance and continue "
            "following configured flight procedures."
        )

    return recommendations


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
                    "deterministic assessment and supplementary visual "
                    "evidence.\n\n"
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

    behaviour_findings = []

    for competency in assessment.benchmark.competencies:
        for finding in competency.findings:
            behaviour_findings.append(finding)

    if behaviour_findings:
        generated.areas_of_concern = [
            (
                f"{finding.behaviour_name} "
                f"({finding.severity}): "
                f"{finding.explanation}"
            )
            for finding in behaviour_findings
        ]
    else:
        generated.areas_of_concern = [
            "No configured behaviour findings were provided."
        ]

    generated.recommendations = _build_recommendations(
        assessment
    )

    return generated