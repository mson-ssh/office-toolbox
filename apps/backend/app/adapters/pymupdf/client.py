import asyncio
import json
import os
import signal
import sys
from pathlib import Path
from typing import Any

from app.core.config import Settings


class ProcessingError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


ERROR_MESSAGES = {
    "PDF_ENCRYPTED": "PDF có mật khẩu chưa được hỗ trợ.",
    "PDF_EMPTY": "PDF không có trang nội dung.",
    "PDF_TOO_MANY_PAGES": "PDF vượt quá số trang cho phép.",
    "PDF_TOO_MANY_PIXELS": "Kích thước trang và DPI tạo ra ảnh quá lớn.",
    "OUTPUT_TOO_LARGE": "Kết quả vượt quá dung lượng cho phép.",
    "PDF_INVALID": "Không thể đọc tệp PDF này.",
    "INPUT_INVALID": "Không thể đọc tệp đầu vào này.",
    "IMAGE_INVALID": "Không thể đọc tệp ảnh này.",
    "IMAGE_TOO_MANY_PIXELS": "Ảnh vượt quá giới hạn điểm ảnh cho phép.",
    "PAGE_RANGE_INVALID": "Khoảng trang không hợp lệ.",
    "PAGE_RANGE_OUT_OF_BOUNDS": "Khoảng trang vượt quá số trang của PDF.",
}


class PyMuPDFAdapter:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def _run(self, arguments: list[str]) -> dict[str, Any]:
        process = await asyncio.create_subprocess_exec(
            sys.executable,
            "-m",
            "app.adapters.pymupdf.runner",
            *arguments,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            start_new_session=True,
        )
        try:
            stdout, _stderr = await asyncio.wait_for(
                process.communicate(), timeout=self.settings.processing_timeout_seconds
            )
        except (TimeoutError, asyncio.CancelledError):
            if process.returncode is None:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                await process.wait()
            if asyncio.current_task() and asyncio.current_task().cancelling():
                raise
            raise ProcessingError("PROCESSING_TIMEOUT", "Quá thời gian xử lý cho phép.")

        try:
            payload = json.loads(stdout.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise ProcessingError("ENGINE_FAILURE", "Bộ xử lý PDF gặp lỗi.") from None
        if process.returncode != 0 or not payload.get("ok"):
            code = str(payload.get("error_code", "ENGINE_FAILURE"))
            raise ProcessingError(code, ERROR_MESSAGES.get(code, "Không thể xử lý tệp PDF này."))
        return dict(payload["result"])

    async def inspect(self, input_path: Path, dpi: int) -> dict[str, Any]:
        return await self._run(
            [
                "inspect",
                "--input", str(input_path),
                "--dpi", str(dpi),
                "--max-pages", str(self.settings.max_pdf_pages),
                "--max-total-pixels", str(self.settings.max_total_pixels),
            ]
        )

    async def inspect_image(self, input_path: Path) -> dict[str, Any]:
        return await self._run(
            [
                "inspect-image",
                "--input", str(input_path),
                "--max-pages", str(self.settings.max_pdf_pages),
                "--max-total-pixels", str(self.settings.max_total_pixels),
            ]
        )

    async def render(
        self, input_path: Path, work_dir: Path, output_dir: Path, image_format: str, dpi: int
    ) -> dict[str, Any]:
        return await self._run(
            [
                "render",
                "--input", str(input_path),
                "--work", str(work_dir),
                "--output", str(output_dir),
                "--format", image_format,
                "--dpi", str(dpi),
                "--max-pages", str(self.settings.max_pdf_pages),
                "--max-total-pixels", str(self.settings.max_total_pixels),
                "--max-output-bytes", str(self.settings.max_output_bytes),
            ]
        )

    def _common_output_arguments(self, output_dir: Path) -> list[str]:
        return [
            "--output", str(output_dir),
            "--max-pages", str(self.settings.max_pdf_pages),
            "--max-total-pixels", str(self.settings.max_total_pixels),
            "--max-output-bytes", str(self.settings.max_output_bytes),
        ]

    async def merge(self, input_paths: list[Path], output_dir: Path) -> dict[str, Any]:
        arguments = ["merge"]
        for path in input_paths:
            arguments.extend(("--input", str(path)))
        arguments.extend(self._common_output_arguments(output_dir))
        return await self._run(arguments)

    async def split(self, input_path: Path, output_dir: Path, pages: str) -> dict[str, Any]:
        return await self._run(
            [
                "split", "--input", str(input_path), "--pages", pages,
                *self._common_output_arguments(output_dir),
            ]
        )

    async def images_to_pdf(
        self, input_paths: list[Path], work_dir: Path, output_dir: Path, page_size: str
    ) -> dict[str, Any]:
        arguments = ["images-to-pdf"]
        for path in input_paths:
            arguments.extend(("--input", str(path)))
        arguments.extend(("--work", str(work_dir), "--page-size", page_size))
        arguments.extend(self._common_output_arguments(output_dir))
        return await self._run(arguments)
