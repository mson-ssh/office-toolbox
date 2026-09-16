import re
from copy import deepcopy
from typing import Any


PDF_MIME_TYPES = ["application/pdf"]
IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/tiff"]


def option(option_type: str, default: object, description: str, values: list[object] | None = None) -> dict[str, object]:
    value: dict[str, object] = {"type": option_type, "default": default, "description": description}
    if values is not None:
        value["enum"] = values
    return value


TOOLS_LIST: list[dict[str, Any]] = [
    {
        "id": "pdf-to-image", "name": "PDF → Ảnh", "description": "Chuyển từng trang PDF thành ảnh PNG, JPEG hoặc WEBP.",
        "category": "Chuyển đổi", "input_types": PDF_MIME_TYPES, "input_extensions": [".pdf"], "min_files": 1, "max_files": 1,
        "available": True, "workload": "LIGHT", "output_type": "image/* hoặc application/zip",
        "options": {"format": option("string", "png", "Định dạng ảnh đầu ra", ["png", "jpeg", "webp"]), "dpi": option("integer", 150, "Độ phân giải kết xuất", [150, 200, 300])},
    },
    {
        "id": "pdf-to-word", "name": "PDF → Word", "description": "Chuyển PDF thành tài liệu DOCX bằng Stirling-PDF nội bộ.",
        "category": "Chuyển đổi", "input_types": PDF_MIME_TYPES, "input_extensions": [".pdf"], "min_files": 1, "max_files": 1,
        "available": True, "workload": "HEAVY", "output_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "options": {},
    },
    {
        "id": "pdf-to-excel", "name": "PDF → Excel", "description": "Trích xuất bảng trong PDF thành workbook XLSX bằng Stirling-PDF nội bộ.",
        "category": "Chuyển đổi", "input_types": PDF_MIME_TYPES, "input_extensions": [".pdf"], "min_files": 1, "max_files": 1,
        "available": True, "workload": "HEAVY", "output_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "options": {"pages": option("string", "all", "Trang cần trích xuất, ví dụ 1-3,5 hoặc all")},
    },
    {
        "id": "image-to-text", "name": "Ảnh → Văn bản", "description": "Nhận dạng chữ tiếng Việt và tiếng Anh bằng Tesseract, xuất TXT UTF-8.",
        "category": "OCR", "input_types": IMAGE_MIME_TYPES, "input_extensions": [".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"], "min_files": 1, "max_files": 1,
        "available": True, "workload": "HEAVY", "output_type": "text/plain",
        "options": {"language": option("string", "vie+eng", "Ngôn ngữ OCR", ["vie+eng", "vie", "eng"]), "page_segmentation": option("integer", 3, "Kiểu phân tích bố cục", [3, 6, 11])},
    },
    {
        "id": "ocr-pdf", "name": "OCR PDF", "description": "Tạo PDF có lớp chữ tìm kiếm và sao chép được bằng OCRmyPDF.",
        "category": "OCR", "input_types": PDF_MIME_TYPES, "input_extensions": [".pdf"], "min_files": 1, "max_files": 1,
        "available": True, "workload": "HEAVY", "output_type": "application/pdf",
        "options": {"language": option("string", "vie+eng", "Ngôn ngữ OCR", ["vie+eng", "vie", "eng"]), "deskew": option("boolean", True, "Chỉnh nghiêng trang quét"), "rotate_pages": option("boolean", True, "Tự xoay trang khi chắc chắn")},
    },
    {
        "id": "images-to-pdf", "name": "Ảnh → PDF", "description": "Ghép nhiều ảnh thành một PDF theo đúng thứ tự đã chọn.",
        "category": "PDF", "input_types": IMAGE_MIME_TYPES, "input_extensions": [".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"], "min_files": 1, "max_files": 20,
        "available": True, "workload": "LIGHT", "output_type": "application/pdf", "options": {"page_size": option("string", "image", "Kích thước trang PDF", ["image", "a4"])},
    },
    {
        "id": "merge-pdf", "name": "Ghép PDF", "description": "Ghép nhiều PDF thành một tệp theo đúng thứ tự đã chọn.",
        "category": "PDF", "input_types": PDF_MIME_TYPES, "input_extensions": [".pdf"], "min_files": 2, "max_files": 20,
        "available": True, "workload": "LIGHT", "output_type": "application/pdf", "options": {},
    },
    {
        "id": "split-pdf", "name": "Tách PDF", "description": "Xuất một PDF mới chứa các trang hoặc khoảng trang đã chọn.",
        "category": "PDF", "input_types": PDF_MIME_TYPES, "input_extensions": [".pdf"], "min_files": 1, "max_files": 1,
        "available": True, "workload": "LIGHT", "output_type": "application/pdf", "options": {"pages": option("string", "1", "Trang cần giữ, ví dụ 1-3,5,8-10")},
    },
    {
        "id": "compress-pdf", "name": "Nén PDF", "description": "Tối ưu dung lượng PDF với ba mức chất lượng bằng Stirling-PDF nội bộ.",
        "category": "PDF", "input_types": PDF_MIME_TYPES, "input_extensions": [".pdf"], "min_files": 1, "max_files": 1,
        "available": True, "workload": "HEAVY", "output_type": "application/pdf", "options": {"level": option("string", "balanced", "Mức nén", ["low", "balanced", "maximum"])},
    },
]

