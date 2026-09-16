# Nhật ký bàn giao

## 2026-09-14 — Lập kế hoạch và tài liệu

- Yêu cầu: sử dụng bốn upstream đã chọn; lập kế hoạch chi tiết và tạo tài liệu để tiếp tục qua nhiều phiên.
- Hiện trạng đầu phiên: chỉ README.md, không có code hoặc thư mục .git.
- Thay đổi: thêm AGENTS.md, docs/PLAN.md, ARCHITECTURE.md, UPSTREAM.md, SECURITY.md, TESTING.md, RUNBOOK.md, DECISIONS.md, STATUS.md, SESSION_LOG.md; thêm mục lục vào README, giữ đặc tả gốc.
- Quyết định: M1 PyMuPDF, M2 PDF cơ bản, M3 Tesseract/OCRmyPDF, M4 Stirling; phiên này chỉ chuẩn bị tài liệu.
- Kiểm tra: nguồn upstream chính thức đã tra cứu; liên kết Markdown tương đối được kiểm tra bằng script cuối phiên. Chưa có kiểm thử runtime.
- Giới hạn: chưa audit code upstream, chưa chọn release/license artifact, chưa biết NAS; không chứng nhận bảo mật hoặc chất lượng chuyển đổi.
- Bước tiếp theo: M1.1, thẩm định dependency và dựng foundation. Đọc STATUS trước khi bắt đầu.

## 2026-09-14 — Kế hoạch frontend và backend

- Yêu cầu: tạo kế hoạch xây giao diện và backend chứa logic.
- Thêm `FRONTEND_BACKEND_PLAN.md`: route/màn hình, UI states, component, module backend, luồng xử lý và sáu bước bàn giao FB-01–FB-06.
- Đồng bộ mục lục README, PLAN, ARCHITECTURE, DECISIONS và STATUS; thêm thiết kế config API công khai cho Settings chỉ đọc.
- Trạng thái: chỉ tài liệu, chưa có code hoặc kiểm thử runtime. Kiểm tra liên kết Markdown nội bộ và code fence ở cuối phiên.
- Tiếp tục: FB-01 / M1.1; không triển khai OCR/Stirling trước nghiệm thu M1.

### Mẫu ghi phiên

```text
Ngày / mục tiêu:
Trạng thái đầu phiên:
Công việc hoàn thành và file thay đổi:
Quyết định mới/thay đổi:
Lệnh kiểm tra thực sự chạy và kết quả:
Việc chưa xong / blocker:
Bước tiếp theo cụ thể:
```

## 2026-09-14T16:48:22+07:00 — DOC-PROGRESS-RULES — IMPLEMENTED_UNVERIFIED

- Đã làm: quy tắc bắt buộc ghi tiến độ sau từng bước, lỗi, trước tác vụ dài và khi bàn giao; định nghĩa trạng thái và checkpoint tối thiểu.
- File thay đổi: AGENTS.md, README.md, docs/STATUS.md, docs/SESSION_LOG.md.
- Kiểm tra: NOT_RUN đối với validation Markdown ở checkpoint này; đã đọc hiện trạng tài liệu. Không có runtime cần test.
- Phần còn lại: kiểm tra liên kết/code fence và quy tắc; ghi kết quả trước khi kết thúc.
- Bước tiếp theo: chạy script validation tài liệu. Không có process chạy nền.

### Mẫu checkpoint cho mọi AI

## 2026-09-14T16:48:35+07:00 — DOC-PROGRESS-RULES — DONE

- Kiểm tra: PASS — chạy script Python kiểm tra liên kết nội bộ, code fence của 12 file Markdown và sự hiện diện các quy tắc/trạng thái bắt buộc; kết quả 0 lỗi.
- File cập nhật sau kiểm tra: docs/STATUS.md và docs/SESSION_LOG.md để ghi kết quả thực tế.
- Hạn chế: quy tắc là hướng dẫn cho AI, chưa có công cụ tự động cưỡng chế việc ghi log. Chưa có kiểm thử ứng dụng vì chưa có code.
- Bước tiếp theo: FB-01 / M1.1; ghi trạng thái trước khi làm. Không có process chạy nền.

### Mẫu checkpoint

```text
Thời điểm ISO 8601 kèm múi giờ / mã việc / trạng thái:
Việc vừa làm:
File thay đổi:
Kiểm tra: lệnh + PASS/FAIL/RUNNING/NOT_RUN + bằng chứng/lý do:
Phần còn dở / lỗi / hạn chế:
Process còn chạy và cách kiểm tra (nếu có):
Bước tiếp theo cụ thể:
```

## 2026-09-14T16:50:54+07:00 — DOC-LOCAL-1280-REVIEW — IN_PROGRESS

- Đã đọc quy tắc, trạng thái và rà các mục NAS/cổng/nghiệm thu bằng rg.
- Phát hiện: chưa quy định cổng; M1.5/FB-06 gộp kiểm thử local và NAS.
- File cập nhật: STATUS.md và SESSION_LOG.md.
- Tiếp theo: chốt local 1280, tách nghiệm thu local và NAS, kiểm tra tài liệu; runtime NOT_RUN vì chưa có code.

## 2026-09-14T16:51:15+07:00 — DOC-LOCAL-1280-REVIEW — IMPLEMENTED_UNVERIFIED

- File thay đổi: README, AGENTS, PLAN, ARCHITECTURE, FRONTEND_BACKEND_PLAN, RUNBOOK, TESTING, SECURITY, DECISIONS, STATUS và SESSION_LOG.
- Chốt URL local http://localhost:1280, frontend container 8080, backend 8000 nội bộ; dev server không tự đổi cổng.
- Tách M1-LOCAL trước M1-NAS; chỉnh cấu trúc heading kiến trúc/quyết định cho rõ.
- Kiểm tra runtime NOT_RUN vì chưa có app; tiếp theo chạy validation tài liệu.

## 2026-09-14T16:51:15+07:00 — DOC-LOCAL-1280-REVIEW — DONE

 - PASS: script Python kiểm tra 12 file Markdown, liên kết/code fence, cổng 1280 trong 9 tài liệu điều phối và M1-LOCAL/M1-NAS riêng.
 - Rà soát: giữ PDF → Image trước; nguồn chính thức, kiểm tra artifact trước tích hợp; checkpoint liên tục; không còn yêu cầu chờ NAS để bắt đầu local.
 - File cập nhật kết quả: STATUS.md, SESSION_LOG.md.
 - NOT_RUN: ứng dụng/Docker/cổng thực tế vì phiên này rà tài liệu, chưa có code.
 - Tiếp theo: FB-01 / M1.1, kiểm tra công cụ local và cổng 1280; không có process chạy nền.

## 2026-09-14T16:53:20+07:00 — FE-BUILD — IN_PROGRESS

- Mục tiêu: Xây dựng frontend giao diện OfficeBox theo yêu cầu người dùng và FRONTEND_BACKEND_PLAN.
- Đã làm: Xác nhận môi trường (Node v26.7.0, npm 11.19.0, port 1280 trống). Chuẩn bị cấu trúc apps/frontend.
- Kiểm tra: NOT_RUN (theo yêu cầu người dùng: không tự test, người dùng tự kiểm tra).
- Bước tiếp theo: Khởi tạo và code hoàn chỉnh các module frontend, chạy server trên port 1280.

## 2026-09-14T16:57:30+07:00 — FE-BUILD — IMPLEMENTED_UNVERIFIED

- Đã làm: Xây dựng toàn bộ giao diện frontend OfficeBox tại `apps/frontend/` theo FRONTEND_BACKEND_PLAN:
  + Cấu hình `vite.config.ts` cổng cố định 1280, proxy `/api` tới backend 8000.
  + Hệ thống CSS tokens chuẩn văn phòng, responsive desktop/mobile trong `src/styles/index.css`.
  + Components dùng chung: `AppShell`, `Button`, `StatusBadge`, `FileDropzone`, `ConfirmDeleteDialog`, `ProgressBar`, `EmptyState`.
  + Màn hình Trang chủ (`DashboardPage`), Danh mục công cụ (`ToolsListPage`), Chuyển đổi PDF sang ảnh (`PdfToImagePage`), Quản lý công việc (`JobsListPage`), Chi tiết công việc và tiến trình (`JobDetailPage`), Cài đặt & Giới hạn (`SettingsPage`).
  + Client API `lib/api/client.ts` hỗ trợ kết nối backend và cơ chế fallback giả lập tương tác độc lập để người dùng có thể trải nghiệm toàn bộ luồng.
  + Khởi chạy Vite dev server local tại `http://localhost:1280`.
