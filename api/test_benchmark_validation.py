from pathlib import Path

from app.services.assessment_service import assess_flight


def print_assessment(label, csv_path):
    print()
    print("=" * 70)
    print(label)
    print("=" * 70)

    assessment = assess_flight(Path(csv_path))

    print(
        f"Benchmark: "
        f"{assessment.benchmark.benchmark_id} "
        f"v{assessment.benchmark.benchmark_version}"
    )

    print()

    for competency in assessment.benchmark.competencies:
        print(f"COMPETENCY: {competency.competency_name}")

        for finding in competency.findings:
            print(
                f"  {finding.behaviour_id}"
                f" | status={finding.status}"
                f" | severity={finding.severity}"
            )

            print(
                f"    {finding.explanation}"
            )

            for evidence in finding.evidence:
                print(
                    f"    - {evidence.metric}: "
                    f"value={evidence.value}, "
                    f"timestamp={evidence.timestamp_sec}"
                )


print_assessment(
    "NORMAL SAMPLE",
    "data/fdr_sample.csv",
)

print_assessment(
    "VIOLATION TEST",
    "fdr_violation_test_v2.csv",
)