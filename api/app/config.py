from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Groq
    groq_api_key: str = Field(..., alias="GROQ_API_KEY")
    groq_model: str = Field(
        "openai/gpt-oss-120b",
        alias="GROQ_MODEL",
    )

    groq_vision_model: str = Field(
        "meta-llama/llama-4-scout-17b-16e-instruct",
        alias="GROQ_VISION_MODEL",
    )

    # PostgreSQL
    # Not required for the MVP yet.
    database_url: str | None = Field(
        default=None,
        alias="DATABASE_URL",
    )
    database_query_timeout: int = Field(
        5,
        alias="DATABASE_QUERY_TIMEOUT",
    )

    # pgvector / RAG
    # Not used in Phase 1.
    embedding_model: str = Field(
        "text-embedding-3-small",
        alias="EMBEDDING_MODEL",
    )
    rag_top_k: int = Field(
        5,
        alias="RAG_TOP_K",
    )

    # Redis
    # Not used in the MVP initially.
    redis_url: str = Field(
        "redis://localhost:6379/0",
        alias="REDIS_URL",
    )

    # FastF1
    # Keep for now, but it is not part of the flight assessment MVP.
    fastf1_cache_dir: str = Field(
        ".fastf1_cache",
        alias="FASTF1_CACHE_DIR",
    )

    # API
    api_host: str = Field(
        "0.0.0.0",
        alias="API_HOST",
    )
    api_port: int = Field(
        8000,
        alias="API_PORT",
    )
    api_cors_origins: list[str] = Field(
        default=["http://localhost:5173"],
        alias="API_CORS_ORIGINS",
    )
    rate_limit_per_minute: int = Field(
        20,
        alias="RATE_LIMIT_PER_MINUTE",
    )

    # Environment
    env: str = Field(
        "development",
        alias="ENV",
    )

    from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Groq
    groq_api_key: str = Field(..., alias="GROQ_API_KEY")
    groq_model: str = Field(
        "openai/gpt-oss-120b",
        alias="GROQ_MODEL",
    )

    groq_vision_model: str = Field(
        "meta-llama/llama-4-scout-17b-16e-instruct",
        alias="GROQ_VISION_MODEL",
    )

    # PostgreSQL
    # Not required for the MVP yet.
    database_url: str | None = Field(
        default=None,
        alias="DATABASE_URL",
    )
    database_query_timeout: int = Field(
        5,
        alias="DATABASE_QUERY_TIMEOUT",
    )

    # pgvector / RAG
    # Not used in Phase 1.
    embedding_model: str = Field(
        "text-embedding-3-small",
        alias="EMBEDDING_MODEL",
    )
    rag_top_k: int = Field(
        5,
        alias="RAG_TOP_K",
    )

    # Redis
    # Not used in the MVP initially.
    redis_url: str = Field(
        "redis://localhost:6379/0",
        alias="REDIS_URL",
    )

    # FastF1
    # Keep for now, but it is not part of the flight assessment MVP.
    fastf1_cache_dir: str = Field(
        ".fastf1_cache",
        alias="FASTF1_CACHE_DIR",
    )

    # API
    api_host: str = Field(
        "0.0.0.0",
        alias="API_HOST",
    )
    api_port: int = Field(
        8000,
        alias="API_PORT",
    )
    api_cors_origins: list[str] = Field(
        default=["http://localhost:5173"],
        alias="API_CORS_ORIGINS",
    )
    rate_limit_per_minute: int = Field(
        20,
        alias="RATE_LIMIT_PER_MINUTE",
    )

    # Environment
    env: str = Field(
        "development",
        alias="ENV",
    )

    @property
    def is_production(self) -> bool:
        return self.env == "production"

        # Authentication
    jwt_secret_key: str = Field(
        ...,
        alias="JWT_SECRET_KEY",
    )
    jwt_algorithm: str = Field(
        "HS256",
        alias="JWT_ALGORITHM",
    )
    jwt_expire_minutes: int = Field(
        60,
        alias="JWT_EXPIRE_MINUTES",
    )

    # Environment
    env: str = Field(
        "development",
        alias="ENV",
    )

    @property
    def is_production(self) -> bool:
        return self.env == "production"


settings = Settings()