from app.graph.builder import build_flight_graph
from app.graph.embedding import (
    build_flight_embeddings,
    find_similar_flights,
)


def find_similar_assessments(
    records,
    assessment_id,
    top_k=3,
):
    graph = build_flight_graph(records)

    embeddings = build_flight_embeddings(
        graph
    )

    flight_id = f"flight:{assessment_id}"

    return find_similar_flights(
        embeddings,
        flight_id,
        top_k=top_k,
    )