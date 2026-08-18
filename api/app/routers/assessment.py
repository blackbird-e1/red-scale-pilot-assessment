from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.models.assessment import Assessment
from app.services.assessment_service import assess_flight


router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"],
)


@router.post(
    "",
    response_model=Assessment,
    status_code=status.HTTP_200_OK,
)
async def create_assessment(
    file: UploadFile = File(...),
) -> Assessment:
    """
    Assess an uploaded flight-data CSV file.
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A CSV file is required.",
        )

    if Path(file.filename).suffix.lower() != ".csv":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported.",
        )

    temp_path = None

    try:
        with NamedTemporaryFile(
            mode="wb",
            suffix=".csv",
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)

            while chunk := await file.read(1024 * 1024):
                temp_file.write(chunk)

        return assess_flight(temp_path)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    finally:
        await file.close()

        if temp_path and temp_path.exists():
            temp_path.unlink()