- File thay đổi: Toàn bộ thư mục `apps/frontend/`, `docs/STATUS.md`, `docs/SESSION_LOG.md`.
- Kiểm tra:
  + Biên dịch bundle `npm run build`: PASS (0 lỗi).
  + Kiểm tra port 1280 bằng HTTP request: PASS (`HTTP/1.1 200 OK`).
  + Kiểm thử chức năng giao diện người dùng: NOT_RUN (tuân thủ nghiêm ngặt chỉ đạo: người dùng sẽ tự test).
- Process đang chạy: Background task `npm run dev` (task-87), lắng nghe tại `http://localhost:1280`.
- Bước tiếp theo: Người dùng tự kiểm thử giao diện tại http://localhost:1280.

## 2026-09-14 — M1-IMPLEMENTATION — IN_PROGRESS

- Mục tiêu: hoàn thành code M1 từ frontend hiện có đến backend, PDF → Image, Docker và tài liệu vận hành local cổng 1280.
- Đã kiểm tra: frontend có mô phỏng job/health khi API lỗi; backend và Docker chưa có. Python/Node/Docker/Compose sẵn có; PyMuPDF 1.28.2 có trên PyPI chính thức.
- Kiểm tra: NOT_RUN theo chỉ đạo người dùng; không chạy test/build trong công việc này.
- Process có sẵn: Vite PID 42206 tại cổng 1280, không dừng hoặc thay đổi trong bước này.
- Bước tiếp theo: tạo backend foundation và logic xử lý thực.

### Checkpoint M1 backend foundation

- Đã tạo `.env.example`, ignore rules, data placeholders và dependency backend đã pin.
- Đã tạo cấu hình tập trung, logging JSON, SQLite WAL/session và model metadata Job/JobFile; binary không lưu trong DB.
- File: `.gitignore`, `.dockerignore`, `.env.example`, `data/`, `apps/backend/requirements.txt`, `app/core/`, `app/db/`.
- Kiểm tra: NOT_RUN theo yêu cầu người dùng.
- Tiếp theo: storage manager, registry, subprocess PyMuPDF và queue/cleanup.

### Checkpoint M1 backend logic và API

- Đã tạo storage theo UUID, streaming upload, kiểm tra PDF, registry/options, PyMuPDF subprocess có timeout, render một ảnh/nhiều trang ZIP và giới hạn tài nguyên.
- Đã tạo job service, queue LIGHT, startup recovery, cleanup, download có lock, health/config/tools/jobs API và error response an toàn.
- File: `apps/backend/app/storage/`, `tools/`, `adapters/`, `jobs/`, `api/`, `main.py`.
- Kiểm tra: NOT_RUN theo yêu cầu người dùng; implementation chưa được xác minh runtime.
- Tiếp theo: sửa frontend bỏ mô phỏng, đồng bộ schema/config/polling/accessibility.

### Checkpoint M1 frontend integration

- Đã xóa cơ chế mô phỏng job/health/delete; API lỗi được hiển thị thay vì giả thành công.
- Đồng bộ multipart `files`, response `job_id`, public config, giới hạn upload và retention; polling dùng chu kỳ tuần tự 3 giây, chậm lại khi tab ẩn.
- Bỏ Google Fonts từ Internet, bind Vite loopback, thêm thao tác bàn phím cho dropzone/tool/format và semantics dialog/nút xóa.
- File: `apps/frontend/src/lib/api/`, các trang dashboard/tools/jobs/settings, components, CSS, index.html, vite config.
- Kiểm tra: NOT_RUN theo yêu cầu người dùng.
- Tiếp theo: Docker frontend/backend, proxy và tài liệu chạy.

### Checkpoint M1 Docker

- Đã tạo image backend một worker, image frontend Nginx non-root, same-origin `/api` proxy và healthcheck.
- Compose chỉ publish `${APP_BIND_ADDRESS}:${APP_PORT}:8080`, mặc định loopback:1280; backend nội bộ, volume `/data`, read-only rootfs, drop capabilities và PUID/PGID cấu hình được.
- File: Dockerfiles, `apps/frontend/nginx.conf`, `docker-compose.yml`, `.env.example`.
- Kiểm tra: NOT_RUN theo yêu cầu người dùng; chưa build/start container.
- Tiếp theo: hoàn thiện Tailwind setup, tài liệu vận hành và rà code tĩnh không chạy test.

### Checkpoint M1 Tailwind và dependency

- Lần cài Tailwind 3.4.17 ban đầu tự báo một dependency mức high; đã gỡ ngay, không dùng cấu hình này.
- Đã chuyển sang Tailwind CSS và PostCSS plugin 4.3.3 từ npm; kết quả cài đặt tự báo 0 vulnerabilities. Không chạy audit/test riêng theo chỉ đạo.
- Thêm PostCSS config, import Tailwind và `.dockerignore` riêng cho từng build context.
- Tiếp theo: hoàn thiện tài liệu chạy và rà tính đầy đủ của implementation mà không thực thi test/build.

### Checkpoint M1 rà soát hoàn thiện mã nguồn

- Thời điểm: 2026-09-14T17:23:55+07:00. Mã việc: M1-IMPLEMENTATION. Trạng thái: IN_PROGRESS.
- Đã rà hợp đồng API, lifecycle job, queue, storage, Docker/Nginx và luồng frontend bằng cách đọc mã nguồn; không thực thi ứng dụng.
- Đã xử lý trường hợp queue đầy sau khi commit job, dọn output dở khi worker lỗi, dọn thư mục job mồ côi có khoảng đệm và chặn symlink ở mọi cấp thư mục/file của job.
- Đã đặt nút dùng chung mặc định `type="button"` để thao tác bỏ chọn file không vô tình submit form; bổ sung semantics cho progress bar.
- File thay đổi: `apps/backend/app/jobs/coordinator.py`, `apps/backend/app/jobs/service.py`, `apps/backend/app/storage/manager.py`, `apps/frontend/src/components/Button.tsx`, `apps/frontend/src/components/ProgressBar.tsx`, `docs/PLAN.md`, `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`, `docs/DECISIONS.md`.
- Kiểm tra: NOT_RUN theo yêu cầu người dùng; không chạy type-check, build, Docker, API hay conversion.
- Phần còn dở: bằng chứng M1-LOCAL, scan dependency/image, benchmark và M1-NAS. Bước tiếp theo: người dùng khởi động Compose và chạy checklist M1-LOCAL.

## 2026-09-14T17:25:57+07:00 — M1-IMPLEMENTATION — IMPLEMENTED_UNVERIFIED

- Hoàn tất phạm vi mã nguồn M1: frontend, API, SQLite metadata, storage, queue/worker, PyMuPDF PDF → Image, download/delete/retention/recovery và Docker Compose local cổng 1280.
- Hoàn tất rà soát mã nguồn cuối: không còn fallback mô phỏng trong source; queue đầy được ghi FAILED có job_id; output dở và orphan được dọn; đường dẫn job chặn traversal/symlink; nút trong form và progress semantics đã sửa.
- File thay đổi trong phiên: cấu hình/ignore ở root, `apps/backend/`, frontend integration và cấu hình build trong `apps/frontend/`, `docker-compose.yml`, `THIRD_PARTY_NOTICES.md`, `data/` placeholders, README và tài liệu điều phối trong `docs/`.
- Kiểm tra: NOT_RUN theo chỉ đạo người dùng; không chạy type-check, build, Docker, API, conversion, benchmark hoặc security scan. Thư mục `apps/frontend/dist` hiện có là artifact cũ từ lần build trước, không phải bằng chứng cho mã nguồn hiện tại và bị loại khỏi Docker build context.
- Process: Vite PID 42206 từng được quan sát ở cổng 1280 trước triển khai; chưa xác minh lại, không dừng. Trước Compose cần kiểm tra cổng và dừng đúng process nếu còn tồn tại.
- Trạng thái kế hoạch: giữ checkbox M1/FB-01–FB-06 trống vì chưa có bằng chứng nghiệm thu. M2–M4 chưa bắt đầu.
- Bước tiếp theo cụ thể: `cp .env.example .env`, chỉnh PUID/PGID nếu cần, chạy `docker compose up -d --build`, sau đó thực hiện M1-LOCAL theo `docs/TESTING.md` và `docs/RUNBOOK.md`.

## 2026-09-14T17:28:14+07:00 — M1-LOCAL-STARTUP — IN_PROGRESS

