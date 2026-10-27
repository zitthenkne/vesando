# Kiểm tra

Chạy từ thư mục gốc. Script trình duyệt cần Playwright và Chrome; đặt `PLAYWRIGHT_MODULE` trỏ tới Playwright nếu không cài toàn cục.

| Script | Loại | Nội dung |
| --- | --- | --- |
| `tests/verify.cjs` | Node, không trình duyệt | 812 kiểm tra lõi: hình học sản đồ, quy chuẩn, kiểm định ca, xuất |
| `tests/verify-descent-convention.cjs` | Node | Quy ước một đường độ lọt (/5 ↔ station) |
| `tests/verify-exam-conversion.cjs` | Node + trình duyệt | Chuyển đề thi sang dữ liệu ca |
| `tests/verify-boot.cjs` | Trình duyệt | Khởi động, Vue tải chậm/không tải được, tài liệu xuất |
| `tests/verify-next-workspace.cjs` | Trình duyệt | Luồng không gian làm việc: chọn, kéo, nháp, lớp, AI, cảm ứng, bố cục |
| `tests/verify-direct-title.cjs` | Trình duyệt | Đổi tên ca trực tiếp ở nhiều độ rộng |
| `tests/verify-ai-comparison.cjs`, `tests/verify-ai-session.cjs` | Trình duyệt | Đối chiếu và phiên AI |

Mỗi script tự dựng server tĩnh với danh sách file được phép phục vụ. Khi thêm file JS/CSS mới vào `index.html`, thêm tên file vào danh sách đó.

`docs/archive/legacy-tests/` chứa 28 script của các vòng cũ. Chúng đã lỗi trên bản 23a53ea vì giao diện thay đổi (nút/nhãn đã bỏ), nên không còn được dùng làm thước đo. Muốn dùng lại script nào thì chuyển vào `tests/`, thay `__dirname` bằng `ROOT` như các script hiện có, rồi sửa bộ chọn theo giao diện mới.
