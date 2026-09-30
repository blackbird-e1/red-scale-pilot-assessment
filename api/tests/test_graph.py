from types import SimpleNamespace
from uuid import uuid4

from app.graph.builder import build_flight_graph


def test_build_flight_graph():

    pilot_id = uuid4()
    assessment_id = uuid4()

    record = SimpleNamespace(
        id=assessment_id,
        pilot_id=pilot_id,
        benchmark={
            "benchmark_id": "red-scale-icao-cbta",
            "benchmark_version": "0.3.1",
            "competencies": [
                {
                    "competency_id": "OB-4",
                    "competency_name": "Application of Procedures",
                    "findings": [
                        {
                            "behaviour_id": "OB-4.1",
                            "behaviour_name": "Procedure compliance",
                            "status": "deviation",
                            "severity": "medium",
                            "evidence": [],
                            "explanation": "Test finding",
                        }
                    ],
                }
            ],
        },
    )

    graph = build_flight_graph([record])

    pilot_node = f"pilot:{pilot_id}"
    flight_node = f"flight:{assessment_id}"
    assessment_node = f"assessment:{assessment_id}"
    finding_node = (
        f"finding:{assessment_id}:OB-4.1"
    )
    competency_node = "competency:OB-4"

    # Nodes exist
    assert pilot_node in graph
    assert flight_node in graph
    assert assessment_node in graph
    assert finding_node in graph
    assert competency_node in graph

    # Relationships exist
    assert graph.has_edge(
        pilot_node,
        flight_node,
    )

    assert graph.has_edge(
        flight_node,
        assessment_node,
    )

    assert graph.has_edge(
        assessment_node,
        finding_node,
    )

    assert graph.has_edge(
        finding_node,
        competency_node,
    )

    # Relationship labels
    assert graph[pilot_node][flight_node]["relation"] == "performed"

    assert graph[flight_node][assessment_node]["relation"] == "has"

    assert graph[assessment_node][finding_node]["relation"] == "contains"

    assert graph[finding_node][competency_node]["relation"] == "maps_to"