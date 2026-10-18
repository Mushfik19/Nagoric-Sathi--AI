import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nagorik Sathi AI"
    PROJECT_VERSION: str = "1.2.0"
    API_V1_STR: str = "/api"
    
    # Environment & Host
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Database
    # Standard PostgreSQL + PostGIS URL. In local dev/test if Postgres is offline, fallback SQLite/memory engine is supported safely.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/nagoriksathi_db")
    DATABASE_SYNC_URL: str = os.getenv("DATABASE_SYNC_URL", "postgresql://postgres:postgres@localhost:5432/nagoriksathi_db")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-nagorik-sathi-jwt-key-change-in-production-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Object Storage (MinIO / S3)
    OBJECT_STORAGE_ENDPOINT: str = os.getenv("OBJECT_STORAGE_ENDPOINT", "http://localhost:9000")
    OBJECT_STORAGE_BUCKET: str = os.getenv("OBJECT_STORAGE_BUCKET", "nagoriksathi-media")
    OBJECT_STORAGE_ACCESS_KEY: str = os.getenv("OBJECT_STORAGE_ACCESS_KEY", "minioadmin")
    OBJECT_STORAGE_SECRET_KEY: str = os.getenv("OBJECT_STORAGE_SECRET_KEY", "minioadmin")
    
    # AI Pipeline & Confidence Gate Defaults
    ROUTING_CONFIDENCE_GATE_DEFAULT: float = 0.80  # 80% per R&D Section 10.11
    AI_TIMEOUT_SECONDS: int = 10
    
    # Media Limits
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_VIDEO_SIZE_MB: int = 50
    MAX_AUDIO_SIZE_MB: int = 20
    
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
