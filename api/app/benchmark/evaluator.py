from app.benchmark.models import (
    BehaviourFinding,
    BenchmarkAssessment,
    CompetencyFinding,
    EvidenceItem,
)
from app.benchmark.registry import (
    BENCHMARK_ID,
    BENCHMARK_VERSION,
    COMPETENCIES,
)


def _get_metric_value(features, metric: str) -> float:
    return float(getattr(features, metric))


def evaluate_behaviour(
    behaviour_id: str,
    definition: dict,
    features,
) -> BehaviourFinding:
    evidence = []

    for metric in definition["metrics"]:
        value = _get_metric_value(features, metric)

        evidence.append(
            EvidenceItem(
                metric=metric,
                value=value,
            )
        )

    return BehaviourFinding(
        behaviour_id=behaviour_id,
        behaviour_name=definition["name"],
        status="observed",
        severity="medium",
        evidence=evidence,
        explanation=definition["description"],
    )


def evaluate_benchmark(features) -> BenchmarkAssessment:
    competencies = []

    for competency_id, competency in COMPETENCIES.items():

        findings = []

        for behaviour_id, behaviour in competency["behaviours"].items():
            finding = evaluate_behaviour(
                behaviour_id=behaviour_id,
                definition=behaviour,
                features=features,
            )

            findings.append(finding)

        competencies.append(
            CompetencyFinding(
                competency_id=competency_id,
                competency_name=competency["name"],
                findings=findings,
            )
        )

    return BenchmarkAssessment(
        benchmark_id=BENCHMARK_ID,
        benchmark_version=BENCHMARK_VERSION,
        competencies=competencies,
    )