# Làm việc với OfficeBox

## Bắt đầu mỗi phiên

1. Đọc `README.md`, `docs/STATUS.md` và mục bàn giao cuối trong `docs/SESSION_LOG.md`.
2. Đọc `docs/PLAN.md`; chọn công việc chưa hoàn thành đầu tiên có đủ điều kiện.
3. Đọc `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/UPSTREAM.md` khi sửa phần liên quan.
4. Kiểm tra mã nguồn và thay đổi hiện có trước khi sửa. Không ghi đè công việc của người dùng.

## Quy tắc thực hiện

- Chạy local trước, URL `http://localhost:1280`; chỉ chuyển triển khai NAS sau khi nghiệm thu local đạt. Compose chỉ publish frontend trên cổng host 1280; backend/engine ở mạng nội bộ. Không tự đổi cổng khi bị chiếm: xác định và báo xung đột, không dừng process lạ.
- Tách bằng chứng `M1-LOCAL` và `M1-NAS`; thiếu NAS không ngăn hoàn thành kiểm thử local, nhưng không được tuyên bố sẵn sàng NAS. Các engine M2–M4 vẫn chờ M1 đầy đủ theo kế hoạch.

- Người dùng đã chọn tích hợp PyMuPDF, Tesseract, OCRmyPDF và Stirling-PDF theo lộ trình. Không cần hỏi lại việc dùng bốn nguồn này cho các bước thông thường.
- Hiện tại ưu tiên milestone M1: PDF → Image. Không làm công cụ M2–M4 trước khi M1 đạt nghiệm thu.
- Chỉ dùng upstream chính thức trong `docs/UPSTREAM.md`. Không thêm fork ít sao/không rõ nguồn hoặc dịch vụ chuyển đổi trực tuyến.
- Tích hợp thư viện, CLI và API qua interface nhỏ; không chép toàn bộ mã nguồn upstream vào repository.
- Không xem số sao là chứng nhận bảo mật; kiểm tra bản phát hành, dependency và giấy phép trước khi tích hợp.
- Không bịa endpoint, phiên bản, kết quả chuyển đổi hoặc kết quả kiểm thử.
- Không thêm Redis, Celery, PostgreSQL, Kubernetes hoặc dependency chưa dùng.
- Không upload tài liệu ra ngoài, commit secret hoặc log nội dung tài liệu.
- Trước mỗi phần triển khai lớn: kiểm tra hiện trạng, mô tả thay đổi, triển khai tối thiểu và xác minh phù hợp.
- Tài liệu thiết kế là mục tiêu dự kiến; mã nguồn và bằng chứng kiểm thử quyết định trạng thái thực tế.

## Quy tắc bắt buộc: làm đến đâu, ghi đến đó

Áp dụng cho mọi AI làm việc trong repository. Không chỉ lưu tiến độ trong hội thoại hoặc chờ đến cuối phiên. Một bước chưa được ghi lại chưa được coi là bàn giao xong.

1. **Trước khi bắt đầu một đầu việc:** ghi mã việc (ví dụ FB-01), mục tiêu, trạng thái `IN_PROGRESS` và bước sắp làm vào `docs/STATUS.md`. Không đánh dấu hoàn thành trước.
2. **Ngay sau mỗi bước có kết quả, trước khi chuyển sang bước tiếp theo:** cập nhật STATUS và thêm checkpoint vào `docs/SESSION_LOG.md`. Một bước là một thay đổi có ý nghĩa, một nhóm kiểm tra hoặc một kết luận điều tra; không cần ghi từng dòng code/từng lệnh đọc file.
3. **Ngay khi có lỗi, blocker hoặc đổi hướng:** ghi lỗi đã lọc, điều đã thử, kết quả và bước xử lý tiếp. Không xóa dấu vết thất bại chỉ vì lần chạy sau thành công.
4. **Trước thao tác dài hoặc có thể ngắt phiên** (build, test dài, migration, deploy): lưu checkpoint trước, ghi lệnh và trạng thái `RUNNING`; cập nhật kết quả khi công cụ trả về. Chưa có kết quả thì không ghi PASS.
5. **Khi một đầu việc đạt nghiệm thu:** ghi `DONE` kèm bằng chứng; đồng bộ checkbox trong PLAN và FRONTEND_BACKEND_PLAN nếu có. Nếu mới viết code, dùng `IMPLEMENTED_UNVERIFIED`, không dùng DONE.
6. **Khi bị ngắt hoặc kết thúc phiên:** lưu phần đã xong, phần còn dở, tiến trình còn chạy và bước tiếp tục cụ thể; không để trạng thái chung chung như “tiếp tục làm backend”. Nếu bị ngắt đột ngột không kịp ghi, AI phiên sau phải đối chiếu file/process thực tế và bổ sung checkpoint phục hồi, không đoán kết quả.

### Nội dung checkpoint tối thiểu

- Thời điểm thực tế kèm múi giờ; mã việc và trạng thái.
- Việc vừa làm và file đã thay đổi (hoặc ghi không thay đổi).
- Kiểm tra/lệnh đã chạy và kết quả `PASS`, `FAIL`, `RUNNING` hoặc `NOT_RUN`; nếu không chạy, ghi lý do.
- Phần chưa xong, lỗi/hạn chế, bước tiếp theo đủ cụ thể để AI khác thực hiện.
- Nếu còn process chạy: ghi session/PID nếu có, cách kiểm tra; phiên sau phải xác minh còn tồn tại trước khi dùng.

### Nơi ghi và tính nhất quán

- `docs/STATUS.md`: ảnh chụp trạng thái mới nhất, ngắn gọn, được cập nhật tại chỗ.
- `docs/SESSION_LOG.md`: lịch sử checkpoint theo thời gian, thêm bản ghi mới; không ghi đè bản cũ. Nếu cần đính chính, thêm bản ghi tham chiếu checkpoint cũ.
- `docs/PLAN.md` và `docs/FRONTEND_BACKEND_PLAN.md`: chỉ đánh dấu checkbox khi đầu việc tương ứng thực sự đạt yêu cầu; không cần chép toàn bộ log vào kế hoạch.
- `docs/DECISIONS.md`: ghi quyết định kiến trúc ngay khi chốt; tài liệu hợp đồng liên quan phải đồng bộ trong cùng bước.
- Chỉ ghi sự kiện quan sát được và bằng chứng cần thiết; không ghi suy luận nội bộ, secrets, nội dung tài liệu người dùng hoặc toàn bộ log thô.
- Nếu tài liệu và code khác nhau, kiểm tra thực tế rồi ghi sai lệch và sửa trạng thái. Không tin mù quáng bản ghi của AI trước.

Trạng thái công việc: `TODO`, `IN_PROGRESS`, `IMPLEMENTED_UNVERIFIED`, `BLOCKED`, `DONE`. `BLOCKED` phải nêu điều kiện cần để tiếp tục; có thể làm việc độc lập khác nếu vẫn trong phạm vi được giao.

## Rà soát cuối phiên

- Cập nhật `docs/STATUS.md`: đã làm, đang làm, bước kế tiếp, hạn chế và kiểm thử thực sự đã chạy.
- Đánh dấu công việc hoàn thành trong `docs/PLAN.md` khi có bằng chứng.
- Thêm bản ghi vào `docs/SESSION_LOG.md`, ghi file thay đổi và lệnh tiếp tục cụ thể nếu đã có.
- Ghi quyết định mới vào `docs/DECISIONS.md`. Không sửa lịch sử quyết định âm thầm.
- Không ghi thông tin nhạy cảm vào tài liệu bàn giao.
