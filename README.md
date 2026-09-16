# OfficeBox — Private Office Tools

**Trạng thái hiện tại (2026-09-16):** OfficeBox đang chạy local tại `http://localhost:1280` với đủ chín công cụ: PDF → Image/Word/Excel, Image → Text, OCR PDF, Images → PDF, Merge/Split/Compress PDF. Build, health và valid-path API conversion bằng fixture tổng hợp đã PASS. Nghiệm thu trình duyệt, ma trận lỗi/tài nguyên và NAS vẫn chưa hoàn tất; image Stirling chính thức còn finding bảo mật nên chưa tuyên bố sẵn sàng NAS/public.

Trang chi tiết công việc hiển thị preview kết quả PDF, PNG/JPEG/WEBP và TXT ngay sau khi xử lý xong. ZIP, DOCX và XLSX hiện thông báo không hỗ trợ xem trực tiếp và vẫn cho tải xuống.

Riêng công cụ Ảnh → Văn bản cho phép dán ảnh trực tiếp bằng `Ctrl+V` hoặc `⌘V`. Nội dung OCR được hiển thị dạng văn bản có thể chọn và sao chép ngay trong giao diện; tải TXT là tùy chọn.

**Chốt triển khai:** chạy và nghiệm thu local trước tại `http://localhost:1280`, sau đó mới đưa lên Synology NAS. Cổng host của ứng dụng là **1280**; backend và engine không mở cổng ra host trong Compose. Đây là cập nhật mới nhất, được ưu tiên nếu đặc tả gốc bên dưới chỉ nhắc NAS. Khi chạy local, tài liệu nằm trên máy local; khi chạy NAS, tài liệu nằm trên NAS, không gửi ra dịch vụ bên ngoài.

## Chạy local bằng Docker

Yêu cầu Docker Desktop hoặc Docker Engine có Compose.

```bash
cp .env.example .env
docker compose up -d --build
```

Mở `http://localhost:1280`. Health API đi qua cùng cổng tại `http://localhost:1280/api/v1/health`.

Nếu cổng 1280 đang được Vite hoặc ứng dụng khác sử dụng, dừng đúng tiến trình đó trước khi chạy Compose. Không đổi cổng mặc định. Dữ liệu runtime nằm trong `data/database` và `data/jobs`.

```bash
docker compose logs -f backend frontend
docker compose down
```

Trên Linux hoặc Synology, chỉnh `PUID` và `PGID` trong `.env` theo tài khoản sở hữu thư mục `data`. Không dùng quyền `777`.

## Bắt đầu và tiếp tục giữa các phiên

- [Hướng dẫn làm việc cho agent](AGENTS.md)
- [Trạng thái hiện tại và bước kế tiếp](docs/STATUS.md)
- [Kế hoạch triển khai chi tiết](docs/PLAN.md)
- [Kế hoạch frontend và backend](docs/FRONTEND_BACKEND_PLAN.md)
- [Kiến trúc và hợp đồng API dự kiến](docs/ARCHITECTURE.md)
- [Nguồn chính thức và sổ dependency](docs/UPSTREAM.md)
- [Yêu cầu bảo mật](docs/SECURITY.md)
- [Kế hoạch kiểm thử](docs/TESTING.md)
- [Phát triển và vận hành](docs/RUNBOOK.md)
- [Quyết định kiến trúc](docs/DECISIONS.md)
- [Nhật ký bàn giao](docs/SESSION_LOG.md)

Đọc `AGENTS.md` và `docs/STATUS.md` khi bắt đầu phiên mới. Các mục dưới đây là **đặc tả ban đầu**. Trạng thái thực tế của từng hạng mục nằm trong `docs/STATUS.md`, `docs/PLAN.md` và bằng chứng trong `docs/SESSION_LOG.md`.

