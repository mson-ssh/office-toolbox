import json
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session, sessionmaker

from app.adapters.pymupdf.client import ProcessingError, PyMuPDFAdapter
from app.core.config import Settings
from app.db.models import Job, JobFile
from app.jobs.errors import OfficeBoxError
from app.jobs.schemas import JobFileResponse, JobListResponse, JobResponse
from app.storage.manager import StorageError, StorageManager, UploadTooLarge
from app.tools.executor import ToolExecutor
from app.tools.registry import TOOLS, validate_options


TERMINAL_STATUSES = {"COMPLETED", "FAILED", "EXPIRED"}
PREVIEWABLE_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
}


def utc_now() -> datetime:
    return datetime.now(UTC)


def as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def optional_utc(value: datetime | None) -> datetime | None:
    return as_utc(value) if value is not None else None


def safe_original_filename(value: str | None) -> str:
    filename = Path((value or "document.pdf").replace("\\", "/")).name
    filename = re.sub(r"[\x00-\x1f\x7f]", "_", filename).strip().strip(".")
    return filename[:255] or "document.pdf"


def result_download_name(original_filename: str, extension: str, suffix: str) -> str:
    stem = Path(original_filename).stem
    stem = re.sub(r"[^\w .()-]", "_", stem, flags=re.UNICODE).strip(" .")[:150]
    return f"{stem or 'document'}-{suffix}.{extension}"


