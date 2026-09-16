# Trạng thái hiện tại — đọc trước khi tiếp tục

Cập nhật: 2026-09-16T09:19:27+07:00.

## Công việc hiện tại

- Mã việc: RELEASE-GITHUB.
- Trạng thái: DONE.
- Kết quả: code và local valid-path cho đủ chín công cụ đã hoàn tất; trang chi tiết đã có preview PDF/ảnh/TXT và fallback download cho định dạng Office/ZIP. Ảnh → Văn bản nhận Ctrl/⌘+V và hiển thị/copy text OCR trực tiếp. Backend, frontend, Stirling đang healthy; URL `http://localhost:1280`.
- Chưa thể dùng trạng thái DONE vì chưa có browser/negative/resource/restart-cleanup matrix đầy đủ, chưa nghiệm thu NAS và image scan còn finding.

## GitHub

- Repository: `https://github.com/mson-ssh/office-toolbox.git`.
- Nhánh: `main`, tracking `origin/main`.
- Push đầu tiên: PASS ngày 2026-09-16; mã nguồn, Compose và tài liệu đã lên remote.
- `.env`, database, WAL/SHM, job files, node_modules và dist không được commit.

## Runtime đang chạy

- `officebox-frontend-1`: healthy, duy nhất publish `127.0.0.1:1280->8080`.
- `officebox-backend-1`: healthy, internal port 8000.
- `officebox-stirling-1`: healthy, internal port 8080; official v2.14.3-fat pin digest.
- Backend engine: Python 3.13.15, PyMuPDF 1.28.2, Tesseract 5.5.0 (`eng`, `vie`, `osd`), OCRmyPDF 17.11.0, httpx 0.28.1.
- Dữ liệu: `data/database`, `data/jobs`; fixture kiểm tra tạm ở `/tmp/officebox-smoke`.

## Bằng chứng đạt

- Python compile và TypeScript production build: PASS.
- Compose build/start, health và registry đủ chín tool: PASS.
- Valid-path download/output cho cả chín công cụ: PASS bằng fixture tổng hợp.
- OCR tiếng Anh/Việt, searchable PDF, DOCX/XLSX OOXML, page count/order ZIP/PDF: PASS.
- XLSX không có bảng trả lỗi `TABLE_NOT_FOUND`: PASS.
- Sau nâng base/pin dependency, smoke PyMuPDF + OCR Việt + Stirling: PASS.
- `npm audit --omit=dev`: 0 finding.

## Bảo mật còn mở

- Backend Scout toàn image: 0 critical/9 high; `--ignore-base`: 0 critical/5 high chưa có fixed version.
- Frontend: 0 critical/1 high chưa có fixed version.
- Stirling official image: 1 critical/65 high; giữ internal-only. Đây là blocker cho tuyên bố sẵn sàng NAS/public.
- Runtime đã pin `msgpack 1.2.1` và `setuptools 80.10.2`; Scout vẫn liệt kê metadata bản cũ từ provenance/base layer.
- Chưa có auth/ownership; chỉ dùng workspace local tin cậy.

## Việc kế tiếp

1. Chủ dự án kiểm tra trực quan Ctrl/⌘+V, OCR inline/copy, preview PDF/ảnh/TXT và fallback DOCX/XLSX/ZIP tại `http://localhost:1280`.
2. Chủ dự án chạy browser smoke chín tool tại `http://localhost:1280`.
3. Hoàn tất negative/resource/concurrency/restart/cleanup matrix trong `docs/TESTING.md`.
4. Theo dõi/nâng base và Stirling, scan lại; đánh giá applicability/chấp nhận rủi ro trước NAS.
5. Thu thập model NAS, CPU/RAM/DSM, UID/GID và phạm vi truy cập; sau đó mới thực hiện M1-NAS.

## Lệnh tiếp tục

```bash
docker compose ps
curl -fsS http://127.0.0.1:1280/api/v1/health
docker compose logs --tail=100 backend frontend stirling
```
