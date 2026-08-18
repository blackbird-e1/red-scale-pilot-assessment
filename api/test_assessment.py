from pathlib import Path

from app.services.assessment_service import assess_flight


def test_assess_flight():
    csv_path = Path("data/fdr_sample.csv")

    assessment = assess_flight(csv_path)

    assert assessment is not None

    assert 0 <= assessment.risk_score <= 100

    assert assessment.overall_rating in {
        "Excellent",
        "Good",
        "Fair",
        "Poor",
        "Unsafe",
    }

    assert assessment.features is not None
    assert assessment.violations is not None