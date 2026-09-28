from pathlib import Path

import pandas as pd

from app.tornado.schemas import (
    TornadoFlight,
    TornadoReferencePoint,
    TornadoTelemetryPoint,
)


def load_tornado_flight(
    telemetry_csv: Path,
    reference_csv: Path,
    flight_id: str,
) -> TornadoFlight:
    telemetry_df = pd.read_csv(telemetry_csv)
    reference_df = pd.read_csv(reference_csv)

    required_telemetry = [
        "elapsed_time",
        "drone_x",
        "drone_y",
        "drone_z",
        "drone_velocity_linear_x",
        "drone_velocity_linear_y",
        "drone_velocity_linear_z",
        "drone_roll",
        "drone_pitch",
        "drone_yaw",
        "drone_velocity_angular_x",
        "drone_velocity_angular_y",
        "drone_velocity_angular_z",
        "channels_roll",
        "channels_pitch",
        "channels_thrust",
        "channels_yaw",
    ]

    required_reference = [
        "timestamp",
        "pose_position_x",
        "pose_position_y",
        "pose_position_z",
    ]

    missing_telemetry = [
        column
        for column in required_telemetry
        if column not in telemetry_df.columns
    ]

    if missing_telemetry:
        raise ValueError(
            "Missing required telemetry columns: "
            + ", ".join(missing_telemetry)
        )

    missing_reference = [
        column
        for column in required_reference
        if column not in reference_df.columns
    ]

    if missing_reference:
        raise ValueError(
            "Missing required reference columns: "
            + ", ".join(missing_reference)
        )

    telemetry_df = telemetry_df.sort_values("elapsed_time")
    required_reference = [
        "timestamp",
        "pose_position_x",
        "pose_position_y",
        "pose_position_z",
    ]

    telemetry = [
        TornadoTelemetryPoint(
            timestamp_sec=float(row.elapsed_time),
            position_x_m=float(row.drone_x),
            position_y_m=float(row.drone_y),
            position_z_m=float(row.drone_z),
            velocity_x_ms=float(row.drone_velocity_linear_x),
            velocity_y_ms=float(row.drone_velocity_linear_y),
            velocity_z_ms=float(row.drone_velocity_linear_z),
            roll_deg=float(row.drone_roll) * 180.0 / 3.141592653589793,
            pitch_deg=float(row.drone_pitch) * 180.0 / 3.141592653589793,
            yaw_deg=float(row.drone_yaw) * 180.0 / 3.141592653589793,
            angular_velocity_x_rads=float(row.drone_velocity_angular_x),
            angular_velocity_y_rads=float(row.drone_velocity_angular_y),
            angular_velocity_z_rads=float(row.drone_velocity_angular_z),
            control_roll=float(row.channels_roll),
            control_pitch=float(row.channels_pitch),
            control_thrust=float(row.channels_thrust),
            control_yaw=float(row.channels_yaw),
        )
        for row in telemetry_df.itertuples(index=False)
    ]

    reference_start_timestamp = float(reference_df["timestamp"].iloc[0])

    reference = [
        TornadoReferencePoint(
            timestamp_sec=(
                float(row.timestamp) - reference_start_timestamp
            ) / 1_000_000.0,
            position_x_m=float(row.pose_position_x),
            position_y_m=float(row.pose_position_y),
            position_z_m=float(row.pose_position_z),
        )
        for row in reference_df.itertuples(index=False)
    ]

    duration_sec = 0.0

    if telemetry:
        duration_sec = telemetry[-1].timestamp_sec - telemetry[0].timestamp_sec

    return TornadoFlight(
        flight_id=flight_id,
        telemetry=telemetry,
        reference=reference,
        duration_sec=max(duration_sec, 0.0),
    )