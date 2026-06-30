"""
Flight Assessment Service.

This module orchestrates the complete assessment pipeline.

Pipeline:

CSV
    ↓
Parser
    ↓
Feature Extraction
    ↓
Rule Evaluation
    ↓
Risk Prediction
    ↓
Assessment Model
"""

from pathlib import Path

from app.core.features import extract_features
from app.core.ml import predict_risk
from app.core.parser import parse_fdr
from app.core.rules import evaluate_rules
from app.models.assessment import Assessment


def determine_rating(risk_score: float) -> str:
    """
    Convert risk score into an overall pilot rating.
    """

    if risk_score < 20:
        return "Excellent"

    if risk_score < 40:
        return "Good"

    if risk_score < 60:
        return "Fair"

    if risk_score < 80:
        return "Poor"

    return "Unsafe"


def assess_flight(csv_path: Path) -> Assessment:
    """
    Execute the complete flight assessment pipeline.
    """

    # -------------------------------------------------------------
    # Parse CSV
    # -------------------------------------------------------------

    df = parse_fdr(csv_path)

    # -------------------------------------------------------------
    # Extract Features
    # -------------------------------------------------------------

    features = extract_features(df)

    # -------------------------------------------------------------
    # Evaluate SOP Rules
    # -------------------------------------------------------------

    violations = evaluate_rules(features)

    # -------------------------------------------------------------
    # Predict Risk
    # -------------------------------------------------------------

    risk_score = predict_risk(
        features=features,
        violations=violations,
    )

    # -------------------------------------------------------------
    # Determine Rating
    # -------------------------------------------------------------

    overall_rating = determine_rating(risk_score)

    # -------------------------------------------------------------
    # Return Assessment
    # -------------------------------------------------------------

    return Assessment(
        features=features,
        violations=violations,
        risk_score=risk_score,
        overall_rating=overall_rating,
    )