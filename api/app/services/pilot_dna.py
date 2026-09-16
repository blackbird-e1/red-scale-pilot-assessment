from collections import defaultdict

from app.models.assessment_record import AssessmentRecord
from app.models.pilot_dna import PilotDNA, RecurringViolation


def _calculate_risk_trend(records: list[AssessmentRecord]) -> str:
    if len(records) < 2:
        return "insufficient_data"

    ordered = sorted(
        records,
        key=lambda record: record.created_at,
    )

    scores = [record.risk_score for record in ordered]

    midpoint = len(scores) // 2

    first_half = scores[:midpoint]
    second_half = scores[midpoint:]

    first_average = sum(first_half) / len(first_half)
    second_average = sum(second_half) / len(second_half)

    difference = second_average - first_average

    if difference >= 5:
        return "deteriorating"

    if difference <= -5:
        return "improving"

    return "stable"


def _build_recurring_violations(
    records: list[AssessmentRecord],
) -> list[RecurringViolation]:
    total_assessments = len(records)

    if total_assessments == 0:
        return []

    violation_data = defaultdict(
        lambda: {
            "rule_name": "",
            "occurrences": 0,
            "severity": "low",
        }
    )

    for record in records:
        seen_in_assessment = set()

        for violation in record.violations:
            rule_id = violation.get("rule_id")

            if not rule_id:
                continue

            # Count a violation once per assessment,
            # even if it appears multiple times in the same record.
            if rule_id in seen_in_assessment:
                continue

            seen_in_assessment.add(rule_id)

            data = violation_data[rule_id]

            data["rule_name"] = violation.get(
                "rule_name",
                rule_id,
            )

            data["occurrences"] += 1

            severity = violation.get("severity", "low")

            severity_order = {
                "low": 1,
                "medium": 2,
                "high": 3,
                "critical": 4,
            }

            if severity_order.get(
                severity,
                1,
            ) > severity_order.get(
                data["severity"],
                1,
            ):
                data["severity"] = severity

    recurring = []

    for rule_id, data in violation_data.items():
        occurrences = data["occurrences"]

        if occurrences < 2:
            continue

        percentage = (
            occurrences / total_assessments
        ) * 100

        recurring.append(
            RecurringViolation(
                rule_id=rule_id,
                rule_name=data["rule_name"],
                occurrences=occurrences,
                total_assessments=total_assessments,
                severity=data["severity"],
                percentage=round(percentage, 2),
            )
        )

    recurring.sort(
        key=lambda item: item.occurrences,
        reverse=True,
    )

    return recurring


def build_pilot_dna(
    records: list[AssessmentRecord],
) -> PilotDNA:
    if not records:
        raise ValueError(
            "Cannot build Pilot DNA without assessments."
        )

    ordered = sorted(
        records,
        key=lambda record: record.created_at,
    )

    risk_scores = [
        record.risk_score
        for record in ordered
    ]

    latest = ordered[-1]

    return PilotDNA(
        pilot_id=latest.pilot_id,
        assessment_count=len(ordered),
        latest_risk=latest.risk_score,
        average_risk=round(
            sum(risk_scores) / len(risk_scores),
            2,
        ),
        risk_trend=_calculate_risk_trend(ordered),
        strengths=[],
        weaknesses=[],
        recurring_violations=_build_recurring_violations(
            ordered
        ),
        latest_assessment_date=latest.created_at,
    )