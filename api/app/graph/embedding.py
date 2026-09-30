from collections import defaultdict

import networkx as nx
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def build_flight_embeddings(
    graph: nx.DiGraph,
) -> dict[str, np.ndarray]:
    """
    Build a simple graph-based representation for each flight.

    Each flight is represented by the competency and finding nodes
    connected to its assessment.

    The resulting vectors can be compared to identify
    structurally similar flights.
    """

    flights = [
        node
        for node, data in graph.nodes(data=True)
        if data.get("node_type") == "flight"
    ]

    # Collect all graph concepts associated with flights.
    concepts = set()

    flight_concepts = defaultdict(set)

    for flight_id in flights:

        # Flight -> Assessment
        assessments = [
            target
            for target in graph.successors(flight_id)
            if graph.nodes[target].get("node_type")
            == "assessment"
        ]

        for assessment_id in assessments:

            # Assessment -> Finding
            findings = [
                target
                for target in graph.successors(assessment_id)
                if graph.nodes[target].get("node_type")
                == "finding"
            ]

            for finding_id in findings:

                finding_data = graph.nodes[finding_id]

                behaviour_id = finding_data.get(
                    "behaviour_id"
                )

                if behaviour_id:
                    concept = f"behaviour:{behaviour_id}"
                    concepts.add(concept)
                    flight_concepts[flight_id].add(
                        concept
                    )

                # Finding -> Competency
                competencies = [
                    target
                    for target in graph.successors(
                        finding_id
                    )
                    if graph.nodes[target].get("node_type")
                    == "competency"
                ]

                for competency_id in competencies:
                    concept = competency_id
                    concepts.add(concept)
                    flight_concepts[flight_id].add(
                        concept
                    )

    concepts = sorted(concepts)

    if not concepts:
        return {
            flight_id: np.zeros(0, dtype=float)
            for flight_id in flights
        }

    concept_index = {
        concept: index
        for index, concept in enumerate(concepts)
    }

    embeddings = {}

    for flight_id in flights:

        vector = np.zeros(
            len(concepts),
            dtype=float,
        )

        for concept in flight_concepts[flight_id]:
            vector[concept_index[concept]] = 1.0

        embeddings[flight_id] = vector

    return embeddings


def find_similar_flights(
    embeddings: dict[str, np.ndarray],
    flight_id: str,
    top_k: int = 3,
) -> list[dict]:
    """
    Find flights with the most similar graph representation.
    """

    if flight_id not in embeddings:
        raise ValueError(
            f"Unknown flight: {flight_id}"
        )

    target = embeddings[flight_id]

    if target.size == 0:
        return []

    flight_ids = list(embeddings.keys())

    matrix = np.array(
        [
            embeddings[current_id]
            for current_id in flight_ids
        ]
    )

    similarities = cosine_similarity(
        target.reshape(1, -1),
        matrix,
    )[0]

    results = []

    for current_id, similarity in zip(
        flight_ids,
        similarities,
    ):
        if current_id == flight_id:
            continue

        results.append(
            {
                "flight_id": current_id,
                "similarity": round(
                    float(similarity),
                    4,
                ),
            }
        )

    results.sort(
        key=lambda item: item["similarity"],
        reverse=True,
    )

    return results[:top_k]