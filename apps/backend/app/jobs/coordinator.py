import asyncio
import json
import logging
from collections import defaultdict

from app.adapters.pymupdf.client import ProcessingError
from app.core.config import Settings
from app.jobs.service import JobService
from app.tools.registry import TOOLS


logger = logging.getLogger(__name__)


class JobCoordinator:
    def __init__(self, settings: Settings, service: JobService) -> None:
        self.settings = settings
        self.service = service
        self._queues: dict[str, asyncio.Queue[str]] = {
            "LIGHT": asyncio.Queue(maxsize=settings.max_queue_size),
            "HEAVY": asyncio.Queue(maxsize=settings.max_queue_size),
        }
        self._locks: defaultdict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
        self._workers: list[asyncio.Task[None]] = []
        self._cleanup_task: asyncio.Task[None] | None = None
        self._stopping = False

    def _workload_for(self, job_id_or_tool_id: str) -> str:
        tool = TOOLS.get(job_id_or_tool_id)
        if tool is not None:
            return str(tool.get("workload", "HEAVY"))
        try:
            job = self.service.get_job_model(job_id_or_tool_id)
        except Exception:
            return "HEAVY"
        return str(TOOLS.get(job.tool_id, {}).get("workload", "HEAVY"))

    def full(self, tool_id: str) -> bool:
        return self._queues[self._workload_for(tool_id)].full()

    async def enqueue(self, job_id: str) -> bool:
        try:
            self._queues[self._workload_for(job_id)].put_nowait(job_id)
        except asyncio.QueueFull:
            self.service.mark_failed(job_id, "QUEUE_FULL", "Hệ thống đang bận. Vui lòng thử lại sau.")
            return False
        return True

    async def start(self) -> None:
        self._stopping = False
        orphan_grace = max(300, self.settings.cleanup_interval_minutes * 60)
        removed = self.service.storage.cleanup_orphans(
            self.service.known_job_ids(), orphan_grace
        )
        if removed:
            logger.info("Removed orphaned job directories", extra={"count": len(removed)})
        for job_id in self.service.recover_jobs():
            await self.enqueue(job_id)
        self._workers = []
        for workload, count in (
            ("LIGHT", self.settings.max_light_jobs),
            ("HEAVY", self.settings.max_heavy_jobs),
        ):
            self._workers.extend(
                asyncio.create_task(
                    self._worker_loop(workload, index), name=f"{workload.lower()}-worker-{index}"
                )
                for index in range(count)
            )
        self._cleanup_task = asyncio.create_task(self._cleanup_loop(), name="cleanup-worker")

    async def stop(self) -> None:
        self._stopping = True
        tasks = [*self._workers]
        if self._cleanup_task is not None:
            tasks.append(self._cleanup_task)
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        self._workers.clear()
        self._cleanup_task = None

    async def _worker_loop(self, workload: str, _index: int) -> None:
        queue = self._queues[workload]
        while True:
            job_id = await queue.get()
            try:
                async with self._locks[job_id]:
                    await self._process(job_id)
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Unhandled job worker error", extra={"job_id": job_id})
                try:
                    self.service.storage.clear_output(job_id)
                except Exception:
                    logger.warning("Unable to clear failed job output", extra={"job_id": job_id})
                self.service.mark_failed(job_id, "INTERNAL_ERROR", "Không thể xử lý tài liệu.")
            finally:
                queue.task_done()

    async def _process(self, job_id: str) -> None:
        job = self.service.mark_processing(job_id)
        if job is None:
            return
        input_files = [item for item in job.files if item.role == "input"]
        if not input_files:
            self.service.mark_failed(job_id, "INPUT_MISSING", "Tệp đầu vào không còn tồn tại.")
            return
        input_paths = [self.service.storage.input_path(job_id, item.storage_name) for item in input_files]
        if any(not path.is_file() or path.is_symlink() for path in input_paths):
            self.service.mark_failed(job_id, "INPUT_MISSING", "Tệp đầu vào không còn tồn tại.")
            return
        if not self.service.storage.has_free_space(self.settings.min_free_space_mb * 1024 * 1024):
            self.service.mark_failed(job_id, "DISK_SPACE_LOW", "Máy chủ không đủ dung lượng trống để xử lý.")
            return
        options = json.loads(job.options_json)
        try:
            result = await self.service.processor.process(
                job.tool_id,
                input_paths,
                self.service.storage.work_dir(job_id),
                self.service.storage.output_dir(job_id),
                options,
            )
            self.service.mark_completed(job_id, result)
        except ProcessingError as exc:
            try:
                self.service.storage.clear_output(job_id)
            except Exception:
                logger.warning("Unable to clear failed job output", extra={"job_id": job_id})
            self.service.mark_failed(job_id, exc.code, exc.message)
        finally:
            try:
                self.service.storage.clear_work(job_id)
            except Exception:
                logger.warning("Unable to clear job work directory", extra={"job_id": job_id})

    async def acquire_job(self, job_id: str) -> asyncio.Lock:
        lock = self._locks[job_id]
        await lock.acquire()
        return lock

    async def delete_job(self, job_id: str) -> None:
        async with self._locks[job_id]:
            self.service.delete_terminal_job(job_id)

    async def _cleanup_loop(self) -> None:
        interval = self.settings.cleanup_interval_minutes * 60
        while True:
            try:
                await self.cleanup_once()
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Cleanup cycle failed")
            await asyncio.sleep(interval)

    async def cleanup_once(self) -> None:
        for job_id in self.service.due_job_ids():
            lock = self._locks[job_id]
            if lock.locked():
                continue
            async with lock:
                try:
                    self.service.expire_job(job_id)
                except Exception:
                    logger.exception("Unable to expire job", extra={"job_id": job_id})