**Quy tắc cho mọi AI:** làm đến đâu ghi đến đó. Cập nhật `docs/STATUS.md` và thêm checkpoint vào `docs/SESSION_LOG.md` ngay sau mỗi bước có kết quả, khi gặp lỗi và trước tác vụ dài; không đợi cuối phiên. Chi tiết và trạng thái công việc nằm trong [AGENTS.md](AGENTS.md).

---

# ROLE

You are the senior software architect and full-stack engineer responsible for building a production-quality self-hosted web application named **OfficeBox**.

OfficeBox is a private office document processing toolbox designed to run on a Synology NAS using Docker Compose.

The primary deployment target is a relatively resource-constrained Synology NAS, so the application must prioritize:

- low memory usage
- low idle CPU usage
- simple deployment
- modular architecture
- security
- local file processing
- reliable error handling
- easy future expansion

Do not build an unnecessarily complicated enterprise architecture.

Do not introduce Kubernetes, microservices orchestration, Redis, RabbitMQ, Celery, PostgreSQL, Elasticsearch or similar infrastructure unless a later requirement genuinely needs them.

For V1, keep the system simple.

---

# PROJECT NAME

OfficeBox

Tagline:

Private Office Tools

Main categories:

- PDF
- OCR
- Image
- Office documents

---

# PRIMARY GOAL

Build a self-hosted web application that lets office users process documents through a simple browser interface.

Typical workflow:

User uploads document

→ OfficeBox creates processing job

→ backend processes document locally

→ user downloads result

→ temporary files are automatically deleted after configured retention time.

The user's files must remain on the NAS.

OfficeBox must not upload documents to external online conversion services.

---

# TARGET ENVIRONMENT

Primary deployment:

Synology NAS

Container runtime:

Docker / Synology Container Manager

Deployment mechanism:

docker-compose.yml

Architecture:

Browser
→ Synology Reverse Proxy
→ OfficeBox Frontend
→ OfficeBox Backend
→ Internal processing services

All processing engines should remain inaccessible directly from the public network.

Only the OfficeBox frontend/backend should be exposed as necessary.

---

# TECH STACK

Frontend:

React
TypeScript
Vite
Tailwind CSS

Backend:

Python
FastAPI
Pydantic
SQLAlchemy

Database:

SQLite

Initial database path:

/data/database/officebox.db

Document processing technologies may include:

- Stirling PDF API
- PyMuPDF
- Pillow
- Tesseract OCR
- OCRmyPDF
- LibreOffice headless

Do not tightly couple the application to any single processing engine.

Use adapter/service abstractions.

---

# IMPORTANT DEVELOPMENT RULE

Do NOT attempt to implement the entire application in one giant pass.

Build the application incrementally.

Before each major implementation phase:

1. inspect the existing codebase
2. describe the changes needed
3. modify only the files required
4. avoid unnecessary refactoring
5. run or describe appropriate validation
6. document important architectural decisions

Never destroy working functionality just to restructure the project.

---

# INITIAL REPOSITORY STRUCTURE

Create a clean monorepo similar to:

officebox/

apps/
    frontend/
    backend/

services/
    pdf/
    ocr/
    office/

data/
    jobs/
    database/

docker/

docker-compose.yml

.env.example

.gitignore

README.md

The final implementation may adjust this structure when technically justified, but keep frontend, backend and processing responsibilities clearly separated.

---

# FRONTEND REQUIREMENTS

Create a clean modern office-oriented interface.

Do not imitate SmallPDF exactly.

The visual style should be:

- clean
- professional
- minimal
- easy for non-technical office workers
- responsive
- fast
- low visual clutter

Primary navigation:

Dashboard
Tools
Jobs
Settings

Dashboard should display tool cards.

Initial V1 tools:

1. PDF to Image
2. PDF to Word
3. PDF to Excel
4. Image to Text
5. OCR PDF
6. Images to PDF
7. Merge PDF
8. Split PDF
9. Compress PDF

Example layout:

OfficeBox

Private Office Tools

What do you want to do?

