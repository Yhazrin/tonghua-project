from pydantic_settings import BaseSettings
from typing import Optional, List
from pydantic import field_validator


class Settings(BaseSettings):
    APP_NAME: str = "Tonghua API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database - Read from env, no default for security
    DATABASE_URL: str
    DB_ECHO: bool = False

    # Redis - Read from env, no default for security
    REDIS_URL: str

    # JWT - Read from env, no default for security
    SECRET_KEY: str  # Must be set via environment variable
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # WeChat
    WECHAT_APP_ID: Optional[str] = None
    WECHAT_APP_SECRET: Optional[str] = None

    # Rate Limiting
    GLOBAL_RATE_LIMIT: int = 1000  # per minute
    USER_RATE_LIMIT: int = 60  # per minute

    # AES Encryption - Read from env, no default for security
    AES_KEY: str  # Must be 32 bytes for AES-256, set via environment variable

    # CORS - Default to empty list, must be configured via env
    CORS_ORIGINS: List[str] = []

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string (comma-separated) or list."""
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
