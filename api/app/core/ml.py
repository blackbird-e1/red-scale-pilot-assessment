"""
Temporary compatibility mapping for benchmark-engine results.

ARCHITECTURE
------------
benchmark-engine is the source of truth for:

    - benchmark definitions
    - thresholds
    - rule evaluation
    - benchmark scoring
    - assessment logic
    - future risk/severity calculations

Red Scale should consume those results rather than implement
its own assessment methodology.

TEMPORARY COMPATIBILITY
-----------------------
The current benchmark-engine result exposes a normalized benchmark
score but does not yet expose the final Red Scale risk representation.

Until benchmark-engine provides that representation, this module
performs a simple compatibility conversion:

    benchmark score → Red Scale risk score

This is intentionally temporary.

TODO
----
When benchmark-engine exposes a native risk score:

    1. Update benchmark_adapter.py to consume it.
    2. Remove this conversion.
    3. Remove this module if no longer required.

Do not add aviation-specific thresholds or assessment rules here.
"""


def predict_risk(benchmark_score: float) -> float:
    """
    Temporarily convert a benchmark-engine score into the
    Red Scale risk representation.

    benchmark-engine score:
        0.0 = worst performance
        1.0 = best performance

    Red Scale risk:
        0.0 = no risk
        100.0 = maximum risk

    This conversion is compatibility code only. The permanent
    risk calculation belongs in benchmark-engine.
    """

    benchmark_score = max(0.0, min(1.0, benchmark_score))

    return (1.0 - benchmark_score) * 100.0