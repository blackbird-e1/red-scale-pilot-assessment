"""
Compatibility adapter for the Red Scale benchmark.

The previous implementation delegated to benchmark-engine.
The replacement benchmark now lives in app.benchmark.
"""

from app.benchmark.evaluator import evaluate_benchmark
from app.benchmark.models import BenchmarkAssessment
from app.models.flight_features import FlightFeatures


def benchmark_assessment(
    features: FlightFeatures,
) -> BenchmarkAssessment:
    """
    Evaluate flight features using the Red Scale aviation benchmark.
    """

    return evaluate_benchmark(features)