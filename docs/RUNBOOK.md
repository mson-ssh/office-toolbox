# Phát triển và vận hành

Cập nhật: 2026-09-16. Local runtime đang phục vụ tại `http://localhost:1280` với chín công cụ.

## Khởi động local

```bash
cp .env.example .env   # chỉ khi chưa có .env
+docker compose up -d --build
+docker compose ps
+curl -fsS http://127.0.0.1:1280/api/v1/health
+```
+
+Nếu cổng 1280 bị chiếm, xác định và báo process; không tự đổi cổng hoặc dừng process lạ. Chỉ frontend publish cổng host. Xem log bằng:
+
+```bash
+docker compose logs -f backend frontend stirling
+```
+
+Dừng dịch vụ bằng `docker compose down`. Dữ liệu giữ trong `data/database` và `data/jobs`; named volume Stirling không chứa tài liệu job OfficeBox.
+
+## Cấu hình chính
+
+| Biến | Mặc định local | Ghi chú |
+|---|---|---|
+| `APP_PORT` | 1280 | Cổng đã chốt |
+| `APP_BIND_ADDRESS` | 127.0.0.1 | Chỉ local |
+| `JOB_RETENTION_MINUTES` | 60 | Từ lúc kết thúc job |
+| `CLEANUP_INTERVAL_MINUTES` | 10 | Cleanup terminal job |
+| `MAX_UPLOAD_SIZE_MB` | 100 | Tổng input/job |
+| `MAX_FILES_PER_JOB` | 20 | Registry có thể giới hạn thấp hơn |
+| `MAX_LIGHT_JOBS` | 2 | Cần benchmark NAS |
+| `MAX_HEAVY_JOBS` | 1 | OCR/Stirling |
+| `TZ` | Asia/Ho_Chi_Minh | DB dùng UTC |
+
+## Kiểm tra nhanh
+
+```bash
+python3 -m compileall -q apps/backend/app
+cd apps/frontend && npm run build
+docker compose config
+curl -fsS http://127.0.0.1:1280/api/v1/tools
+```
+
+Sau khi nâng dependency/engine: rebuild, kiểm tra health, chạy ít nhất một luồng PyMuPDF, OCR và Stirling, sau đó quét dependency/image. Không coi service healthy là bằng chứng conversion đúng.
+
+## NAS
+
+Chưa triển khai NAS. Trước khi làm: thu thập model/CPU/RAM/DSM, kiểm tra image architecture, đặt UID/GID sở hữu volume, giữ cổng 1280 và chỉ publish frontend. Reverse proxy phải đồng bộ upload limit/timeout. Không dùng `chmod 777`, Docker socket, privileged hay host network.
+
+Hiện scan Stirling còn finding critical/high; phải nâng hoặc có đánh giá/chấp nhận rủi ro trước khi tuyên bố sẵn sàng NAS/public.
+
+## Backup và xử lý lỗi
+
+- Backup SQLite nhất quán hoặc dừng backend trước khi copy; không bỏ qua WAL/SHM khi DB đang chạy.
+- `413`: kiểm tra limit proxy/backend. Job chờ: kiểm tra health, queue và log theo job ID.
+- Engine unavailable: kiểm tra container health và network nội bộ; không tạo output giả.
+- Không yêu cầu người dùng gửi tài liệu thật hoặc log chứa nội dung tài liệu.
+EOF
sed -i '' 's/^+//' docs/RUNBOOK.md