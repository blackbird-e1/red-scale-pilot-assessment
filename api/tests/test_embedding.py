from types import SimpleNamespace
from uuid import uuid4

from app.graph.builder import build_flight_graph
from app.graph.embedding import (
    build_flight_embeddings,
    find_similar_flights,
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


def test_build_flight_embeddings():

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

    graph = build_flight_graph(
        [
            flight_a,
            flight_b,
            flight_c,
        ]
    )

    embeddings = build_flight_embeddings(
        graph
    )

    flight_a_id = f"flight:{flight_a.id}"
    flight_b_id = f"flight:{flight_b.id}"
    flight_c_id = f"flight:{flight_c.id}"

    # Every flight should have an embedding.
    assert flight_a_id in embeddings
    assert flight_b_id in embeddings
    assert flight_c_id in embeddings

    # Every embedding should have the same dimensionality.
    assert (
        embeddings[flight_a_id].shape
        == embeddings[flight_b_id].shape
        == embeddings[flight_c_id].shape
    )


def test_find_similar_flights():

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

    graph = build_flight_graph(
        [
            flight_a,
            flight_b,
            flight_c,
        ]
    )

    embeddings = build_flight_embeddings(
        graph
    )

    flight_a_id = f"flight:{flight_a.id}"
    flight_b_id = f"flight:{flight_b.id}"
    flight_c_id = f"flight:{flight_c.id}"

    results = find_similar_flights(
        embeddings,
        flight_a_id,
        top_k=2,
    )

    assert len(results) == 2

    # The structurally identical flight should
    # be the most similar.
    assert results[0]["flight_id"] == flight_b_id

    assert results[0]["similarity"] > results[1]["similarity"]

    # The unrelated flight should have lower similarity.
    assert results[1]["flight_id"] == flight_c_id