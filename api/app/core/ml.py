from app.models.flight_features import FlightFeatures
from app.models.rule_violation import RuleViolation


def predict_risk(
    features: FlightFeatures,
    violations: list[RuleViolation],
) -> float:

    score = 0.0

    score += len(violations) * 15

    if features.max_bank_angle_deg > 45:
        score += 20

    if features.max_speed_knots > 250:
        score += 20

    if features.max_climb_rate_fpm > 2000:
        score += 15

    if features.max_descent_rate_fpm < -1500:
        score += 15

    return min(score, 100.0)