[ PDF → Word ]
[ PDF → Excel ]
[ PDF → Image ]

[ Image → Text ]
[ OCR PDF ]
[ Compress PDF ]

[ Merge PDF ]
[ Split PDF ]
[ Images → PDF ]

Recent Jobs

...

---

# TOOL UI DESIGN

Every processing tool should follow a consistent pattern.

Example:

PDF → Word

Large drag-and-drop area.

User can:

- drag files
- click to select files

Show:

filename
file size
file type

Optional settings should appear below.

Main action:

Convert to Word

After submitting:

display:

Queued
Processing
Completed
Failed

Where appropriate display progress.

When complete:

Download Result

Also allow:

Process Another File

---

# BACKEND ARCHITECTURE

FastAPI backend.

Suggested modules:

app/
    main.py

    api/
        routes/
        dependencies/

    core/
        config.py
        logging.py
        security.py

    db/
        models.py
        session.py

    jobs/
        models.py
        service.py
        worker.py
        cleanup.py

    tools/
        base.py

        pdf_to_image/
        pdf_to_word/
        pdf_to_excel/
        image_to_text/
        ocr_pdf/
        images_to_pdf/
        merge_pdf/
        split_pdf/
        compress_pdf/

    adapters/
        stirling/
        tesseract/
        ocrmypdf/
        libreoffice/

    storage/
        manager.py

Do not let API routes contain conversion implementation.

API route:

→ service

→ adapter

→ processing engine

---

# TOOL ABSTRACTION

Create a common tool abstraction.

Conceptually something similar to:

Tool

id
name
description
category
supported_input_types
output_type
processing_class

And:

process(job, options)

Every tool implementation must conform to a predictable interface.

The goal is to make adding new tools easy.

Adding a tool in the future should ideally require:

- implementing tool service
- adding adapter if necessary
- defining API route or generic route configuration
- registering tool
- adding frontend tool page

Avoid duplicating job-processing logic across tools.

---

# PROCESSING ENGINE ABSTRACTION

Do not make OfficeBox dependent on Stirling PDF.

For example:

PDFToWordService

should depend on an interface similar to:

PDFToWordAdapter

Possible implementation:

StirlingPDFAdapter

Future implementation could be:

AlternativePDFAdapter

without requiring frontend changes.

Use dependency injection or equivalent clean design where practical.

Do not over-engineer the implementation.

---

# JOB SYSTEM

Every file operation must create a job.

Job states:

QUEUED
PROCESSING
COMPLETED
FAILED
EXPIRED

Job model should contain at minimum:

id

tool_id

status

original_filename

created_at

started_at

finished_at

expires_at

error_message

progress

Store metadata only.

Do not store document binary content in SQLite.

---

# JOB STORAGE

Each job should have its own isolated folder.

Structure:

/data/jobs/{uuid}/

input/
work/
output/

Example:

/data/jobs/53f77bc2-.../

input/
    contract.pdf

work/

output/
    contract.docx

Do not use user supplied filenames as directory names.

Use cryptographically safe UUID job IDs.

Sanitize all filenames.

Prevent directory traversal attacks.

Never trust uploaded filenames.

---

# FILE RETENTION

Files must automatically expire.

Environment variable:

JOB_RETENTION_MINUTES=60

When a job expires:

input files should be removed

work files should be removed

output files should be removed

job status becomes:

EXPIRED

A cleanup worker should periodically detect expired jobs.

Example:

CLEANUP_INTERVAL_MINUTES=10

The cleanup worker must tolerate already deleted files.

Deletion must be safe and restricted to the configured OfficeBox data directory.

Never recursively delete arbitrary user-provided paths.

---

# QUEUE SYSTEM

The target NAS has limited CPU/RAM.

Do not process unlimited jobs concurrently.

Support at least two workload classes:

LIGHT
HEAVY

Example:

LIGHT:

merge PDF
split PDF
PDF to image

HEAVY:

