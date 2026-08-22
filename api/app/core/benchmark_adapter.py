"""Bridge between Red Scale and benchmark-engine."""

from benchmark_engine import BenchmarkEngine, BenchmarkInput
from benchmark_engine.adapters.aviation import AVIATION_RULES

from app.models.flight_features import FlightFeatures
from app.models.rule_violation import RuleViolation


# benchmark-engine is the only benchmarking implementation.
# Red Scale talks to it through this adapter.
_ENGINE = BenchmarkEngine(AVIATION_RULES)


def evaluate_benchmark(features: FlightFeatures):
    """
    Evaluate Red Scale flight features using benchmark-engine.

    Only the metrics currently supported by benchmark-engine's
    aviation adapter are sent to the engine.
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


def benchmark_violations_from_result(
    result,
) -> list[RuleViolation]:
    """
    Convert an existing benchmark-engine result into
    Red Scale RuleViolation objects.
    """

    violations = []

    for name, metric in result.metrics.items():
        if metric.score >= 1.0:
            continue

        severity = _severity_from_score(metric.score)

        violations.append(
            RuleViolation(
                rule_id=f"BENCHMARK-{name.upper()}",
                rule_name=name.replace("_", " ").title(),
                severity=severity,
                message=_build_message(metric),
                expected=metric.benchmark,
                actual=str(metric.value),
            )
        )

    return violations


def benchmark_violations(
    features: FlightFeatures,
) -> list[RuleViolation]:
    """
    Evaluate benchmark-engine and return Red Scale violations.
    """

    result = evaluate_benchmark(features)

    return benchmark_violations_from_result(result)


def _severity_from_score(score: float) -> str:
    """Convert benchmark score into Red Scale severity."""

    if score <= 0.25:
        return "critical"

    if score <= 0.50:
        return "high"

    if score <= 0.75:
        return "medium"

    return "low"


def _build_message(metric) -> str:
    """Create a human-readable violation message."""

    if metric.status == "ABOVE_LIMIT":
        return (
            f"{metric.name.replace('_', ' ').title()} "
            f"is above the benchmark."
        )

    if metric.status == "BELOW_RANGE":
        return (
            f"{metric.name.replace('_', ' ').title()} "
            f"is below the benchmark range."
        )

    if metric.status == "ABOVE_RANGE":
        return (
            f"{metric.name.replace('_', ' ').title()} "
            f"is above the benchmark range."
        )

    if metric.status == "BELOW_LIMIT":
        return (
            f"{metric.name.replace('_', ' ').title()} "
            f"is below the benchmark."
        )

    if metric.status == "OFF_TARGET":
        return (
            f"{metric.name.replace('_', ' ').title()} "
            "is outside the target."
        )

    return (
        f"{metric.name.replace('_', ' ').title()} "
        "does not meet the benchmark."
    )

"""
Adapter between Red Scale flight features and benchmark-engine.

ARCHITECTURE OWNERSHIP
----------------------
Red Scale is responsible for:
    - FDR parsing
    - feature extraction
    - adapting data into benchmark-engine inputs
    - adapting benchmark-engine results into Red Scale API models
    - API/UI presentation

benchmark-engine is responsible for:
    - benchmark definitions
    - benchmark rules
    - benchmark evaluation
    - benchmark scoring
    - domain-specific assessment logic

IMPORTANT
---------
Do NOT add aviation thresholds, aviation rules, or aviation scoring
logic to Red Scale to compensate for limitations in benchmark-engine.

TEMPORARY COMPATIBILITY / MISMATCH NOTES
-----------------------------------------
The current benchmark-engine version does not yet expose every flight
metric that Red Scale extracts.

For the current MVP, placeholder values/mappings may be used for
metrics that are not yet supported by benchmark-engine.

These placeholders are intentional and temporary.

TODO - revisit when benchmark-engine evolves:
    - Replace placeholder metric mappings with real benchmark-engine inputs.
    - Add newly supported metrics such as pitch/climb-related metrics
      when benchmark-engine exposes them.
    - Revisit the adapter when the benchmark-engine result schema changes.
    - Remove any temporary compatibility mappings once native support exists.

The adapter must remain a translation layer. It must not become the
location where aviation assessment logic is implemented.
"""