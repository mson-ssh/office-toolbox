import argparse
import json
import os
import re
import sys
import zipfile
from pathlib import Path

import pymupdf
from PIL import Image, ImageOps, UnidentifiedImageError


def inspect_pdf(input_path: Path, dpi: int, max_pages: int, max_total_pixels: int) -> dict[str, int]:
    with pymupdf.open(input_path) as document:
        if document.needs_pass:
            raise ValueError("PDF_ENCRYPTED")
        page_count = document.page_count
        if page_count < 1:
            raise ValueError("PDF_EMPTY")
        if page_count > max_pages:
            raise ValueError("PDF_TOO_MANY_PAGES")
        scale = dpi / 72
        total_pixels = 0
        for page in document:
            rect = page.rect
            total_pixels += max(1, round(rect.width * scale)) * max(1, round(rect.height * scale))
            if total_pixels > max_total_pixels:
                raise ValueError("PDF_TOO_MANY_PIXELS")
        return {"page_count": page_count, "total_pixels": total_pixels}


def inspect_image(input_path: Path, max_total_pixels: int) -> dict[str, int]:
    Image.MAX_IMAGE_PIXELS = max_total_pixels
    try:
        with Image.open(input_path) as image:
            image.verify()
        with Image.open(input_path) as image:
            width, height = image.size
            frames = int(getattr(image, "n_frames", 1))
    except (UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning, OSError):
        raise ValueError("IMAGE_INVALID") from None
    total_pixels = width * height * frames
    if width < 1 or height < 1 or total_pixels > max_total_pixels:
        raise ValueError("IMAGE_TOO_MANY_PIXELS")
    return {"width": width, "height": height, "frames": frames, "total_pixels": total_pixels}


def result(path: Path, mime_type: str, extension: str, suffix: str) -> dict[str, object]:
    return {
        "storage_name": path.name,
        "mime_type": mime_type,
        "size_bytes": path.stat().st_size,
        "extension": extension,
        "suffix": suffix,
    }


def enforce_output(path: Path, max_output_bytes: int) -> None:
    if path.stat().st_size > max_output_bytes:
        path.unlink(missing_ok=True)
        raise ValueError("OUTPUT_TOO_LARGE")


def render_pdf(input_path: Path, work_dir: Path, output_dir: Path, image_format: str, dpi: int, max_pages: int, max_total_pixels: int, max_output_bytes: int) -> dict[str, object]:
    metadata = inspect_pdf(input_path, dpi, max_pages, max_total_pixels)
    extension = "jpg" if image_format == "jpeg" else image_format
    mime = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}[image_format]
    work_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    rendered: list[Path] = []
    total_size = 0
    with pymupdf.open(input_path) as document:
        matrix = pymupdf.Matrix(dpi / 72, dpi / 72)
        for index, page in enumerate(document, start=1):
            pixmap = page.get_pixmap(matrix=matrix, alpha=False, colorspace=pymupdf.csRGB)
            target = work_dir / f"page-{index:04d}.{extension}"
            if image_format == "png":
                pixmap.save(target)
            elif image_format == "jpeg":
                pixmap.pil_save(target, format="JPEG", quality=88, optimize=True)
            else:
                pixmap.pil_save(target, format="WEBP", quality=88, method=4)
            total_size += target.stat().st_size
            if total_size > max_output_bytes:
                raise ValueError("OUTPUT_TOO_LARGE")
            rendered.append(target)
    if len(rendered) == 1:
        final_path = output_dir / f"result.{extension}"
        os.replace(rendered[0], final_path)
        return {**metadata, **result(final_path, mime, extension, "images")}
    temporary_zip = work_dir / "result.zip.partial"
    with zipfile.ZipFile(temporary_zip, "w", compression=zipfile.ZIP_DEFLATED, allowZip64=True) as archive:
        for image in rendered:
            archive.write(image, arcname=image.name)
    enforce_output(temporary_zip, max_output_bytes)
    final_path = output_dir / "result.zip"
    os.replace(temporary_zip, final_path)
    return {**metadata, **result(final_path, "application/zip", "zip", "images")}


def merge_pdfs(inputs: list[Path], output_dir: Path, max_pages: int, max_output_bytes: int) -> dict[str, object]:
    merged = pymupdf.open()
    try:
        total_pages = 0
        for source_path in inputs:
            with pymupdf.open(source_path) as source:
                if source.needs_pass:
                    raise ValueError("PDF_ENCRYPTED")
                total_pages += source.page_count
                if total_pages > max_pages:
                    raise ValueError("PDF_TOO_MANY_PAGES")
                merged.insert_pdf(source)
        if total_pages < 1:
            raise ValueError("PDF_EMPTY")
        final_path = output_dir / "result.pdf"
        merged.save(final_path, garbage=4, deflate=True)
    finally:
        merged.close()
    enforce_output(final_path, max_output_bytes)
    return {"page_count": total_pages, **result(final_path, "application/pdf", "pdf", "merged")}


def parse_pages(expression: str, page_count: int) -> list[int]:
    if not re.fullmatch(r"\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*", expression):
        raise ValueError("PAGE_RANGE_INVALID")
    pages: list[int] = []
    seen: set[int] = set()
    for part in expression.split(","):
        if "-" in part:
            start, end = (int(value) for value in part.split("-", 1))
            if start > end:
                raise ValueError("PAGE_RANGE_INVALID")
            values = range(start, end + 1)
        else:
            values = [int(part)]
        for value in values:
            if value < 1 or value > page_count:
                raise ValueError("PAGE_RANGE_OUT_OF_BOUNDS")
            if value not in seen:
                seen.add(value)
                pages.append(value - 1)
    return pages


