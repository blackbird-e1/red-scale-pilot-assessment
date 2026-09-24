from app.benchmark.evaluator import (
    evaluate_benchmark,
    evaluate_behaviour,
)
from app.benchmark.registry import (
    BENCHMARK_ID,
    BENCHMARK_VERSION,
    COMPETENCIES,
)
from app.models.flight_features import FlightFeatures


def create_test_features():
    return FlightFeatures(
        duration_sec=600,
        max_speed_knots=180,
        avg_speed_knots=150,
        max_bank_angle_deg=43.2,
        max_pitch_deg=12.0,
        min_pitch_deg=-5.0,
        max_roll_deg=43.2,
        min_roll_deg=-43.2,
        max_descent_rate_fpm=900,
        max_altitude_ft=10000,
        min_altitude_ft=5000,
        max_climb_rate_fpm=1200,
        avg_throttle_percent=60,
    )


def test_benchmark_identity():
    assert BENCHMARK_ID == "red-scale-icao-cbta"
    assert BENCHMARK_VERSION == "0.2.0"


def test_fpm_competency_exists():
    assert "flight_path_management_manual" in COMPETENCIES

    competency = COMPETENCIES[
        "flight_path_management_manual"
    ]

    assert (
        competency["name"]
        == "Aeroplane Flight Path Management - Manual Control"
    )


def test_supported_behaviours():
    competency = COMPETENCIES[
        "flight_path_management_manual"
    ]

    behaviour_ids = set(competency["behaviours"].keys())

    assert behaviour_ids == {
        "manual_flight_path_control",
        "flight_path_deviation_monitoring",
        "attitude_speed_thrust_management",
        "safe_flight_path_management",
    }


def test_behaviours_have_required_definition_fields():
    competency = COMPETENCIES[
        "flight_path_management_manual"
    ]

    for behaviour_id, definition in competency["behaviours"].items():
        assert definition["name"]
        assert definition["description"]
        assert definition["icao_observable_behaviour"]
        assert definition["metrics"]
        assert definition["criteria"]

        assert len(definition["metrics"]) > 0


def test_behaviour_evaluation_produces_evidence():
    features = create_test_features()

    competency = COMPETENCIES[
        "flight_path_management_manual"
    ]

    for behaviour_id, definition in competency["behaviours"].items():
        finding = evaluate_behaviour(
            behaviour_id=behaviour_id,
            definition=definition,
            features=features,
        )

        assert finding.behaviour_id == behaviour_id
        assert finding.behaviour_name == definition["name"]

        assert finding.status == "observed"
        assert finding.severity == "medium"

        assert len(finding.evidence) == len(
            definition["metrics"]
        )


def test_complete_benchmark_assessment():
    features = create_test_features()

    assessment = evaluate_benchmark(features)

    assert assessment.benchmark_id == "red-scale-icao-cbta"
    assert assessment.benchmark_version == "0.2.0"

    assert len(assessment.competencies) == 1

    competency = assessment.competencies[0]

    assert (
        competency.competency_id
        == "flight_path_management_manual"
    )

    assert (
        competency.competency_name
        == "Aeroplane Flight Path Management - Manual Control"
    )

    assert len(competency.findings) == 4

    behaviour_ids = {
        finding.behaviour_id
        for finding in competency.findings
    }

    assert behaviour_ids == {
        "manual_flight_path_control",
        "flight_path_deviation_monitoring",
        "attitude_speed_thrust_management",
        "safe_flight_path_management",
    }


def test_evidence_values_are_preserved():
    features = create_test_features()

    assessment = evaluate_benchmark(features)

    findings = {
        finding.behaviour_id: finding
        for finding in assessment.competencies[0].findings
    }

    manual_control = findings[
        "manual_flight_path_control"
    ]

    evidence = {
        item.metric: item.value
        for item in manual_control.evidence
    }

    assert evidence["max_bank_angle_deg"] == 43.2
    assert evidence["max_pitch_deg"] == 12.0
    assert evidence["min_pitch_deg"] == -5.0