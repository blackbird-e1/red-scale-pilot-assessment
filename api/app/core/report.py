from app.models.assessment import Assessment


def generate_report(
    assessment: Assessment,
) -> dict:

    return {
        "overall_rating": assessment.overall_rating,
        "risk_score": assessment.risk_score,
        "features": assessment.features.model_dump(),
        "violations": [
            violation.model_dump()
            for violation in assessment.violations
        ],
    }