def split_pdf(input_path: Path, output_dir: Path, expression: str, max_pages: int, max_output_bytes: int) -> dict[str, object]:
    with pymupdf.open(input_path) as source:
        if source.needs_pass:
            raise ValueError("PDF_ENCRYPTED")
        if source.page_count > max_pages:
            raise ValueError("PDF_TOO_MANY_PAGES")
        selected = parse_pages(expression, source.page_count)
        output = pymupdf.open()
        try:
            for page_number in selected:
                output.insert_pdf(source, from_page=page_number, to_page=page_number)
            final_path = output_dir / "result.pdf"
            output.save(final_path, garbage=4, deflate=True)
        finally:
            output.close()
    enforce_output(final_path, max_output_bytes)
    return {"page_count": len(selected), **result(final_path, "application/pdf", "pdf", "split")}


def images_to_pdf(inputs: list[Path], work_dir: Path, output_dir: Path, page_size: str, max_total_pixels: int, max_output_bytes: int) -> dict[str, object]:
    Image.MAX_IMAGE_PIXELS = max_total_pixels
    document = pymupdf.open()
    total_pixels = 0
    try:
        for index, input_path in enumerate(inputs):
            with Image.open(input_path) as opened:
                image = ImageOps.exif_transpose(opened)
                total_pixels += image.width * image.height
                if total_pixels > max_total_pixels:
                    raise ValueError("IMAGE_TOO_MANY_PIXELS")
                if image.mode not in {"RGB", "L"}:
                    background = Image.new("RGB", image.size, "white")
                    if "A" in image.getbands():
                        background.paste(image, mask=image.getchannel("A"))
                    else:
                        background.paste(image.convert("RGB"))
                    image = background
                normalized = work_dir / f"image-{index:04d}.jpg"
                image.convert("RGB").save(normalized, "JPEG", quality=92, optimize=True)
                if page_size == "a4":
                    page_width, page_height = (842, 595) if image.width > image.height else (595, 842)
                    scale = min(page_width / image.width, page_height / image.height)
                    width, height = image.width * scale, image.height * scale
                    x0, y0 = (page_width - width) / 2, (page_height - height) / 2
                    rect = pymupdf.Rect(x0, y0, x0 + width, y0 + height)
                else:
                    page_width, page_height = image.width * 0.75, image.height * 0.75
                    rect = pymupdf.Rect(0, 0, page_width, page_height)
                page = document.new_page(width=page_width, height=page_height)
                page.insert_image(rect, filename=normalized)
        final_path = output_dir / "result.pdf"
        document.save(final_path, garbage=4, deflate=True)
    except (UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning, OSError):
        raise ValueError("IMAGE_INVALID") from None
    finally:
        document.close()
    enforce_output(final_path, max_output_bytes)
    return {"page_count": len(inputs), **result(final_path, "application/pdf", "pdf", "images")}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("inspect", "inspect-image", "render", "merge", "split", "images-to-pdf"))
    parser.add_argument("--input", type=Path, action="append", required=True)
    parser.add_argument("--dpi", type=int, default=72)
    parser.add_argument("--max-pages", type=int, required=True)
    parser.add_argument("--max-total-pixels", type=int, required=True)
    parser.add_argument("--work", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--format", choices=("png", "jpeg", "webp"))
    parser.add_argument("--pages")
    parser.add_argument("--page-size", choices=("image", "a4"))
    parser.add_argument("--max-output-bytes", type=int)
    args = parser.parse_args()
    try:
        if args.action == "inspect":
            payload = inspect_pdf(args.input[0], args.dpi, args.max_pages, args.max_total_pixels)
        elif args.action == "inspect-image":
            payload = inspect_image(args.input[0], args.max_total_pixels)
        else:
            if args.output is None or args.max_output_bytes is None:
                raise ValueError("INVALID_RENDER_ARGUMENTS")
            args.output.mkdir(parents=True, exist_ok=True)
            if args.action == "render":
                if args.work is None or args.format is None:
                    raise ValueError("INVALID_RENDER_ARGUMENTS")
                payload = render_pdf(args.input[0], args.work, args.output, args.format, args.dpi, args.max_pages, args.max_total_pixels, args.max_output_bytes)
            elif args.action == "merge":
                payload = merge_pdfs(args.input, args.output, args.max_pages, args.max_output_bytes)
            elif args.action == "split":
                if args.pages is None:
                    raise ValueError("PAGE_RANGE_INVALID")
                payload = split_pdf(args.input[0], args.output, args.pages, args.max_pages, args.max_output_bytes)
            else:
                if args.work is None or args.page_size is None:
                    raise ValueError("INVALID_RENDER_ARGUMENTS")
                payload = images_to_pdf(args.input, args.work, args.output, args.page_size, args.max_total_pixels, args.max_output_bytes)
        print(json.dumps({"ok": True, "result": payload}))
        return 0
    except Exception as exc:
        code = str(exc) if str(exc).isupper() and " " not in str(exc) else "INPUT_INVALID"
        print(json.dumps({"ok": False, "error_code": code}))
        return 2


if __name__ == "__main__":
    sys.exit(main())
