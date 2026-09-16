# Third-party components

OfficeBox tích hợp upstream dưới dạng package, CLI hoặc container; không sao chép toàn bộ repository. Trước khi phân phối, phải kèm license/notice của đúng artifact và rà lại mô hình cấp phép.

| Component | Version/artifact | Purpose | Upstream license |
|---|---|---|---|
| PyMuPDF | 1.28.2 | PDF rendering and manipulation | AGPL-3.0 |
| Pillow | 12.3.0 | Image encoding/inspection | HPND |
| Tesseract OCR | Debian 5.5.0 plus `eng`/`vie` data | Image OCR | Apache-2.0 |
| OCRmyPDF | 17.11.0 | Searchable PDF generation | MPL-2.0 |
| Stirling-PDF | 2.14.3-fat, pinned image digest | DOCX/XLSX conversion and PDF compression | Release root license is MIT with documented exceptions; review exact artifact before redistribution |
| FastAPI | 0.141.1 | HTTP API | MIT |
| SQLAlchemy | 2.0.52 | SQLite persistence | MIT |
| httpx | 0.28.1 | Internal HTTP client | BSD-3-Clause |
| React/Vite | package-lock versions | Browser UI/build | MIT |
| Tailwind CSS | 4.3.3 | UI styling | MIT |
| Nginx | 1.29.5-alpine3.23 | Static frontend/API proxy | BSD-2-Clause |

OfficeBox chưa chọn license riêng. Việc phát hành ra ngoài môi trường riêng phải được đối chiếu với AGPL của PyMuPDF và các ngoại lệ/điều khoản artifact Stirling.
