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

1. Never invent violations.

2. Never invent aircraft, pilot, mission, weather, or operational context.

3. Never invent SOP limits, procedures, approach segments, aircraft
   limitations, or operational rules.

4. Only discuss violations explicitly provided in the violations list.

5. When discussing a violation, use only its supplied:
   - rule_name
   - severity
   - message
   - expected value
   - actual value

6. Do not infer physical consequences that are not explicitly supplied.

7. Do NOT claim or imply:
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

8. Do not infer why a parameter matters using general aviation knowledge
   when doing so would introduce an unsupported physical consequence.

9. Recommendations must be limited to training or procedural actions
   directly supported by the supplied violations.

10. Visual observations are supplementary evidence only.

11. Never convert a visual observation into a deterministic SOP violation.

12. Never claim that a visual observation proves a violation unless the
    deterministic violations explicitly establish that connection.

13. Do not infer information from the image that is not present in
    visual_observations.

14. Respect the confidence value of visual observations.

15. If visual evidence does not directly support a finding, do not use it.

16. Do not calculate, modify, reinterpret, or override the risk score.

17. Do not calculate, modify, reinterpret, or override the overall rating.

18. Return ONLY valid JSON matching the requested schema.

DEBRIEF STYLE:

For each violation:
- State the violation.
- State its severity.
- State the expected value.
- State the actual value.
- Give a concise training-focused interpretation.
- Give a practical training recommendation.

Do not add unsupported explanations about physical consequences.

If there are no violations:
- State that no configured SOP violations were detected.
- Focus on positive flight characteristics and maintaining performance.

VISUAL EVIDENCE:

Use visual observations only when they provide useful context.

For example, if the visual evidence says an ILS approach was visible,
you may state that an ILS approach was visually observed.

Do not infer additional operational meaning from that observation.

The deterministic assessment remains authoritative.
""".strip()

RECOMMENDATIONS_BY_RULE = {
    "BANK_001": (
        "Conduct simulator training on maintaining bank angles "
        "within the configured limit of 45 degrees during flight maneuvers."
    ),
    "CLIMB_001": (
        "Review climb-rate management and practice keeping climb rates "
        "within the configured limit of 2000 fpm."
    ),
    "DESCENT_001": (
        "Reinforce descent-rate management and practice keeping descent "
        "rates within the configured limit of 1500 fpm."
    ),
    "SPD_001": (
        "Conduct speed-management drills to keep airspeed within the "
        "configured limit of 250 knots."
    ),
}

def _build_assessment_payload(assessment: Assessment) -> dict:
    return {
        "features": assessment.features.model_dump(),
        "violations": [
            violation.model_dump()
            for violation in assessment.violations
        ],
        "visual_observations": [
            observation.model_dump()
            for observation in assessment.visual_observations
        ],
    }

def _build_recommendations(
    assessment: Assessment,
) -> list[str]:
    recommendations = []

    for violation in assessment.violations:
        recommendation = RECOMMENDATIONS_BY_RULE.get(
            violation.rule_id
        )

        if recommendation:
            recommendations.append(recommendation)

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

    # -------------------------------------------------------------
    # Enforce deterministic training recommendations.
    # Groq may explain the assessment, but recommendations tied
    # to configured violations come from the backend.
    # -------------------------------------------------------------

    generated.recommendations = _build_recommendations(
        assessment
    )

    return generated