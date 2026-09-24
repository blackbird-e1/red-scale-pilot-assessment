import pandas as pd

from app.benchmark.evidence import find_metric_timestamp


def create_test_dataframe():
    return pd.DataFrame(
        {
            "timestamp_sec": [
                0.0,
                10.0,
                20.0,
                30.0,
            ],
            "altitude_ft": [
                1000.0,
                5000.0,
                9000.0,
                7000.0,
            ],
            "indicated_airspeed_knots": [
                100.0,
                150.0,
                220.0,
                180.0,
            ],
            "pitch_deg": [
                2.0,
                8.0,
                12.0,
                -5.0,
            ],
            "bank_angle_deg": [
                2.0,
                10.0,
                35.0,
                5.0,
            ],
            "vertical_speed_fpm": [
                500.0,
                1000.0,
                -500.0,
                -1800.0,
            ],
        }
    )


def test_max_speed_timestamp():
    df = create_test_dataframe()

    timestamp = find_metric_timestamp(
        df,
        "max_speed_knots",
    )

    assert timestamp == 20.0


def test_max_bank_timestamp():
    df = create_test_dataframe()

    timestamp = find_metric_timestamp(
        df,
        "max_bank_angle_deg",
    )

    assert timestamp == 20.0


def test_max_altitude_timestamp():
    df = create_test_dataframe()

    timestamp = find_metric_timestamp(
        df,
        "max_altitude_ft",
    )

    assert timestamp == 20.0


def test_min_pitch_timestamp():
    df = create_test_dataframe()

    timestamp = find_metric_timestamp(
        df,
        "min_pitch_deg",
    )

    assert timestamp == 30.0


def test_max_descent_timestamp():
    df = create_test_dataframe()

    timestamp = find_metric_timestamp(
        df,
        "max_descent_rate_fpm",
    )

    assert timestamp == 30.0