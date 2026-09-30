import json
from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.models.user import UserRole
from app.tools.red_scale_tools import build_red_scale_tools

def make_record(
    assessment_id=None,
    pilot_id=None,
    findings=None,
    telemetry=None,
):
    assessment_id = assessment_id or uuid4()
    pilot_id = pilot_id or uuid4()

    benchmark = {
        "competencies": [
            {
                "competency_id": "C1",
                "competency_name": "Flight Path Control",
                "findings": findings or [],
            }
        ]
    }

    return SimpleNamespace(
        id=assessment_id,
        pilot_id=pilot_id,
        created_at=datetime(
            2026,
            9,
            16,
            7,
            34,
            tzinfo=timezone.utc,
        ),
        source_filename="flight.csv",
        benchmark_id="red-scale-icao-cbta",
        benchmark_version="0.3.1",
        benchmark=benchmark,
        duration_sec=700.0,
        max_altitude_ft=9981.0,
        min_altitude_ft=1000.0,
        max_speed_knots=253.0,
        avg_speed_knots=133.0,
        max_pitch_deg=18.4,
        min_pitch_deg=-8.5,
        max_roll_deg=34.0,
        min_roll_deg=-34.0,
        max_bank_angle_deg=34.0,
        max_climb_rate_fpm=1805.0,
        max_descent_rate_fpm=1368.0,
        avg_throttle_percent=44.0,
        visual_observations=None,
        risk_score=13.0,
        overall_rating="Excellent",
        telemetry=telemetry or [],
    )


def make_user(
    user_id=None,
    role=UserRole.TRAINEE,
):
    return SimpleNamespace(
        id=user_id or uuid4(),
        role=role,
    )

class FakeResult:
    def __init__(self, record=None, records=None):
        self.record = record
        self.records = records or []

    def scalar_one_or_none(self):
        return self.record

    def scalars(self):
        return self

    def all(self):
        return self.records


class FakeDB:
    def __init__(self, record=None, records=None):
        self.record = record
        self.records = records or []

    async def execute(self, query):
        return FakeResult(
            record=self.record,
            records=self.records,
        )


@pytest.mark.asyncio
async def test_get_assessment_preserves_findings_and_evidence():
    assessment_id = uuid4()
    pilot_id = uuid4()

    findings = [
        {
            "behaviour_id": "OB-4.1",
            "behaviour_name": "Flight path control",
            "status": "deviation",
            "severity": "medium",
            "explanation": "Bank angle exceeded the prototype threshold.",
            "evidence": [
                {
                    "metric": "max_bank_angle_deg",
                    "value": 34.0,
                    "timestamp_sec": 42.5,
                    "duration_sec": 700.0,
                }
            ],
        }
    ]

    record = make_record(
        assessment_id=assessment_id,
        pilot_id=pilot_id,
        findings=findings,
        telemetry=[],
    )

    user = make_user(user_id=pilot_id)

    db = FakeDB(record=record)

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_assessment = tools[1]

    result = await get_assessment.ainvoke(
        {
            "assessment_id": str(assessment_id),
        }
    )

    payload = json.loads(result)

    finding = payload["benchmark"]["findings"][0]

    assert finding["behaviour_id"] == "OB-4.1"
    assert finding["status"] == "deviation"
    assert finding["severity"] == "medium"

    evidence = finding["evidence"][0]

    assert evidence["metric"] == "max_bank_angle_deg"
    assert evidence["value"] == 34.0
    assert evidence["timestamp_sec"] == 42.5


@pytest.mark.asyncio
async def test_get_assessment_marks_legacy_fields_non_authoritative():
    record = make_record()

    user = make_user(user_id=record.pilot_id)

    db = FakeDB(record=record)

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_assessment = tools[1]

    result = await get_assessment.ainvoke(
        {
            "assessment_id": str(record.id),
        }
    )

    payload = json.loads(result)

    assert (
        payload["evidence_scope"]
        ["legacy_fields_are_not_authoritative"]
        is True
    )

    assert (
        payload["evidence_scope"]
        ["legacy_risk_score"]
        == 13.0
    )

    assert (
        payload["evidence_scope"]
        ["legacy_overall_rating"]
        == "Excellent"
    )


