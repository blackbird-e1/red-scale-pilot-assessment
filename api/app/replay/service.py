from app.models.assessment_record import AssessmentRecord
from app.replay.schemas import (
    ReplayDataset,
    ReplayEvent,
    ReplayTelemetryPoint,
)


def find_evidence_timestamp(
    metric: str,
    telemetry: list[ReplayTelemetryPoint],
) -> float:
    """
    Backward-compatible fallback for older assessment records
    that do not contain timestamped benchmark evidence.

    New assessments should normally provide timestamp_sec directly
    through benchmark evidence.
    """

    if not telemetry:
        return 0.0

    if metric == "max_speed_knots":
        point = max(
            telemetry,
            key=lambda item: item.indicated_airspeed_knots,
        )
        return point.timestamp_sec

    if metric == "max_bank_angle_deg":
        point = max(
            telemetry,
            key=lambda item: abs(item.bank_angle_deg),
        )
        return point.timestamp_sec

    if metric == "max_altitude_ft":
        point = max(
            telemetry,
            key=lambda item: item.altitude_ft,
        )
        return point.timestamp_sec

    if metric == "min_altitude_ft":
        point = min(
            telemetry,
            key=lambda item: item.altitude_ft,
        )
        return point.timestamp_sec

    if metric == "max_pitch_deg":
        point = max(
            telemetry,
            key=lambda item: item.pitch_deg,
        )
        return point.timestamp_sec

    if metric == "min_pitch_deg":
        point = min(
            telemetry,
            key=lambda item: item.pitch_deg,
        )
        return point.timestamp_sec

    if metric == "max_climb_rate_fpm":
        point = max(
            telemetry,
            key=lambda item: item.vertical_speed_fpm,
        )
        return point.timestamp_sec

    if metric == "max_descent_rate_fpm":
        point = min(
            telemetry,
            key=lambda item: item.vertical_speed_fpm,
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

    for competency in record.benchmark.get(
        "competencies",
        [],
    ):
        competency_name = competency.get(
            "competency_name",
            "Competency",
        )

        for finding in competency.get(
            "findings",
            [],
        ):
            behaviour_name = finding.get(
                "behaviour_name",
                "Behaviour",
            )

            severity = finding.get("severity")

            for evidence in finding.get(
                "evidence",
                [],
            ):
                metric = evidence.get("metric")

                if not metric:
                    continue

                # Prefer the timestamp produced by the benchmark.
                # This is the authoritative timestamp for new assessments.
                timestamp_sec = evidence.get(
                    "timestamp_sec"
                )

                # Fall back to calculating the timestamp for
                # older assessment records.
                if timestamp_sec is None:
                    timestamp_sec = find_evidence_timestamp(
                        metric,
                        telemetry,
                    )

                events.append(
                    ReplayEvent(
                        timestamp_sec=timestamp_sec,
                        type="behaviour",
                        label=(
                            f"{competency_name}: "
                            f"{behaviour_name}"
                        ),
                        severity=severity,
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