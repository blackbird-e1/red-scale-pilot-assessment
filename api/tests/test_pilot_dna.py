from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.models.assessment_record import AssessmentRecord
from app.services.pilot_dna import build_pilot_dna


def make_record(
    pilot_id,
    risk_score,
    created_at,
    violations=None,
):
    return AssessmentRecord(
        pilot_id=pilot_id,
        created_by=uuid4(),
        created_at=created_at,
        source_filename="test.csv",
        benchmark_id="aviation",
        benchmark_version="1",
        duration_sec=100,
        max_altitude_ft=10000,
        min_altitude_ft=5000,
        max_speed_knots=400,
        avg_speed_knots=300,
        max_pitch_deg=20,
        min_pitch_deg=-10,
        max_roll_deg=30,
        min_roll_deg=-20,
        max_bank_angle_deg=35,
        max_climb_rate_fpm=3000,
        max_descent_rate_fpm=-2500,
        avg_throttle_percent=70,
        risk_score=risk_score,
        overall_rating="Good",
        benchmark_results=[],
        violations=violations or [],
        visual_observations=[],
        telemetry=[],
    )


def test_pilot_dna_single_assessment():
    pilot_id = uuid4()

    record = make_record(
        pilot_id,
        40,
        datetime(
            2026,
            9,
            1,
            tzinfo=timezone.utc,
        ),
    )

    dna = build_pilot_dna([record])

    assert dna.pilot_id == pilot_id
    assert dna.assessment_count == 1
    assert dna.latest_risk == 40
    assert dna.average_risk == 40
    assert dna.risk_trend == "insufficient_data"
    assert dna.recurring_violations == []


def test_pilot_dna_improving():
    pilot_id = uuid4()

    records = [
        make_record(
            pilot_id,
            70,
            datetime(
                2026,
                9,
                1,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            60,
            datetime(
                2026,
                9,
                2,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            40,
            datetime(
                2026,
                9,
                3,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            30,
            datetime(
                2026,
                9,
                4,
                tzinfo=timezone.utc,
            ),
        ),
    ]

    dna = build_pilot_dna(records)

    assert dna.risk_trend == "improving"
    assert dna.latest_risk == 30


def test_pilot_dna_deteriorating():
    pilot_id = uuid4()

    records = [
        make_record(
            pilot_id,
            20,
            datetime(
                2026,
                9,
                1,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            30,
            datetime(
                2026,
                9,
                2,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            60,
            datetime(
                2026,
                9,
                3,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            70,
            datetime(
                2026,
                9,
                4,
                tzinfo=timezone.utc,
            ),
        ),
    ]

    dna = build_pilot_dna(records)

    assert dna.risk_trend == "deteriorating"


def test_pilot_dna_stable():
    pilot_id = uuid4()

    records = [
        make_record(
            pilot_id,
            50,
            datetime(
                2026,
                9,
                1,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            51,
            datetime(
                2026,
                9,
                2,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            49,
            datetime(
                2026,
                9,
                3,
                tzinfo=timezone.utc,
            ),
        ),
        make_record(
            pilot_id,
            50,
            datetime(
                2026,
                9,
                4,
                tzinfo=timezone.utc,
            ),
        ),
    ]

    dna = build_pilot_dna(records)

    assert dna.risk_trend == "stable"


def test_recurring_violation():
    pilot_id = uuid4()

    violation = {
        "rule_id": "bank-angle",
        "rule_name": "Excessive Bank Angle",
        "severity": "high",
        "message": "Bank angle exceeded threshold.",
        "expected": "< 30 degrees",
        "actual": "40 degrees",
        "benchmark_score": 80,
        "status": "failed",
        "deviation": 10,
    }

    records = [
        make_record(
            pilot_id,
            40,
            datetime(
                2026,
                9,
                1,
                tzinfo=timezone.utc,
            ),
            [violation],
        ),
        make_record(
            pilot_id,
            45,
            datetime(
                2026,
                9,
                2,
                tzinfo=timezone.utc,
            ),
            [violation],
        ),
        make_record(
            pilot_id,
            50,
            datetime(
                2026,
                9,
                3,
                tzinfo=timezone.utc,
            ),
            [],
        ),
    ]

    dna = build_pilot_dna(records)

    assert len(dna.recurring_violations) == 1

    recurring = dna.recurring_violations[0]

    assert recurring.rule_id == "bank-angle"
    assert recurring.occurrences == 2
    assert recurring.total_assessments == 3
    assert recurring.severity == "high"
    assert recurring.percentage == 66.67


def test_single_violation_is_not_recurring():
    pilot_id = uuid4()

    violation = {
        "rule_id": "bank-angle",
        "rule_name": "Excessive Bank Angle",
        "severity": "high",
    }

    records = [
        make_record(
            pilot_id,
            40,
            datetime(
                2026,
                9,
                1,
                tzinfo=timezone.utc,
            ),
            [violation],
        ),
        make_record(
            pilot_id,
            45,
            datetime(
                2026,
                9,
                2,
                tzinfo=timezone.utc,
            ),
            [],
        ),
    ]

    dna = build_pilot_dna(records)

    assert dna.recurring_violations == []


def test_no_assessments():
    with pytest.raises(
        ValueError,
        match="without assessments",
    ):
        build_pilot_dna([])