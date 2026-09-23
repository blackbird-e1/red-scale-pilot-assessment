from uuid import uuid4

from app.models.assessment_record import AssessmentRecord
from app.replay.service import build_replay_dataset


def test_replay_uses_benchmark_evidence():

    record = AssessmentRecord(
        id=uuid4(),
        pilot_id=uuid4(),
        created_by=uuid4(),
        source_filename="test.csv",
        benchmark_id="red-scale-icao-cbta",
        benchmark_version="0.1.0",
        duration_sec=100.0,
        max_altitude_ft=10000.0,
        min_altitude_ft=5000.0,
        max_speed_knots=220.0,
        avg_speed_knots=200.0,
        max_pitch_deg=10.0,
        min_pitch_deg=-5.0,
        max_roll_deg=20.0,
        min_roll_deg=-20.0,
        max_bank_angle_deg=30.0,
        max_climb_rate_fpm=1000.0,
        max_descent_rate_fpm=1200.0,
        avg_throttle_percent=50.0,
        benchmark={
            "benchmark_id": "red-scale-icao-cbta",
            "benchmark_version": "0.1.0",
            "competencies": [
                {
                    "competency_id": "flight_path_management_manual",
                    "competency_name": (
                        "Aircraft Flight Path Management - Manual Control"
                    ),
                    "findings": [
                        {
                            "behaviour_id": "bank_management",
                            "behaviour_name": "Bank Management",
                            "status": "observed",
                            "severity": "medium",
                            "evidence": [
                                {
                                    "metric": "max_bank_angle_deg",
                                    "value": 30.0,
                                }
                            ],
                            "explanation": (
                                "Maximum recorded bank angle was 30 degrees."
                            ),
                        }
                    ],
                }
            ],
        },
        visual_observations=[],
        telemetry=[
            {
                "timestamp_sec": 0.0,
                "altitude_ft": 5000.0,
                "indicated_airspeed_knots": 180.0,
                "pitch_deg": 2.0,
                "roll_deg": 5.0,
                "vertical_speed_fpm": 0.0,
                "bank_angle_deg": 5.0,
                "throttle_percent": 50.0,
            },
            {
                "timestamp_sec": 42.0,
                "altitude_ft": 7000.0,
                "indicated_airspeed_knots": 210.0,
                "pitch_deg": 5.0,
                "roll_deg": 30.0,
                "vertical_speed_fpm": 500.0,
                "bank_angle_deg": 30.0,
                "throttle_percent": 60.0,
            },
        ],
    )

    replay = build_replay_dataset(record)

    assert len(replay.events) == 1

    event = replay.events[0]

    assert event.type == "behaviour"
    assert event.label == (
        "Aircraft Flight Path Management - Manual Control: "
        "Bank Management"
    )
    assert event.severity == "medium"
    assert event.timestamp_sec == 42.0