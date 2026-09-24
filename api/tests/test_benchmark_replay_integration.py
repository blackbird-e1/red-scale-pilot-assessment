from pathlib import Path

from app.models.assessment_record import AssessmentRecord
from app.replay.service import build_replay_dataset
from app.services.assessment_service import assess_flight


BASE_DIR = Path(__file__).resolve().parents[1]

FDR_PATH = BASE_DIR / "fdr_violation_test_v2.csv"


def test_benchmark_evidence_timestamp_reaches_replay():
    assessment = assess_flight(FDR_PATH)

    record = AssessmentRecord(
        id="00000000-0000-0000-0000-000000000001",
        pilot_id="00000000-0000-0000-0000-000000000002",
        source_filename=FDR_PATH.name,
        duration_sec=float(
            assessment.telemetry[-1].timestamp_sec
        ),
        benchmark=assessment.benchmark.model_dump(),
        telemetry=[
            point.model_dump()
            for point in assessment.telemetry
        ],
    )

    replay = build_replay_dataset(record)

    benchmark_timestamps = []

    for competency in assessment.benchmark.competencies:
        for finding in competency.findings:
            for evidence in finding.evidence:
                if evidence.timestamp_sec is not None:
                    benchmark_timestamps.append(
                        evidence.timestamp_sec
                    )

    replay_timestamps = [
        event.timestamp_sec
        for event in replay.events
    ]

    assert benchmark_timestamps
    assert replay_timestamps

    for timestamp in benchmark_timestamps:
        assert timestamp in replay_timestamps