- Mục tiêu: khởi chạy OfficeBox local bằng Docker Compose tại `http://localhost:1280` theo yêu cầu người dùng.
- Kiểm tra: PASS cho Docker 29.7.2, Compose 5.4.0 và Docker daemon. `.env` chưa có.
- Xung đột cổng: PID 42206 là Vite của đúng workspace, cwd `apps/frontend`, đang giữ `127.0.0.1:1280`; đủ căn cứ dừng tiến trình cũ trước Compose.
- File thay đổi: `docs/STATUS.md`, `docs/SESSION_LOG.md`.
- Bước tiếp theo: dừng PID 42206, kiểm tra cổng, tạo `.env` với PUID/PGID 501:20; lưu checkpoint trước `docker compose up -d --build`.

### Checkpoint trước build/start Compose — RUNNING

- Đã gửi TERM và xác nhận Vite PID 42206 không còn giữ cổng 1280; không dừng process ngoài workspace.
- Đã tạo `.env` từ `.env.example`, đặt PUID=501 và PGID=20 theo tài khoản local; `.env` nằm trong ignore, không ghi secrets vào log.
- File thay đổi: `.env`, `docs/STATUS.md`, `docs/SESSION_LOG.md`.
- Lệnh sắp chạy: `docker compose up -d --build`. Trạng thái: RUNNING; kết quả chưa biết.
- Bước tiếp theo sau khi lệnh trả về: ghi PASS/FAIL, kiểm tra container, health và frontend.

### Checkpoint build/start Compose — PASS

- `docker compose up -d --build`: PASS, exit code 0.
- Frontend đã chạy `npm ci --ignore-scripts` và `npm run build` thành công trong image build; backend dependencies cài thành công; image `officebox-frontend` và `officebox-backend` được tạo.
- Backend đạt Docker healthcheck sau khoảng 6 giây; frontend container đã start. Network nội bộ `officebox_internal` được tạo.
- File thay đổi: không có file nguồn; Docker tạo image/container/network và runtime data theo Compose.
- Bước tiếp theo: kiểm tra `docker compose ps`, log đã lọc, `http://localhost:1280/` và `/api/v1/health`.

## 2026-09-14T17:29:38+07:00 — M1-LOCAL-STARTUP — DONE

- `docker compose ps`: PASS; `officebox-backend-1` và `officebox-frontend-1` đều running/healthy. Chỉ frontend publish `127.0.0.1:1280→8080`; backend 8000 không publish ra host.
- `GET http://localhost:1280/`: PASS, HTTP 200 qua Nginx; có CSP, nosniff, frame deny và no-referrer headers.
- `GET /api/v1/health`: PASS, status/database/storage/PyMuPDF đều healthy, phiên bản app 0.1.0. `GET /api/v1/tools`: PASS, chỉ có `pdf-to-image` khả dụng.
- Log khởi động: PASS; Uvicorn startup complete, không thấy lỗi trong 100 dòng log cuối. Cổng 1280 hiện do Docker Desktop giữ đúng mapping Compose.
- File thay đổi: `.env`, README, `docs/STATUS.md`, `docs/RUNBOOK.md`, `docs/SESSION_LOG.md`. Process còn chạy: hai container Compose; kiểm tra bằng `docker compose ps`, dừng bằng `docker compose down`.
- Giới hạn: chưa upload tài liệu hoặc kiểm tra conversion/download/delete/expiry/restart; không tuyên bố M1-LOCAL hoàn tất và không đánh dấu checkbox kế hoạch.
- Bước tiếp theo: người dùng kiểm tra giao diện tại `http://localhost:1280`, sau đó thực hiện phần còn lại của ma trận M1-LOCAL.

## 2026-09-14T18:51:04+07:00 — M2-M4-TOOLS — IN_PROGRESS

- Mục tiêu: theo chỉ đạo mới của chủ dự án, hoàn thiện PDF → Word, PDF → Excel, Image → Text, OCR PDF, Images → PDF, Merge PDF, Split PDF và Compress PDF.
- Nguồn được chủ dự án xác nhận: repository chính thức Stirling-PDF, Tesseract, OCRmyPDF và PyMuPDF; không dùng fork hoặc dịch vụ chuyển đổi online.
- Điều tra upstream: GitHub API ghi release mới nhất tại thời điểm kiểm tra là Stirling-PDF v2.14.3, Tesseract 5.5.3, OCRmyPDF v17.11.0. Đã đọc OpenAPI Stirling Processing API và source controller đúng v2.14.3 để xác minh endpoint `/api/v1/convert/pdf/word`, `/api/v1/convert/pdf/xlsx` và `/api/v1/misc/compress-pdf`; chưa bịa contract.
- Trạng thái runtime trước sửa: hai container M1 vẫn running/healthy trên cổng 1280.
- File thay đổi: `docs/STATUS.md`, `docs/SESSION_LOG.md`.
- Kiểm tra: nguồn chính thức PASS; triển khai và runtime các công cụ mới NOT_RUN.
- Bước tiếp theo: thiết kế registry/options và generalize luồng nhiều input mà không phá job M1.

### Checkpoint registry, dependency và backend đa công cụ

- Đã mở registry từ một lên chín công cụ, khai báo số lượng/loại input, workload, output và allowlist options; parser khoảng trang chỉ nhận cú pháp hữu hạn.
- Đã generalize upload streaming cho nhiều file theo thứ tự, giới hạn tổng dung lượng/trang/pixel, tên lưu do server tạo và validation PDF/ảnh trong subprocess.
- Đã thêm PyMuPDF merge/split/images-to-PDF, Tesseract image-to-text, OCRmyPDF searchable PDF và Stirling adapter cho Word/XLSX/compress; mọi CLI dùng argv, timeout dừng process group, HTTP Stirling chỉ tới URL nội bộ cấu hình sẵn.
- Compose thêm Stirling-PDF v2.14.3-fat từ registry chính thức, pin manifest digest đa kiến trúc `sha256:444c2a...d1775f6a`; không publish cổng. Backend thêm OCRmyPDF 17.11.0, Tesseract eng/vie và native dependencies từ Debian.
- Lỗi điều tra đã gặp: một lệnh clone nghiên cứu bị policy chặn vì có `rm -rf`; đã không thực thi xóa. Sparse checkout lần đầu lỗi do đưa file root như directory, lần sau lỗi pathspec Dockerfile; đã sửa bằng đường dẫn repository thực `docker/compose` và đọc được health/env chính thức. Không ảnh hưởng workspace.
- File thay đổi: backend registry, PyMuPDF runner/client, OCR/Stirling/process adapters, tool executor, job service/coordinator/routes/main/config, requirements, backend Dockerfile, `.env.example`, `.env`, `docker-compose.yml`.
- Kiểm tra runtime: NOT_RUN cho code mới. Bước tiếp theo: hoàn thiện frontend generic, sau đó rà/build theo checkpoint riêng.

## 2026-09-14T17:30:15+07:00 — M1-LOCAL-COMPOSE — IMPLEMENTED_UNVERIFIED

- Kiểm tra dịch vụ Compose:
  + `docker compose ps`: PASS — cả `officebox-backend-1` và `officebox-frontend-1` đều `Up` và `healthy`.
  + `curl http://127.0.0.1:1280/api/v1/health`: PASS — HTTP 200 `{"status":"healthy","database":"healthy","storage":"healthy","processing_services":{"pymupdf":"healthy"}}`.
  + `curl http://127.0.0.1:1280/api/v1/tools`: PASS — HTTP 200, tool `pdf-to-image` sẵn sàng với schema options.
  + `curl -I http://127.0.0.1:1280/`: PASS — HTTP 200 OK, Nginx phục vụ frontend static bundle.
  + Kiểm thử giao diện/trình duyệt: NOT_RUN (chủ dự án tự kiểm thử theo yêu cầu).
- File thay đổi: `docs/STATUS.md`, `docs/SESSION_LOG.md`.
- Process đang chạy: Docker Compose containers `officebox-backend-1` và `officebox-frontend-1` trên cổng host 1280.
- Bước tiếp theo: Chủ dự án tự nghiệm thu M1-LOCAL trên trình duyệt tại `http://localhost:1280`.

### Checkpoint frontend dùng chung cho chín công cụ

- Thời điểm: 2026-09-14T19:03:32+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Đã thêm trang công cụ động theo registry, upload một/nhiều tệp có kiểm tra loại/dung lượng và sắp xếp thứ tự, trường tùy chọn theo schema, cảnh báo chất lượng; dashboard, lịch sử và chi tiết job hiển thị đúng tên/tùy chọn của cả chín công cụ.
- Đã cập nhật điều hướng, trang cài đặt và CSS cho luồng đa công cụ; không thay đổi công việc hay dữ liệu runtime hiện có.
- File thay đổi: `apps/frontend/src/app/App.tsx`, `components/AppShell.tsx`, `components/MultiFileDropzone.tsx`, `features/tools/ToolPage.tsx`, `features/tools/ToolsListPage.tsx`, `features/dashboard/DashboardPage.tsx`, `features/jobs/JobDetailPage.tsx`, `features/jobs/JobsListPage.tsx`, `features/settings/SettingsPage.tsx`, `lib/api/client.ts`, `lib/api/types.ts`, `lib/tools.ts`, `styles/index.css`.
- Kiểm tra: NOT_RUN cho frontend mới; container đang chạy vẫn là image M1 cũ. Bước tiếp theo: rà cú pháp/type và build trước khi thay runtime.