class JobService:
    def __init__(
        self,
        settings: Settings,
        session_factory: sessionmaker[Session],
        storage: StorageManager,
        adapter: PyMuPDFAdapter,
        processor: ToolExecutor,
    ) -> None:
        self.settings = settings
        self.session_factory = session_factory
        self.storage = storage
        self.adapter = adapter
        self.processor = processor
        self.queue: object | None = None

    def attach_queue(self, queue: object) -> None:
        self.queue = queue

    @staticmethod
    def _serialize(job: Job) -> JobResponse:
        options = json.loads(job.options_json)
        outputs = [
            JobFileResponse(
                id=item.id,
                role="output",
                filename=job.output_filename or item.original_filename,
                mime_type=item.mime_type,
                size_bytes=item.size_bytes,
                order_index=item.order_index,
            )
            for item in job.files
            if item.role == "output"
        ]
        return JobResponse(
            id=job.id,
            tool_id=job.tool_id,
            status=job.status,  # type: ignore[arg-type]
            original_filename=job.original_filename,
            options=options,
            progress=job.progress,
            progress_stage=job.progress_stage,
            created_at=as_utc(job.created_at),
            started_at=optional_utc(job.started_at),
            finished_at=optional_utc(job.finished_at),
            expires_at=optional_utc(job.expires_at),
            error_code=job.error_code,
            error_message=job.error_message,
            result_files=outputs,
            download_filename=job.output_filename,
        )

    def get_job_model(self, job_id: str) -> Job:
        try:
            self.storage.validate_job_id(job_id)
        except ValueError:
            raise OfficeBoxError(404, "JOB_NOT_FOUND", "Không tìm thấy công việc.") from None
        with self.session_factory() as session:
            job = session.scalar(select(Job).where(Job.id == job_id))
            if job is None:
                raise OfficeBoxError(404, "JOB_NOT_FOUND", "Không tìm thấy công việc.")
            _ = job.files
            session.expunge(job)
            return job

    def get_job(self, job_id: str) -> JobResponse:
        return self._serialize(self.get_job_model(job_id))

    def list_jobs(self, page: int, limit: int) -> JobListResponse:
        offset = (page - 1) * limit
        with self.session_factory() as session:
            total = session.scalar(select(func.count()).select_from(Job)) or 0
            jobs = list(
                session.scalars(select(Job).order_by(Job.created_at.desc()).offset(offset).limit(limit))
            )
            for job in jobs:
                _ = job.files
                session.expunge(job)
        return JobListResponse(
            jobs=[self._serialize(job) for job in jobs], total=total, page=page, limit=limit
        )

    @staticmethod
    async def _close_uploads(uploads: list[UploadFile]) -> None:
        for upload in uploads:
            await upload.close()

    async def create_job(self, uploads: list[UploadFile], tool_id: str, options_raw: str) -> Job:
        if tool_id not in TOOLS:
            await self._close_uploads(uploads)
            raise OfficeBoxError(422, "TOOL_UNSUPPORTED", "Công cụ không được hỗ trợ.")
        tool = TOOLS[tool_id]
        if len(uploads) < int(tool["min_files"]) or len(uploads) > min(int(tool["max_files"]), self.settings.max_files_per_job):
            await self._close_uploads(uploads)
            raise OfficeBoxError(422, "FILE_COUNT_INVALID", "Số lượng tệp không phù hợp với công cụ.")
        try:
            options = validate_options(tool_id, json.loads(options_raw or "{}"))
        except json.JSONDecodeError:
            await self._close_uploads(uploads)
            raise OfficeBoxError(422, "OPTIONS_INVALID", "Tùy chọn JSON không hợp lệ.") from None
        except ValueError as exc:
            await self._close_uploads(uploads)
            raise OfficeBoxError(422, "OPTIONS_INVALID", str(exc)) from None

        queue = self.queue
        if queue is None or getattr(queue, "full")(tool_id):
            await self._close_uploads(uploads)
            raise OfficeBoxError(503, "QUEUE_FULL", "Hệ thống đang bận. Vui lòng thử lại sau.")

        accepted_types = set(tool["input_types"])
        accepted_extensions = set(tool["input_extensions"])
        original_filenames = [safe_original_filename(upload.filename) for upload in uploads]
        for upload, filename in zip(uploads, original_filenames, strict=True):
            if Path(filename).suffix.lower() not in accepted_extensions:
                await self._close_uploads(uploads)
                raise OfficeBoxError(415, "FILE_TYPE_UNSUPPORTED", "Định dạng tệp không được hỗ trợ.")
            if upload.content_type and upload.content_type not in accepted_types | {"application/octet-stream"}:
                await self._close_uploads(uploads)
                raise OfficeBoxError(415, "FILE_TYPE_UNSUPPORTED", "Định dạng tệp không được hỗ trợ.")

        job_id = str(uuid4())
        try:
            self.storage.create_job_dirs(job_id)
        except (OSError, StorageError):
            await self._close_uploads(uploads)
            raise OfficeBoxError(507, "STORAGE_FAILURE", "Không thể chuẩn bị vùng lưu trữ.") from None
        stored_inputs: list[tuple[Path, str, str, int]] = []
        try:
            total_size = 0
            total_pages = 0
            total_pixels = 0
            for index, (upload, filename) in enumerate(zip(uploads, original_filenames, strict=True)):
                extension = Path(filename).suffix.lower()
                storage_name = f"input-{index:04d}{extension}"
                input_path = self.storage.input_path(job_id, storage_name)
                size = await self.storage.save_upload(upload, input_path, self.settings.max_upload_bytes - total_size)
                if size == 0:
                    raise OfficeBoxError(422, "FILE_EMPTY", "Tệp tải lên không có dữ liệu.")
                total_size += size
                mime_type = upload.content_type or "application/octet-stream"
                if extension == ".pdf":
                    with input_path.open("rb") as source:
                        if source.read(5) != b"%PDF-":
                            raise OfficeBoxError(415, "FILE_TYPE_UNSUPPORTED", "Nội dung tệp không phải PDF.")
                    metadata = await self.adapter.inspect(input_path, int(options.get("dpi", 72)))
                    total_pages += int(metadata["page_count"])
                    total_pixels += int(metadata["total_pixels"])
                    mime_type = "application/pdf"
                else:
                    metadata = await self.adapter.inspect_image(input_path)
                    total_pixels += int(metadata["total_pixels"])
                if total_pages > self.settings.max_pdf_pages:
                    raise OfficeBoxError(422, "PDF_TOO_MANY_PAGES", "Tổng số trang PDF vượt quá giới hạn.")
                if total_pixels > self.settings.max_total_pixels:
                    raise OfficeBoxError(422, "INPUT_TOO_MANY_PIXELS", "Tổng điểm ảnh vượt quá giới hạn.")
                stored_inputs.append((input_path, filename, mime_type, size))
        except UploadTooLarge:
            await self._close_uploads(uploads)
            self.storage.delete_job(job_id)
            raise OfficeBoxError(413, "UPLOAD_TOO_LARGE", "Tệp vượt quá dung lượng cho phép.") from None
        except ProcessingError as exc:
            await self._close_uploads(uploads)
            self.storage.delete_job(job_id)
            raise OfficeBoxError(422, exc.code, exc.message) from None
        except OfficeBoxError:
            await self._close_uploads(uploads)
            self.storage.delete_job(job_id)
            raise
        except (OSError, StorageError):
            await self._close_uploads(uploads)
            self.storage.delete_job(job_id)
            raise OfficeBoxError(507, "STORAGE_FAILURE", "Không thể lưu tệp tải lên.") from None
        except Exception:
            await self._close_uploads(uploads)
            self.storage.delete_job(job_id)
            raise OfficeBoxError(500, "INPUT_VALIDATION_FAILURE", "Không thể kiểm tra tệp tải lên.") from None

        now = utc_now()
        original_filename = original_filenames[0] if len(original_filenames) == 1 else f"{original_filenames[0]} +{len(original_filenames) - 1} tệp"
        job = Job(
            id=job_id,
            tool_id=tool_id,
            status="QUEUED",
            original_filename=original_filename,
            options_json=json.dumps(options),
            progress=0,
            progress_stage="Đang chờ xử lý",
            created_at=now,
        )
        for index, (input_path, filename, mime_type, size) in enumerate(stored_inputs):
            job.files.append(
                JobFile(
                    id=str(uuid4()), role="input", order_index=index,
                    original_filename=filename, storage_name=input_path.name,
                    mime_type=mime_type, size_bytes=size,
                )
            )
        try:
            with self.session_factory.begin() as session:
                session.add(job)
        except Exception:
            self.storage.delete_job(job_id)
            raise OfficeBoxError(500, "DATABASE_FAILURE", "Không thể tạo công việc.") from None
        if not await getattr(queue, "enqueue")(job_id):
            raise OfficeBoxError(
                503,
                "QUEUE_FULL",
                "Hệ thống đang bận. Công việc đã được lưu ở trạng thái thất bại.",
                job_id,
            )
        return job

    def mark_processing(self, job_id: str) -> Job | None:
        with self.session_factory.begin() as session:
            job = session.scalar(select(Job).where(Job.id == job_id))
            if job is None or job.status != "QUEUED":
                return None
            job.status = "PROCESSING"
            job.started_at = utc_now()
            job.progress = 10
            job.progress_stage = "Đang xử lý tài liệu"
            _ = job.files
            session.flush()
            session.expunge(job)
            return job

    def mark_completed(self, job_id: str, result: dict[str, object]) -> None:
        now = utc_now()
        with self.session_factory.begin() as session:
            job = session.scalar(select(Job).where(Job.id == job_id))
            if job is None or job.status != "PROCESSING":
                return
            extension = str(result["extension"])
            job.output_filename = result_download_name(job.original_filename, extension, str(result.get("suffix", "result")))
            job.output_mime = str(result["mime_type"])
            job.output_size = int(result["size_bytes"])
            job.status = "COMPLETED"
            job.progress = 100
            job.progress_stage = "Hoàn tất"
            job.finished_at = now
            job.expires_at = now + timedelta(minutes=self.settings.job_retention_minutes)
            job.files.append(
                JobFile(
                    id=str(uuid4()),
                    role="output",
                    order_index=0,
                    original_filename=job.output_filename,
                    storage_name=str(result["storage_name"]),
                    mime_type=job.output_mime,
                    size_bytes=job.output_size,
                )
            )

    def mark_failed(self, job_id: str, code: str, message: str) -> None:
        now = utc_now()
        with self.session_factory.begin() as session:
            job = session.scalar(select(Job).where(Job.id == job_id))
            if job is None or job.status in TERMINAL_STATUSES:
                return
            job.status = "FAILED"
            job.progress = None
            job.progress_stage = None
            job.error_code = code[:64]
            job.error_message = message[:512]
            job.finished_at = now
            job.expires_at = now + timedelta(minutes=self.settings.job_retention_minutes)

    def recover_jobs(self) -> list[str]:
        now = utc_now()
        with self.session_factory.begin() as session:
            session.execute(
                update(Job)
                .where(Job.status == "PROCESSING")
                .values(
                    status="FAILED",
                    progress=None,
                    progress_stage=None,
                    error_code="WORKER_RESTARTED",
                    error_message="Công việc bị gián đoạn do ứng dụng khởi động lại.",
                    finished_at=now,
                    expires_at=now + timedelta(minutes=self.settings.job_retention_minutes),
                )
            )
            return list(session.scalars(select(Job.id).where(Job.status == "QUEUED").order_by(Job.created_at)))

    def known_job_ids(self) -> set[str]:
        with self.session_factory() as session:
            return set(session.scalars(select(Job.id)))

    def delete_terminal_job(self, job_id: str) -> None:
        job = self.get_job_model(job_id)
        if job.status not in TERMINAL_STATUSES:
            raise OfficeBoxError(409, "JOB_ACTIVE", "Không thể xóa công việc đang xử lý.", job_id)
        try:
            self.storage.delete_job(job_id)
        except StorageError:
            raise OfficeBoxError(500, "STORAGE_FAILURE", "Không thể xóa dữ liệu công việc.", job_id) from None
        with self.session_factory.begin() as session:
            stored = session.get(Job, job_id)
            if stored is not None:
                stored.status = "EXPIRED"
                stored.output_filename = None
                stored.output_mime = None
                stored.output_size = None
                stored.progress = None
                stored.progress_stage = None
                stored.files.clear()

    def output_for_download(self, job_id: str) -> tuple[Path, str, str]:
        job = self.get_job_model(job_id)
        if job.expires_at is not None and as_utc(job.expires_at) <= utc_now():
            self.expire_job(job_id)
            raise OfficeBoxError(410, "JOB_EXPIRED", "Kết quả đã hết hạn.", job_id)
        if job.status == "EXPIRED":
            raise OfficeBoxError(410, "JOB_EXPIRED", "Kết quả đã hết hạn.", job_id)
        if job.status != "COMPLETED":
            raise OfficeBoxError(409, "RESULT_NOT_READY", "Kết quả chưa sẵn sàng.", job_id)
        output = next((item for item in job.files if item.role == "output"), None)
        if output is None or not job.output_filename or not job.output_mime:
            raise OfficeBoxError(410, "RESULT_MISSING", "Kết quả không còn tồn tại.", job_id)
        path = self.storage.output_path(job_id, output.storage_name)
        if not path.is_file() or path.is_symlink():
            raise OfficeBoxError(410, "RESULT_MISSING", "Kết quả không còn tồn tại.", job_id)
        return path, job.output_filename, job.output_mime

    def output_for_preview(self, job_id: str) -> tuple[Path, str, str]:
        path, filename, mime_type = self.output_for_download(job_id)
        base_mime_type = mime_type.partition(";")[0].strip().lower()
        if base_mime_type not in PREVIEWABLE_MIME_TYPES:
            raise OfficeBoxError(
                415,
                "PREVIEW_UNSUPPORTED",
                "Định dạng kết quả này không hỗ trợ xem trước trực tiếp.",
                job_id,
            )
        return path, filename, mime_type

    def due_job_ids(self) -> list[str]:
        with self.session_factory() as session:
            return list(
                session.scalars(
                    select(Job.id).where(
                        Job.status.in_(("COMPLETED", "FAILED")),
                        Job.expires_at.is_not(None),
                        Job.expires_at <= utc_now(),
                    )
                )
            )

    def expire_job(self, job_id: str) -> None:
        with self.session_factory() as session:
            job = session.scalar(
                select(Job).where(
                    Job.id == job_id,
                    Job.status.in_(("COMPLETED", "FAILED")),
                    Job.expires_at.is_not(None),
                    Job.expires_at <= utc_now(),
                )
            )
            if job is None:
                return
        self.storage.delete_job(job_id)
        with self.session_factory.begin() as session:
            job = session.get(Job, job_id)
            if job is not None and job.status in {"COMPLETED", "FAILED"}:
                job.status = "EXPIRED"
                job.output_filename = None
                job.output_mime = None
                job.output_size = None
                job.progress = None
                job.progress_stage = None
                job.files.clear()
