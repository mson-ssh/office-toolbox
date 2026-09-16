# Kế hoạch kiểm thử và bằng chứng

Cập nhật: 2026-09-16. Không có test runner tự động đầy đủ; các kiểm tra dưới đây là lệnh/build và integration smoke đã thực thi bằng fixture tổng hợp trong `/tmp`, không dùng tài liệu người dùng.

## Bằng chứng đã có

- `python3 -m compileall -q apps/backend/app`: PASS.
- `npm run build`: PASS, production bundle tạo thành công.
- Compose build/start: PASS; backend/frontend/Stirling healthy, chỉ frontend publish `127.0.0.1:1280`.
- Health API: DB, storage, PyMuPDF, Tesseract, OCRmyPDF, Stirling healthy.
- Registry: đủ chín tool available.
- Full valid-path API suite:
  - PDF → Image: ZIP hợp lệ, đúng số trang.
  - PDF → Word: DOCX OOXML hợp lệ và có nội dung mẫu.
  - PDF → Excel: XLSX OOXML hợp lệ với bảng có đường kẻ; PDF không có bảng trả `TABLE_NOT_FOUND`.
  - Image → Text: tiếng Anh và tiếng Việt khớp nội dung fixture.
  - OCR PDF: PDF hợp lệ, trích xuất được text mẫu.
  - Images → PDF: đúng hai trang/thứ tự fixture.
  - Merge PDF: đúng ba trang.
  - Split PDF: đúng trang 2, một trang.
  - Compress PDF: PDF hợp lệ; kích thước fixture giảm, không coi là benchmark.
- Sau nâng base và pin dependency: smoke lại PDF → Image, OCR Việt, PDF → Word PASS.
- Result preview: PDF, PNG, TXT trả inline và nội dung/magic hợp lệ; header same-origin/no-store/nosniff PASS. DOCX trả 415 `PREVIEW_UNSUPPORTED`; bundle production có đủ trạng thái preview/fallback. Kiểm tra trực quan trong browser còn chờ chủ dự án.
- OCR clipboard/inline: TypeScript build PASS; production bundle có hướng dẫn Ctrl/⌘+V, trạng thái paste, khối nội dung OCR và nút copy; endpoint trả đúng `VĂN BẢN TIẾNG VIỆT 2026`. Tương tác paste/copy trực quan còn chờ browser smoke.
- `npm audit` và Docker Scout đã chạy; kết quả/giới hạn ghi trong SECURITY/UPSTREAM.

## Ma trận còn lại

| Nhóm | Trường hợp cần chạy | Trạng thái |
|---|---|---|
| Upload | rỗng, giả MIME/extension, hỏng, mã hóa, quá dung lượng/số file | Chưa đủ |
| Options | JSON/field/range sai, giá trị biên | Chưa đủ |
| Storage | traversal, absolute path, Unicode, symlink, file mất | Chưa đủ |
| Queue | vượt LIGHT/HEAVY, backlog, engine lỗi/timeout | Chưa đủ |
| Restart/cleanup | QUEUED/PROCESSING, download cạnh cleanup, down/up persistence | Chưa đủ |
| Browser | upload/download/delete, failed/expired, refresh route, keyboard/mobile | Chưa chạy bởi chủ dự án |
| Resource | idle/peak RAM/CPU, file lớn, disk gần đầy | Chưa chạy |
| NAS | architecture, UID/GID, reverse proxy, restart, retention, network | Chưa chạy |

Fixture hợp lệ hiện ở `/tmp/officebox-smoke` trên máy local và có thể mất sau reboot; không phụ thuộc fixture này như dữ liệu sản phẩm. Không đánh dấu M1-NAS từ kết quả local.
