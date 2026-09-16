import os
import shutil
import time
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile


class StorageError(Exception):
    pass


class UploadTooLarge(StorageError):
    pass


class StorageManager:
    def __init__(self, jobs_root: Path) -> None:
        self.root = jobs_root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def validate_job_id(job_id: str) -> str:
        parsed = UUID(job_id)
        if str(parsed) != job_id:
            raise ValueError("Invalid job identifier")
        return job_id

    def _contained(self, path: Path) -> Path:
        resolved = path.resolve(strict=False)
        if resolved == self.root or self.root not in resolved.parents:
            raise StorageError("Path is outside the job storage root")
        return resolved

    def job_dir(self, job_id: str) -> Path:
        candidate = self.root / self.validate_job_id(job_id)
        if candidate.is_symlink():
            raise StorageError("Job directory must not be a symlink")
        return self._contained(candidate)

    def _job_subdir(self, job_id: str, name: str) -> Path:
        candidate = self.job_dir(job_id) / name
        if candidate.is_symlink():
            raise StorageError("Job subdirectory must not be a symlink")
        return self._contained(candidate)

    def create_job_dirs(self, job_id: str) -> dict[str, Path]:
        base = self.job_dir(job_id)
        if base.exists():
            raise StorageError("Job storage already exists")
        directories = {name: base / name for name in ("input", "work", "output")}
        for directory in directories.values():
            directory.mkdir(parents=True, exist_ok=False)
        return directories

    def input_path(self, job_id: str, storage_name: str = "input.pdf") -> Path:
        if Path(storage_name).name != storage_name:
            raise StorageError("Invalid storage name")
        candidate = self._job_subdir(job_id, "input") / storage_name
        if candidate.is_symlink():
            raise StorageError("Input file must not be a symlink")
        return self._contained(candidate)

    def output_path(self, job_id: str, storage_name: str) -> Path:
        if Path(storage_name).name != storage_name:
            raise StorageError("Invalid storage name")
        candidate = self._job_subdir(job_id, "output") / storage_name
        if candidate.is_symlink():
            raise StorageError("Output file must not be a symlink")
        return self._contained(candidate)

    def work_dir(self, job_id: str) -> Path:
        return self._job_subdir(job_id, "work")

    def output_dir(self, job_id: str) -> Path:
        return self._job_subdir(job_id, "output")

    async def save_upload(self, upload: UploadFile, destination: Path, max_bytes: int) -> int:
        destination = self._contained(destination)
        total = 0
        try:
            with destination.open("xb") as target:
                while chunk := await upload.read(1024 * 1024):
                    total += len(chunk)
                    if total > max_bytes:
                        raise UploadTooLarge("Upload exceeds configured limit")
                    target.write(chunk)
                target.flush()
                os.fsync(target.fileno())
        except Exception:
            destination.unlink(missing_ok=True)
            raise
        finally:
            await upload.close()
        return total

    def delete_job(self, job_id: str) -> None:
        base = self.job_dir(job_id)
        if not base.exists():
            return
        if base.is_symlink():
            raise StorageError("Refusing to delete symlinked job directory")
        shutil.rmtree(base)

    def clear_work(self, job_id: str) -> None:
        work = self.work_dir(job_id)
        if work.exists():
            shutil.rmtree(work)
        work.mkdir(parents=True, exist_ok=True)

    def clear_output(self, job_id: str) -> None:
        output = self.output_dir(job_id)
        if output.exists():
            shutil.rmtree(output)
        output.mkdir(parents=True, exist_ok=True)

    def cleanup_orphans(self, known_job_ids: set[str], minimum_age_seconds: int) -> list[str]:
        removed: list[str] = []
        now = time.time()
        for candidate in self.root.iterdir():
            if candidate.is_symlink() or not candidate.is_dir():
                continue
            try:
                job_id = self.validate_job_id(candidate.name)
                contained = self.job_dir(job_id)
            except (ValueError, StorageError):
                continue
            if job_id in known_job_ids or now - contained.stat().st_mtime < minimum_age_seconds:
                continue
            shutil.rmtree(contained)
            removed.append(job_id)
        return removed

    def has_free_space(self, minimum_bytes: int) -> bool:
        return shutil.disk_usage(self.root).free >= minimum_bytes
