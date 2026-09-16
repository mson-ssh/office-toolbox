from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


JobStatus = Literal["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "EXPIRED"]


class JobFileResponse(BaseModel):
    id: str
    role: Literal["input", "output"]
    filename: str
    mime_type: str
    size_bytes: int
    order_index: int = 0


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tool_id: str
    status: JobStatus
    original_filename: str
    options: dict[str, Any]
    progress: int | None
    progress_stage: str | None
    created_at: datetime
    started_at: datetime | None
    finished_at: datetime | None
    expires_at: datetime | None
    error_code: str | None
    error_message: str | None
    result_files: list[JobFileResponse] = Field(default_factory=list)
    download_filename: str | None = None


class JobCreatedResponse(BaseModel):
    job_id: str
    status: JobStatus
    created_at: datetime


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
    page: int
    limit: int


class ErrorResponse(BaseModel):
    code: str
    message: str
    job_id: str | None = None
