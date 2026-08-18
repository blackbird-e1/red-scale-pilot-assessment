"""
Red Scale conversational assistant.

The assistant uses Groq for aviation and flight-assessment questions only.

Critical flight assessment decisions are NOT made here.
Those remain the responsibility of the deterministic
assessment engine and the debrief service.
"""

import re
from typing import AsyncGenerator

from groq import AsyncGroq

from app.config import settings


OFF_TOPIC_RESPONSE = (
    "I can only help with aviation, flight assessment, pilot training, "
    "aircraft operations, or mission-related questions."
)


AVIATION_TERMS = (
    "aviation",
    "aircraft",
    "airplane",
    "aeroplane",
    "flight",
    "flying",
    "pilot",
    "piloting",
    "co-pilot",
    "copilot",
    "cockpit",
    "runway",
    "taxiway",
    "takeoff",
    "take-off",
    "landing",
    "approach",
    "airspace",
    "airport",
    "airfield",
    "altitude",
    "airspeed",
    "pitch",
    "roll",
    "yaw",
    "bank angle",
    "heading",
    "climb rate",
    "climb",
    "descent rate",
    "descent",
    "throttle",
    "stall",
    "turbulence",
    "telemetry",
    "fdr",
    "flight data recorder",
    "sop",
    "standard operating procedure",
    "flight assessment",
    "pilot assessment",
    "pilot training",
    "flight training",
    "mission debrief",
    "mission planning",
    "mission intelligence",
    "operational risk",
    "risk assessment",
    "aviation safety",
    "flight safety",
    "navigation",
    "instrument flight",
    "ifr",
    "vfr",
    "atc",
    "air traffic control",
    "airline",
    "airliner",
    "helicopter",
    "rotorcraft",
    "drone",
    "uav",
    "unmanned aerial",
    "aerodynamics",
    "avionics",
    "aircraft systems",
    "flight procedures",
    "aircraft operations",
    "pilot debrief",
    "flight debrief",
)


AVIATION_MANUFACTURERS = (
    "airbus",
    "boeing",
    "cessna",
    "embraer",
    "bombardier",
    "gulfstream",
    "lockheed martin",
    "northrop grumman",
    "dassault aviation",
    "sukhoi",
    "mig",
    "saab",
    "eurofighter",
    "bell helicopter",
    "textron aviation",
)


AIRCRAFT_PATTERN = re.compile(
    r"\b(?:"
    r"f-?\d{1,3}|"
    r"f/a-?\d{1,3}|"
    r"c-?\d{1,3}|"
    r"p-?\d{1,3}|"
    r"kc-?\d{1,3}|"
    r"b-?\d{2,3}|"
    r"a-?\d{2,3}|"
    r"su-?\d{1,3}|"
    r"mig-?\d{1,3}|"
    r"an-?\d{1,3}|"
    r"il-?\d{1,3}|"
    r"tu-?\d{1,3}"
    r")\b",
    re.IGNORECASE,
)


FOLLOW_UP_PATTERNS = (
    "why is that",
    "why is it",
    "why does that matter",
    "why does it matter",
    "what does that mean",
    "what does it mean",
    "how does that work",
    "how does it work",
    "is that dangerous",
    "is it dangerous",
    "what should the pilot do",
    "what should i do",
    "how should a pilot respond",
    "can you explain that",
    "explain that",
    "tell me more",
)


SYSTEM_PROMPT = """
You are Red Scale, an AI Pilot Debrief & Assessment Assistant.

You assist pilots, instructors, analysts, and users of the Red Scale
flight assessment system.

Your role is to explain aviation and flight-assessment concepts clearly
and professionally.

STRICT SCOPE:

1. Answer only aviation, aircraft, flight, pilot, flight-assessment,
   pilot-training, operational, safety, or aviation mission-related
   questions.

2. If a request is unrelated to aviation, do not answer it.

3. If a request mixes aviation with an unrelated topic, answer only the
   aviation portion and decline the unrelated portion.

4. Do not infer that a question is aviation-related merely because it
   contains generic words such as "who", "what", "history", or "mission".

ASSESSMENT RULES:

5. Do not invent flight data.

6. Do not invent SOP violations.

7. Do not invent aircraft specifications.

8. Do not claim that a parameter violated an SOP unless the supplied
   assessment explicitly establishes that violation.

9. The deterministic Red Scale assessment engine is authoritative for:
   risk score, overall rating, features, and violations.

10. Never modify or override an assessment result.

11. If the user asks about a specific flight but no flight assessment
    data has been provided in the conversation, clearly say that you
    do not have that flight data.

12. Do not invent aircraft type, pilot identity, mission type, weather,
    or operational circumstances.

13. Keep answers concise, professional, and useful.

14. This assistant is an explanatory interface, not a replacement for
    qualified aviation personnel, official SOPs, manuals, or operational
    procedures.

15. Never fabricate evidence.
""".strip()


def _has_aviation_context(text: str) -> bool:
    """
    Return True when the supplied text contains clear aviation context.
    """

    normalized = text.lower()

    if any(term in normalized for term in AVIATION_TERMS):
        return True

    if any(
        manufacturer in normalized
        for manufacturer in AVIATION_MANUFACTURERS
    ):
        return True

    return AIRCRAFT_PATTERN.search(normalized) is not None


def _is_contextual_follow_up(
    message: str,
    history: list[dict] | None = None,
) -> bool:
    """
    Allow short follow-up questions when the recent conversation
    is already clearly aviation-related.
    """

    if not history:
        return False

    normalized = " ".join(message.lower().split())

    if len(normalized.split()) > 10:
        return False

    if not any(
        normalized.startswith(pattern)
        for pattern in FOLLOW_UP_PATTERNS
    ):
        return False

    recent_text = " ".join(
        str(turn.get("content", ""))
        for turn in history[-6:]
        if isinstance(turn, dict)
    )

    return _has_aviation_context(recent_text)


def _is_aviation_related(
    message: str,
    history: list[dict] | None = None,
) -> bool:
    """
    Enforce the aviation-only scope before calling Groq.
    """

    if _has_aviation_context(message):
        return True

    return _is_contextual_follow_up(message, history)


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
    Generate a complete aviation-scoped assistant response.
    """

    if not _is_aviation_related(message, history):
        return OFF_TOPIC_RESPONSE

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

    if not _is_aviation_related(message, history):
        yield ("delta", OFF_TOPIC_RESPONSE)
        yield ("done", OFF_TOPIC_RESPONSE)
        return

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