### Checkpoint phục hồi phiên và kiểm tra tĩnh

- Thời điểm: 2026-09-16T08:30:15+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Đã đối chiếu checkpoint với mã nguồn thực tế; bổ sung dọn storage và lỗi an toàn khi validation input gặp ngoại lệ ngoài dự kiến; public config đã khai báo đầy đủ MIME PDF/ảnh và giao diện mô tả đúng giới hạn tổng dung lượng mỗi job.
- `python3 -m compileall -q apps/backend/app`: PASS.
- `npm run build` tại `apps/frontend`: PASS; TypeScript và Vite tạo production bundle, 1.894 module được transform.
- File thay đổi trong bước: `apps/backend/app/jobs/service.py`, `apps/backend/app/api/routes/system.py`, `apps/frontend/src/features/settings/SettingsPage.tsx`, `docs/STATUS.md`, `docs/SESSION_LOG.md`.
- Runtime hiện vẫn là image M1 trước thay đổi; bước tiếp theo: lưu checkpoint RUNNING rồi chạy `docker compose up -d --build`.

### Checkpoint trước rebuild Compose — RUNNING

- Thời điểm: 2026-09-16T08:31:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Lệnh: `docker compose up -d --build` tại root dự án. Mục tiêu: tạo backend có Tesseract/OCRmyPDF, frontend đa công cụ và khởi động Stirling-PDF nội bộ.
- Kết quả: chưa có; không ghi PASS. Runtime M1 cũ có thể được thay thế trong quá trình Compose recreate.
- Bước tiếp theo: khi lệnh trả về, ghi exit code, kiểm tra `docker compose ps`, health và log đã lọc.

### Checkpoint rebuild Compose — PASS

- Thời điểm: 2026-09-16T08:33:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- `docker compose up -d --build`: PASS, exit code 0. Stirling-PDF image đúng tag/digest đã được pull; backend và frontend build thành công.
- Compose đã tạo ba named volume Stirling, khởi động Stirling healthy, backend healthy và frontend started; chỉ frontend tiếp tục publish cổng host 1280 theo cấu hình.
- File nguồn không đổi trong bước này; Docker đã thay image/container runtime. Bước tiếp theo: kiểm tra `docker compose ps`, API health/tools, frontend và log lỗi.

### Checkpoint runtime đa engine — PASS

- Thời điểm: 2026-09-16T08:34:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- `docker compose ps`: PASS; Stirling, backend và frontend đều healthy. Chỉ frontend publish `127.0.0.1:1280`; backend 8000 và Stirling 8080 chỉ ở network nội bộ.
- `GET /api/v1/health`: PASS, database/storage/PyMuPDF/Tesseract/OCRmyPDF/Stirling đều healthy. `GET /api/v1/tools`: PASS, trả đúng chín công cụ khả dụng. `HEAD /`: PASS, HTTP 200 và security headers hiện diện.
- Engine quan sát trong backend: Tesseract 5.3.0 với `eng`, `osd`, `vie`; OCRmyPDF 17.11.0; PyMuPDF 1.28.2; httpx 0.28.1. Log khởi động backend không có lỗi; Stirling v2.14.3 start thành công, cảnh báo thiếu `rar` chỉ tắt công cụ PDF-to-CBR không được OfficeBox sử dụng.
- File nguồn không đổi trong bước. Bước tiếp theo: tạo fixture PDF/ảnh tổng hợp trong `/tmp`, gọi API và kiểm tra kết quả download của từng công cụ.

### Checkpoint lỗi sao chép fixture — FAIL

- Thời điểm: 2026-09-16T08:35:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Script trong backend đã tạo và liệt kê hai PDF, hai PNG và một scan PDF tổng hợp tại `/tmp/officebox-fixtures`; không dùng tài liệu người dùng.
- `docker cp officebox-backend-1:/tmp/officebox-fixtures/. /tmp/officebox-smoke/`: FAIL vì Docker báo không tìm thấy đường dẫn sau khi lệnh `docker compose exec` kết thúc. Chưa chạy conversion, không ghi PASS.
- File workspace không thay đổi. Bước tiếp theo: xác minh namespace `/tmp` của container; nếu fixture không còn, tạo fixture trực tiếp ở `/data` tạm thời hoặc stream tar ra host rồi tiếp tục.

### Checkpoint fixture phục hồi và conversion — RUNNING

- Thời điểm: 2026-09-16T08:36:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Xác minh fixture vẫn tồn tại trong `/tmp` của backend; nguyên nhân thực tế chỉ là `docker cp` không đọc được đường dẫn tmpfs. Đã stream tar từ container ra `/tmp/officebox-smoke` trên host thành công.
- Fixture gồm PDF 2 trang, PDF 1 trang, hai PNG chứa chữ mẫu và PDF scan tạo từ ảnh. Không chứa dữ liệu người dùng; file workspace không thay đổi.
- Sắp gọi API tạo job, poll trạng thái và tải kết quả cho cả chín công cụ. Kết quả chưa biết; không ghi PASS.

### Checkpoint conversion vòng 1 — 8 PASS, 1 FAIL

- Thời điểm: 2026-09-16T08:37:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- PASS end-to-end create/poll/download: PDF → Image (ZIP), Image → Text (Tesseract nhận đúng `OFFICEBOX OCR SAMPLE 12345`), Images → PDF, Merge PDF, Split PDF, OCR PDF, PDF → Word (DOCX), Compress PDF.
- Kết quả tải xuống có magic hợp lệ: ZIP/DOCX `PK`, PDF `%PDF`; nén scan mẫu từ 1.803.568 xuống 8.467 byte. Đây là fixture tổng hợp nên số nén chỉ là bằng chứng luồng chạy, không phải benchmark tài liệu thực.
- FAIL: PDF → Excel kết thúc `STIRLING_REJECTED`; chưa có output. Job ID `22ffc1f8-cd28-4e74-b74b-b05b5316073f`.
- File workspace không thay đổi. Bước tiếp theo: đọc log Stirling quanh request XLSX và gọi trực tiếp nội bộ để thu status/body đã lọc, sau đó sửa field/contract và chạy lại.

### Checkpoint PDF → Excel — PASS với bảng có cấu trúc

- Thời điểm: 2026-09-16T08:38:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Log backend xác nhận lần đầu endpoint XLSX trả HTTP 204; đây là trường hợp không tìm thấy bảng trong fixture chỉ có văn bản phân cách bằng dấu `|`, không phải sai endpoint hay field.
- Đã tạo fixture PDF có đường kẻ ô và chạy lại: job `767e3e3d-5c06-40d7-838d-d29d90938148` COMPLETED, tải `table-tables.xlsx` 3.376 byte với magic ZIP hợp lệ.
- Đã cập nhật Stirling adapter để ánh xạ HTTP 204 của XLSX thành lỗi rõ ràng `TABLE_NOT_FOUND` thay cho `STIRLING_REJECTED` chung.
- File thay đổi: `apps/backend/app/adapters/stirling/client.py`, tài liệu checkpoint. Bước tiếp theo: rebuild backend, xác minh lỗi mới và kiểm tra cấu trúc/nội dung các output.

### Checkpoint kiểm tra sâu và lỗi fixture tiếng Việt

- Thời điểm: 2026-09-16T08:41:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Rebuild backend sau sửa XLSX: PASS; health API tiếp tục healthy. PDF không có bảng đã được thử lại và job FAILED đúng `TABLE_NOT_FOUND` với thông báo an toàn.
- Kiểm tra sâu: DOCX và XLSX mở được dưới dạng ZIP OOXML và chứa nội dung mẫu; Images → PDF 2 trang; Merge PDF 3 trang; Split PDF đúng trang 2; OCR PDF 1 trang và trích xuất được `OFFICEBOX OCR SAMPLE 12345`; các PDF còn lại có page count đúng.
- Cảnh báo không ảnh hưởng kết quả: khi stream tar output từ macOS vào tmpfs container, tar báo extended attribute/utime không được phép nhưng các file đã giải nén đủ và bước kiểm tra sau đó PASS.
- FAIL khi tạo fixture OCR tiếng Việt: backend image không có font `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`; không tạo được PNG, các lệnh tar/API phụ thuộc cũng thất bại. Đây là lỗi fixture kiểm thử, không phải lỗi engine; Tesseract `vie` đã được xác nhận cài đặt.
- File workspace không thay đổi. Bước tiếp theo: tìm font Unicode sẵn có trong container hoặc dùng font hệ thống host để tạo fixture, rồi chạy lại OCR Việt.

