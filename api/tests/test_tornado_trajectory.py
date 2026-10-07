import pytest

from app.tornado.evaluator import build_trajectory_series
from app.tornado.schemas import TornadoFlight
from app.tornado.schemas import TornadoReferencePoint
from app.tornado.schemas import TornadoTelemetryPoint
from app.tornado.examples import EXAMPLE_FLIGHTS
from app.tornado.service import assess_tornado_flight

def create_test_flight() -> TornadoFlight:
    telemetry = [
        TornadoTelemetryPoint(
            timestamp_sec=0.0,
            position_x_m=0.0,
            position_y_m=0.0,
            position_z_m=0.0,
            velocity_x_ms=10.0,
            velocity_y_ms=0.0,
            velocity_z_ms=0.0,
            roll_deg=0.0,
            pitch_deg=0.0,
            yaw_deg=0.0,
            angular_velocity_x_rads=0.0,
            angular_velocity_y_rads=0.0,
            angular_velocity_z_rads=0.0,
            control_roll=0.0,
            control_pitch=0.0,
            control_thrust=0.5,
            control_yaw=0.0,
        ),
        TornadoTelemetryPoint(
            timestamp_sec=1.0,
            position_x_m=1.5,
            position_y_m=0.0,
            position_z_m=0.0,
            velocity_x_ms=10.0,
            velocity_y_ms=0.0,
            velocity_z_ms=0.0,
            roll_deg=0.0,
            pitch_deg=0.0,
            yaw_deg=0.0,
            angular_velocity_x_rads=0.0,
            angular_velocity_y_rads=0.0,
            angular_velocity_z_rads=0.0,
            control_roll=0.0,
            control_pitch=0.0,
            control_thrust=0.5,
            control_yaw=0.0,
        ),
        TornadoTelemetryPoint(
            timestamp_sec=2.0,
            position_x_m=2.0,
            position_y_m=0.0,
            position_z_m=0.0,
            velocity_x_ms=10.0,
            velocity_y_ms=0.0,
            velocity_z_ms=0.0,
            roll_deg=0.0,
            pitch_deg=0.0,
            yaw_deg=0.0,
            angular_velocity_x_rads=0.0,
            angular_velocity_y_rads=0.0,
            angular_velocity_z_rads=0.0,
            control_roll=0.0,
            control_pitch=0.0,
            control_thrust=0.5,
            control_yaw=0.0,
        ),
    ]

    reference = [
        TornadoReferencePoint(
            timestamp_sec=0.0,
            position_x_m=0.0,
            position_y_m=0.0,
            position_z_m=0.0,
        ),
        TornadoReferencePoint(
            timestamp_sec=1.0,
            position_x_m=1.0,
            position_y_m=0.0,
            position_z_m=0.0,
        ),
        TornadoReferencePoint(
            timestamp_sec=2.0,
            position_x_m=2.0,
            position_y_m=0.0,
            position_z_m=0.0,
        ),
    ]

    return TornadoFlight(
        flight_id="test-flight",
        telemetry=telemetry,
        reference=reference,
        duration_sec=2.0,
    )


def test_build_trajectory_series_contains_all_series():
    flight = create_test_flight()

    trajectory = build_trajectory_series(flight)

    assert len(trajectory.actual) == 3
    assert len(trajectory.reference) == 3
    assert len(trajectory.deviation) == 3


def test_build_trajectory_series_aligns_timestamps():
    flight = create_test_flight()

    trajectory = build_trajectory_series(flight)

    actual_timestamps = [
        point.timestamp_sec
        for point in trajectory.actual
    ]

    reference_timestamps = [
        point.timestamp_sec
        for point in trajectory.reference
    ]

    deviation_timestamps = [
        point.timestamp_sec
        for point in trajectory.deviation
    ]

    assert actual_timestamps == [0.0, 1.0, 2.0]
    assert reference_timestamps == [0.0, 1.0, 2.0]
    assert deviation_timestamps == [0.0, 1.0, 2.0]


def test_build_trajectory_series_calculates_deviation():
    flight = create_test_flight()

    trajectory = build_trajectory_series(flight)

    errors = [
        point.error_m
        for point in trajectory.deviation
    ]

    assert errors[0] == pytest.approx(0.0)
    assert errors[1] == pytest.approx(0.5)
    assert errors[2] == pytest.approx(0.0)

    assert all(error >= 0.0 for error in errors)

def test_assess_tornado_flight_includes_trajectory():
    example = EXAMPLE_FLIGHTS["flight-01a-ellipse"]

    result = assess_tornado_flight(
        telemetry_csv=example["telemetry"],
        reference_csv=example["reference"],
        flight_id="flight-01a-ellipse",
    )

    assert result["flight_id"] == "flight-01a-ellipse"
    assert result["duration_sec"] >= 0.0

    assert "trajectory" in result
    assert "metrics" in result
    assert "events" in result

    trajectory = result["trajectory"]

    assert "actual" in trajectory
    assert "reference" in trajectory
    assert "deviation" in trajectory

    assert len(trajectory["actual"]) > 0
    assert len(trajectory["reference"]) > 0
    assert len(trajectory["deviation"]) > 0

    assert len(trajectory["actual"]) == len(
        trajectory["reference"]
    )
    assert len(trajectory["actual"]) == len(
        trajectory["deviation"]
    )