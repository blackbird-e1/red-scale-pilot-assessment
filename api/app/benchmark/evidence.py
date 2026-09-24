import pandas as pd


def find_metric_timestamp(
    df: pd.DataFrame,
    metric: str,
) -> float | None:
    if df.empty:
        return None

    metric_mapping = {
        "max_altitude_ft": ("altitude_ft", "max"),
        "min_altitude_ft": ("altitude_ft", "min"),
        "max_speed_knots": (
            "indicated_airspeed_knots",
            "max",
        ),
        "max_pitch_deg": ("pitch_deg", "max"),
        "min_pitch_deg": ("pitch_deg", "min"),
        "max_bank_angle_deg": ("bank_angle_deg", "max"),
        "max_climb_rate_fpm": (
            "vertical_speed_fpm",
            "max",
        ),
        "max_descent_rate_fpm": (
            "vertical_speed_fpm",
            "min",
        ),
    }

    if metric not in metric_mapping:
        return None

    column, operation = metric_mapping[metric]

    if column not in df.columns:
        return None

    if operation == "max":
        index = df[column].idxmax()
    else:
        index = df[column].idxmin()

    return float(df.loc[index, "timestamp_sec"])