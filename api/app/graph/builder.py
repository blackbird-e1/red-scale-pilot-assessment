import networkx as nx


def build_flight_graph(records):
    """
    Build a lightweight aviation performance graph
    from Red Scale assessment records.

    Graph structure:

        Pilot
          ↓ performed
        Flight
          ↓ has
        Assessment
          ↓ contains
        Finding
          ↓ maps_to
        Competency
    """

    graph = nx.DiGraph()

    for record in records:

        pilot_id = f"pilot:{record.pilot_id}"
        flight_id = f"flight:{record.id}"
        assessment_id = f"assessment:{record.id}"

        # -----------------------------------------------------
        # Pilot
        # -----------------------------------------------------

        graph.add_node(
            pilot_id,
            node_type="pilot",
        )

        # -----------------------------------------------------
        # Flight
        # -----------------------------------------------------

        graph.add_node(
            flight_id,
            node_type="flight",
        )

        # -----------------------------------------------------
        # Assessment
        # -----------------------------------------------------

        graph.add_node(
            assessment_id,
            node_type="assessment",
        )

        # Pilot → Flight
        graph.add_edge(
            pilot_id,
            flight_id,
            relation="performed",
        )

        # Flight → Assessment
        graph.add_edge(
            flight_id,
            assessment_id,
            relation="has",
        )

        # -----------------------------------------------------
        # Benchmark findings
        # -----------------------------------------------------

        benchmark = record.benchmark or {}

        for competency in benchmark.get(
            "competencies",
            [],
        ):

            competency_id = competency.get(
                "competency_id"
            )

            if not competency_id:
                continue

            competency_node = (
                f"competency:{competency_id}"
            )

            graph.add_node(
                competency_node,
                node_type="competency",
                name=competency.get(
                    "competency_name",
                    competency_id,
                ),
            )

            for finding in competency.get(
                "findings",
                [],
            ):

                behaviour_id = finding.get(
                    "behaviour_id"
                )

                if not behaviour_id:
                    continue

                finding_node = (
                    f"finding:{record.id}:{behaviour_id}"
                )

                graph.add_node(
                    finding_node,
                    node_type="finding",
                    behaviour_id=behaviour_id,
                    name=finding.get(
                        "behaviour_name",
                        behaviour_id,
                    ),
                    status=finding.get(
                        "status"
                    ),
                    severity=finding.get(
                        "severity"
                    ),
                )

                # Assessment → Finding
                graph.add_edge(
                    assessment_id,
                    finding_node,
                    relation="contains",
                )

                # Finding → Competency
                graph.add_edge(
                    finding_node,
                    competency_node,
                    relation="maps_to",
                )

    return graph