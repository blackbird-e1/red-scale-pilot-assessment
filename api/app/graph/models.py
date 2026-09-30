from dataclasses import dataclass


@dataclass
class GraphNode:
    node_id: str
    node_type: str


@dataclass
class GraphEdge:
    source: str
    target: str
    relation: str