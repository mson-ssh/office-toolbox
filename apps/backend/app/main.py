import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.adapters.pymupdf.client import PyMuPDFAdapter
from app.adapters.ocr.client import OcrAdapter
from app.adapters.stirling.client import StirlingAdapter
from app.api.routes import jobs, system, tools
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.session import create_session_factory
from app.jobs.coordinator import JobCoordinator
from app.jobs.errors import OfficeBoxError
from app.jobs.service import JobService
from app.storage.manager import StorageManager
from app.tools.executor import ToolExecutor


configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    settings.database_dir.mkdir(parents=True, exist_ok=True)
    settings.jobs_dir.mkdir(parents=True, exist_ok=True)
    Path(settings.data_dir).resolve().mkdir(parents=True, exist_ok=True)
    session_factory = create_session_factory(settings)
    storage = StorageManager(settings.jobs_dir)
    adapter = PyMuPDFAdapter(settings)
    ocr_adapter = OcrAdapter(settings)
    stirling_adapter = StirlingAdapter(settings)
    processor = ToolExecutor(adapter, ocr_adapter, stirling_adapter)
    job_service = JobService(settings, session_factory, storage, adapter, processor)
    coordinator = JobCoordinator(settings, job_service)
    job_service.attach_queue(coordinator)

    app.state.settings = settings
    app.state.session_factory = session_factory
    app.state.storage = storage
    app.state.job_service = job_service
    app.state.stirling_adapter = stirling_adapter
    app.state.coordinator = coordinator
    await coordinator.start()
    try:
        yield
    finally:
        await coordinator.stop()
        session_factory.kw["bind"].dispose()


app = FastAPI(
    title="OfficeBox API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url=None,
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


@app.exception_handler(OfficeBoxError)
async def officebox_error_handler(_request: Request, exc: OfficeBoxError) -> JSONResponse:
    body: dict[str, str] = {"code": exc.code, "message": exc.message}
    if exc.job_id:
        body["job_id"] = exc.job_id
    return JSONResponse(status_code=exc.status_code, content=body)


@app.exception_handler(Exception)
async def unexpected_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled request error", exc_info=(type(exc), exc, exc.__traceback__))
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_ERROR", "message": "Đã xảy ra lỗi hệ thống."},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, _exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"code": "REQUEST_INVALID", "message": "Dữ liệu yêu cầu không hợp lệ."},
    )


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Cache-Control", "no-store" if request.url.path.startswith("/api/") else "no-cache")
    return response


app.include_router(system.router, prefix="/api/v1", tags=["system"])
app.include_router(tools.router, prefix="/api/v1", tags=["tools"])
app.include_router(jobs.router, prefix="/api/v1", tags=["jobs"])
