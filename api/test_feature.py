from app.core.parser import parse_fdr
from app.core.features import extract_features


def test_extract_features():
    df = parse_fdr("data/fdr_sample.csv")

    features = extract_features(df)

    assert features is not None
    assert features.duration_sec >= 0
    assert features.max_altitude_ft >= features.min_altitude_ft
    assert features.max_speed_knots >= 0
    assert features.max_bank_angle_deg >= 0
    assert features.max_climb_rate_fpm >= 0
    assert features.max_descent_rate_fpm >= 0