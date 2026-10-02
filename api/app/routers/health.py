"""Health router — GET /health."""

import logging

import asyncpg
from fastapi import APIRouter

from app.config import settings
from app.models.schemas import HealthResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Return backend and PostgreSQL health status."""
    components: dict[str, str] = {}

    try:
        database_url = settings.database_url.replace(
            "postgresql+asyncpg://",
            "postgresql://",
            1,
        )

        conn = await asyncpg.connect(database_url)
        await conn.execute("SELECT 1")
        await conn.close()
        components["postgres"] = "ok"
    except Exception as exc:
        logger.warning("Postgres health check failed: %s", exc)
        components["postgres"] = "unavailable"

    overall = "ok" if components["postgres"] == "ok" else "degraded"

    return HealthResponse(
        status=overall,
        components=components,
    )