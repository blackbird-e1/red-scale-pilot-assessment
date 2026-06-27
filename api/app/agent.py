"""
F1 agent — built with the OpenAI Agents SDK.

The agent is given:
  - A system prompt containing the full database schema and tool descriptions
  - Two tools: sql_query, f1_knowledge
  - Autonomy to choose which tool(s) to call, in what order, and how to
    combine results before producing a final natural-language answer.
"""

from agents import Agent, Runner, function_tool, RunConfig, RawResponsesStreamEvent, RunItemStreamEvent
from agents.models.openai_responses import OpenAIResponsesModel

from app.config import settings
from app.tools.sql_query import sql_query, SCHEMA_DESCRIPTION
from app.tools.f1_knowledge import aviation_knowledge

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = f"""
You are Red Scale, an AI Pilot Debrief & Assessment System.

You assist instructors, analysts and pilots by evaluating flight missions.

You have access to two tools.

1. aviation_knowledge
Searches manuals, SOPs, emergency procedures and training documents.

2. sql_query
Queries mission records, pilot assessments and flight logs.

Responsibilities:

• Analyze flight missions
• Compare pilot actions with SOP
• Detect policy violations
• Produce structured mission debriefs
• Recommend training

Never fabricate results.

If knowledge is unavailable, clearly state it.

Prefer aviation_knowledge for manuals.

Prefer sql_query for structured mission records.

When useful, combine both tools.

## Database Schema

{SCHEMA_DESCRIPTION}
""".strip()


# ---------------------------------------------------------------------------
# Tool registration
# ---------------------------------------------------------------------------

_sql_tool = function_tool(sql_query)
_knowledge_tool = function_tool(aviation_knowledge)


# ---------------------------------------------------------------------------
# Agent factory
# ---------------------------------------------------------------------------

def create_agent() -> Agent:
    """Return a configured Red Scale agent."""
    return Agent(
        name="Red Scale",
        instructions=SYSTEM_PROMPT,
        model=OpenAIResponsesModel(
            model=settings.openai_model,
            openai_client=_openai_client(),
        ),
        tools=[_sql_tool, _knowledge_tool],
    )


def _openai_client():
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=settings.openai_api_key)


# ---------------------------------------------------------------------------
# Runner helpers
# ---------------------------------------------------------------------------

async def run_agent(message: str, history: list[dict] | None = None) -> str:
    """
    Run the agent for a single turn and return the final text response.

    Args:
        message: The user's current message.
        history: Optional list of prior turns as {"role": ..., "content": ...} dicts.

    Returns:
        The agent's final answer as a plain string.
    """
    agent = create_agent()
    input_messages = _build_input(message, history)

    result = await Runner.run(
        agent,
        input=input_messages,
        run_config=RunConfig(tracing_disabled=not settings.is_production),
    )
    return str(result.final_output)


async def stream_agent(message: str, history: list[dict] | None = None):
    """
    Stream the agent's response token-by-token.

    Yields:
        Tuples of (event_type, payload) where event_type is one of:
          - "delta": a text token chunk (payload is str)
          - "tool_call": a tool was invoked (payload is tool name str)
          - "done": stream complete (payload is final full text str)
    """
    agent = create_agent()
    input_messages = _build_input(message, history)

    # run_streamed returns RunResultStreaming directly (not a context manager)
    stream = Runner.run_streamed(
        agent,
        input=input_messages,
        run_config=RunConfig(tracing_disabled=not settings.is_production),
    )

    async for event in stream.stream_events():
        if isinstance(event, RawResponsesStreamEvent):
            inner_type = getattr(event.data, "type", None)
            if inner_type == "response.output_text.delta":
                delta = getattr(event.data, "delta", "")
                if delta:
                    yield ("delta", delta)

        elif isinstance(event, RunItemStreamEvent):
            if event.name == "tool_called":
                tool_name = getattr(event.item, "raw_item", None)
                name = getattr(tool_name, "name", "unknown_tool") if tool_name else "unknown_tool"
                yield ("tool_call", name)

    yield ("done", str(stream.final_output))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_input(message: str, history: list[dict] | None) -> list[dict] | str:
    """Construct the input for the Runner from message + optional history."""
    if not history:
        return message

    turns = [{"role": t["role"], "content": t["content"]} for t in history]
    turns.append({"role": "user", "content": message})
    return turns