TOOLS = {tool["id"]: tool for tool in TOOLS_LIST}


def public_tools() -> list[dict[str, Any]]:
    return [deepcopy(tool) for tool in TOOLS_LIST]


def _enum(options: dict[str, object], name: str, values: set[object], default: object) -> object:
    value = options.get(name, default)
    if isinstance(value, bool) and not all(isinstance(item, bool) for item in values):
        raise ValueError(f"Tùy chọn {name} không hợp lệ.")
    if value not in values:
        raise ValueError(f"Tùy chọn {name} không hợp lệ.")
    return value


def _boolean(options: dict[str, object], name: str, default: bool) -> bool:
    value = options.get(name, default)
    if not isinstance(value, bool):
        raise ValueError(f"Tùy chọn {name} phải là true hoặc false.")
    return value


def _pages(options: dict[str, object], default: str, allow_all: bool) -> str:
    value = options.get("pages", default)
    if not isinstance(value, str):
        raise ValueError("Danh sách trang phải là chuỗi.")
    value = value.strip().lower().replace(" ", "")
    if allow_all and value == "all":
        return value
    if len(value) > 200 or not re.fullmatch(r"\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*", value):
        raise ValueError("Danh sách trang chỉ nhận dạng như 1-3,5,8-10.")
    return value


def validate_options(tool_id: str, raw_options: object) -> dict[str, Any]:
    tool = TOOLS.get(tool_id)
    if tool is None:
        raise ValueError("Công cụ không được hỗ trợ.")
    if not isinstance(raw_options, dict):
        raise ValueError("Tùy chọn phải là một đối tượng JSON.")
    allowed = set(tool["options"])
    if set(raw_options) - allowed:
        raise ValueError("Tùy chọn chứa trường không được hỗ trợ.")
    options: dict[str, object] = raw_options
    if tool_id == "pdf-to-image":
        return {"format": _enum(options, "format", {"png", "jpeg", "webp"}, "png"), "dpi": _enum(options, "dpi", {150, 200, 300}, 150)}
    if tool_id == "pdf-to-excel":
        return {"pages": _pages(options, "all", True)}
    if tool_id == "image-to-text":
        return {"language": _enum(options, "language", {"vie+eng", "vie", "eng"}, "vie+eng"), "page_segmentation": _enum(options, "page_segmentation", {3, 6, 11}, 3)}
    if tool_id == "ocr-pdf":
        return {"language": _enum(options, "language", {"vie+eng", "vie", "eng"}, "vie+eng"), "deskew": _boolean(options, "deskew", True), "rotate_pages": _boolean(options, "rotate_pages", True)}
    if tool_id == "images-to-pdf":
        return {"page_size": _enum(options, "page_size", {"image", "a4"}, "image")}
    if tool_id == "split-pdf":
        return {"pages": _pages(options, "1", False)}
    if tool_id == "compress-pdf":
        return {"level": _enum(options, "level", {"low", "balanced", "maximum"}, "balanced")}
    return {}
