from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.services.graph_similarity_service import (
    find_similar_assessments_for_pilot,
)


def make_record(
    pilot_id,
    behaviour_ids,
    competency_id,
):
    findings = [
        {
            "behaviour_id": behaviour_id,
            "behaviour_name": behaviour_id,
            "status": "deviation",
            "severity": "medium",
            "evidence": [],
            "explanation": "Test finding",
        }
        for behaviour_id in behaviour_ids
    ]

    return SimpleNamespace(
        id=uuid4(),
        pilot_id=pilot_id,
        created_at=None,
        benchmark={
            "benchmark_id": "red-scale-icao-cbta",
            "benchmark_version": "0.3.1",
            "competencies": [
                {
                    "competency_id": competency_id,
                    "competency_name": competency_id,
                    "findings": findings,
                }
            ],
        },
    )


@pytest.mark.asyncio
async def test_find_similar_assessments_for_pilot():

    pilot_id = uuid4()

    flight_a = make_record(
        pilot_id,
        ["OB-4.1", "OB-4.2"],
        "OB-4",
    )

    flight_b = make_record(
        pilot_id,
        ["OB-4.1", "OB-4.2"],
        "OB-4",
    )

    flight_c = make_record(
        pilot_id,
        ["OB-5.1"],
        "OB-5",
    )

    records = [
        flight_a,
        flight_b,
        flight_c,
    ]

    db = SimpleNamespace()

    result = SimpleNamespace(
        scalars=lambda: SimpleNamespace(
            all=lambda: records
        )
    )

    db.execute = AsyncMock(
        return_value=result
    )

    results = await find_similar_assessments_for_pilot(
        db=db,
        pilot_id=pilot_id,
        assessment_id=flight_a.id,
        top_k=2,
    )

    assert len(results) == 2

    assert results[0]["flight_id"] == (
        f"flight:{flight_b.id}"
    )

    assert (
        results[0]["similarity"]
        > results[1]["similarity"]
    )


@pytest.mark.asyncio
async def test_assessment_must_belong_to_pilot():

    pilot_id = uuid4()
    other_pilot_id = uuid4()

    flight = make_record(
        pilot_id,
        ["OB-4.1"],
        "OB-4",
    )

    db = SimpleNamespace()

    # Simulate the database WHERE pilot_id = other_pilot_id
    # returning no records.
    result = SimpleNamespace(
        scalars=lambda: SimpleNamespace(
            all=lambda: []
        )
    )

    db.execute = AsyncMock(
        return_value=result
    )

    with pytest.raises(
        ValueError,
        match="No assessments found for this pilot",
    ):
        await find_similar_assessments_for_pilot(
            db=db,
            pilot_id=other_pilot_id,
            assessment_id=flight.id,
            top_k=3,
        )