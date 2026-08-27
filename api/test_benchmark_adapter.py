from app.core.benchmark_adapter import (
    evaluate_benchmark,
    benchmark_violations,
)
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


def test_benchmark_engine_evaluates_flight():
    features = make_features()

    result = evaluate_benchmark(features)

    assert result is not None
    assert 0.0 <= result.score <= 1.0

    assert "max_speed_knots" in result.metrics
    assert "max_bank_angle_deg" in result.metrics
    assert "max_descent_rate_fpm" in result.metrics
    assert "avg_throttle_percent" in result.metrics


def test_safe_flight_has_no_benchmark_violations():
    features = make_features()

    violations = benchmark_violations(features)

    assert violations == []