from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "OfficeBox"
    app_version: str = "0.1.0"
    data_dir: Path = Path("/data")
    job_retention_minutes: int = Field(default=60, ge=1, le=10080)
    cleanup_interval_minutes: int = Field(default=10, ge=1, le=1440)
    max_upload_size_mb: int = Field(default=100, ge=1, le=100)
    max_files_per_job: int = Field(default=20, ge=1, le=100)
    max_light_jobs: int = Field(default=2, ge=1, le=16)
    max_heavy_jobs: int = Field(default=1, ge=1, le=8)
    max_queue_size: int = Field(default=100, ge=1, le=10000)
    max_pdf_pages: int = Field(default=200, ge=1, le=5000)
    max_total_pixels: int = Field(default=250_000_000, ge=1_000_000)
    max_output_size_mb: int = Field(default=500, ge=1, le=4096)
    min_free_space_mb: int = Field(default=512, ge=32)
    processing_timeout_seconds: int = Field(default=600, ge=10, le=86400)
    stirling_url: str = "http://stirling:8080"
    stirling_api_key: str = ""

    @property
    def jobs_dir(self) -> Path:
        return self.data_dir / "jobs"

    @property
    def database_dir(self) -> Path:
        return self.data_dir / "database"

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.database_dir / 'officebox.db'}"

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def max_output_bytes(self) -> int:
        return self.max_output_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
