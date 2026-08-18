"""
Red Scale FastAPI application entry point.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.limiter import limiter
from app.routers.assessment import router as assessment_router
from app.routers.health import router as health_router
from app.routers.debrief import router as debrief_router
from app.routers.chat import router as chat_router
from app.routers.auth import router as auth_router

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.DEBUG if not settings.is_production else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle.
    """

    os.makedirs(settings.fastf1_cache_dir, exist_ok=True)

    logger.info(
        "Red Scale API starting up — env=%s model=%s",
        settings.env,
        settings.groq_model,
    )

    yield

    logger.info("Red Scale API shutting down.")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Red Scale API",
    description="AI-powered pilot assessment and debriefing system.",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)


# ---------------------------------------------------------------------------
# Rate Limiting
# ---------------------------------------------------------------------------

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.api_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

# Health
app.include_router(health_router)

# Flight assessment
app.include_router(
    assessment_router,
    prefix="/api/v1",
)


# ---------------------------------------------------------------------------
# Global Error Handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.error(
        "Unhandled exception: %s",
        exc,
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal error occurred."
        },
    )

app.include_router(
    debrief_router,
    prefix="/api/v1",
)

app.include_router(
    chat_router,
    prefix="/api/v1",
)

# Authentication
app.include_router(
    auth_router,
    prefix="/api/v1",
)

# Flight assessment
app.include_router(
    assessment_router,
    prefix="/api/v1",
)