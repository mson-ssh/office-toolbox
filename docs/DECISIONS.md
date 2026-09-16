# Sổ quyết định kiến trúc

Ngày khởi tạo: 2026-09-14. Các quyết định bên dưới định hướng triển khai, chưa là bằng chứng đã triển khai.

| ID | Quyết định | Lý do và hệ quả |
|---|---|---|
| ADR-001 | Xây OfficeBox riêng, dùng package/CLI/API của upstream chính thức | Giữ UI/job/retention theo yêu cầu; tránh gánh một fork lớn |
| ADR-002 | M1 chỉ PyMuPDF cho PDF → Image | Tạo luồng hoàn chỉnh trước; chưa cài OCR hoặc Stirling |
| ADR-003 | SQLite, queue trong tiến trình, một worker/replica | Nhẹ cho NAS; không scale nhiều worker trước khi thay cơ chế điều phối |
| ADR-004 | Conversion chạy subprocess có timeout | Có thể chấm dứt native engine và bảo vệ event loop |
| ADR-005 | Retention từ lúc kết thúc, chặn xóa job đang hoạt động | Giữ đủ thời gian tải; tránh đua cleanup/conversion |
| ADR-006 | Tesseract/OCRmyPDF ở M3, Stirling ở M4, profile tùy chọn | Không bắt máy M1 gánh mọi engine; Word/Excel cần spike |
| ADR-007 | Giữ nguyên README đặc tả, thêm tài liệu điều phối | Không mất yêu cầu gốc; phiên sau có entrypoint và trạng thái riêng |
| ADR-008 | M1 workspace chung trong mạng tin cậy | Giả định triển khai ban đầu; phải bổ sung auth/ownership trước nhu cầu riêng tư nhiều người |

### ADR-009 — Bổ sung thiết kế frontend/backend (2026-09-14)

Settings M1 chỉ đọc; thêm API `/api/v1/config` trả allowlist giới hạn công khai để UI không hard-code cấu hình server. Thiết kế giao diện mặc định tiếng Việt, tập trung desktop và hỗ trợ mobile cơ bản. Các bước FB-01–FB-06 chi tiết hóa M1, không mở rộng sang engine M2–M4. Chưa triển khai.

### ADR-010 — Local trước, cổng 1280 (2026-09-14)

Theo yêu cầu người dùng: xây và nghiệm thu trên local trước, sau đó đưa lên NAS. Cổng host là 1280; local bind loopback, frontend container nghe 8080 và backend 8000 chỉ trong mạng Docker. Dev server nếu dùng cũng giữ 1280 với strictPort. Không tự đổi cổng hoặc dừng process lạ khi xung đột.

Chi tiết hóa ADR-008: giai đoạn đầu truy cập từ máy local, mô hình workspace chung vẫn giữ; mở LAN/NAS đánh giá phạm vi truy cập trước. Thay phần nghiệm thu gộp trước đây bằng M1-LOCAL và M1-NAS riêng; phải đạt local trước khi triển khai NAS, M1 đầy đủ vẫn cần cả hai. Không coi thiếu NAS là blocker phát triển local.

### ADR-011 — Cấu hình triển khai M1 (2026-09-14)

M1 pin PyMuPDF 1.28.2 và Pillow 12.3.0 trong backend, Tailwind CSS 4.3.3 trong frontend. Compose dùng Nginx làm frontend/proxy cùng origin, FastAPI một worker, bind local mặc định `127.0.0.1:1280`, backend chỉ ở mạng Docker nội bộ. Container chạy quyền thấp, read-only root filesystem, drop capabilities; dữ liệu runtime bind vào `./data`. Các lựa chọn này đã có trong mã nguồn và vẫn chờ kiểm thử local.

## Còn mở

- Model/CPU/RAM NAS, network truy cập và số người dùng thực tế (cần ở M1-NAS).
- License/phân phối OfficeBox và điều khoản của artifact upstream được chọn.
- Digest image và phiên bản các dependency gián tiếp sau khi build/scan.
- Giới hạn tài nguyên sau benchmark; hình thức đóng gói OCR worker ở M3.
- Endpoint/edition/chất lượng Word và Excel của Stirling ở M4.

Khi thay quyết định: thêm ADR mới, ghi thay thế ID cũ, lý do, ảnh hưởng và validation; cập nhật tài liệu liên quan.

### ADR-012 — Tích hợp đủ chín công cụ trong local runtime (2026-09-16)

Theo chỉ đạo mới của chủ dự án, phạm vi local được mở cho M2–M4 trước khi có M1-NAS. ADR-002 và ADR-006 được thay thế về thứ tự triển khai: Tesseract/OCRmyPDF được đóng gói trong backend để giữ mô hình nhẹ một worker; Stirling-PDF v2.14.3-fat chạy container riêng, pin digest, chỉ ở network nội bộ. Frontend và job API dùng registry/tool executor chung nên không phụ thuộc engine cụ thể.

### ADR-013 — Giữ local-only khi image scan còn finding (2026-09-16)

Backend/frontend được nâng base và OS packages, loại critical khỏi hai image tự build; các Python package có fixed version được pin. Finding chưa có bản vá và finding của image Stirling chính thức được ghi nguyên trạng. Không tự sửa image Stirling đã thu gọn sau khi thử `apt-get upgrade` thất bại; giữ image chính thức, cổng nội bộ, container hardening, queue/timeout. Chưa triển khai NAS/public cho đến khi findings được cập nhật hoặc có đánh giá/chấp nhận rủi ro rõ ràng.
