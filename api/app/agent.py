"""
Red Scale conversational assistant.

The assistant uses Groq for general aviation and
flight-assessment related questions.

Critical flight assessment decisions are NOT made here.
Those remain the responsibility of the deterministic
assessment engine and the debrief service.
"""

from typing import AsyncGenerator

from groq import AsyncGroq

from app.config import settings


SYSTEM_PROMPT = """
You are Red Scale, an AI Pilot Debrief & Assessment Assistant.

You assist pilots, instructors, analysts, and users of the Red Scale
flight assessment system.

Your role is to explain aviation and flight-assessment concepts clearly
and professionally.

You may discuss:

- Flight assessment concepts
- Flight telemetry
- Altitude
- Airspeed
- Pitch
- Roll
- Bank angle
- Climb rate
- Descent rate
- Throttle
- SOP compliance
- Pilot training concepts
- Mission debrief concepts
- Risk assessment concepts
- General aviation operations

IMPORTANT RULES:

1. Do not invent flight data.
2. Do not invent SOP violations.
3. Do not invent aircraft specifications.
4. Do not claim that a parameter violated an SOP unless the supplied
   assessment explicitly establishes that violation.
5. The deterministic Red Scale assessment engine is authoritative for:
   risk score, overall rating, features, and violations.
6. Never modify or override an assessment result.
7. If the user asks about a specific flight but no flight assessment
   data has been provided in the conversation, clearly say that you
   do not have that flight data.
8. Do not invent aircraft type, pilot identity, mission type,
   weather, or operational circumstances.
9. Keep answers concise, professional, and useful.
10. This assistant is an explanatory interface, not a replacement
    for qualified aviation personnel, official SOPs, manuals, or
    operational procedures.

If the user asks a general aviation question, answer directly.

If the user asks about an assessment result, use only the assessment
information available in the conversation.

Never fabricate evidence.
""".strip()


def _build_messages(
    message: str,
    history: list[dict] | None = None,
) -> list[dict[str, str]]:
    """
    Build the Groq chat message list.
    """

    messages: list[dict[str, str]] = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    if history:
        for turn in history:
            messages.append(
                {
                    "role": turn["role"],
                    "content": turn["content"],
                }
            )

    messages.append(
        {
            "role": "user",
            "content": message,
        }
    )

    return messages


def _client() -> AsyncGroq:
    """
    Create the Groq client.
    """

    return AsyncGroq(
        api_key=settings.groq_api_key,
    )


async def run_agent(
    message: str,
    history: list[dict] | None = None,
) -> str:
    """
    Generate a complete assistant response.
    """

    client = _client()

    response = await client.chat.completions.create(
        model=settings.groq_model,
        messages=_build_messages(message, history),
        temperature=0.2,
    )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return content


async def stream_agent(
    message: str,
    history: list[dict] | None = None,
) -> AsyncGenerator[tuple[str, str], None]:
    """
    Stream the assistant response.

    Yields:

        ("delta", text)
        ("done", full_response)

    The chat router can continue using the existing SSE format.
    """

    client = _client()

    stream = await client.chat.completions.create(
        model=settings.groq_model,
        messages=_build_messages(message, history),
        temperature=0.2,
        stream=True,
    )

    full_response = ""

    async for chunk in stream:
        if not chunk.choices:
            continue

        delta = chunk.choices[0].delta.content

        if not delta:
            continue

        full_response += delta

        yield ("delta", delta)

    yield ("done", full_response)