### Checkpoint OCR tiếng Việt và scan bảo mật — RUNNING

- Thời điểm: 2026-09-16T08:43:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Đã tạo lại fixture bằng font Unicode hệ thống chỉ dùng tạm; Image → Text với `vie+eng` COMPLETED và nhận chính xác `VĂN BẢN TIẾNG VIỆT 2026`. Cùng với fixture tiếng Anh trước đó, yêu cầu OCR hai ngôn ngữ đã có bằng chứng local.
- `npm audit --omit=dev --json`: PASS, 0 finding ở mọi mức cho production dependency frontend tại thời điểm chạy.
- Sắp chạy Docker Scout CVE mức high/critical cho ba image runtime. Kết quả chưa biết; không gọi đây là security audit độc lập.

### Checkpoint Docker Scout vòng 1 và hướng khắc phục — FAIL/RUNNING

- Thời điểm: 2026-09-16T08:47:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Docker Scout high/critical: frontend 12 critical/39 high; backend 7 critical/79 high; Stirling chính thức 1 critical/65 high. Phần lớn frontend/backend đến từ base OS đã cũ; Stirling còn cả OS và dependency Java/Python của upstream. Vì còn finding, không tuyên bố image sạch hoặc sẵn sàng NAS.
- Đã đổi build base chính thức: Python `3.13.15-slim-trixie`, Node `22.23.2-alpine3.24`, Nginx `1.31.6-alpine3.24`; thêm OS package upgrade trong runtime images.
- Đã thêm image dẫn xuất `officebox-stirling:2.14.3-hardened` chỉ `FROM` image Stirling chính thức đã pin digest rồi cập nhật OS package; không sửa/copy mã nguồn Stirling. Dependency ứng dụng trong JAR vẫn phải chờ upstream cập nhật nếu scan còn finding.
- File thay đổi: `apps/backend/Dockerfile`, `apps/frontend/Dockerfile`, `services/stirling/Dockerfile`, `docker-compose.yml`, tài liệu checkpoint.
- Bước tiếp theo: `docker compose build --pull` và start lại, xác minh 9 tool, quét lại cả ba image; ghi rõ finding còn lại và mức phơi nhiễm nội bộ.

### Checkpoint rebuild hardening — RUNNING

- Thời điểm: 2026-09-16T08:48:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Lệnh sắp chạy: `docker compose build --pull` rồi `docker compose up -d`. Kết quả chưa biết; không ghi PASS.
- Bước tiếp theo sau build: xử lý lỗi package/runtime nếu có, sau đó health và scan vòng 2.

### Checkpoint rebuild hardening vòng 1 — FAIL

- Thời điểm: 2026-09-16T08:49:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- `docker compose build --pull`: FAIL trước khi build vì tag chính thức `nginx:1.31.6-alpine3.24` tồn tại trên Docker Hub nhưng manifest không có platform `linux/arm64` của máy local. Các target khác bị hủy theo BuildKit; runtime đang chạy không bị thay.
- Không hạ kiến trúc hoặc dùng image không chính thức. Bước tiếp theo: đọc manifest các tag Nginx chính thức mới, chọn tag exact có arm64 rồi build lại.

### Checkpoint chọn lại Nginx đa kiến trúc

- Thời điểm: 2026-09-16T08:51:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- `docker manifest inspect` xác nhận `nginx:1.29.5-alpine3.23` có manifest `linux/arm64` cùng các kiến trúc chính. Python `3.13.15-slim-trixie` và Node `22.23.2-alpine3.24` cũng resolve được từ registry chính thức.
- Đã thay Nginx bằng tag exact đa kiến trúc này. Bước tiếp theo: chạy lại build hardening với `--pull`.

### Checkpoint rebuild hardening vòng 2 — FAIL có giới hạn upstream

- Thời điểm: 2026-09-16T08:52:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Nginx/Python/Node mới đã resolve và bắt đầu build, nhưng target Stirling dẫn xuất FAIL khi `apt-get upgrade`: image chính thức đã thu gọn metadata dpkg/perl, khiến pre-install script libc không chạy được. BuildKit hủy các target song song; runtime cũ vẫn hoạt động.
- Đã bỏ lớp image dẫn xuất để không tạo một Stirling sửa dở hoặc không tái lập được; Compose quay lại image chính thức v2.14.3-fat pin digest. Finding dependency của Stirling được giữ thành hạn chế upstream cần theo dõi, giảm phơi nhiễm bằng network nội bộ, không publish cổng, timeout/queue/read-only/no-new-privileges.
- File thay đổi: hoàn nguyên phần build Stirling trong `docker-compose.yml`, xóa `services/stirling/Dockerfile`. Bước tiếp theo: build riêng backend/frontend đã nâng base, start và scan lại; Stirling giữ kết quả scan vòng 1.

### Checkpoint rebuild backend sau sửa XLSX — RUNNING

- Thời điểm: 2026-09-16T08:39:00+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Lệnh sắp chạy: `docker compose up -d --build backend`. Kết quả chưa biết; frontend và Stirling đang healthy.
- Sau khi lệnh trả về: xác minh backend health, thử PDF không có bảng phải trả job FAILED với `TABLE_NOT_FOUND`, rồi kiểm tra sâu output đã tải.

### Checkpoint rebuild backend/frontend hardening — PASS

- Thời điểm: 2026-09-16T08:43:33+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- #1 [internal] load local bake definitions
#1 reading from stdin 1.04kB done
#1 DONE 0.0s

#2 [backend internal] load build definition from Dockerfile
#2 DONE 0.0s

#2 [backend internal] load build definition from Dockerfile
#2 transferring dockerfile: 1.20kB done
#2 DONE 0.0s

#3 [frontend internal] load build definition from Dockerfile
#3 transferring dockerfile: 635B done
#3 DONE 0.0s

#4 [frontend internal] load metadata for docker.io/library/node:22.23.2-alpine3.24
#4 DONE 0.9s

#5 [backend internal] load metadata for docker.io/library/python:3.13.15-slim-trixie
#5 DONE 0.9s

#6 [backend internal] load .dockerignore
#6 transferring context: 83B done
#6 DONE 0.0s

#7 [frontend internal] load metadata for docker.io/library/nginx:1.29.5-alpine3.23
#7 DONE 0.9s

#8 [backend internal] load build context
#8 transferring context: 4.43kB done
#8 DONE 0.0s

#9 [frontend internal] load .dockerignore
#9 transferring context: 74B done
#9 DONE 0.0s

#10 [backend 1/5] FROM docker.io/library/python:3.13.15-slim-trixie@sha256:9d2e5553305c7c7b0097999bb17187c69b921ccd6bc9d40e4bb5ebe652c00285
#10 resolve docker.io/library/python:3.13.15-slim-trixie@sha256:9d2e5553305c7c7b0097999bb17187c69b921ccd6bc9d40e4bb5ebe652c00285 0.0s done
#10 DONE 0.0s

#11 [backend 2/5] WORKDIR /app
#11 CACHED

#12 [backend 3/5] COPY requirements.txt ./requirements.txt
#12 CACHED

#13 [backend 4/5] RUN apt-get update     && apt-get upgrade --yes     && apt-get install --yes --no-install-recommends         ghostscript         pngquant         qpdf         tesseract-ocr         tesseract-ocr-eng         tesseract-ocr-vie         unpaper     && pip install --requirement requirements.txt     && apt-get clean     && rm -rf /var/lib/apt/lists/*     && addgroup --system --gid 10001 officebox     && adduser --system --uid 10001 --ingroup officebox --home /nonexistent --no-create-home officebox
#13 CACHED

#14 [backend 5/5] COPY --chown=officebox:officebox app ./app
#14 CACHED

#15 [frontend build 1/6] FROM docker.io/library/node:22.23.2-alpine3.24@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32
#15 resolve docker.io/library/node:22.23.2-alpine3.24@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 0.0s done
#15 DONE 0.0s

#16 [frontend stage-1 1/4] FROM docker.io/library/nginx:1.29.5-alpine3.23@sha256:1eff5a5f3fcf8431a0abb7eddf5471fec24e5e1905a2581aeacdb07a4479b92b
#16 resolve docker.io/library/nginx:1.29.5-alpine3.23@sha256:1eff5a5f3fcf8431a0abb7eddf5471fec24e5e1905a2581aeacdb07a4479b92b 0.0s done
#16 DONE 0.0s

