from app.benchmark.models import (
    BehaviourFinding,
    EvidenceItem,
)


def evaluate_bank_management(features) -> BehaviourFinding:
    value = features.max_bank_angle_deg

    return BehaviourFinding(
        behaviour_id="bank_management",
        behaviour_name="Bank Management",
        status="observed",
        severity="medium",
        evidence=[
            EvidenceItem(
                metric="max_bank_angle_deg",
                value=value,
            )
        ],
        explanation=(
            f"Maximum recorded bank angle was {value} degrees."
        ),
    )


def evaluate_airspeed_control(features) -> BehaviourFinding:
    value = features.max_speed_knots

    return BehaviourFinding(
        behaviour_id="airspeed_control",
        behaviour_name="Airspeed Control",
        status="observed",
        severity="medium",
        evidence=[
            EvidenceItem(
                metric="max_speed_knots",
                value=value,
            )
        ],
        explanation=(
            f"Maximum recorded airspeed was {value} knots."
        ),
    )


def evaluate_altitude_management(features) -> BehaviourFinding:
    max_value = features.max_altitude_ft
    min_value = features.min_altitude_ft

    return BehaviourFinding(
        behaviour_id="altitude_management",
        behaviour_name="Altitude Management",
        status="observed",
        severity="medium",
        evidence=[
            EvidenceItem(
                metric="max_altitude_ft",
                value=max_value,
            ),
            EvidenceItem(
                metric="min_altitude_ft",
                value=min_value,
            ),
        ],
        explanation=(
            f"Recorded altitude range was "
            f"{min_value} to {max_value} feet."
        ),
    )


def evaluate_descent_management(features) -> BehaviourFinding:
    value = features.max_descent_rate_fpm

    return BehaviourFinding(
        behaviour_id="descent_management",
        behaviour_name="Descent Management",
        status="observed",
        severity="medium",
        evidence=[
            EvidenceItem(
                metric="max_descent_rate_fpm",
                value=value,
            )
        ],
        explanation=(
            f"Maximum recorded descent rate was "
            f"{value} feet per minute."
        ),
    )

from app.benchmark.models import (
    BehaviourFinding,
    BenchmarkAssessment,
    CompetencyFinding,
    EvidenceItem,
)


def evaluate_benchmark(features) -> BenchmarkAssessment:
    findings = [
        evaluate_bank_management(features),
        evaluate_airspeed_control(features),
        evaluate_altitude_management(features),
        evaluate_descent_management(features),
    ]

    competency = CompetencyFinding(
        competency_id="flight_path_management_manual",
        competency_name=(
            "Aircraft Flight Path Management - Manual Control"
        ),
        findings=findings,
    )

    return BenchmarkAssessment(
        benchmark_id="red-scale-icao-cbta",
        benchmark_version="0.1.0",
        competencies=[competency],
    )