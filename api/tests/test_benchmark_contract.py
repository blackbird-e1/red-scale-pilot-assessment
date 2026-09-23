from app.benchmark.evaluator import (
    evaluate_bank_management,
    evaluate_airspeed_control,
    evaluate_altitude_management,
    evaluate_descent_management,
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


def test_bank_management_contract():
    features = create_test_features()

    finding = evaluate_bank_management(features)

    assert finding.behaviour_id == "bank_management"
    assert finding.behaviour_name == "Bank Management"

    assert len(finding.evidence) == 1
    assert finding.evidence[0].metric == "max_bank_angle_deg"
    assert finding.evidence[0].value == 43.2


def test_airspeed_control_contract():
    features = create_test_features()

    finding = evaluate_airspeed_control(features)

    assert finding.behaviour_id == "airspeed_control"
    assert finding.behaviour_name == "Airspeed Control"

    assert len(finding.evidence) == 1
    assert finding.evidence[0].metric == "max_speed_knots"
    assert finding.evidence[0].value == 180


def test_altitude_management_contract():
    features = create_test_features()

    finding = evaluate_altitude_management(features)

    assert finding.behaviour_id == "altitude_management"
    assert finding.behaviour_name == "Altitude Management"

    assert len(finding.evidence) == 2

    metrics = {
        evidence.metric: evidence.value
        for evidence in finding.evidence
    }

    assert metrics["max_altitude_ft"] == 10000
    assert metrics["min_altitude_ft"] == 5000


def test_descent_management_contract():
    features = create_test_features()

    finding = evaluate_descent_management(features)

    assert finding.behaviour_id == "descent_management"
    assert finding.behaviour_name == "Descent Management"

    assert len(finding.evidence) == 1
    assert finding.evidence[0].metric == "max_descent_rate_fpm"
    assert finding.evidence[0].value == 900

def test_complete_benchmark_assessment():
    from app.benchmark.evaluator import evaluate_benchmark

    features = create_test_features()

    assessment = evaluate_benchmark(features)

    assert assessment.benchmark_id == "red-scale-icao-cbta"
    assert assessment.benchmark_version == "0.1.0"

    assert len(assessment.competencies) == 1

    competency = assessment.competencies[0]

    assert competency.competency_id == "flight_path_management_manual"

    assert len(competency.findings) == 4

    behaviour_ids = {
        finding.behaviour_id
        for finding in competency.findings
    }

    assert behaviour_ids == {
        "bank_management",
        "airspeed_control",
        "altitude_management",
        "descent_management",
    }