@pytest.mark.asyncio
async def test_get_assessment_rejects_invalid_uuid():
    user = make_user()

    db = FakeDB()

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_assessment = tools[1]

    result = await get_assessment.ainvoke(
        {
            "assessment_id": "not-a-uuid",
        }
    )

    payload = json.loads(result)

    assert payload["error"] == "Invalid assessment ID."


@pytest.mark.asyncio
async def test_get_assessment_returns_not_found():
    user = make_user()

    db = FakeDB(record=None)

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_assessment = tools[1]

    result = await get_assessment.ainvoke(
        {
            "assessment_id": str(uuid4()),
        }
    )

    payload = json.loads(result)

    assert payload["error"] == "Assessment not found."


@pytest.mark.asyncio
async def test_trainee_cannot_access_another_trainees_assessment():
    owner_id = uuid4()
    other_user_id = uuid4()

    record = make_record(
        pilot_id=owner_id,
    )

    user = make_user(
        user_id=other_user_id,
    )

    db = FakeDB(record=record)

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_assessment = tools[1]

    result = await get_assessment.ainvoke(
        {
            "assessment_id": str(record.id),
        }
    )

    payload = json.loads(result)

    assert (
        payload["error"]
        == "Assessment not found or not accessible."
    )


@pytest.mark.asyncio
async def test_empty_assessment_history():
    user = make_user()

    db = FakeDB(records=[])

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_history = tools[0]

    result = await get_history.ainvoke({})

    payload = json.loads(result)

    assert payload["assessment_count"] == 0
    assert payload["assessments"] == []


@pytest.mark.asyncio
async def test_assessment_history_preserves_order():
    user_id = uuid4()

    older = make_record(
        pilot_id=user_id,
    )

    newer = make_record(
        pilot_id=user_id,
    )

    newer.created_at = datetime(
        2026,
        9,
        17,
        7,
        34,
        tzinfo=timezone.utc,
    )

    db = FakeDB(
        records=[
            newer,
            older,
        ]
    )

    user = make_user(
        user_id=user_id,
    )

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_history = tools[0]

    result = await get_history.ainvoke({})

    payload = json.loads(result)

    assert payload["assessment_count"] == 2

    assert (
        payload["assessments"][0]["id"]
        == str(newer.id)
    )

    assert (
        payload["assessments"][1]["id"]
        == str(older.id)
    )

@pytest.mark.asyncio
async def test_get_replay_evidence_returns_event_and_telemetry():
    assessment_id = uuid4()
    pilot_id = uuid4()

    findings = [
        {
            "behaviour_id": "OB-4.1",
            "behaviour_name": "Flight path control",
            "status": "deviation",
            "severity": "medium",
            "explanation": (
                "Bank angle exceeded the prototype threshold."
            ),
            "evidence": [
                {
                    "metric": "max_bank_angle_deg",
                    "value": 34.0,
                    "timestamp_sec": 42.5,
                    "duration_sec": 700.0,
                }
            ],
        }
    ]

    telemetry = [
        {
            "timestamp_sec": 40.0,
            "altitude_ft": 5000.0,
            "indicated_airspeed_knots": 120.0,
            "pitch_deg": 5.0,
            "roll_deg": 20.0,
            "vertical_speed_fpm": 100.0,
            "bank_angle_deg": 20.0,
            "throttle_percent": 45.0,
        },
        {
            "timestamp_sec": 42.5,
            "altitude_ft": 5050.0,
            "indicated_airspeed_knots": 122.0,
            "pitch_deg": 6.0,
            "roll_deg": 34.0,
            "vertical_speed_fpm": 120.0,
            "bank_angle_deg": 34.0,
            "throttle_percent": 47.0,
        },
        {
            "timestamp_sec": 45.0,
            "altitude_ft": 5100.0,
            "indicated_airspeed_knots": 121.0,
            "pitch_deg": 5.5,
            "roll_deg": 25.0,
            "vertical_speed_fpm": 90.0,
            "bank_angle_deg": 25.0,
            "throttle_percent": 46.0,
        },
    ]

    record = make_record(
        assessment_id=assessment_id,
        pilot_id=pilot_id,
        findings=findings,
        telemetry=telemetry,
    )

    user = make_user(
        user_id=pilot_id,
    )

    db = FakeDB(record=record)

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_replay_evidence = tools[3]

    result = await get_replay_evidence.ainvoke(
        {
            "assessment_id": str(assessment_id),
        }
    )

    payload = json.loads(result)

    assert payload["assessment_id"] == str(
        assessment_id
    )

    assert payload["event_count"] == 1

    event = payload["events"][0]

    assert event["timestamp_sec"] == 42.5
    assert event["severity"] == "medium"

    assert (
        event["behaviour_id"]
        == "OB-4.1"
    )

    assert (
        event["evidence"]["metric"]
        == "max_bank_angle_deg"
    )

    assert (
        event["evidence"]["value"]
        == 34.0
    )

    assert len(
        event["telemetry_context"]
    ) == 3

