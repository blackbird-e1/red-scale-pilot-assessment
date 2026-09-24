from pathlib import Path

from app.services.assessment_service import assess_flight


def test_assess_flight():
    csv_path = Path("data/fdr_sample.csv")

    assessment = assess_flight(csv_path)

    assert assessment is not None

    assert assessment.features is not None

    assert assessment.benchmark is not None
    assert assessment.benchmark.benchmark_id == "red-scale-icao-cbta"
    assert assessment.benchmark.benchmark_version == "0.3.1"

    assert len(assessment.benchmark.competencies) == 1

    competency = assessment.benchmark.competencies[0]

    assert competency.competency_id == "flight_path_management_manual"

    assert len(competency.findings) == 4

    behaviour_ids = {
        finding.behaviour_id
        for finding in competency.findings
    }

    assert behaviour_ids == {
        "manual_flight_path_control",
        "flight_path_deviation_monitoring",
        "attitude_speed_thrust_management",
        "safe_flight_path_management",
    }

    for finding in competency.findings:
        assert finding.status in {
            "observed",
            "attention",
            "deviation",
        }

        assert finding.severity in {
            "low",
            "medium",
            "high",
        }

        assert len(finding.evidence) > 0

    assert assessment.telemetry is not None