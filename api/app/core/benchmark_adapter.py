"""
Compatibility adapter for the Red Scale benchmark.

Compatibility adapter for the Red Scale benchmark assessment pipeline.
The replacement benchmark now lives in app.benchmark.
"""

import pandas as pd

from app.benchmark.evaluator import evaluate_benchmark
from app.benchmark.models import BenchmarkAssessment
from app.models.flight_features import FlightFeatures


def benchmark_assessment(
    features: FlightFeatures,
    evidence_source: pd.DataFrame | None = None,
) -> BenchmarkAssessment:
    """
    Evaluate flight features using the Red Scale aviation benchmark.

    The optional evidence_source contains the original FDR telemetry.
    It allows the benchmark evaluator to attach timestamps to evidence
    metrics for replay and debriefing.
    """

    return evaluate_benchmark(
        features,
        evidence_source=evidence_source,
    )