#17 [frontend internal] load build context
#17 transferring context: 1.78kB done
#17 DONE 0.0s

#18 [frontend build 5/6] COPY . .
#18 CACHED

#19 [frontend build 4/6] RUN npm ci --ignore-scripts
#19 CACHED

#20 [frontend build 2/6] WORKDIR /app
#20 CACHED

#21 [frontend stage-1 2/4] COPY nginx.conf /etc/nginx/nginx.conf
#21 CACHED

#22 [frontend stage-1 3/4] COPY --from=build /app/dist /usr/share/nginx/html
#22 CACHED

#23 [frontend build 3/6] COPY package.json package-lock.json ./
#23 CACHED

#24 [frontend build 6/6] RUN npm run build
#24 CACHED

#25 [frontend stage-1 4/4] RUN apk upgrade --no-cache     && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run
#25 CACHED

#26 [frontend] exporting to image
#26 exporting layers done
#26 exporting manifest sha256:063aa2042b9bb6032be1b6268e228a02e567e6685b201c5ee47ffc201e224e69 done
#26 exporting config sha256:d9e9d3853c4588adeaac8314b23a3ee8b22a7ec670d530cfea8ed1ab36c77105 done
#26 exporting attestation manifest sha256:64f070df61e25c31256585d648b1dcb0819712a1c085d966e44c3690ff9868a6
#26 exporting attestation manifest sha256:64f070df61e25c31256585d648b1dcb0819712a1c085d966e44c3690ff9868a6 0.0s done
#26 exporting manifest list sha256:d1625602f2a1433f3788cf959d54d6a824e06d47ec7ce55b6ae80d96205cf744 done
#26 naming to docker.io/library/officebox-frontend:latest done
#26 unpacking to docker.io/library/officebox-frontend:latest done
#26 DONE 0.1s

#27 [backend] exporting to image
#27 exporting layers done
#27 exporting manifest sha256:d3bc052251afdcd632dc3ec5d9ce50e613cedb3a6d18ac05b80fabbdfd871220 done
#27 exporting config sha256:2e2ca96b755a8f195b549411d13550d30957880dcc760e275e1d219d5aad78aa done
#27 exporting attestation manifest sha256:026c26941d896886e03dec31830803729904974a02097b0efc55e8331b8efb37 0.0s done
#27 exporting manifest list sha256:fc77fcc64f1a869e22acacec755dfe12dd60884d6ad589c8236ba8dd715f7393 0.0s done
#27 naming to docker.io/library/officebox-backend:latest done
#27 unpacking to docker.io/library/officebox-backend:latest done
#27 DONE 0.1s

#28 [backend] resolving provenance for metadata file
#28 DONE 0.0s

#29 [frontend] resolving provenance for metadata file
#29 DONE 0.0s: PASS, exit code 0. Backend dùng Python 3.13.15 slim-trixie; frontend build dùng Node 22.23.2 Alpine 3.24 và runtime Nginx 1.29.5 Alpine 3.23. Hai image đều cập nhật gói hệ điều hành trong bước build.
- Image local mới:  manifest list ;  manifest list .
- Stirling giữ nguyên image chính thức v2.14.3-fat pin digest do giới hạn image upstream đã ghi ở checkpoint trước.
- File nguồn không đổi trong bước. Bước tiếp theo: recreate backend/frontend, chờ health rồi chạy smoke đại diện và scan CVE vòng 2.


### Đính chính checkpoint rebuild hardening

- Thời điểm: 2026-09-16T08:43:45+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Bản ghi ngay trước bị chèn log build do ký hiệu Markdown được shell diễn giải khi ghi file. Lệnh build cache đã vô tình chạy lại và PASS; không thay đổi mã nguồn.
- Kết quả đúng: `docker compose build --pull backend frontend` PASS. Image hiện tại: backend manifest list `sha256:fc77fcc64f1a869e22acacec755dfe12dd60884d6ad589c8236ba8dd715f7393`; frontend manifest list `sha256:73583f6e1aece25e4116ddffa2309726627...`.
- Bước tiếp theo: recreate runtime, xác minh health/conversion và scan CVE vòng 2.


### Checkpoint runtime hardening — PASS

- Thời điểm: 2026-09-16T08:44:07+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- `docker compose up -d`: PASS. Backend, frontend và Stirling đều healthy; chỉ frontend publish `127.0.0.1:1280`.
- Health API: PASS, database/storage/PyMuPDF/Tesseract/OCRmyPDF/Stirling đều healthy. Danh mục API tiếp tục trả đủ chín công cụ khả dụng.
- Runtime mới quan sát: Python 3.13.15, PyMuPDF 1.28.2, httpx 0.28.1, OCRmyPDF 17.11.0, Tesseract 5.5.0 với `eng`, `osd`, `vie`.
- Fixture tổng hợp ở `/tmp/officebox-smoke` còn đủ; không có tài liệu người dùng. Bước tiếp theo: chạy lại các conversion đại diện trên runtime mới, sau đó scan CVE vòng 2.


### Checkpoint smoke runtime mới — RUNNING

- Thời điểm: 2026-09-16T08:44:22+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Sắp chạy lại ba đường xử lý đại diện trên fixture tổng hợp: PDF → Image qua PyMuPDF, Image → Text tiếng Việt qua Tesseract và PDF → Word qua Stirling.
- Kiểm tra sẽ tạo job, poll trạng thái, tải output và xác minh magic/nội dung cơ bản. Kết quả chưa biết; không ghi PASS.


### Checkpoint smoke runtime mới vòng 1 — PARTIAL/FAIL

- Thời điểm: 2026-09-16T08:45:36+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- PDF → Image: PASS, job `50860d5b-e8e6-4174-9dd6-1876cab24bfd` COMPLETED và tải ZIP thành công.
- Image → Text: request FAIL HTTP 422 vì script gửi tùy chọn `languages` dạng mảng, trong khi contract dùng `language` dạng chuỗi (`vie+eng`, `vie`, `eng`). Đây là lỗi script kiểm tra; job OCR chưa được tạo. PDF → Word chưa chạy vì script dừng ở lỗi trên.
- File workspace không thay đổi. Bước tiếp theo: sửa script fixture thành `{"language":"vie+eng","page_segmentation":3}`, chạy lại OCR và Word rồi xác minh output.


### Checkpoint smoke runtime mới vòng 2 — PASS

- Thời điểm: 2026-09-16T08:45:59+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Sau khi sửa đúng contract của script kiểm tra, cả ba luồng đại diện đều COMPLETED: PDF → Image job `5100bee7-d615-4e89-8ec3-f1afdd80a1c7`, Image → Text job `b86b6a69-2ef8-4b9a-a114-42d5aca476e9`, PDF → Word job `fcb41b82-daa5-4d72-a3fd-3c2f6084cf1a`.
- Xác minh output: ZIP chứa đúng hai ảnh; TXT khớp `VĂN BẢN TIẾNG VIỆT 2026`; DOCX là OOXML ZIP hợp lệ có `[Content_Types].xml`.
- Kết hợp với vòng full-suite trước khi nâng base, chín công cụ có bằng chứng local valid-path. Bước tiếp theo: Docker Scout vòng 2 cho backend/frontend, phân loại finding còn lại và đồng bộ tài liệu.


### Checkpoint Docker Scout vòng 2 — RUNNING

- Thời điểm: 2026-09-16T08:46:06+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Lệnh: `docker scout cves --only-severity critical,high` cho `local://officebox-backend:latest` và `local://officebox-frontend:latest`; báo cáo ghi ngoài workspace tại `/tmp/officebox-*.scan.txt`.
- Kết quả chưa biết; không ghi PASS. Stirling không scan lại vì image/digest không đổi so với vòng 1.


### Checkpoint Docker Scout vòng 2 — FAIL/IMPROVED

- Thời điểm: 2026-09-16T08:47:10+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Backend mới: 0 critical/9 high, giảm từ 7 critical/79 high. Frontend mới: 0 critical/1 high, giảm từ 12 critical/39 high. Vì vẫn có high finding, kết quả bảo mật không phải PASS.
- Frontend còn `libxml2` CVE-2026-86140 chưa có bản vá Alpine. Backend còn năm finding OS chưa có bản vá (`cjson`, `libxml2`, `zlib`) và bốn finding Python có bản vá: `msgpack` cần 1.2.1, `setuptools` cần >=78.1.1.
- Báo cáo đầy đủ ở `/tmp/officebox-backend.scan.txt` và `/tmp/officebox-frontend.scan.txt`, không chứa tài liệu người dùng. Stirling giữ kết quả vòng 1 là 1 critical/65 high do image không đổi.
- Bước tiếp theo: pin `msgpack==1.2.1` và `setuptools==80.10.2`, rebuild backend, smoke lại rồi scan vòng 3.


