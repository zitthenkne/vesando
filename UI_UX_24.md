# Hoàn thiện 24 thay đổi trải nghiệm biên tập

Giữ các thay đổi đang có trong `index.html`, `canvas.css` và cơ chế dữ liệu/xuất hiện tại. Không thêm thư viện.

- [x] Kiểm tra mã, dữ liệu, lịch sử, bản nháp và kiểm tra trình duyệt hiện có.
- [x] Thanh trái có nhãn; một bảng chính; tiêu đề và dấu chọn rõ ràng (1–4).
- [x] Lịch sử cố định có tên thao tác; lưu riêng với xuất; đổi tên trực tiếp; tìm kiếm trên thanh trên (5–9).
- [x] Thu phóng cố định; Chọn/sửa và Kéo vùng xem; bảng co giãn, ghim/nổi; một vùng cuộn (10–13).
- [x] Tùy chỉnh cơ bản/nâng cao, ảnh mẫu thiết kế, thư viện ca mẫu tìm/lọc được (14–16).
- [x] Dải ca có ảnh, thêm/nhân bản; chọn rồi sửa; lỗi ngay tại ô; xử lý bản chưa lưu (17–20).
- [x] Ca trống gọn; xuất có xem trước và ghi nhớ; điện thoại bốn mục; chữ/nút/phản hồi thống nhất (21–24).
- [x] Chạy kiểm tra chức năng, bàn phím, dữ liệu, xuất, light/dark và responsive; xem ảnh kết quả.

Kiểm định: `node verify.cjs` đạt 812 kiểm tra. `verify-ux24.cjs`, `verify-canva-workspace.cjs` và `verify-boot.cjs` chạy đạt trong Chrome headless. Kiểm tra PNG/PDF/JSON bằng tệp tải thật; số trang xem trước PDF khớp tệp. Kiểm tra 1440, 1024, 768, 390 và 320 px ở cả light/dark; xem ảnh desktop và điện thoại.

Bản sửa có hộp Lưu / Bỏ / Tiếp tục, áp dụng cả đổi công cụ, đóng thuộc tính điểm và lịch sử. Điểm và ô dùng một lần nhấp để chọn, nhấp đúp/Enter để sửa; Enter lưu, Esc hủy. Tùy chọn bảng và định dạng xuất được giữ trên trình duyệt. Thông báo thành công nằm dưới tên ca, không che bản vẽ.
