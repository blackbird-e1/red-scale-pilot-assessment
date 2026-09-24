from collections import defaultdict

from app.models.assessment_record import AssessmentRecord
from app.models.pilot_dna import PilotDNA, RecurringBehaviour


def _calculate_risk_trend(
    records: list[AssessmentRecord],
) -> str:

    if len(records) < 2:
        return "insufficient_data"

    ordered = sorted(
        records,
        key=lambda record: record.created_at,
    )

    scores = [
        record.risk_score
        for record in ordered
        if record.risk_score is not None
    ]

    if len(scores) < 2:
        return "insufficient_data"

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


def _build_recurring_behaviours(
    records: list[AssessmentRecord],
) -> list[RecurringBehaviour]:

    total_assessments = len(records)

    if total_assessments == 0:
        return []

    behaviour_data = defaultdict(
        lambda: {
            "behaviour_name": "",
            "occurrences": 0,
            "severity": "low",
        }
    )

    for record in records:
        seen_in_assessment = set()

        benchmark = record.benchmark or {}

        for competency in benchmark.get(
            "competencies",
            [],
        ):
            for finding in competency.get(
                "findings",
                [],
            ):
                behaviour_id = finding.get(
                    "behaviour_id"
                )

                if not behaviour_id:
                    continue

                if behaviour_id in seen_in_assessment:
                    continue

                seen_in_assessment.add(behaviour_id)

                data = behaviour_data[behaviour_id]

                data["behaviour_name"] = finding.get(
                    "behaviour_name",
                    behaviour_id,
                )

                data["occurrences"] += 1

                severity = finding.get(
                    "severity",
                    "low",
                )

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

    for behaviour_id, data in behaviour_data.items():

        occurrences = data["occurrences"]

        if occurrences < 2:
            continue

        percentage = (
            occurrences / total_assessments
        ) * 100

        recurring.append(
            RecurringBehaviour(
                behaviour_id=behaviour_id,
                behaviour_name=data["behaviour_name"],
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


def _build_strengths(
    risk_trend: str,
    recurring_behaviours: list[RecurringBehaviour],
) -> list[str]:

    strengths = []

    if risk_trend == "improving":
        strengths.append(
            "Overall risk performance is improving."
        )

    elif risk_trend == "stable":
        strengths.append(
            "Risk performance is consistent."
        )

    if not recurring_behaviours:
        strengths.append(
            "No recurring behaviour patterns identified."
        )

    return strengths


def _build_weaknesses(
    recurring_behaviours: list[RecurringBehaviour],
) -> list[str]:

    return [
        behaviour.behaviour_name
        for behaviour in recurring_behaviours
    ]


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
        if record.risk_score is not None
    ]

    latest = ordered[-1]

    risk_trend = _calculate_risk_trend(
        ordered
    )

    recurring_behaviours = _build_recurring_behaviours(
        ordered
    )

    strengths = _build_strengths(
        risk_trend,
        recurring_behaviours,
    )

    weaknesses = _build_weaknesses(
        recurring_behaviours,
    )

    latest_risk = (
        round(latest.risk_score, 2)
        if latest.risk_score is not None
        else None
    )

    average_risk = (
        round(
            sum(risk_scores) / len(risk_scores),
            2,
        )
        if risk_scores
        else None
    )

    return PilotDNA(
        pilot_id=latest.pilot_id,
        assessment_count=len(ordered),
        latest_risk=latest_risk,
        average_risk=average_risk,
        risk_trend=risk_trend,
        risk_history=risk_scores,
        strengths=strengths,
        weaknesses=weaknesses,
        recurring_behaviours=recurring_behaviours,
        latest_assessment_date=latest.created_at,
    )