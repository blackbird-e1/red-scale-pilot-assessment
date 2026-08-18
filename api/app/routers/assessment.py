from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.models.assessment import Assessment
from app.services.assessment_service import assess_flight
from app.services.vision_service import analyze_image


router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"],
)


ALLOWED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024


@router.post(
    "",
    response_model=Assessment,
    status_code=status.HTTP_200_OK,
)
async def create_assessment(
    file: UploadFile = File(...),
    image: UploadFile | None = File(None),
) -> Assessment:
    """
    Assess an uploaded flight-data CSV file with optional
    visual evidence.
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

    if image and image.filename:
        image_suffix = Path(image.filename).suffix.lower()

        if image_suffix not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PNG, JPG, and JPEG images are supported.",
            )

    csv_temp_path = None
    image_temp_path = None

    try:
        # ---------------------------------------------------------
        # Save CSV
        # ---------------------------------------------------------

        with NamedTemporaryFile(
            mode="wb",
            suffix=".csv",
            delete=False,
        ) as temp_file:
            csv_temp_path = Path(temp_file.name)

            while chunk := await file.read(1024 * 1024):
                temp_file.write(chunk)

        # ---------------------------------------------------------
        # Analyze optional visual evidence
        # ---------------------------------------------------------

        visual_observations = []

        if image and image.filename:
            image_suffix = Path(image.filename).suffix.lower()

            image_bytes = await image.read()

            if len(image_bytes) > MAX_IMAGE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Image file is too large. Maximum size is 10 MB.",
                )

            with NamedTemporaryFile(
                mode="wb",
                suffix=image_suffix,
                delete=False,
            ) as temp_file:
                image_temp_path = Path(temp_file.name)
                temp_file.write(image_bytes)

            visual_observations = await analyze_image(
                image_temp_path
            )

        # ---------------------------------------------------------
        # Run assessment
        # ---------------------------------------------------------

        return assess_flight(
            csv_temp_path,
            visual_observations=visual_observations,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    finally:
        await file.close()

        if image:
            await image.close()

        if csv_temp_path and csv_temp_path.exists():
            csv_temp_path.unlink()

        if image_temp_path and image_temp_path.exists():
            image_temp_path.unlink()