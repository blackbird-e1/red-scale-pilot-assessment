from app.core.benchmark_adapter import benchmark_assessment
from app.models.flight_features import FlightFeatures


def make_features() -> FlightFeatures:
    return FlightFeatures(
        duration_sec=600.0,
        max_altitude_ft=10000.0,
        min_altitude_ft=5000.0,
        max_speed_knots=220.0,
        avg_speed_knots=200.0,
        max_pitch_deg=10.0,
        min_pitch_deg=-5.0,
        max_roll_deg=20.0,
        min_roll_deg=-20.0,
        max_bank_angle_deg=20.0,
        max_climb_rate_fpm=1000.0,
        max_descent_rate_fpm=1000.0,
        avg_throttle_percent=50.0,
    )


def test_benchmark_adapter_returns_assessment():
    features = make_features()

    result = benchmark_assessment(features)

    assert result is not None
    assert result.benchmark_id == "red-scale-icao-cbta"
    assert result.benchmark_version == "0.2.0"


def test_benchmark_adapter_returns_fpm_competency():
    features = make_features()

    result = benchmark_assessment(features)

    assert len(result.competencies) == 1

    competency = result.competencies[0]

    assert (
        competency.competency_id
        == "flight_path_management_manual"
    )

    assert len(competency.findings) == 4


def test_benchmark_adapter_returns_new_behaviours():
    features = make_features()

    result = benchmark_assessment(features)

    competency = result.competencies[0]

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


def test_benchmark_adapter_preserves_evidence():
    features = make_features()

    result = benchmark_assessment(features)

    competency = result.competencies[0]

    findings = {
        finding.behaviour_id: finding
        for finding in competency.findings
    }

    manual_control = findings[
        "manual_flight_path_control"
    ]

    evidence = {
        item.metric: item.value
        for item in manual_control.evidence
    }

    assert evidence["max_bank_angle_deg"] == 20.0
    assert evidence["max_pitch_deg"] == 10.0
    assert evidence["min_pitch_deg"] == -5.0