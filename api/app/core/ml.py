def predict_risk(benchmark_score: float) -> float:
    """
    Convert benchmark-engine performance into Red Scale risk.

    benchmark_score:
        0.0 = worst performance
        1.0 = best performance

    Red Scale risk:
        0.0 = no risk
        100.0 = maximum risk
    """

    benchmark_score = max(0.0, min(1.0, benchmark_score))

    benchmark_risk = (1.0 - benchmark_score) * 100.0

    return min(benchmark_risk, 100.0)