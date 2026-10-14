
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.models.user import UserRole
from app.routers.assessment import delete_assessment


@pytest.fixture
def assessment_delete_setup():
    trainer_id = uuid4()
    other_trainer_id = uuid4()
    trainee_id = uuid4()
    assessment_id = uuid4()

    record = SimpleNamespace(
        id=assessment_id,
        created_by=trainer_id,
    )

    db = SimpleNamespace(
        execute=AsyncMock(
            return_value=SimpleNamespace(
                scalar_one_or_none=lambda: record
            )
        ),
        delete=AsyncMock(),
        commit=AsyncMock(),
    )

    def make_user(role, user_id):
        return SimpleNamespace(id=user_id, role=role)

    return {
        "trainer_id": trainer_id,
        "other_trainer_id": other_trainer_id,
        "trainee_id": trainee_id,
        "assessment_id": assessment_id,
        "record": record,
        "db": db,
        "make_user": make_user,
    }


@pytest.mark.asyncio
async def test_trainer_can_delete_own_assessment(
    assessment_delete_setup,
):
    setup = assessment_delete_setup
    trainer = setup["make_user"](
        UserRole.TRAINER,
        setup["trainer_id"],
    )

    result = await delete_assessment(
        assessment_id=setup["assessment_id"],
        current_user=trainer,
        db=setup["db"],
    )

    assert result is None
    setup["db"].delete.assert_awaited_once_with(setup["record"])
    setup["db"].commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_trainer_cannot_delete_another_trainers_assessment(
    assessment_delete_setup,
):
    setup = assessment_delete_setup
    trainer = setup["make_user"](
        UserRole.TRAINER,
        setup["other_trainer_id"],
    )

    with pytest.raises(HTTPException) as exc:
        await delete_assessment(
            assessment_id=setup["assessment_id"],
            current_user=trainer,
            db=setup["db"],
        )

    assert exc.value.status_code == 403
    setup["db"].delete.assert_not_awaited()
    setup["db"].commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_trainee_cannot_delete_assessment(
    assessment_delete_setup,
):
    setup = assessment_delete_setup
    trainee = setup["make_user"](
        UserRole.TRAINEE,
        setup["trainee_id"],
    )

    with pytest.raises(HTTPException) as exc:
        await delete_assessment(
            assessment_id=setup["assessment_id"],
            current_user=trainee,
            db=setup["db"],
        )

    assert exc.value.status_code == 403
    setup["db"].delete.assert_not_awaited()
    setup["db"].commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_admin_can_delete_another_trainers_assessment(
    assessment_delete_setup,
):
    setup = assessment_delete_setup
    admin = setup["make_user"](
        UserRole.ADMIN,
        uuid4(),
    )

    result = await delete_assessment(
        assessment_id=setup["assessment_id"],
        current_user=admin,
        db=setup["db"],
    )

    assert result is None
    setup["db"].delete.assert_awaited_once_with(setup["record"])
    setup["db"].commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_delete_returns_404_when_assessment_does_not_exist(
    assessment_delete_setup,
):
    setup = assessment_delete_setup
    setup["db"].execute.return_value = SimpleNamespace(
        scalar_one_or_none=lambda: None
    )

    trainer = setup["make_user"](
        UserRole.TRAINER,
        setup["trainer_id"],
    )

    with pytest.raises(HTTPException) as exc:
        await delete_assessment(
            assessment_id=setup["assessment_id"],
            current_user=trainer,
            db=setup["db"],
        )

    assert exc.value.status_code == 404
    setup["db"].delete.assert_not_awaited()
    setup["db"].commit.assert_not_awaited()
