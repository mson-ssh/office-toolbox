# Nguồn tích hợp và sổ dependency

Cập nhật: 2026-09-16. OfficeBox chỉ dùng package, CLI và container từ upstream chính thức; không sao chép repository hoặc dùng dịch vụ chuyển đổi trực tuyến. Số sao chỉ là tiêu chí lọc ban đầu, không phải chứng nhận bảo mật.

| Thành phần | Phiên bản/artifact đang dùng | Vai trò | License upstream | Trạng thái xác minh |
|---|---|---|---|---|
| PyMuPDF | `1.28.2` | Render, merge, split và tạo PDF | AGPL-3.0 | Chín-tool local suite có đường PyMuPDF PASS |
| Pillow | `12.3.0` | Đọc/ghi ảnh | HPND | Runtime và conversion PASS |
| Tesseract | Debian runtime `5.5.0`, data `eng`, `vie`, `osd` | OCR ảnh | Apache-2.0 | OCR Anh và Việt PASS |
| OCRmyPDF | `17.11.0` | PDF có lớp chữ | MPL-2.0 | Searchable PDF fixture PASS |
| Stirling-PDF | `2.14.3-fat`, digest `sha256:444c2a995e5266e585cbc22d9613d5b4c11c8ea6ac486a9a05869b55d1775f6a` | Word, Excel, nén PDF | MIT kèm ngoại lệ/thư mục có điều khoản riêng | API đúng release đã kiểm tra; valid-path PASS |
| httpx | `0.28.1` | HTTP adapter nội bộ | BSD-3-Clause | Runtime PASS |
| msgpack | `1.2.1` | Dependency Python gián tiếp đã pin vá lỗi | Apache-2.0 | Runtime import xác nhận 1.2.1 |
| setuptools | `80.10.2` | Packaging runtime gián tiếp đã pin vá lỗi | MIT | Runtime import xác nhận 80.10.2 |

Nguồn chính thức: [PyMuPDF](https://github.com/pymupdf/PyMuPDF), [Tesseract](https://github.com/tesseract-ocr/tesseract), [OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF), [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF). Endpoint Stirling được lấy từ OpenAPI/source của đúng release, không suy đoán.

## Kết quả dependency/image scan

Ngày 2026-09-16:

- `npm audit --omit=dev`: 0 finding cho production dependency frontend.
- Backend sau nâng base: Docker Scout báo 0 critical/9 high trên toàn image. Scan `--ignore-base` báo 0 critical/5 high trong `cjson` và `libxml2`; tất cả ghi `Fixed version: not fixed`.
- Runtime backend thực tế có `msgpack 1.2.1` và `setuptools 80.10.2`. Scout toàn image vẫn liệt kê thêm bản cũ từ provenance/base layer; không xóa finding khỏi báo cáo.
- Frontend sau nâng base: 0 critical/1 high (`libxml2`, chưa có bản vá Alpine).
- Stirling official image không đổi: 1 critical/65 high. Đây là blocker cho tuyên bố sẵn sàng NAS/public; service chỉ ở network nội bộ và không publish cổng.

Báo cáo Scout là ảnh chụp theo database tại thời điểm chạy, không thay security audit độc lập. Khi upstream/base phát hành bản vá: cập nhật pin, rebuild, chạy conversion smoke và scan lại trước khi triển khai NAS.

## Quy tắc cập nhật

1. Chỉ lấy release/package/image từ chủ sở hữu upstream chính thức; pin version/digest.
2. Đọc advisory, license và điều khoản của đúng artifact trước khi đổi phiên bản.
3. Không coi độ phổ biến là bằng chứng an toàn.
4. Chạy fixture hợp lệ, lỗi, timeout và kiểm tra output thật sau mỗi lần nâng.
5. Không đưa tài liệu người dùng vào issue, log, scan hoặc dịch vụ ngoài.
