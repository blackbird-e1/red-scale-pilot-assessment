import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.tornado.schemas import TornadoAssessmentResult
from app.tornado.service import assess_tornado_flight
from app.tornado.examples import EXAMPLE_FLIGHTS

router = APIRouter(
    prefix="/tornado",
    tags=["TORNADO"],
)


@router.post(
    "/assess",
    response_model=TornadoAssessmentResult,
)
async def assess_flight(
    telemetry_csv: UploadFile = File(...),
    reference_csv: UploadFile = File(...),
    flight_id: str = Form(...),
) -> TornadoAssessmentResult:

    if not telemetry_csv.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Telemetry CSV is required.",
        )

    if not reference_csv.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reference CSV is required.",
        )

    if not telemetry_csv.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Telemetry file must be a CSV.",
        )

    if not reference_csv.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reference file must be a CSV.",
        )

    telemetry_path = None
    reference_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=".csv",
            delete=False,
        ) as telemetry_file:
            telemetry_path = Path(telemetry_file.name)

        with tempfile.NamedTemporaryFile(
            suffix=".csv",
            delete=False,
        ) as reference_file:
            reference_path = Path(reference_file.name)

        telemetry_path.write_bytes(await telemetry_csv.read())
        reference_path.write_bytes(await reference_csv.read())

        result = assess_tornado_flight(
            telemetry_csv=telemetry_path,
            reference_csv=reference_path,
            flight_id=flight_id,
        )

        return TornadoAssessmentResult(**result)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    finally:
        if telemetry_path is not None:
            telemetry_path.unlink(missing_ok=True)

        if reference_path is not None:
            reference_path.unlink(missing_ok=True)

@router.get("/examples")
async def list_examples():
    return [
        {
            "id": flight_id,
            "name": config["name"],
            "description": config["description"],
        }
        for flight_id, config in EXAMPLE_FLIGHTS.items()
    ]

@router.post(
    "/examples/{flight_id}/assess",
    response_model=TornadoAssessmentResult,
)
async def assess_example_flight(
    flight_id: str,
) -> TornadoAssessmentResult:

    example = EXAMPLE_FLIGHTS.get(flight_id)

    if example is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Example flight not found.",
        )

    result = assess_tornado_flight(
        telemetry_csv=example["telemetry"],
        reference_csv=example["reference"],
        flight_id=flight_id,
    )

    return TornadoAssessmentResult(**result)