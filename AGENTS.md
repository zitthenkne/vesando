# Sản đồ Studio — bản đồ mã cho AI

Ứng dụng tĩnh (không build, không backend): soạn đề và theo dõi sản đồ chuyển dạ. Vue 3, Lucide và Tailwind nạp từ CDN trong `index.html`. Dữ liệu chỉ nằm trong trình duyệt (localStorage) và tệp JSON người dùng tải về.

## Đọc file nào

Chỉ mở file liên quan tới việc đang làm; đừng đọc cả thư mục.

| Việc cần làm | File |
| --- | --- |
| Khung trang, template Vue chính | `index.html` (chỉ markup) |
| Dựng SVG sản đồ, kiểm định ca, xuất PNG/PDF, ca mẫu | `core.js` |
| Trạng thái ứng dụng (`setup()`), lưu/mở, lịch sử, điều phối công cụ | `app.js` |
| Component Vue: sản đồ tương tác, hồ sơ ca, bộ chỉnh, menu | `components.js` |
| Trợ lý AI, thư viện, hướng dẫn trong app, xuất đề | `enhancements.js` (`registerEnhancements`) |
| Không gian Nhập/Thiết kế/Trình chiếu, lớp, trục mốc, bảng dữ liệu | `workspace-next.js` (`registerNextWorkspace`) |
| Quy tắc lâm sàng, giới hạn dữ liệu | `clinical-rules.js`, `guidance.js` |
| Nguồn tham chiếu chuyên môn | `docs/CLINICAL_REFERENCES.md` |

Thứ tự nạp script: `clinical-rules → guidance → enhancements → workspace-next → core → components → app`. Các hằng/hàm cấp cao của `core.js` là biến toàn cục dùng chung.

## CSS

Nạp theo thứ tự, file sau đè file trước: `base → studio → workspace → interaction → theme → canvas → workspace-next → canva`.

- Các lớp cũ dùng nhiều `!important` và bộ chọn `#app#app…`. **Sửa giao diện mới trong `canva.css`** (khung kiểu Canva: thanh trên, thanh trái, bảng ghim, vùng canvas, thanh thu phóng) thay vì thêm vào lớp cũ.
- Màu dùng biến `--surface`, `--line`, `--brand`, `--brand-soft`, `--ink`; giao diện tối qua `:root[data-theme=dark]`.

## Kiểm tra

Node + Playwright (Chrome). Đặt `PLAYWRIGHT_MODULE` nếu Playwright không cài toàn cục.

- `node tests/verify.cjs` — kiểm tra lõi không cần trình duyệt (dựng SVG, quy chuẩn, kiểm định); luôn chạy sau khi sửa `core.js`/`app.js`.
- `node tests/verify-boot.cjs`, `node tests/verify-next-workspace.cjs` — khởi động và luồng không gian làm việc trên trình duyệt.
- Danh sách đầy đủ và cách thêm file mới: `docs/TESTS.md`.

## Quy ước

- Giao diện, chữ hiển thị và tài liệu bằng tiếng Việt.
- Không thêm thư viện hay bước build. Giữ nguyên định dạng dữ liệu JSON và bộ dựng SVG (bản xuất phụ thuộc vào nó).
- `docs/archive/` là nhật ký các vòng nâng cấp cũ — chỉ đọc khi cần truy lại lý do một quyết định.