### Checkpoint rebuild backend dependency vá lỗi — RUNNING

- Thời điểm: 2026-09-16T08:47:16+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: RUNNING.
- Đã pin `msgpack==1.2.1` và `setuptools==80.10.2` trong `apps/backend/requirements.txt` theo fixed version của báo cáo Scout.
- Lệnh sắp chạy: `docker compose build backend`, rồi recreate backend. Kết quả chưa biết; không ghi PASS.


### Checkpoint backend dependency vá lỗi — PASS/RUNNING

- Thời điểm: 2026-09-16T08:48:46+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Build backend và recreate container: PASS. Health toàn hệ thống PASS; runtime xác nhận `msgpack 1.2.1`, `setuptools 80.10.2`. Ba container healthy và chỉ frontend publish cổng 1280.
- Sắp chạy lại smoke đại diện và Docker Scout backend vòng 3; kết quả chưa biết.


### Checkpoint Docker Scout vòng 3 — cảnh báo provenance

- Thời điểm: 2026-09-16T08:50:36+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IN_PROGRESS.
- Smoke sau pin dependency: PASS cho PDF → Image, OCR tiếng Việt và PDF → Word.
- Scout vẫn báo 0 critical/9 high vì SBOM liệt kê đồng thời `msgpack 1.1.2`/`1.2.1` và `setuptools 70.3.0`/`80.10.2`. Kiểm tra filesystem/runtime chỉ thấy dist-info và import của phiên bản đã vá 1.2.1/80.10.2; bản cũ xuất hiện từ provenance/layer base.
- Chưa loại finding khỏi báo cáo; bước tiếp theo: scan base trực tiếp và scan `--ignore-base` để xác định nguồn, sau đó giữ cách diễn giải thận trọng trong SECURITY/STATUS.


### Checkpoint đồng bộ tài liệu dự án

- Thời điểm: 2026-09-16T08:54:24+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IMPLEMENTED_UNVERIFIED.
- Đã cập nhật trạng thái thực tế cho README, PLAN, FRONTEND_BACKEND_PLAN, ARCHITECTURE, UPSTREAM, SECURITY, TESTING, RUNBOOK, THIRD_PARTY_NOTICES, DECISIONS và STATUS.
- Tài liệu ghi đủ chín tool, bằng chứng valid-path local, runtime/pin hiện tại, lỗi đã gặp và finding bảo mật còn mở; không tuyên bố NAS/public ready.
- File code thay đổi trong pha hardening: `apps/backend/requirements.txt`, `apps/backend/Dockerfile`, `apps/frontend/Dockerfile`, `docker-compose.yml`, `apps/backend/app/adapters/stirling/client.py` cùng phần triển khai tool/frontend đã ghi ở checkpoint trước.
- Bước tiếp theo: kiểm tra tính nhất quán tài liệu/Compose, health cuối và ghi checkpoint kết phiên.


### Checkpoint kết phiên — local tools hoàn tất ở mức IMPLEMENTED_UNVERIFIED

- Thời điểm: 2026-09-16T08:54:57+07:00. Mã việc: M2-M4-TOOLS. Trạng thái: IMPLEMENTED_UNVERIFIED.
- Kiểm tra cuối: `docker compose config -q` PASS; Python compile PASS; frontend production build PASS; health HTTP 200; registry trả đúng chín tool; frontend HTTP 200 với security headers.
- `docker compose ps`: backend, frontend, Stirling healthy; chỉ frontend publish `127.0.0.1:1280`. Log cuối không có traceback/fatal/panic; chuỗi `ExitOnOutOfMemoryError` là JVM option của Stirling, không phải sự cố runtime.
- Scan phân loại cuối: backend toàn image 0C/9H, ngoài base 0C/5H chưa có fixed version; frontend 0C/1H chưa có fixed version; Stirling official giữ 1C/65H. Runtime dependency có bản vá đã pin và xác nhận.
- Tất cả tài liệu bàn giao đã đồng bộ. Không có build/scan process còn chạy. Bước tiếp theo cụ thể: browser smoke chín tool, hoàn tất negative/resource/restart-cleanup matrix, rồi xử lý/chấp nhận finding trước M1-NAS.


### UI-RESULT-PREVIEW — bắt đầu

- Thời điểm: 2026-09-16T09:04:10+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IN_PROGRESS.
- Mục tiêu: sau khi job COMPLETED, hiển thị preview an toàn trong trang chi tiết cho PDF, ảnh và TXT; ZIP/DOCX/XLSX giữ download và thông báo không hỗ trợ xem trực tiếp.
- Bước sắp làm: đọc schema/result/download và trang chi tiết hiện tại, chốt hợp đồng preview tối thiểu rồi triển khai. Kiểm tra: NOT_RUN.


### UI-RESULT-PREVIEW — triển khai endpoint và giao diện

- Thời điểm: 2026-09-16T09:05:10+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IN_PROGRESS.
- Backend thêm `GET /api/v1/jobs/{id}/preview`, tái sử dụng expiry/download lock và chỉ allowlist PDF, PNG, JPEG, WEBP, TXT; response inline, no-store, nosniff, SAMEORIGIN.
- Frontend thêm `ResultPreview`: ảnh hiển thị co giãn, PDF/TXT trong iframe, link mở toàn màn hình; ZIP/DOCX/XLSX hiện thông báo và giữ nút download.
- File thay đổi: `jobs/service.py`, `api/routes/jobs.py`, `api/client.ts`, `JobDetailPage.tsx`, `ResultPreview.tsx`, `styles/index.css`.
- Kiểm tra: NOT_RUN. Bước tiếp theo: compile/build, rebuild container, kiểm tra preview supported/unsupported và header bảo mật.

### UI-RESULT-PREVIEW — build/recreate RUNNING

- Thời điểm: 2026-09-16T09:05:10+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: RUNNING.
- Sắp chạy Python compile, TypeScript production build và `docker compose up -d --build backend frontend`. Chưa có kết quả, không ghi PASS.


### UI-RESULT-PREVIEW — build/recreate PASS

- Thời điểm: 2026-09-16T09:05:42+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IN_PROGRESS.
- `python3 -m compileall -q apps/backend/app`: PASS. `npm run build`: PASS, 1.895 module transformed. `docker compose up -d --build backend frontend`: PASS; backend/frontend recreated và healthy.
- Bước tiếp theo: chọn job COMPLETED hiện có để kiểm tra PDF/TXT supported, DOCX/ZIP unsupported, header inline/no-store/nosniff/SAMEORIGIN và trang chi tiết dùng bundle mới.


### UI-RESULT-PREVIEW — lỗi MIME TXT và hướng sửa

- Thời điểm: 2026-09-16T09:05:59+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IN_PROGRESS.
- Kiểm tra metadata phát hiện output TXT dùng `text/plain; charset=utf-8`; so sánh MIME tuyệt đối khiến preview bị đánh dấu unsupported và backend trả 415.
- Đã sửa cả backend/frontend để chuẩn hóa phần trước dấu `;` thành lowercase trước khi so allowlist. Bước tiếp theo: rebuild và chạy lại kiểm tra endpoint.


### UI-RESULT-PREVIEW — kiểm tra vòng 1 PARTIAL/FAIL

- Thời điểm: 2026-09-16T09:06:45+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IN_PROGRESS.
- TXT preview HTTP 200, nội dung đúng; PDF preview HTTP 200, magic `%PDF-` đúng; response backend có inline/no-store/nosniff/SAMEORIGIN.
- FAIL hiển thị iframe: Nginx chèn thêm `X-Frame-Options: DENY` và CSP `frame-ancestors 'none'` lên response `/api`, sẽ chặn preview cùng origin.
- Kiểm tra DOCX dùng job cũ đã bị cleanup nên trả 404, chưa kiểm chứng 415. Script tạo job ảnh rồi dừng vì dùng tên biến `status` là biến read-only của zsh; đây là lỗi script kiểm tra, không phải ứng dụng.
- Bước tiếp theo: điều chỉnh Nginx cho preview same-origin an toàn, rebuild frontend, tìm/xác minh job ảnh vừa tạo và tạo job unsupported mới nếu cần.


### UI-RESULT-PREVIEW — Nginx same-origin fix RUNNING

- Thời điểm: 2026-09-16T09:07:15+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: RUNNING.
- Đã thêm location riêng cho `/api/v1/jobs/{uuid}/preview`: ẩn header frame cũ, trả SAMEORIGIN và CSP `frame-ancestors 'self'`; các route/trang khác tiếp tục DENY.
- Sắp rebuild/recreate frontend và kiểm tra lại header. Kết quả chưa biết.


