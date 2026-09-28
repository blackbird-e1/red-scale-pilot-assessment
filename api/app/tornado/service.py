from pathlib import Path

from app.tornado.adapter import load_tornado_flight
from app.tornado.evaluator import evaluate_tornado_flight
from app.tornado.events import detect_trajectory_deviation_events


def assess_tornado_flight(
    telemetry_csv: Path,
    reference_csv: Path,
    flight_id: str,
):
    flight = load_tornado_flight(
        telemetry_csv=telemetry_csv,
        reference_csv=reference_csv,
        flight_id=flight_id,
    )

    metrics = evaluate_tornado_flight(flight)
    events = detect_trajectory_deviation_events(flight)

    return {
        "flight_id": flight.flight_id,
        "duration_sec": flight.duration_sec,
        "metrics": metrics,
        "events": [event.model_dump() for event in events],
    }