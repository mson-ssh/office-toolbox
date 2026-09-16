# Kế hoạch triển khai OfficeBox

Cập nhật: 2026-09-16. Yêu cầu mới của chủ dự án đã mở phạm vi local cho cả M2–M4 trước khi hoàn tất M1-NAS. Chín công cụ đã được triển khai và valid-path local đã chạy; nghiệm thu trình duyệt, ma trận lỗi/tài nguyên và NAS vẫn còn.

## Trạng thái milestone

| Milestone | Kết quả | Trạng thái |
|---|---|---|
| M0 | Tài liệu và quy tắc bàn giao | DONE |
| M1-LOCAL | Nền tảng, Docker, PDF → Image | IMPLEMENTED_UNVERIFIED: API/conversion PASS; browser, restart/cleanup/resource matrix chưa đủ |
| M1-NAS | Chạy trên Synology | TODO |
| M2 | Merge, split, images → PDF | IMPLEMENTED_UNVERIFIED: valid-path PASS |
| M3 | Image → Text, OCR PDF | IMPLEMENTED_UNVERIFIED: OCR Anh/Việt và searchable PDF PASS |
| M4 | Word, Excel, compress qua Stirling | IMPLEMENTED_UNVERIFIED: valid-path PASS; image scan còn finding |

## Nền tảng và giao diện

- [x] FastAPI, SQLite, storage theo UUID, queue LIGHT/HEAVY, recovery và cleanup.
- [x] Upload streaming, signature/parse validation, options allowlist, output/download an toàn.
- [x] React/TypeScript/Vite/Tailwind; dashboard, tool page dùng chung, jobs, settings.
- [x] Upload nhiều file, sắp xếp thứ tự và tùy chọn theo registry.
- [x] Preview kết quả PDF, ảnh và TXT; fallback download cho ZIP/DOCX/XLSX.
- [x] Ảnh → Văn bản nhận ảnh clipboard bằng Ctrl/⌘+V và hiển thị/copy OCR text trong UI.
- [x] Compose chỉ publish frontend tại `127.0.0.1:1280`; backend/engine nội bộ.
- [x] Health báo DB/storage/PyMuPDF/Tesseract/OCRmyPDF/Stirling.
- [ ] Browser smoke đầy đủ: responsive, bàn phím, refresh route, error/expired/delete.
- [ ] Restart/cleanup/concurrency/timeout/resource và input lỗi theo toàn bộ ma trận TESTING.

## Chín công cụ

- [x] PDF → Image: PNG/JPEG/WEBP, DPI, nhiều trang ZIP.
- [x] PDF → Word: DOCX qua Stirling adapter.
- [x] PDF → Excel: XLSX; trả `TABLE_NOT_FOUND` khi không có bảng.
- [x] Image → Text: Tesseract `vie+eng`, TXT UTF-8.
- [x] OCR PDF: OCRmyPDF, deskew/rotate, không ghi đè input.
- [x] Images → PDF: nhiều ảnh theo thứ tự.
- [x] Merge PDF: nhiều PDF theo thứ tự.
- [x] Split PDF: khoảng/trang chọn thành một PDF.
- [x] Compress PDF: low/balanced/maximum, không hứa tỷ lệ nén.
- [ ] Bộ fixture lỗi, file lớn, tài liệu nghiêng/mã hóa và giới hạn tài nguyên cho từng tool.

## Dependency và bảo mật

- [x] Pin package/version và Stirling image digest; ghi license/upstream.
- [x] `npm audit` production không có finding tại thời điểm chạy.
- [x] Nâng Python/Node/Nginx base; loại toàn bộ critical khỏi backend/frontend scan.
- [x] Pin bản vá runtime `msgpack 1.2.1`, `setuptools 80.10.2`.
- [ ] Xử lý/đánh giá lại finding chưa có bản vá: backend 5 high ngoài base, frontend 1 high.
- [ ] Nâng Stirling khi upstream có image phù hợp; hiện scan image chính thức còn 1 critical/65 high.
- [ ] Security review độc lập, auth/ownership trước khi mở truy cập rộng.
- [ ] Rà license artifact cuối và chọn license OfficeBox trước phân phối.

## M1-NAS

- [ ] Thu thập model NAS, CPU/RAM, DSM/Container Manager và phạm vi truy cập.
- [ ] Xác minh kiến trúc image, UID/GID, volume, cổng 1280 và reverse proxy.
- [ ] Chạy smoke, restart/retention, benchmark và scan trên thiết bị đích.
- [ ] Chỉ tuyên bố sẵn sàng NAS sau khi findings được chấp nhận hoặc khắc phục có ghi nhận.

## Ngoài phạm vi hiện tại

AI extraction, WebSocket, queue ngoài, nhiều replica và ứng dụng công khai đa người dùng. Các công cụ tương lai trong README chỉ bắt đầu bằng mục kế hoạch mới và checkpoint riêng.
