from app.models.assessment import Assessment


def generate_report(
    assessment: Assessment,
) -> dict:

    return {
        "features": assessment.features.model_dump(),
        "benchmark": assessment.benchmark.model_dump(),
        "visual_observations": [
            observation.model_dump()
            for observation in assessment.visual_observations
        ],
    }