### UI-RESULT-PREVIEW — kiểm tra vòng 2 PARTIAL

- Thời điểm: 2026-09-16T09:08:04+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IN_PROGRESS.
- PDF, PNG và TXT endpoint đều HTTP 200, `Content-Disposition: inline`, `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'`, no-store; không còn header DENY từ Nginx. Magic PDF/PNG đúng.
- Assertion nội dung TXT FAIL vì chọn job OCR QR có text khác fixture kỳ vọng. Job DOCX cũ trả 404 khi gọi preview dù còn xuất hiện trong snapshot list; cần đối chiếu trạng thái hiện tại/tạo job mới.
- Một lệnh đối chiếu phụ ban đầu cũng FAIL do cú pháp `echo` bị zsh diễn giải; đã chạy lại bằng `printf`.
- Bước tiếp theo: dùng đúng job TXT tiếng Việt, tạo DOCX mới và xác minh 415 `PREVIEW_UNSUPPORTED`; sau đó kiểm tra bundle/trang job.


### UI-RESULT-PREVIEW — kết phiên

- Thời điểm: 2026-09-16T09:08:52+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IMPLEMENTED_UNVERIFIED.
- PASS: Python compile, TypeScript production build, Docker rebuild/recreate, health. Preview PDF/PNG/TXT HTTP 200 với nội dung/magic đúng và header inline/no-store/nosniff/SAMEORIGIN/CSP same-origin.
- PASS: DOCX mới job `05ec472c-fce2-4522-b8c6-ab7ec43fb2f0` trả HTTP 415 `PREVIEW_UNSUPPORTED`; production bundle chứa đủ nhãn preview, mở toàn màn hình và fallback.
- Lỗi đã xử lý: MIME TXT có charset; Nginx chèn DENY/CSP; script zsh dùng biến read-only; chọn nhầm fixture TXT/job DOCX đã cleanup. Không xóa dấu vết các lần FAIL trước.
- Tài liệu đã đồng bộ: README, PLAN, FRONTEND_BACKEND_PLAN, ARCHITECTURE, SECURITY, TESTING, STATUS.
- Chưa xác minh trực quan bằng browser automation vì quyền Computer Use trên máy chưa được cấp; chức năng để `IMPLEMENTED_UNVERIFIED` đến khi chủ dự án xem UI. Runtime tiếp tục phục vụ ở `http://localhost:1280`.


### Đính chính kiểm tra cuối preview

- Thời điểm: 2026-09-16T09:09:06+07:00. Mã việc: UI-RESULT-PREVIEW. Trạng thái: IMPLEMENTED_UNVERIFIED.
- Lệnh cuối dùng `curl -I` gửi HEAD tới endpoint chỉ khai báo GET nên trả 405; đây là sai phương thức của lệnh kiểm tra, không phải lỗi preview. Các GET PDF/PNG/TXT ngay trước đó đều PASS.
- Đã kiểm tra lại bằng GET bên dưới; bước tiếp theo vẫn là chủ dự án xem trực quan trang chi tiết job.


### UI-OCR-PASTE-INLINE — bắt đầu

- Thời điểm: 2026-09-16T09:11:50+07:00. Mã việc: UI-OCR-PASTE-INLINE. Trạng thái: IN_PROGRESS.
- Mục tiêu: riêng Ảnh → Văn bản nhận ảnh clipboard bằng Ctrl/⌘+V thay cho upload, và hiển thị text OCR trực tiếp trong UI sau COMPLETED; download TXT vẫn là tùy chọn phụ.
- Bước sắp làm: rà state/form dropzone, điều hướng sau submit và component preview TXT hiện tại. Kiểm tra: NOT_RUN.


### UI-OCR-PASTE-INLINE — triển khai

- Thời điểm: 2026-09-16T09:12:59+07:00. Mã việc: UI-OCR-PASTE-INLINE. Trạng thái: IN_PROGRESS.
- `MultiFileDropzone` nhận paste toàn trang khi tool bật capability, bỏ qua control editable, chỉ nhận PNG/JPEG/WEBP/TIFF, tạo filename an toàn nếu clipboard thiếu tên và dùng chung validation size/extension/file-count.
- ToolPage chỉ bật capability cho `image-to-text`; UI hiển thị phím Ctrl+V/⌘V và trạng thái dán thành công.
- TXT result được fetch từ preview endpoint rồi render bằng `<pre>` để chọn/copy; có nút Sao chép và fallback copy cục bộ. Download TXT vẫn giữ nguyên.
- File thay đổi: `MultiFileDropzone.tsx`, `ToolPage.tsx`, `ResultPreview.tsx`, `styles/index.css`. Kiểm tra: NOT_RUN.

### UI-OCR-PASTE-INLINE — build/recreate RUNNING

- Thời điểm: 2026-09-16T09:12:59+07:00. Mã việc: UI-OCR-PASTE-INLINE. Trạng thái: RUNNING.
- Sắp chạy TypeScript production build và rebuild/recreate frontend. Chưa có kết quả.


### UI-OCR-PASTE-INLINE — kết phiên

- Thời điểm: 2026-09-16T09:13:53+07:00. Mã việc: UI-OCR-PASTE-INLINE. Trạng thái: IMPLEMENTED_UNVERIFIED.
- PASS: TypeScript production build (1.895 module), Docker rebuild/recreate, health toàn hệ thống. Production bundle chứa hướng dẫn Ctrl/⌘+V, trạng thái paste, OCR inline, copy và empty text state.
- PASS: TXT preview endpoint trả đúng `VĂN BẢN TIẾNG VIỆT 2026`; text được render thuần trong `<pre>`, không cần download để đọc. Download TXT vẫn giữ.
- Paste chỉ bật cho Image → Text, nhận PNG/JPEG/WEBP/TIFF từ user paste event, bỏ qua editable controls và dùng chung validation hiện có.
- File thay đổi: `MultiFileDropzone.tsx`, `ToolPage.tsx`, `ResultPreview.tsx`, `styles/index.css`, README và tài liệu kế hoạch/bảo mật/kiểm thử/trạng thái.
- Chưa xác minh thao tác clipboard/copy trực quan do Computer Use chưa có quyền; giữ IMPLEMENTED_UNVERIFIED đến browser smoke của chủ dự án. Runtime healthy tại `http://localhost:1280`.


### RELEASE-GITHUB — bắt đầu

- Thời điểm: 2026-09-16T09:17:20+07:00. Mã việc: RELEASE-GITHUB. Trạng thái: IN_PROGRESS.
- Mục tiêu: đưa workspace OfficeBox hiện tại lên repository `https://github.com/mson-ssh/office-toolbox.git` để chủ dự án triển khai Synology NAS.
- Bước sắp làm: kiểm tra trạng thái Git/remote, `.gitignore`, file nhạy cảm/runtime và lịch sử remote trước khi tạo commit/push. Kiểm tra push: NOT_RUN.


### RELEASE-GITHUB — repository và kiểm tra ignore PARTIAL/FAIL

- Thời điểm: 2026-09-16T09:17:53+07:00. Mã việc: RELEASE-GITHUB. Trạng thái: IN_PROGRESS.
- Remote `git ls-remote` không trả ref: repository đích hiện trống. Đã `git init -b main` và thêm origin đúng URL. `git add --dry-run .` liệt kê 87 file mã nguồn/tài liệu; không thấy `.env`, DB, job output, node_modules hoặc dist.
- FAIL ở bước `git check-ignore`: vòng lặp dùng biến `path`, là biến đặc biệt của zsh, làm lệnh `git`/`sed` phía sau không còn trong PATH. Không có file nào được stage/commit/push bởi lỗi này.
- Bước tiếp theo: chạy lại ignore/remotes/env bằng biến không đặc biệt, quét tên/nội dung nhạy cảm đã lọc rồi mới stage.


### RELEASE-GITHUB — stage và secret scan PARTIAL

- Thời điểm: 2026-09-16T09:18:26+07:00. Mã việc: RELEASE-GITHUB. Trạng thái: IN_PROGRESS.
- `git add .`: 87 file staged, 11.633 dòng mới. Secret scan theo pattern private key/token/API key/assigned secret: PASS; `.env`, SQLite/WAL, job files, node_modules và dist đã xác nhận ignored.
- `git diff --cached --check`: FAIL do trailing whitespace ở CSS/SESSION_LOG và một số file có thêm blank line ở EOF; chưa commit/push.
- Bước tiếp theo: chỉ chuẩn hóa whitespace các file được báo, stage lại và yêu cầu diff check PASS.
