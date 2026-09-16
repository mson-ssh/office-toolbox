import os
from pathlib import Path

import httpx

from app.adapters.pymupdf.client import ProcessingError
from app.core.config import Settings


class StirlingAdapter:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def healthy(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5, follow_redirects=False) as client:
                response = await client.get(f"{self.settings.stirling_url}/api/v1/info/status")
                return response.status_code == 200 and response.json().get("status") == "UP"
        except (httpx.HTTPError, ValueError):
            return False

    async def _convert(self, endpoint: str, input_path: Path, output_dir: Path, extension: str, mime_type: str, fields: dict[str, str]) -> dict[str, object]:
        partial = output_dir / f"result.{extension}.partial"
        final_path = output_dir / f"result.{extension}"
        headers = {"Accept": mime_type}
        if self.settings.stirling_api_key:
            headers["X-API-KEY"] = self.settings.stirling_api_key
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self.settings.processing_timeout_seconds, connect=10), follow_redirects=False) as client:
                with input_path.open("rb") as source:
                    files = {"fileInput": ("document.pdf", source, "application/pdf")}
                    async with client.stream("POST", f"{self.settings.stirling_url}{endpoint}", data=fields, files=files, headers=headers) as response:
                        if response.status_code == 204 and extension == "xlsx":
                            raise ProcessingError("TABLE_NOT_FOUND", "Không tìm thấy bảng có cấu trúc trong PDF.")
                        if response.status_code != 200:
                            raise ProcessingError("STIRLING_REJECTED", "Stirling-PDF không thể xử lý tài liệu này.")
                        total = 0
                        with partial.open("xb") as target:
                            async for chunk in response.aiter_bytes(1024 * 1024):
                                total += len(chunk)
                                if total > self.settings.max_output_bytes:
                                    raise ProcessingError("OUTPUT_TOO_LARGE", "Kết quả vượt quá dung lượng cho phép.")
                                target.write(chunk)
                            target.flush()
                            os.fsync(target.fileno())
            if total == 0:
                raise ProcessingError("STIRLING_OUTPUT_MISSING", "Stirling-PDF không tạo được kết quả.")
            os.replace(partial, final_path)
        except httpx.TimeoutException:
            raise ProcessingError("PROCESSING_TIMEOUT", "Quá thời gian xử lý cho phép.") from None
        except httpx.HTTPError:
            raise ProcessingError("STIRLING_UNAVAILABLE", "Không thể kết nối Stirling-PDF nội bộ.") from None
        finally:
            partial.unlink(missing_ok=True)
        suffix = {"docx": "word", "xlsx": "tables", "pdf": "compressed"}[extension]
        return {"storage_name": final_path.name, "mime_type": mime_type, "size_bytes": final_path.stat().st_size, "extension": extension, "suffix": suffix}

    async def pdf_to_word(self, input_path: Path, output_dir: Path) -> dict[str, object]:
        return await self._convert(
            "/api/v1/convert/pdf/word", input_path, output_dir, "docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", {"outputFormat": "docx"},
        )

    async def pdf_to_excel(self, input_path: Path, output_dir: Path, pages: str) -> dict[str, object]:
        return await self._convert(
            "/api/v1/convert/pdf/xlsx", input_path, output_dir, "xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", {"pageNumbers": pages},
        )

    async def compress_pdf(self, input_path: Path, output_dir: Path, level: str) -> dict[str, object]:
        optimize_level = {"low": "2", "balanced": "5", "maximum": "9"}[level]
        return await self._convert(
            "/api/v1/misc/compress-pdf", input_path, output_dir, "pdf", "application/pdf",
            {"optimizeLevel": optimize_level, "linearize": "false", "normalize": "false", "grayscale": "false"},
        )
