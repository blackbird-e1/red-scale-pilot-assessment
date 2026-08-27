"""
Adapter between Red Scale flight features and benchmark-engine.

ARCHITECTURE OWNERSHIP
----------------------
Red Scale is responsible for:

    - FDR parsing
    - feature extraction
    - adapting flight features into benchmark-engine inputs
    - adapting benchmark-engine results into Red Scale API models
    - API/UI presentation

benchmark-engine is responsible for:

    - benchmark definitions
    - benchmark rules
    - benchmark thresholds
    - benchmark evaluation
    - benchmark scoring
    - assessment logic

IMPORTANT
---------
Do NOT add aviation thresholds, aviation rules, benchmark scoring,
or assessment logic to Red Scale.

If benchmark-engine does not yet support a required flight metric,
use a temporary compatibility mapping rather than implementing
the missing assessment logic in Red Scale.

TEMPORARY COMPATIBILITY / MISMATCH NOTES
-----------------------------------------
The current benchmark-engine version does not yet expose every
flight metric extracted by Red Scale.

For the current MVP, only metrics currently supported by
benchmark-engine are sent to the engine.

Unsupported metrics such as pitch/climb-related metrics are
intentionally not evaluated by Red Scale.

When benchmark-engine adds support for additional metrics:

    1. Update the adapter input mapping.
    2. Let benchmark-engine define the corresponding rules.
    3. Remove any temporary compatibility code.

The adapter must remain a translation boundary. It must never
become a second location for aviation assessment logic.
"""

from benchmark_engine import BenchmarkEngine, BenchmarkInput
from benchmark_engine.adapters.aviation import AVIATION_RULES

from app.models.assessment import BenchmarkResult
from app.models.flight_features import FlightFeatures
from app.models.rule_violation import RuleViolation


# benchmark-engine is the only benchmarking implementation.
# Red Scale communicates with it through this adapter.
_ENGINE = BenchmarkEngine(AVIATION_RULES)


def evaluate_benchmark(features: FlightFeatures):
    """
    Evaluate Red Scale flight features using benchmark-engine.

    Only metrics currently supported by benchmark-engine are
    passed to the engine.

    Red Scale does not evaluate benchmark rules itself.
    """

    benchmark_input = BenchmarkInput(
        metrics={
            "max_speed_knots": features.max_speed_knots,
            "max_bank_angle_deg": features.max_bank_angle_deg,
            "max_descent_rate_fpm": features.max_descent_rate_fpm,
            "avg_throttle_percent": features.avg_throttle_percent,
        }
    )

    return _ENGINE.evaluate(benchmark_input)


def benchmark_results_from_result(
    result,
) -> list[BenchmarkResult]:
    """
    Translate all benchmark-engine metric results into
    Red Scale API benchmark result models.

    No benchmark evaluation is performed here. The
    benchmark-engine result is treated as the source of truth.

    Unlike benchmark_violations_from_result(), this function
    intentionally includes both passing and failing metrics.
    """

    results = []

    for name, metric in result.metrics.items():
        results.append(
            BenchmarkResult(
                rule_id=f"BENCHMARK-{name.upper()}",
                rule_name=name.replace("_", " ").title(),
                severity=_severity_from_score(metric.score),
                message=_build_message(metric),
                expected=metric.benchmark,
                actual=str(metric.value),
                benchmark_score=metric.score,
                status=metric.status,
                deviation=metric.deviation,
            )
        )

    return results


def benchmark_violations_from_result(
    result,
) -> list[RuleViolation]:
    """
    Translate failed benchmark-engine results into
    Red Scale RuleViolation models.

    Passing benchmark metrics are intentionally excluded.

    No benchmark evaluation is performed here. The
    benchmark-engine result is treated as the source of truth.
    """

    violations = []

    for name, metric in result.metrics.items():
        if metric.score >= 1.0:
            continue

        violations.append(
            RuleViolation(
                rule_id=f"BENCHMARK-{name.upper()}",
                rule_name=name.replace("_", " ").title(),
                severity=_severity_from_score(metric.score),
                message=_build_message(metric),
                expected=metric.benchmark,
                actual=str(metric.value),
                benchmark_score=metric.score,
                status=metric.status,
                deviation=metric.deviation,
            )
        )

    return violations


def benchmark_results(
    features: FlightFeatures,
) -> list[BenchmarkResult]:
    """
    Evaluate benchmark-engine and translate all results into
    Red Scale benchmark result models.
    """

    result = evaluate_benchmark(features)

    return benchmark_results_from_result(result)


def benchmark_violations(
    features: FlightFeatures,
) -> list[RuleViolation]:
    """
    Evaluate benchmark-engine and translate failed results
    into Red Scale violation models.
    """

    result = evaluate_benchmark(features)

    return benchmark_violations_from_result(result)


def _severity_from_score(score: float) -> str:
    """
    Temporarily translate benchmark-engine score into the
    Red Scale severity representation.

    TODO:
        Once benchmark-engine exposes severity directly,
        remove this compatibility mapping and consume the
        engine-provided severity instead.

    This function must not evolve into benchmark decision logic.
    """

    if score <= 0.25:
        return "critical"

    if score <= 0.50:
        return "high"

    if score <= 0.75:
        return "medium"

    return "low"


def _build_message(metric) -> str:
    """
    Translate a benchmark-engine metric status into a
    human-readable Red Scale API message.

    The status itself is produced by benchmark-engine.
    Red Scale only converts it into presentation text.
    """

    metric_name = metric.name.replace("_", " ").title()

    if metric.status == "ABOVE_LIMIT":
        return f"{metric_name} is above the benchmark."

    if metric.status == "BELOW_RANGE":
        return f"{metric_name} is below the benchmark range."

    if metric.status == "ABOVE_RANGE":
        return f"{metric_name} is above the benchmark range."

    if metric.status == "BELOW_LIMIT":
        return f"{metric_name} is below the benchmark."

    if metric.status == "OFF_TARGET":
        return f"{metric_name} is outside the target."

    return f"{metric_name} does not meet the benchmark."