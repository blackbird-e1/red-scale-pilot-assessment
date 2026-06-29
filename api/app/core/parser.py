"""
Flight Data Recorder (FDR) Parser.

Responsibilities:
- Read CSV
- Validate required columns
- Clean malformed values
- Convert numeric columns
- Return a clean pandas DataFrame

This module DOES NOT:
- Calculate features
- Apply SOP rules
- Run machine learning
- Generate reports
"""

from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------------------
# Required Columns
# ---------------------------------------------------------------------------

REQUIRED_COLUMNS = [
    "timestamp_sec",
    "altitude_ft",
    "indicated_airspeed_knots",
    "pitch_deg",
    "roll_deg",
    "yaw_deg",
    "vertical_speed_fpm",
    "bank_angle_deg",
    "throttle_percent",
]


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def parse_fdr(csv_path: str | Path) -> pd.DataFrame:
    """
    Parse and validate a Flight Data Recorder CSV.

    Parameters
    ----------
    csv_path : str | Path
        Path to the flight data CSV.

    Returns
    -------
    pd.DataFrame
        Cleaned and validated flight data.

    Raises
    ------
    FileNotFoundError
        If the CSV does not exist.

    ValueError
        If required columns are missing.
    """

    csv_path = Path(csv_path)

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    # -----------------------------------------------------------------------
    # Read CSV
    # -----------------------------------------------------------------------

    df = pd.read_csv(csv_path)

    # -----------------------------------------------------------------------
    # Validate required columns
    # -----------------------------------------------------------------------

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]

    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(missing)}"
        )

    # -----------------------------------------------------------------------
    # Clean Unicode minus signs
    # -----------------------------------------------------------------------

    object_columns = df.select_dtypes(include="object").columns

    for column in object_columns:
        df[column] = (
            df[column]
            .astype(str)
            .str.replace("−", "-", regex=False)
            .str.strip()
        )

    # -----------------------------------------------------------------------
    # Convert numeric columns
    # -----------------------------------------------------------------------

    numeric_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column != "timestamp_sec"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    # Timestamp should also be numeric
    df["timestamp_sec"] = pd.to_numeric(
        df["timestamp_sec"],
        errors="coerce",
    )

    # -----------------------------------------------------------------------
    # Remove invalid rows
    # -----------------------------------------------------------------------

    df = df.dropna()

    # -----------------------------------------------------------------------
    # Reset index
    # -----------------------------------------------------------------------

    df = df.reset_index(drop=True)

    return df