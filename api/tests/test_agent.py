import pytest

from sqlalchemy import select

from app.agent import run_agent
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.agent import _is_aviation_related

async def get_test_user(db):
    result = await db.execute(
        select(User)
        .where(User.role == UserRole.TRAINEE)
        .limit(1)
    )

    user = result.scalar_one_or_none()

    assert user is not None, (
        "No trainee user exists in the database."
    )

    return user


@pytest.mark.asyncio(loop_scope="module")
async def test_agent_replay_investigation():
    """
    Verify that the agent can investigate a recorded event
    from the most recent assessment using replay evidence.
    """

    question = (
        "What happened around the recorded event in my most recent assessment?"
    )

    async with AsyncSessionLocal() as db:
        current_user = await get_test_user(db)

        answer = await run_agent(
            message=question,
            history=None,
            db=db,
            current_user=current_user,
        )

    assert answer
    assert len(answer.strip()) > 0

    lowered = answer.lower()

    print("\n--- REPLAY AGENT ANSWER ---")
    print(answer)
    print("--- END REPLAY AGENT ANSWER ---\n")

    assert (
        "replay" in lowered
        or "event" in lowered
        or "telemetry" in lowered
        or "flight" in lowered
        or "assessment" in lowered
        or "evidence" in lowered
    )


@pytest.mark.asyncio(loop_scope="module")
async def test_agent_specific_finding():
    """
    Verify that the agent investigates a specific
    assessment finding rather than refusing or inventing one.
    """

    question = "Why was the bank-angle finding recorded?"

    async with AsyncSessionLocal() as db:
        current_user = await get_test_user(db)

        answer = await run_agent(
            message=question,
            history=None,
            db=db,
            current_user=current_user,
        )

    assert answer
    assert len(answer.strip()) > 0

    lowered = answer.lower()

    assert (
        "assessment" in lowered
        or "finding" in lowered
        or "bank" in lowered
        or "evidence" in lowered
    )

    assert any(
        phrase in lowered
        for phrase in (
            "no finding",
            "no findings",
            "no deterministic",
            "not recorded",
            "not found",
            "no evidence",
            "does not contain",
            "doesn't contain",
            "does not include",
            "doesn't include",
            "no bank-angle",
            "no bank angle",
            "did not flag",
            "didn't flag",
            "no competency or behaviour findings",
        )
    )

@pytest.mark.asyncio(loop_scope="module")
async def test_agent_longitudinal_debrief():
    """
    Verify that the agent can answer a longitudinal
    performance-comparison question using Red Scale data.
    """

    question = (
        "Why did my performance deteriorate on my latest flight "
        "compared with my previous flights?"
    )

    async with AsyncSessionLocal() as db:
        current_user = await get_test_user(db)

        answer = await run_agent(
            message=question,
            history=None,
            db=db,
            current_user=current_user,
        )

    assert answer
    assert len(answer.strip()) > 0

    lowered = answer.lower()

    print("\n--- LONGITUDINAL AGENT ANSWER ---")
    print(answer)
    print("--- END LONGITUDINAL AGENT ANSWER ---\n")

    # The response should be grounded in assessment,
    # flight, findings, or evidence.
    assert (
        "assessment" in lowered
        or "flight" in lowered
        or "findings" in lowered
        or "evidence" in lowered
    )

    # The agent must not invent a deterioration finding
    # when the deterministic assessment does not establish one.
    assert any(
        phrase in lowered
        for phrase in (
            "no finding",
            "no findings",
            "no deterministic",
            "not identify",
            "does not identify",
            "not supported",
            "no evidence",
            "no specific",
        )
    )


@pytest.mark.asyncio(loop_scope="module")
async def test_agent_latest_findings():
    """
    Verify that the agent can retrieve and report findings
    from the user's most recent assessment without inventing them.
    """

    question = "What findings were recorded on my latest flight?"

    async with AsyncSessionLocal() as db:
        current_user = await get_test_user(db)

        answer = await run_agent(
            message=question,
            history=None,
            db=db,
            current_user=current_user,
        )

    assert answer
    assert len(answer.strip()) > 0

    lowered = answer.lower()

    print("\n--- LATEST FINDINGS AGENT ANSWER ---")
    print(answer)
    print("--- END LATEST FINDINGS AGENT ANSWER ---\n")

    # The response should be grounded in the assessment
    # and/or its findings/evidence.
    assert (
        "assessment" in lowered
        or "finding" in lowered
        or "flight" in lowered
        or "evidence" in lowered
    )

    # The agent must explicitly handle the case where
    # the deterministic benchmark contains no findings.
    assert any(
        phrase in lowered
        for phrase in (
            "no finding",
            "no findings",
            "no deterministic",
            "findings list is empty",
            "findings list",
            "not recorded",
            "none were recorded",
            "no recorded",
        )
    )

@pytest.mark.asyncio
async def test_agent_rejects_off_topic_question():
    answer = await run_agent(
        message="What is the best programming language?",
        history=None,
        db=None,
        current_user=None,
    )

    assert answer == (
        "I can only help with aviation, flight assessment, pilot training, "
        "aircraft operations, or mission-related questions."
    )

def test_contextual_follow_up_is_recognized_as_aviation():
    history = [
        {
            "role": "user",
            "content": "What findings were recorded on my latest flight?",
        },
        {
            "role": "assistant",
            "content": "The assessment recorded a bank-angle finding.",
        },
    ]

    assert _is_aviation_related(
        "Why was that recorded?",
        history,
    )

def test_ambiguous_follow_up_without_aviation_context_is_rejected():
    history = [
        {
            "role": "user",
            "content": "What is Python?",
        },
        {
            "role": "assistant",
            "content": "Python is a programming language.",
        },
    ]

    assert not _is_aviation_related(
        "Why is that?",
        history,
    )