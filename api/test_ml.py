from app.core.ml import predict_risk
import pytest

def test_perfect_benchmark_has_zero_risk():
    risk = predict_risk(
        benchmark_score=1.0,
    )

    assert risk == 0.0


def test_benchmark_score_converts_to_risk():
    risk = predict_risk(
        benchmark_score=0.8,
    )

    assert risk == pytest.approx(20.0)


def test_benchmark_score_point_four_gives_sixty_risk():
    risk = predict_risk(
        benchmark_score=0.4,
    )

    assert risk == 60.0


def test_zero_benchmark_has_maximum_risk():
    risk = predict_risk(
        benchmark_score=0.0,
    )

    assert risk == 100.0


def test_risk_is_capped_at_100():
    risk = predict_risk(
        benchmark_score=-1.0,
    )

    assert risk == 100.0