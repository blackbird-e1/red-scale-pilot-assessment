from pathlib import Path
from tempfile import NamedTemporaryFile
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import require_trainer
from app.models.assessment import Assessment
from app.models.assessment_record import AssessmentRecord
from app.models.user import User, UserRole
from app.services.assessment_service import assess_flight
from app.services.vision_service import analyze_image
from app.models.assessment_history import AssessmentHistoryItem

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

BENCHMARK_ID = "aviation"
BENCHMARK_VERSION = "1"


@router.post(
    "",
    response_model=Assessment,
    status_code=status.HTTP_200_OK,
)
async def create_assessment(
    file: UploadFile = File(...),
    image: UploadFile | None = File(None),
    pilot_id: UUID = Form(...),
    current_user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
) -> Assessment:
    """
    Assess an uploaded flight-data CSV file with optional
    visual evidence and persist the resulting assessment.

    Only authenticated trainers can create assessments.
    """

    # ---------------------------------------------------------
    # Validate pilot
    # ---------------------------------------------------------

    result = await db.execute(
        select(User).where(
            User.id == pilot_id,
            User.role == UserRole.TRAINEE,
        )
    )

    pilot = result.scalar_one_or_none()

    if pilot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pilot/trainee not found.",
        )

    # ---------------------------------------------------------
    # Validate CSV
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Validate image
    # ---------------------------------------------------------

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
        # Run existing assessment pipeline
        # ---------------------------------------------------------

        assessment = assess_flight(
            csv_temp_path,
            visual_observations=visual_observations,
        )

        # ---------------------------------------------------------
        # Persist assessment
        # ---------------------------------------------------------

        record = AssessmentRecord(
            pilot_id=pilot_id,
            created_by=current_user.id,
            source_filename=file.filename,
            benchmark_id=BENCHMARK_ID,
            benchmark_version=BENCHMARK_VERSION,

            duration_sec=assessment.features.duration_sec,
            max_altitude_ft=assessment.features.max_altitude_ft,
            min_altitude_ft=assessment.features.min_altitude_ft,
            max_speed_knots=assessment.features.max_speed_knots,
            avg_speed_knots=assessment.features.avg_speed_knots,
            max_pitch_deg=assessment.features.max_pitch_deg,
            min_pitch_deg=assessment.features.min_pitch_deg,
            max_roll_deg=assessment.features.max_roll_deg,
            min_roll_deg=assessment.features.min_roll_deg,
            max_bank_angle_deg=assessment.features.max_bank_angle_deg,
            max_climb_rate_fpm=assessment.features.max_climb_rate_fpm,
            max_descent_rate_fpm=assessment.features.max_descent_rate_fpm,
            avg_throttle_percent=assessment.features.avg_throttle_percent,

            risk_score=assessment.risk_score,
            overall_rating=assessment.overall_rating,

            benchmark_results=[
                item.model_dump(mode="json")
                for item in assessment.benchmark_results
            ],

            violations=[
                item.model_dump(mode="json")
                for item in assessment.violations
            ],

            visual_observations=assessment.visual_observations,

            telemetry=[
                item.model_dump(mode="json")
                for item in assessment.telemetry
            ],
        )

        db.add(record)
        await db.commit()

        return assessment

    except ValueError as exc:
        await db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    except Exception:
        await db.rollback()
        raise

    finally:
        await file.close()

        if image:
            await image.close()

        if csv_temp_path and csv_temp_path.exists():
            csv_temp_path.unlink()

        if image_temp_path and image_temp_path.exists():
            image_temp_path.unlink()

@router.get(
    "/pilot/{pilot_id}",
    response_model=list[AssessmentHistoryItem],
    status_code=status.HTTP_200_OK,
)
async def get_pilot_assessment_history(
    pilot_id: UUID,
    current_user: User = Depends(require_trainer),
    db: AsyncSession = Depends(get_db),
) -> list[AssessmentHistoryItem]:
    """
    Return assessment history for a trainee.

    Only authenticated trainers can access assessment history.
    """

    # ---------------------------------------------------------
    # Validate pilot
    # ---------------------------------------------------------

    result = await db.execute(
        select(User).where(
            User.id == pilot_id,
            User.role == UserRole.TRAINEE,
        )
    )

    pilot = result.scalar_one_or_none()

    if pilot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pilot/trainee not found.",
        )

    # ---------------------------------------------------------
    # Fetch assessment history
    # ---------------------------------------------------------

    result = await db.execute(
        select(AssessmentRecord)
        .where(AssessmentRecord.pilot_id == pilot_id)
        .order_by(AssessmentRecord.created_at.desc())
    )

    records = result.scalars().all()

    return [
        AssessmentHistoryItem(
            id=record.id,
            created_at=record.created_at,
            source_filename=record.source_filename,
            benchmark_id=record.benchmark_id,
            benchmark_version=record.benchmark_version,
            risk_score=record.risk_score,
            overall_rating=record.overall_rating,
        )
        for record in records
    ]