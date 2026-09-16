import os
from pathlib import Path

from app.adapters.process import run_process
from app.adapters.pymupdf.client import ProcessingError
from app.core.config import Settings


class OcrAdapter:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def _check_output(self, path: Path) -> None:
        if not path.is_file() or path.is_symlink() or path.stat().st_size == 0:
            raise ProcessingError("OCR_OUTPUT_MISSING", "Bộ OCR không tạo được kết quả.")
        if path.stat().st_size > self.settings.max_output_bytes:
            path.unlink(missing_ok=True)
            raise ProcessingError("OUTPUT_TOO_LARGE", "Kết quả vượt quá dung lượng cho phép.")

    async def image_to_text(self, input_path: Path, work_dir: Path, output_dir: Path, language: str, page_segmentation: int) -> dict[str, object]:
        output_base = work_dir / "ocr-result"
        environment = dict(os.environ)
        environment["OMP_THREAD_LIMIT"] = "1"
        code, _stdout, _stderr = await run_process(
            ["tesseract", str(input_path), str(output_base), "-l", language, "--oem", "1", "--psm", str(page_segmentation), "txt"],
            self.settings.processing_timeout_seconds,
            environment,
        )
        if code != 0:
            raise ProcessingError("OCR_FAILED", "Không thể nhận dạng văn bản trong ảnh.")
        generated = output_base.with_suffix(".txt")
        self._check_output(generated)
        final_path = output_dir / "result.txt"
        os.replace(generated, final_path)
        return {"storage_name": final_path.name, "mime_type": "text/plain; charset=utf-8", "size_bytes": final_path.stat().st_size, "extension": "txt", "suffix": "ocr"}

    async def ocr_pdf(self, input_path: Path, output_dir: Path, language: str, deskew: bool, rotate_pages: bool) -> dict[str, object]:
        final_path = output_dir / "result.pdf"
        arguments = [
            "ocrmypdf", "--language", language, "--output-type", "pdf", "--optimize", "1",
            "--jobs", "1", "--skip-text", "--tesseract-timeout", str(self.settings.processing_timeout_seconds),
        ]
        if deskew:
            arguments.append("--deskew")
        if rotate_pages:
            arguments.extend(("--rotate-pages", "--rotate-pages-threshold", "6"))
        arguments.extend((str(input_path), str(final_path)))
        environment = dict(os.environ)
        environment["OMP_THREAD_LIMIT"] = "1"
        code, _stdout, _stderr = await run_process(arguments, self.settings.processing_timeout_seconds, environment)
        if code != 0:
            raise ProcessingError("OCR_PDF_FAILED", "Không thể tạo lớp chữ cho PDF này.")
        self._check_output(final_path)
        return {"storage_name": final_path.name, "mime_type": "application/pdf", "size_bytes": final_path.stat().st_size, "extension": "pdf", "suffix": "ocr"}
