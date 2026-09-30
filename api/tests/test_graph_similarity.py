from types import SimpleNamespace
from uuid import uuid4

from app.services.graph_similarity import (
    find_similar_assessments,
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


def test_find_similar_assessments():

    pilot_id = uuid4()

    # Flight A:
    # OB-4.1 + OB-4.2
    flight_a = make_record(
        pilot_id,
        ["OB-4.1", "OB-4.2"],
        "OB-4",
    )

    # Flight B:
    # Same graph structure as Flight A.
    flight_b = make_record(
        pilot_id,
        ["OB-4.1", "OB-4.2"],
        "OB-4",
    )

    # Flight C:
    # Different graph structure.
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

    results = find_similar_assessments(
        records=records,
        assessment_id=flight_a.id,
        top_k=2,
    )

    assert len(results) == 2

    # Flight B should be the most similar
    # because it has the same competency/finding
    # structure as Flight A.
    assert results[0]["flight_id"] == (
        f"flight:{flight_b.id}"
    )

    # The similarity should be a valid cosine
    # similarity value.
    assert 0.0 <= results[0]["similarity"] <= 1.0

    assert 0.0 <= results[1]["similarity"] <= 1.0

    # The structurally different flight should
    # have lower similarity.
    assert (
        results[0]["similarity"]
        > results[1]["similarity"]
    )


def test_unknown_assessment():

    pilot_id = uuid4()

    flight = make_record(
        pilot_id,
        ["OB-4.1"],
        "OB-4",
    )

    try:
        find_similar_assessments(
            records=[flight],
            assessment_id=uuid4(),
        )
    except ValueError as exc:
        assert "Unknown flight" in str(exc)
    else:
        raise AssertionError(
            "Expected ValueError for unknown assessment"
        )