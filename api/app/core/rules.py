from app.models.flight_features import FlightFeatures
from app.models.rule_violation import RuleViolation

# ------------------------------------------------------------------
# Thresholds
# ------------------------------------------------------------------

MAX_BANK_ANGLE_DEG = 45.0
MAX_PITCH_UP_DEG = 20.0
MAX_PITCH_DOWN_DEG = -15.0
MAX_CLIMB_RATE_FPM = 2000.0
MAX_DESCENT_RATE_FPM = -1500.0
MAX_SPEED_KNOTS = 250.0


def check_bank_angle(features: FlightFeatures):
    if features.max_bank_angle_deg <= MAX_BANK_ANGLE_DEG:
        return None

    return RuleViolation(
        rule_id="BANK_001",
        rule_name="Excessive Bank Angle",
        severity="high",
        message="Maximum bank angle exceeded the allowed limit.",
        expected=f"<= {MAX_BANK_ANGLE_DEG} deg",
        actual=f"{features.max_bank_angle_deg:.1f} deg",
    )


def check_pitch_up(features: FlightFeatures):
    if features.max_pitch_deg <= MAX_PITCH_UP_DEG:
        return None

    return RuleViolation(
        rule_id="PITCH_001",
        rule_name="Excessive Pitch Up",
        severity="medium",
        message="Aircraft pitched up excessively.",
        expected=f"<= {MAX_PITCH_UP_DEG} deg",
        actual=f"{features.max_pitch_deg:.1f} deg",
    )


def check_pitch_down(features: FlightFeatures):
    if features.min_pitch_deg >= MAX_PITCH_DOWN_DEG:
        return None

    return RuleViolation(
        rule_id="PITCH_002",
        rule_name="Excessive Pitch Down",
        severity="medium",
        message="Aircraft pitched down excessively.",
        expected=f">= {MAX_PITCH_DOWN_DEG} deg",
        actual=f"{features.min_pitch_deg:.1f} deg",
    )


def check_climb_rate(features: FlightFeatures):
    if features.max_climb_rate_fpm <= MAX_CLIMB_RATE_FPM:
        return None

    return RuleViolation(
        rule_id="CLIMB_001",
        rule_name="Excessive Climb Rate",
        severity="medium",
        message="Climb rate exceeded limit.",
        expected=f"<= {MAX_CLIMB_RATE_FPM:.0f} fpm",
        actual=f"{features.max_climb_rate_fpm:.0f} fpm",
    )


def check_descent_rate(features: FlightFeatures):
    if features.max_descent_rate_fpm >= MAX_DESCENT_RATE_FPM:
        return None

    return RuleViolation(
        rule_id="DESCENT_001",
        rule_name="Excessive Descent Rate",
        severity="high",
        message="Descent rate exceeded limit.",
        expected=f">= {MAX_DESCENT_RATE_FPM:.0f} fpm",
        actual=f"{features.max_descent_rate_fpm:.0f} fpm",
    )


def check_speed(features: FlightFeatures):
    if features.max_speed_knots <= MAX_SPEED_KNOTS:
        return None

    return RuleViolation(
        rule_id="SPD_001",
        rule_name="High Airspeed",
        severity="medium",
        message="Aircraft exceeded speed limit.",
        expected=f"<= {MAX_SPEED_KNOTS:.0f} knots",
        actual=f"{features.max_speed_knots:.1f} knots",
    )


def evaluate_rules(features: FlightFeatures) -> list[RuleViolation]:

    violations = []

    checks = (
        check_bank_angle,
        check_pitch_up,
        check_pitch_down,
        check_climb_rate,
        check_descent_rate,
        check_speed,
    )

    for check in checks:
        result = check(features)

        if result is not None:
            violations.append(result)

    return violations