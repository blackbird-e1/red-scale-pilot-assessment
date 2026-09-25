import math

import numpy as np

from app.tornado.schemas import TornadoFlight
from app.tornado.schemas import TornadoEvent, TornadoEvidence

def _interpolate_reference(
    flight: TornadoFlight,
) -> tuple[np.ndarray, np.ndarray]:
    reference_times = np.array(
        [point.timestamp_sec for point in flight.reference],
        dtype=float,
    )

    reference_x = np.array(
        [point.position_x_m for point in flight.reference],
        dtype=float,
    )

    reference_y = np.array(
        [point.position_y_m for point in flight.reference],
        dtype=float,
    )

    reference_z = np.array(
        [point.position_z_m for point in flight.reference],
        dtype=float,
    )

    telemetry_times = np.array(
        [point.timestamp_sec for point in flight.telemetry],
        dtype=float,
    )

    interpolated = np.column_stack(
        [
            np.interp(telemetry_times, reference_times, reference_x),
            np.interp(telemetry_times, reference_times, reference_y),
            np.interp(telemetry_times, reference_times, reference_z),
        ]
    )

    return telemetry_times, interpolated


def calculate_trajectory_deviation(flight):
    telemetry_times, errors = calculate_trajectory_error_series(flight)

    max_index = int(np.argmax(errors))

    return {
        "mean_error_m": float(np.mean(errors)),
        "rmse_m": float(np.sqrt(np.mean(errors ** 2))),
        "max_error_m": float(errors[max_index]),
        "max_error_timestamp_sec": float(telemetry_times[max_index]),
    }

def detect_trajectory_deviation_events(
    flight,
    threshold_m=1.0,
    minimum_duration_sec=0.1,
):
    telemetry_times, errors = calculate_trajectory_error_series(flight)

    events = []

    in_event = False
    start_index = 0

    for index, error_m in enumerate(errors):
        above_threshold = error_m >= threshold_m

        if above_threshold and not in_event:
            in_event = True
            start_index = index

        is_last_sample = index == len(errors) - 1

        if in_event and (not above_threshold or is_last_sample):
            end_index = index if above_threshold else index - 1

            start_time = float(telemetry_times[start_index])
            end_time = float(telemetry_times[end_index])

            duration = end_time - start_time

            if duration >= minimum_duration_sec:
                event_errors = errors[start_index:end_index + 1]
                peak_offset = int(np.argmax(event_errors))
                peak_index = start_index + peak_offset

                peak_error = float(errors[peak_index])
                peak_time = float(telemetry_times[peak_index])

                events.append(
                    TornadoEvent(
                        timestamp_sec=peak_time,
                        type="trajectory_deviation",
                        severity="observed",
                        description=(
                            f"Trajectory deviation exceeded "
                            f"{threshold_m:.1f} m for "
                            f"{duration:.2f} seconds. "
                            f"Peak deviation was "
                            f"{peak_error:.2f} m."
                        ),
                        evidence=[
                            TornadoEvidence(
                                metric="trajectory_deviation",
                                value=peak_error,
                                unit="m",
                                timestamp_sec=peak_time,
                                description=(
                                    f"Peak position error from the "
                                    f"reference trajectory was "
                                    f"{peak_error:.2f} m."
                                ),
                            )
                        ],
                    )
                )

            in_event = False

    return events


def calculate_position_stability(
    flight: TornadoFlight,
) -> dict[str, float]:
    positions = np.array(
        [
            [
                point.position_x_m,
                point.position_y_m,
                point.position_z_m,
            ]
            for point in flight.telemetry
        ],
        dtype=float,
    )

    position_variation = np.std(positions, axis=0)

    return {
        "std_x_m": float(position_variation[0]),
        "std_y_m": float(position_variation[1]),
        "std_z_m": float(position_variation[2]),
        "overall_std_m": float(np.mean(position_variation)),
    }


def calculate_velocity_stability(
    flight: TornadoFlight,
) -> dict[str, float]:
    velocities = np.array(
        [
            [
                point.velocity_x_ms,
                point.velocity_y_ms,
                point.velocity_z_ms,
            ]
            for point in flight.telemetry
        ],
        dtype=float,
    )

    velocity_variation = np.std(velocities, axis=0)

    velocity_magnitude = np.linalg.norm(
        velocities,
        axis=1,
    )

    return {
        "std_x_ms": float(velocity_variation[0]),
        "std_y_ms": float(velocity_variation[1]),
        "std_z_ms": float(velocity_variation[2]),
        "overall_std_ms": float(np.mean(velocity_variation)),
        "mean_speed_ms": float(np.mean(velocity_magnitude)),
        "max_speed_ms": float(np.max(velocity_magnitude)),
    }


def calculate_attitude_stability(
    flight: TornadoFlight,
) -> dict[str, float]:
    attitude = np.array(
        [
            [
                point.roll_deg,
                point.pitch_deg,
                point.yaw_deg,
            ]
            for point in flight.telemetry
        ],
        dtype=float,
    )

    variation = np.std(attitude, axis=0)

    return {
        "roll_std_deg": float(variation[0]),
        "pitch_std_deg": float(variation[1]),
        "yaw_std_deg": float(variation[2]),
        "overall_std_deg": float(np.mean(variation)),
    }


def calculate_control_smoothness(
    flight: TornadoFlight,
) -> dict[str, float]:
    controls = np.array(
        [
            [
                point.control_roll,
                point.control_pitch,
                point.control_thrust,
                point.control_yaw,
            ]
            for point in flight.telemetry
        ],
        dtype=float,
    )

    control_changes = np.diff(
        controls,
        axis=0,
    )

    absolute_changes = np.abs(control_changes)

    return {
        "mean_roll_change": float(
            np.mean(absolute_changes[:, 0])
        ),
        "mean_pitch_change": float(
            np.mean(absolute_changes[:, 1])
        ),
        "mean_thrust_change": float(
            np.mean(absolute_changes[:, 2])
        ),
        "mean_yaw_change": float(
            np.mean(absolute_changes[:, 3])
        ),
        "overall_mean_change": float(
            np.mean(absolute_changes)
        ),
        "max_control_change": float(
            np.max(absolute_changes)
        ),
    }


def evaluate_tornado_flight(
    flight: TornadoFlight,
) -> dict[str, dict[str, float]]:
    return {
        "trajectory_deviation": calculate_trajectory_deviation(
            flight
        ),
        "position_stability": calculate_position_stability(
            flight
        ),
        "velocity_stability": calculate_velocity_stability(
            flight
        ),
        "attitude_stability": calculate_attitude_stability(
            flight
        ),
        "control_smoothness": calculate_control_smoothness(
            flight
        ),
    }

def calculate_trajectory_error_series(flight):
    telemetry_times, reference_positions = _interpolate_reference(flight)

    actual_positions = np.array(
        [
            [
                point.position_x_m,
                point.position_y_m,
                point.position_z_m,
            ]
            for point in flight.telemetry
        ],
        dtype=float,
    )

    errors = np.linalg.norm(
        actual_positions - reference_positions,
        axis=1,
    )

    return telemetry_times, errors