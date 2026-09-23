"""
Flight Assessment Service.

This module orchestrates the complete flight assessment pipeline.

Pipeline:

CSV
    ↓
Parser
    ↓
Feature Extraction
    ↓
Benchmark Assessment
    ↓
Competency + Behaviour Findings
    ↓
Telemetry Sampling
    ↓
Assessment Model
"""

from pathlib import Path

import pandas as pd

from app.core.benchmark_adapter import benchmark_assessment
from app.core.features import extract_features
from app.core.parser import parse_fdr
from app.models.assessment import (
    Assessment,
    TelemetryPoint,
    VisualObservation,
)


MAX_TELEMETRY_POINTS = 240


def build_telemetry(df: pd.DataFrame) -> list[TelemetryPoint]:
    """
    Build a compact visualization-ready telemetry series.

    The original FDR may contain a large number of samples.
    To keep the API response lightweight, the series is uniformly
    downsampled to MAX_TELEMETRY_POINTS when necessary.
    """

    if df.empty:
        return []

    if len(df) <= MAX_TELEMETRY_POINTS:
        sampled = df
    else:
        indices = [
            round(index)
            for index in (
                i * (len(df) - 1) / (MAX_TELEMETRY_POINTS - 1)
                for i in range(MAX_TELEMETRY_POINTS)
            )
        ]

        sampled = df.iloc[indices]

    telemetry = []

    for row in sampled.itertuples(index=False):
        telemetry.append(
            TelemetryPoint(
                timestamp_sec=float(row.timestamp_sec),
                altitude_ft=float(row.altitude_ft),
                indicated_airspeed_knots=float(
                    row.indicated_airspeed_knots
                ),
                pitch_deg=float(row.pitch_deg),
                roll_deg=float(row.roll_deg),
                vertical_speed_fpm=float(row.vertical_speed_fpm),
                bank_angle_deg=float(row.bank_angle_deg),
                throttle_percent=float(row.throttle_percent),
            )
        )

    return telemetry


def assess_flight(
    csv_path: Path,
    visual_observations: list[VisualObservation] | None = None,
) -> Assessment:
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
    # Benchmark Assessment
    # -------------------------------------------------------------

    benchmark = benchmark_assessment(features)

    # -------------------------------------------------------------
    # Build visualization telemetry
    # -------------------------------------------------------------

    telemetry = build_telemetry(df)

    # -------------------------------------------------------------
    # Return Assessment
    # -------------------------------------------------------------

    return Assessment(
        features=features,
        benchmark=benchmark,
        visual_observations=visual_observations or [],
        telemetry=telemetry,
    )