OCR
PDF to Word
PDF to Excel
LibreOffice conversion

Environment variables:

MAX_LIGHT_JOBS=2

MAX_HEAVY_JOBS=1

Implement a simple in-process queue for V1.

The design should make it possible to migrate to an external queue later, but do not add Redis/Celery now.

Application restart recovery should not leave jobs permanently marked as PROCESSING.

On startup, stale PROCESSING jobs should be handled safely, for example marked FAILED with an appropriate restart reason.

---

# UPLOAD SECURITY

Implement strict upload validation.

Configuration:

MAX_UPLOAD_SIZE_MB

MAX_FILES_PER_JOB

Allowed MIME types must depend on the selected tool.

Do not trust file extensions only.

Validate MIME/file signatures where practical.

Reject unsupported file types.

Reject zero-byte files.

Generate server-side storage names.

Preserve the original filename only as metadata.

Prevent:

../

absolute paths

shell injection

command injection

malicious filename execution

Never build shell commands by concatenating untrusted filenames.

Use subprocess APIs with argument arrays.

---

# LOGGING

Use structured application logging.

Safe information to log:

job ID

tool

file size

processing duration

status

system error

Do NOT log:

document contents

OCR output

passwords

tokens

cookies

authorization headers

sensitive extracted document data

---

# API DESIGN

Create versioned endpoints.

Example:

/api/v1/

Suggested endpoints:

GET /api/v1/health

GET /api/v1/tools

POST /api/v1/jobs

GET /api/v1/jobs

GET /api/v1/jobs/{job_id}

DELETE /api/v1/jobs/{job_id}

GET /api/v1/jobs/{job_id}/download

Potential upload flow:

POST /api/v1/jobs

multipart/form-data

fields:

tool_id

files

options

Return:

job_id
status
created_at

The frontend then polls:

GET /api/v1/jobs/{job_id}

Keep the API simple and REST oriented.

Do not add WebSockets in V1 unless clearly necessary.

Polling every few seconds is acceptable.

---

# HEALTH CHECKS

Backend:

GET /api/v1/health

Should report application state.

Example:

status: healthy

database: healthy

storage: healthy

processing_services:
    stirling: healthy
    ocr: healthy
    libreoffice: healthy

Do not expose secrets or internal filesystem details.

Docker services should use healthchecks where practical.

---

# INITIAL TOOL IMPLEMENTATION

Implement these tools first.

## PDF TO IMAGE

Input:

PDF

Options:

format:
PNG
JPEG
WEBP

Optional:

DPI

Output:

If one page:
single image

If multiple pages:
ZIP archive containing images

Suggested libraries:

PyMuPDF
Pillow

---

## PDF TO WORD

Input:

PDF

Output:

DOCX

Prefer processing through an adapter.

Initial implementation may use Stirling PDF if available.

If conversion service is unavailable:

return clear error to user.

Do not silently fabricate an output file.

---

## PDF TO EXCEL

Input:

PDF

Output:

XLSX

Use adapter abstraction.

Recognize that table extraction quality varies by PDF.

Return proper processing errors.

---

## IMAGE TO TEXT

Input:

PNG
JPG
JPEG
WEBP
TIFF

OCR languages:

Vietnamese
English

Default:

vie+eng

Use Tesseract.

Return:

TXT file

Also display extracted text in frontend when practical.

---

## OCR PDF

Input:

PDF

Output:

Searchable PDF

Use OCRmyPDF.

Default language:

vie+eng

Options:

deskew
rotate pages where appropriate

Never overwrite the user's source file.

---

## IMAGES TO PDF

Input:

multiple supported images

Output:

PDF

Preserve user ordering.

Frontend must allow reordering before processing.

---

## MERGE PDF

Input:

multiple PDFs

Output:

one PDF

Frontend should allow drag-based ordering.

---

## SPLIT PDF

Input:

PDF

Support:

specific page ranges

Examples:

1-3

1,4,7

1-3,8-10

