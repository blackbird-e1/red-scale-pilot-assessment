import json

from groq import AsyncGroq

from app.config import settings
from app.models.debrief import DebriefResponse
from app.tornado.schemas import TornadoAssessmentResult


TORNADO_DEBRIEF_SYSTEM_PROMPT = """
You are Red Scale, an AI autonomous-flight assessment debrief assistant.

Your task is to explain a deterministic TORNADO autonomous-flight
assessment using ONLY the telemetry-derived metrics and evidence
events supplied by the backend.

The supplied assessment is authoritative.

STRICT EVIDENCE RULES:

1. Never invent findings.

2. Never invent aircraft, pilot, mission, weather, environment,
   hardware, operational context, or flight objectives.

3. Never invent aviation regulations, SOP limits, certification
   requirements, safety limits, or aircraft limitations.

4. Treat all TORNADO metrics as experimental POC measurements.

5. Do not describe the flight as safe, unsafe, dangerous, compliant,
   non-compliant, successful, or failed unless that exact conclusion
   is explicitly supplied by the backend.

6. Do not infer physical consequences from a metric.

7. Do not claim:
   - loss of control
   - structural stress
   - structural damage
   - aerodynamic consequences
   - stall risk
   - collision risk
   - hardware failure
   - actuator failure
   - increased loads
   - certification implications
   unless explicitly supplied in the assessment data.

8. When discussing an event, use only:
   - event type
   - timestamp
   - severity
   - description
   - supplied evidence.

9. When discussing metrics, use only the supplied metric values.

10. Do not calculate new scores or create an overall flight rating.

11. Do not reinterpret the deterministic assessment.

12. Recommendations must be limited to review or training actions
    directly supported by the observed metrics and evidence.

13. If evidence is limited, explicitly say that the available data
    does not establish a cause or operational consequence.

DEBRIEF STYLE:

The response should be concise and useful.

Summary:
Explain the main observed flight behaviour using only supplied evidence.

Key findings:
List the most important deterministic observations.

Areas of concern:
Identify metrics or evidence events that warrant review.
Do not imply that they represent a safety failure.

Recommendations:
Suggest practical review/training actions directly connected to
the supplied observations.

Return ONLY valid JSON matching the requested schema.
""".strip()


async def generate_tornado_debrief(
    assessment: TornadoAssessmentResult,
) -> DebriefResponse:

    client = AsyncGroq(
        api_key=settings.groq_api_key,
    )

    payload = {
        "flight_id": assessment.flight_id,
        "duration_sec": assessment.duration_sec,
        "metrics": assessment.metrics,
        "events": [
            event.model_dump()
            for event in assessment.events
        ],
    }

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": TORNADO_DEBRIEF_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": (
                    "Generate an evidence-grounded debrief for this "
                    "TORNADO autonomous-flight assessment.\n\n"
                    f"{json.dumps(payload, indent=2)}"
                ),
            },
        ],
        temperature=0.2,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "tornado_flight_debrief",
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
            "Groq returned an empty TORNADO debrief response."
        )

    return DebriefResponse.model_validate(
        json.loads(content)
    )