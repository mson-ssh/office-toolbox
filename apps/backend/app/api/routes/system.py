import os
import shutil
from importlib.metadata import PackageNotFoundError, version

from fastapi import APIRouter, Request, Response
from sqlalchemy import text

from app.core.config import Settings


router = APIRouter()


@router.get("/health")
async def health(request: Request, response: Response) -> dict[str, object]:
    database = "healthy"
    storage = "healthy"
    pymupdf = "healthy"
    tesseract = "healthy" if shutil.which("tesseract") else "unhealthy"
    ocrmypdf = "healthy" if shutil.which("ocrmypdf") else "unhealthy"
    try:
        with request.app.state.session_factory() as session:
            session.execute(text("SELECT 1"))
    except Exception:
        database = "unhealthy"
    settings: Settings = request.app.state.settings
    if not settings.jobs_dir.is_dir() or not os.access(settings.jobs_dir, os.R_OK | os.W_OK | os.X_OK):
        storage = "unhealthy"
    try:
        version("PyMuPDF")
    except PackageNotFoundError:
        pymupdf = "unhealthy"
    stirling = "healthy" if await request.app.state.stirling_adapter.healthy() else "unhealthy"
    status = "healthy" if database == storage == pymupdf == tesseract == ocrmypdf == stirling == "healthy" else "unhealthy"
    if status == "unhealthy":
        response.status_code = 503
    return {
        "status": status,
        "database": database,
        "storage": storage,
        "processing_services": {"pymupdf": pymupdf, "tesseract": tesseract, "ocrmypdf": ocrmypdf, "stirling": stirling},
        "version": settings.app_version,
    }


@router.get("/config")
def public_config(request: Request) -> dict[str, object]:
    settings: Settings = request.app.state.settings
    return {
        "max_upload_size_mb": settings.max_upload_size_mb,
        "max_files_per_job": settings.max_files_per_job,
        "max_pdf_pages": settings.max_pdf_pages,
        "allowed_mime_types": ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/tiff"],
        "retention_minutes": settings.job_retention_minutes,
        "max_light_jobs": settings.max_light_jobs,
        "version": settings.app_version,
        "app_name": settings.app_name,
        "mode": "local",
    }