@pytest.mark.asyncio
async def test_trainee_cannot_access_another_trainees_replay():
    owner_id = uuid4()
    other_user_id = uuid4()

    record = make_record(
        pilot_id=owner_id,
    )

    user = make_user(
        user_id=other_user_id,
    )

    db = FakeDB(record=record)

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_replay_evidence = tools[3]

    result = await get_replay_evidence.ainvoke(
        {
            "assessment_id": str(record.id),
        }
    )

    payload = json.loads(result)

    assert (
        payload["error"]
        == "Assessment not found or not accessible."
    )

@pytest.mark.asyncio
async def test_get_replay_evidence_rejects_invalid_uuid():
    user = make_user()

    db = FakeDB()

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_replay_evidence = tools[3]

    result = await get_replay_evidence.ainvoke(
        {
            "assessment_id": "not-a-uuid",
        }
    )

    payload = json.loads(result)

    assert (
        payload["error"]
        == "Invalid assessment ID."
    )

@pytest.mark.asyncio
async def test_get_replay_evidence_returns_not_found():
    user = make_user()

    db = FakeDB(
        record=None,
    )

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    get_replay_evidence = tools[3]

    result = await get_replay_evidence.ainvoke(
        {
            "assessment_id": str(uuid4()),
        }
    )

    payload = json.loads(result)

    assert (
        payload["error"]
        == "Assessment not found."
    )

@pytest.mark.asyncio
async def test_get_similar_flights_returns_graph_similarity():

    user_id = uuid4()

    flight_a = make_record(
        pilot_id=user_id,
        findings=[
            {
                "behaviour_id": "OB-4.1",
                "behaviour_name": "Flight path control",
                "status": "deviation",
                "severity": "medium",
                "explanation": "Test finding.",
                "evidence": [],
            },
            {
                "behaviour_id": "OB-4.2",
                "behaviour_name": "Flight path monitoring",
                "status": "attention",
                "severity": "low",
                "explanation": "Test finding.",
                "evidence": [],
            },
        ],
    )

    flight_b = make_record(
        pilot_id=user_id,
        findings=[
            {
                "behaviour_id": "OB-4.1",
                "behaviour_name": "Flight path control",
                "status": "deviation",
                "severity": "medium",
                "explanation": "Test finding.",
                "evidence": [],
            },
            {
                "behaviour_id": "OB-4.2",
                "behaviour_name": "Flight path monitoring",
                "status": "attention",
                "severity": "low",
                "explanation": "Test finding.",
                "evidence": [],
            },
        ],
    )

    flight_c = make_record(
        pilot_id=user_id,
        findings=[
            {
                "behaviour_id": "OB-5.1",
                "behaviour_name": "Workload management",
                "status": "attention",
                "severity": "low",
                "explanation": "Test finding.",
                "evidence": [],
            }
        ],
    )

    user = make_user(
        user_id=user_id,
    )

    db = FakeDB(
        records=[
            flight_a,
            flight_b,
            flight_c,
        ]
    )

    tools = build_red_scale_tools(
        db=db,
        current_user=user,
    )

    # New tool is the fifth tool.
    get_similar_flights = tools[4]

    result = await get_similar_flights.ainvoke(
        {
            "assessment_id": str(flight_a.id),
            "top_k": 2,
        }
    )

    payload = json.loads(result)

    assert payload["assessment_id"] == str(
        flight_a.id
    )

    assert (
        payload["method"]
        == "graph-based flight similarity"
    )

    assert len(
        payload["similar_flights"]
    ) == 2

    assert (
        payload["similar_flights"][0]["flight_id"]
        == f"flight:{flight_b.id}"
    )

    assert (
        payload["similar_flights"][0]["similarity"]
        > payload["similar_flights"][1]["similarity"]
    )