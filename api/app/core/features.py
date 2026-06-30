"""
Flight Feature Extraction.

Responsibilities:
- Compute numerical flight metrics
- Produce a FlightFeatures object

This module DOES NOT:
- Apply SOP rules
- Perform machine learning
- Generate reports
"""

from __future__ import annotations

import pandas as pd

from app.models.flight_features import FlightFeatures


def extract_features(df: pd.DataFrame) -> FlightFeatures:
    """
    Extract numerical flight features from a cleaned FDR DataFrame.

    Parameters
    ----------
    df : pd.DataFrame
        Clean flight data returned by parse_fdr().

    Returns
    -------
    FlightFeatures
        Extracted numerical flight metrics.
    """

    if df.empty:
        raise ValueError("Flight DataFrame is empty.")

    # ------------------------------------------------------------------
    # Flight Duration
    # ------------------------------------------------------------------

    duration_sec = (
        df["timestamp_sec"].iloc[-1]
        - df["timestamp_sec"].iloc[0]
    )

    # ------------------------------------------------------------------
    # Altitude
    # ------------------------------------------------------------------

    max_altitude_ft = df["altitude_ft"].max()
    min_altitude_ft = df["altitude_ft"].min()

    # ------------------------------------------------------------------
    # Airspeed
    # ------------------------------------------------------------------

    max_speed_knots = df["indicated_airspeed_knots"].max()
    avg_speed_knots = df["indicated_airspeed_knots"].mean()

    # ------------------------------------------------------------------
    # Pitch
    # ------------------------------------------------------------------

    max_pitch_deg = df["pitch_deg"].max()
    min_pitch_deg = df["pitch_deg"].min()

    # ------------------------------------------------------------------
    # Roll
    # ------------------------------------------------------------------

    max_roll_deg = df["roll_deg"].max()
    min_roll_deg = df["roll_deg"].min()

    # ------------------------------------------------------------------
    # Bank Angle
    # ------------------------------------------------------------------

    max_bank_angle_deg = (
        df["bank_angle_deg"]
        .abs()
        .max()
    )

    # ------------------------------------------------------------------
    # Vertical Speed
    # ------------------------------------------------------------------

    max_climb_rate_fpm = (
        df["vertical_speed_fpm"]
        .clip(lower=0)
        .max()
    )

    max_descent_rate_fpm = abs(
        df["vertical_speed_fpm"].min()
    )

    # ------------------------------------------------------------------
    # Throttle
    # ------------------------------------------------------------------

    avg_throttle_percent = (
        df["throttle_percent"].mean()
    )

    # ------------------------------------------------------------------
    # Return Features
    # ------------------------------------------------------------------

    return FlightFeatures(
        duration_sec=float(duration_sec),

        max_altitude_ft=float(max_altitude_ft),
        min_altitude_ft=float(min_altitude_ft),

        max_speed_knots=float(max_speed_knots),
        avg_speed_knots=float(avg_speed_knots),

        max_pitch_deg=float(max_pitch_deg),
        min_pitch_deg=float(min_pitch_deg),

        max_roll_deg=float(max_roll_deg),
        min_roll_deg=float(min_roll_deg),

        max_bank_angle_deg=float(max_bank_angle_deg),

        max_climb_rate_fpm=float(max_climb_rate_fpm),
        max_descent_rate_fpm=float(max_descent_rate_fpm),

        avg_throttle_percent=float(avg_throttle_percent),
    )