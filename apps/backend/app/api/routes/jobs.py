from urllib.parse import quote

from fastapi import APIRouter, File, Form, Query, Request, UploadFile
from fastapi.responses import FileResponse, Response
from starlette.background import BackgroundTask

from app.jobs.errors import OfficeBoxError
from app.jobs.schemas import JobCreatedResponse, JobListResponse, JobResponse


router = APIRouter()


@router.post("/jobs", response_model=JobCreatedResponse, status_code=202)
async def create_job(
    request: Request,
    tool_id: str = Form(...),
    options: str = Form("{}"),
    files: list[UploadFile] = File(...),
) -> JobCreatedResponse:
    job = await request.app.state.job_service.create_job(files, tool_id, options)
    return JobCreatedResponse(job_id=job.id, status="QUEUED", created_at=job.created_at)


@router.get("/jobs", response_model=JobListResponse)
def list_jobs(
    request: Request,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> JobListResponse:
    return request.app.state.job_service.list_jobs(page, limit)


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(request: Request, job_id: str) -> JobResponse:
    return request.app.state.job_service.get_job(job_id)


@router.delete("/jobs/{job_id}", status_code=204)
async def delete_job(request: Request, job_id: str) -> Response:
    await request.app.state.coordinator.delete_job(job_id)
    return Response(status_code=204)


@router.get("/jobs/{job_id}/download")
async def download_result(request: Request, job_id: str) -> FileResponse:
    lock = await request.app.state.coordinator.acquire_job(job_id)
    try:
        path, filename, mime_type = request.app.state.job_service.output_for_download(job_id)

        async def release_lock() -> None:
            lock.release()

        return FileResponse(
            path,
            media_type=mime_type,
            filename=filename,
            headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "no-store"},
            background=BackgroundTask(release_lock),
        )
    except Exception:
        lock.release()
        raise


@router.get("/jobs/{job_id}/preview")
async def preview_result(request: Request, job_id: str) -> FileResponse:
    lock = await request.app.state.coordinator.acquire_job(job_id)
    try:
        path, filename, mime_type = request.app.state.job_service.output_for_preview(job_id)

        async def release_lock() -> None:
            lock.release()

        return FileResponse(
            path,
            media_type=mime_type,
            headers={
                "Content-Disposition": f"inline; filename*=UTF-8''{quote(filename)}",
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "SAMEORIGIN",
                "Cache-Control": "no-store",
            },
            background=BackgroundTask(release_lock),
        )
    except Exception:
        lock.release()
        raise