Validate page syntax carefully.

---

## COMPRESS PDF

Input:

PDF

Output:

compressed PDF

Provide levels:

Low
Balanced
Maximum

Avoid claiming exact reduction percentages.

---

# AUTOMATIC SCANNED PDF DETECTION

Design architecture for this but it does not need to be fully implemented in the first commit.

Future workflow:

PDF upload

→ inspect pages

→ detect whether useful text layer exists

If yes:

normal conversion

If no:

recommend OCR

Eventually allow:

OCR automatically before PDF to Word.

Do not implement AI for this.

Use deterministic PDF inspection.

---

# DATABASE

Use SQLite.

Store:

jobs

users if auth is enabled

application settings where necessary

Do not store uploaded file content in DB.

Use migrations if appropriate.

Keep the database simple.

---

# AUTHENTICATION

Architecture must allow authentication.

For V1 implement simple local authentication only if it does not significantly block the core processing workflow.

Never implement insecure plain-text passwords.

Use secure password hashing.

Session or token design should be simple and appropriate for a browser-based internal app.

Do not expose processing services directly.

---

# DOCKER

Create production-oriented Dockerfiles.

Expected services may include:

officebox-frontend

officebox-backend

stirling-pdf

Do not expose Stirling directly to the host unless required for debugging.

Use an internal Docker network.

Persist only necessary paths.

Example:

/data/database

/data/jobs

Make file permissions configurable if needed for Synology.

Support environment variables such as:

TZ=Asia/Bangkok

JOB_RETENTION_MINUTES=60

CLEANUP_INTERVAL_MINUTES=10

MAX_UPLOAD_SIZE_MB=100

MAX_FILES_PER_JOB=20

MAX_LIGHT_JOBS=2

MAX_HEAVY_JOBS=1

Create:

.env.example

Never commit real secrets.

---

# SYNOLOGY REQUIREMENTS

The project will run through Synology Container Manager.

Avoid dependencies on systemd.

Avoid privileged containers wherever possible.

Avoid mounting the Docker socket.

Do not require host networking.

All required state should be persisted through explicit Docker volumes/bind mounts.

Container restart should be safe.

The app should work after:

docker compose down

followed by:

docker compose up -d

without losing job metadata or configuration.

Temporary job files may persist until cleanup.

---

# RESOURCE CONSTRAINTS

Assume CPU and RAM are limited.

Do not load large documents entirely into memory unless unavoidable.

Prefer streaming upload handling where possible.

Avoid creating unnecessary duplicate copies.

Delete temporary files after processing.

Limit concurrency.

Avoid heavyweight frontend frameworks and server-side rendering.

React + Vite SPA is preferred.

---

# ERROR HANDLING

User-facing errors must be understandable.

Bad:

Internal subprocess failed with exit code 127.

Better:

Document conversion service is currently unavailable.

Application logs may contain the technical details.

Return consistent API errors.

Suggested structure:

code

message

job_id

details only when safe

Never expose raw stack traces to frontend users.

---

# FRONTEND JOB EXPERIENCE

When processing:

File uploaded

→ Waiting

→ Processing

→ Completed

If failed:

Processing failed

display useful message

allow retry where safe

Completed jobs should display:

original file

tool used

date

result

expiry time

download button

delete button

---

# ACCESSIBILITY

Use:

semantic HTML

keyboard usable controls

proper labels

visible focus states

reasonable contrast

Do not rely solely on icons.

---

# RESPONSIVE DESIGN

Primary use is desktop office computers.

Also ensure basic usability on tablet/mobile.

Desktop layout should be prioritized.

---

# TESTING

Backend tests should cover at least:

file validation

filename sanitization

job creation

job state transitions

safe path handling

cleanup logic

page range parser

queue concurrency rules

API validation

Where feasible, include integration tests for processing adapters.

Frontend should at minimum validate critical forms and job-state rendering.

Do not chase 100% test coverage.

