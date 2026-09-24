import pandas as pd

from app.benchmark.evidence import find_metric_timestamp
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


STATUS_RANK = {
    "observed": 0,
    "attention": 1,
    "deviation": 2,
}


SEVERITY_BY_STATUS = {
    "observed": "low",
    "attention": "medium",
    "deviation": "high",
}


def _get_metric_value(features, metric: str) -> float:
    return float(getattr(features, metric))


def _evaluate_threshold(
    value: float,
    criterion: dict,
) -> str:
    operator = criterion["operator"]
    attention = criterion["attention"]
    deviation = criterion["deviation"]

    if operator == "max":
        if value > deviation:
            return "deviation"
        if value > attention:
            return "attention"
        return "observed"

    if operator == "min":
        if value < deviation:
            return "deviation"
        if value < attention:
            return "attention"
        return "observed"

    raise ValueError(
        f"Unsupported telemetry criterion operator: {operator}"
    )


def _build_metric_explanation(
    metric: str,
    value: float,
    criterion: dict,
    status: str,
) -> str:
    attention = criterion["attention"]
    deviation = criterion["deviation"]

    if status == "observed":
        return (
            f"{metric}={value:.2f} remains within the defined "
            f"prototype criterion."
        )

    if status == "attention":
        return (
            f"{metric}={value:.2f} crossed the attention threshold "
            f"of {attention:.2f}."
        )

    if status == "deviation":
        return (
            f"{metric}={value:.2f} crossed the deviation threshold "
            f"of {deviation:.2f}."
        )

    raise ValueError(
        f"Unsupported behaviour status: {status}"
    )


def evaluate_behaviour(
    behaviour_id: str,
    definition: dict,
    features,
    evidence_source: pd.DataFrame | None = None,
) -> BehaviourFinding:
    evidence = []
    metric_statuses = []
    metric_explanations = []

    criteria = definition.get("criteria", {})
    criterion_metrics = criteria.get("metrics", {})

    for metric in definition["metrics"]:
        value = _get_metric_value(features, metric)

        criterion = criterion_metrics.get(metric)

        if criterion is None:
            raise ValueError(
                f"No evaluation criterion configured for metric "
                f"'{metric}' in behaviour '{behaviour_id}'."
            )

        status = _evaluate_threshold(
            value=value,
            criterion=criterion,
        )

        metric_statuses.append(status)

        metric_explanations.append(
            _build_metric_explanation(
                metric=metric,
                value=value,
                criterion=criterion,
                status=status,
            )
        )

        timestamp_sec = None

        if evidence_source is not None:
            timestamp_sec = find_metric_timestamp(
                evidence_source,
                metric,
            )

        evidence.append(
            EvidenceItem(
                metric=metric,
                value=value,
                timestamp_sec=timestamp_sec,
            )
        )

    if not metric_statuses:
        status = "observed"
    else:
        status = max(
            metric_statuses,
            key=lambda item: STATUS_RANK[item],
        )

    severity = SEVERITY_BY_STATUS[status]

    explanation = (
        f"{definition['description']} "
        f"Overall status: {status}. "
        + " ".join(metric_explanations)
    )

    return BehaviourFinding(
        behaviour_id=behaviour_id,
        behaviour_name=definition["name"],
        status=status,
        severity=severity,
        evidence=evidence,
        explanation=explanation,
    )


def evaluate_benchmark(
    features,
    evidence_source: pd.DataFrame | None = None,
) -> BenchmarkAssessment:
    competencies = []

    for competency_id, competency in COMPETENCIES.items():
        findings = []

        for behaviour_id, behaviour in competency["behaviours"].items():
            finding = evaluate_behaviour(
                behaviour_id=behaviour_id,
                definition=behaviour,
                features=features,
                evidence_source=evidence_source,
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