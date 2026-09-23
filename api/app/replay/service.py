from app.models.assessment_record import AssessmentRecord
from app.replay.schemas import (
    ReplayDataset,
    ReplayEvent,
    ReplayTelemetryPoint,
)


def find_violation_timestamp(
    violation: dict,
    telemetry: list[ReplayTelemetryPoint],
) -> float:
    """
    Find the telemetry timestamp that best represents a violation.

    The current assessment engine exposes violation rule names,
    while the replay dataset contains the underlying telemetry.

    For the currently supported benchmark rules:
    - Max Speed Knots -> maximum recorded airspeed
    - Max Bank Angle Deg -> maximum absolute bank angle

    Falls back to timestamp 0 if the rule cannot be mapped.
    """

    if not telemetry:
        return 0.0

    rule_name = violation.get(
        "rule_name",
        "",
    ).strip().lower()

    if "max speed" in rule_name:
        point = max(
            telemetry,
            key=lambda item: item.indicated_airspeed_knots,
        )

        return point.timestamp_sec

    if "max bank" in rule_name:
        point = max(
            telemetry,
            key=lambda item: abs(item.bank_angle_deg),
        )

        return point.timestamp_sec

    return 0.0


def build_replay_dataset(
    record: AssessmentRecord,
) -> ReplayDataset:

    telemetry = [
        ReplayTelemetryPoint(
            timestamp_sec=point["timestamp_sec"],
            altitude_ft=point["altitude_ft"],
            indicated_airspeed_knots=point[
                "indicated_airspeed_knots"
            ],
            pitch_deg=point["pitch_deg"],
            roll_deg=point["roll_deg"],
            vertical_speed_fpm=point["vertical_speed_fpm"],
            bank_angle_deg=point["bank_angle_deg"],
            throttle_percent=point["throttle_percent"],
        )
        for point in record.telemetry
    ]

    events = []

    for violation in record.violations:
        timestamp_sec = find_violation_timestamp(
            violation,
            telemetry,
        )

        events.append(
            ReplayEvent(
                timestamp_sec=timestamp_sec,
                type="violation",
                label=violation.get(
                    "rule_name",
                    "Violation",
                ),
                severity=violation.get("severity"),
            )
        )

    events.sort(
        key=lambda event: event.timestamp_sec,
    )

    return ReplayDataset(
        assessment_id=record.id,
        pilot_id=record.pilot_id,
        source_filename=record.source_filename,
        duration_sec=record.duration_sec,
        telemetry=telemetry,
        events=events,
    )