Prioritize business-critical and security-sensitive behavior.

---

# DOCUMENTATION

README.md must explain:

What OfficeBox is

Architecture

Requirements

Development setup

Docker deployment

Synology deployment

Environment variables

Data folders

Backup recommendations

Updating containers

Troubleshooting

Adding a new tool

Security considerations

---

# CODING QUALITY

Use strong typing.

Python:

type hints

TypeScript:

strict mode

Keep functions small.

Prefer explicit code over clever abstractions.

Avoid huge files.

Avoid unnecessary dependencies.

Use clear domain names.

Avoid magic constants.

Configuration should be centralized.

---

# SECURITY PRINCIPLE

Treat every uploaded document as potentially sensitive and potentially malicious.

Treat every user-provided filename, MIME type and request parameter as untrusted.

Processing engines must only receive files inside controlled OfficeBox job directories.

No processing function may accept arbitrary filesystem paths from the frontend.

---

# FUTURE EXTENSIONS

Architect the project so these can be added later:

Word to PDF

Excel to PDF

PowerPoint to PDF

PDF watermark

PDF page numbers

PDF rotation

PDF page reorder

PDF page deletion

PDF metadata removal

PDF password protection

PDF unlock

PDF image extraction

PDF redact

Image conversion

Image resize

Image compression

Barcode scanner

QR code scanner

QR generator

Batch rename

TXT to PDF

Markdown to PDF

AI document extraction

Do NOT implement all these in V1.

Only ensure the architecture does not make them difficult to add.

---

# FIRST DEVELOPMENT TASK

Start by inspecting the current repository.

If it is empty:

create the initial repository structure.

Then implement only the first foundation milestone:

1. Docker Compose structure
2. FastAPI backend skeleton
3. React + TypeScript + Vite frontend
4. Tailwind setup
5. SQLite database initialization
6. Job model
7. storage manager
8. basic queue abstraction
9. health endpoint
10. tools registry
11. dashboard UI
12. one fully working tool: PDF to Image
13. Docker deployment
14. .env.example
15. README

PDF to Image must be the first end-to-end vertical slice.

The complete flow must work:

Browser

→ upload PDF

→ create job

→ queue job

→ convert PDF pages to images

→ job becomes completed

→ browser shows result

→ user downloads result

Do not implement PDF to Word, PDF to Excel, OCR or other tools until this vertical slice is stable.

---

# FIRST MILESTONE ACCEPTANCE CRITERIA

The milestone is complete only if:

docker compose up -d

starts the application successfully.

Frontend loads.

Backend health endpoint works.

SQLite initializes automatically.

Dashboard loads available tools.

User can select PDF to Image.

User can upload a PDF.

Upload creates a job.

Job moves through:

QUEUED

PROCESSING

COMPLETED

A one-page PDF produces an image.

A multi-page PDF produces an archive of images or another clearly documented multi-file download solution.

User can download the processed result.

Uploaded and generated files are stored only inside the configured job directory.

Expired jobs can be safely deleted.

Invalid uploads return a useful error.

The system does not execute user-controlled shell commands.

README contains local Docker startup instructions.

---

# WORKING STYLE

When implementing this project:

Do not just output large amounts of code without understanding the existing repository.

Inspect before editing.

When you encounter a design decision, prefer the simplest implementation that preserves future modularity.

Do not introduce technology simply because it is popular.

Do not modify unrelated files.

Do not leave unused placeholder dependencies.

Do not leave fake implementations that pretend conversion succeeded.

Do not hard-code host-specific paths.

Keep Docker deployment reproducible.

Maintain a TODO section for future milestones.

At the end of each milestone report:

Implemented

Files changed

Architecture decisions

How to run

How to test

Known limitations

Recommended next milestone

---

# BEGIN

Inspect the repository and implement the FIRST DEVELOPMENT TASK only.

Do not start Phase 2 functionality until the first milestone acceptance criteria are satisfied.
