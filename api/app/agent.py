"""
Red Scale conversational assistant.

The assistant uses LangGraph + Groq for aviation and
flight-assessment questions.

Critical flight assessment decisions are NOT made here.
Those remain the responsibility of the deterministic
assessment engine and debrief service.
"""

import re
from typing import AsyncGenerator

from langchain.agents import create_agent
from langchain_groq import ChatGroq

from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.tools.red_scale_tools import build_red_scale_tools

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
    "red scale",
    "assessment evidence",
    "assessment finding",
    "assessment findings",
    "competency finding",
    "competency findings",
    "behaviour finding",
    "behaviour findings",
    "flight evidence",
    "flight finding",
    "pilot dna",
    "debrief",
    "replay",
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

ASSESSMENT RULES:

4. Never invent flight data.

5. Never invent assessment findings or evidence.

6. Never invent aircraft specifications.

7. Never claim that a parameter violated an SOP unless the supplied
   assessment explicitly establishes that violation.

8. The deterministic Red Scale assessment engine is authoritative for:
   flight features, competency findings, behaviour findings, evidence,
   and benchmark results.

9. Never modify or override an assessment result.

10. If required flight data is unavailable, clearly say so.

11. Never invent aircraft type, pilot identity, mission type, weather,
    or operational circumstances.

12. Keep answers concise, professional, and useful.

13. This assistant is an explanatory interface, not a replacement for
    qualified aviation personnel, official SOPs, manuals, or operational
    procedures.

14. Never fabricate evidence.

IMPORTANT AGENT BEHAVIOUR:

You have access to Red Scale tools.

Use a tool when the user's question requires specific Red Scale
assessment data.

Do not guess data that could have been retrieved from a tool.

When a tool returns assessment data, treat that data as authoritative.

Explain conclusions using the retrieved evidence.

Never modify data through a tool.
""".strip()


def _has_aviation_context(text: str) -> bool:
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

    if _has_aviation_context(message):
        return True

    return _is_contextual_follow_up(message, history)


# ---------------------------------------------------------------------------
# FIRST RED SCALE TOOL
# ---------------------------------------------------------------------------

def _build_agent(
    db: AsyncSession,
    current_user: User,
):
    """
    Build a Red Scale agent with authenticated, read-only tools.
    """

    model = ChatGroq(
        model=settings.groq_model,
        api_key=settings.groq_api_key,
        temperature=0.2,
    )

    tools = build_red_scale_tools(
        db=db,
        current_user=current_user,
    )

    return create_agent(
        model=model,
        tools=tools,
        system_prompt=SYSTEM_PROMPT,
    )



def _build_messages(
    message: str,
    history: list[dict] | None = None,
) -> list[dict]:

    messages: list[dict] = []

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


async def run_agent(
    message: str,
    history: list[dict] | None,
    db: AsyncSession,
    current_user: User,
) -> str:

    if not _is_aviation_related(message, history):
        return OFF_TOPIC_RESPONSE

    agent = _build_agent(
        db=db,
        current_user=current_user,
    )

    result = await agent.ainvoke(
        {
            "messages": _build_messages(
                message,
                history,
            )
        }
    )

    messages = result.get("messages", [])

    if not messages:
        raise RuntimeError(
            "LangGraph agent returned no messages."
        )

    final_message = messages[-1]

    content = final_message.content

    if not content:
        raise RuntimeError(
            "LangGraph agent returned an empty response."
        )

    return content


async def stream_agent(
    message: str,
    history: list[dict] | None,
    db: AsyncSession,
    current_user: User,
) -> AsyncGenerator[tuple[str, str], None]:

    if not _is_aviation_related(message, history):
        yield ("delta", OFF_TOPIC_RESPONSE)
        yield ("done", OFF_TOPIC_RESPONSE)
        return

    agent = _build_agent(
        db=db,
        current_user=current_user,
    )

    full_response = ""

    async for event in agent.astream_events(
        {
            "messages": _build_messages(
                message,
                history,
            )
        },
        version="v2",
    ):

        event_type = event.get("event")

        if event_type == "on_chat_model_stream":

            chunk = event.get("data", {}).get("chunk")

            if chunk is None:
                continue

            content = chunk.content

            if not content:
                continue

            if isinstance(content, list):
                text_parts = []

                for item in content:
                    if isinstance(item, str):
                        text_parts.append(item)
                    elif isinstance(item, dict):
                        text_value = item.get("text")

                        if text_value:
                            text_parts.append(text_value)

                delta = "".join(text_parts)

            else:
                delta = str(content)

            if not delta:
                continue

            full_response += delta

            yield ("delta", delta)

        elif event_type == "on_tool_start":

            tool_name = event.get("name", "")

            yield ("tool_call", tool_name)

    yield ("done", full_response)