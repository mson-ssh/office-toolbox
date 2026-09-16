from pathlib import Path
from typing import Any

from app.adapters.ocr.client import OcrAdapter
from app.adapters.pymupdf.client import ProcessingError, PyMuPDFAdapter
from app.adapters.stirling.client import StirlingAdapter


class ToolExecutor:
    def __init__(self, pymupdf: PyMuPDFAdapter, ocr: OcrAdapter, stirling: StirlingAdapter) -> None:
        self.pymupdf = pymupdf
        self.ocr = ocr
        self.stirling = stirling

    async def process(self, tool_id: str, inputs: list[Path], work_dir: Path, output_dir: Path, options: dict[str, Any]) -> dict[str, object]:
        if tool_id == "pdf-to-image":
            return await self.pymupdf.render(inputs[0], work_dir, output_dir, str(options["format"]), int(options["dpi"]))
        if tool_id == "merge-pdf":
            return await self.pymupdf.merge(inputs, output_dir)
        if tool_id == "split-pdf":
            return await self.pymupdf.split(inputs[0], output_dir, str(options["pages"]))
        if tool_id == "images-to-pdf":
            return await self.pymupdf.images_to_pdf(inputs, work_dir, output_dir, str(options["page_size"]))
        if tool_id == "image-to-text":
            return await self.ocr.image_to_text(inputs[0], work_dir, output_dir, str(options["language"]), int(options["page_segmentation"]))
        if tool_id == "ocr-pdf":
            return await self.ocr.ocr_pdf(inputs[0], output_dir, str(options["language"]), bool(options["deskew"]), bool(options["rotate_pages"]))
        if tool_id == "pdf-to-word":
            return await self.stirling.pdf_to_word(inputs[0], output_dir)
        if tool_id == "pdf-to-excel":
            return await self.stirling.pdf_to_excel(inputs[0], output_dir, str(options["pages"]))
        if tool_id == "compress-pdf":
            return await self.stirling.compress_pdf(inputs[0], output_dir, str(options["level"]))
        raise ProcessingError("TOOL_UNSUPPORTED", "Công cụ không được hỗ trợ.")
