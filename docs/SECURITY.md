# Yêu cầu và trạng thái bảo mật

Cập nhật: 2026-09-16. Các kiểm soát chính đã có và conversion local chạy được; image scan vẫn còn finding nên chưa tuyên bố sẵn sàng NAS/public hoặc đã audit độc lập.

## Kiểm soát đang áp dụng

- Frontend bind `127.0.0.1:1280`; backend và Stirling không publish cổng.
- Upload streaming, giới hạn dung lượng/số file, signature và parse validation; file rỗng/hỏng/không đúng loại bị từ chối.
- UUID và tên lưu do server tạo; path containment; binary không vào SQLite.
- Engine chỉ nhận path/options đã chuẩn hóa. CLI dùng argv, không shell; HTTP Stirling chỉ tới URL cấu hình nội bộ.
- LIGHT/HEAVY concurrency, timeout, output/page/pixel limit, recovery và retention cleanup.
- Container chạy user quyền thấp, read-only/no-new-privileges/drop capability theo Compose; không Docker socket/privileged/host network.
- Download attachment có `X-Content-Type-Options: nosniff` và `Cache-Control: no-store`.
- Preview chỉ allowlist PDF, PNG/JPEG/WEBP và TXT; response inline dùng `nosniff`, `no-store`, `SAMEORIGIN` và CSP `frame-ancestors 'self'`. Route khác tiếp tục chống nhúng bằng `DENY`/`frame-ancestors 'none'`.
- Ảnh clipboard chỉ được nhận trên trang Image → Text, không đọc clipboard chủ động; dữ liệu chỉ lấy từ sự kiện paste do người dùng thực hiện và đi qua validation upload hiện có. OCR text render thuần văn bản, không dùng HTML.
- Log không ghi nội dung OCR/tài liệu, request body, secret hoặc raw stack trace cho người dùng.

## Kết quả scan 2026-09-16

| Phạm vi | Kết quả | Diễn giải |
|---|---|---|
| Frontend npm production | 0 finding | `npm audit --omit=dev` |
| Backend image toàn phần | 0 critical / 9 high | Scout còn metadata bản cũ từ base và OS packages |
| Backend `--ignore-base` | 0 critical / 5 high | `cjson`, `libxml2`; chưa có fixed version |
| Frontend image | 0 critical / 1 high | `libxml2`; chưa có fixed version Alpine |
| Stirling official image | 1 critical / 65 high | Image upstream v2.14.3-fat; chưa thể nâng OS an toàn trong image đã thu gọn |

Runtime backend xác nhận `msgpack 1.2.1` và `setuptools 80.10.2`, là các bản vá được Scout chỉ ra. Báo cáo toàn image vẫn liệt kê bản cũ trong provenance/base layer, vì vậy số scan gốc vẫn được giữ nguyên trong tài liệu.

Stirling chỉ ở network nội bộ, không có host port, bị giới hạn queue/timeout và container hardening. Các biện pháp này giảm phơi nhiễm nhưng không xóa CVE. Finding Stirling là blocker trước NAS/public cho đến khi được nâng, phân tích applicability và chấp nhận rủi ro có ghi nhận.

## Trước khi mở rộng truy cập

Hiện là workspace chung, không có auth/ownership; ai truy cập được ứng dụng có thể thấy job. Trước LAN rộng/Internet/multi-user riêng tư phải bổ sung authentication, ownership mọi endpoint, HTTPS, CSRF khi dùng cookie, rate limit và authorization tests.

## Việc còn phải kiểm chứng

- File mã hóa/ác ý, decompression bomb, tài liệu rất lớn, timeout/cạn đĩa.
- Symlink/traversal, concurrency/restart/cleanup cạnh tranh và engine unavailable.
- Egress runtime thực tế và benchmark trên NAS.
- License review chính thức cho mô hình phân phối.

Khi có sự cố: tắt tool bị ảnh hưởng, giới hạn truy cập, giữ log đã lọc/metadata, tạo fixture vô danh và báo qua kênh bảo mật upstream; không đăng tài liệu thật.
