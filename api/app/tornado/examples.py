from pathlib import Path


TORNADO_DATA_DIR = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "tornado"
)


EXAMPLE_FLIGHTS = {
    "flight-01a-ellipse": {
        "name": "Flight 01 — Ellipse",
        "description": "Autonomous quadrotor ellipse flight.",
        "telemetry": TORNADO_DATA_DIR
        / "flight-01a-ellipse"
        / "telemetry.csv",
        "reference": TORNADO_DATA_DIR
        / "flight-01a-ellipse"
        / "reference.csv",
    },
}