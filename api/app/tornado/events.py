import numpy as np

from app.tornado.evaluator import calculate_trajectory_error_series
from app.tornado.schemas import TornadoEvent, TornadoEvidence


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
        is_last_sample = index == len(errors) - 1

        if above_threshold and not in_event:
            in_event = True
            start_index = index

        if in_event and (not above_threshold or is_last_sample):
            end_index = index if above_threshold else index - 1

            if end_index < start_index:
                in_event = False
                continue

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