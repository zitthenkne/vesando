# Không gian vẽ gọn hơn — 30 thay đổi

Ghi nhận của lần nâng cấp đầu. Bố trí và thao tác hiện tại được cập nhật tiếp trong [UI_UPGRADE_2.md](UI_UPGRADE_2.md).

Mục tiêu: ưu tiên sản đồ, mở công cụ đúng lúc, cho phép tùy biến mức hiển thị.

Trên viewport 1440 × 1000, số phần tử `button` hiển thị ngay khi mở trang giảm từ **18 xuống 9**. Menu và ô chọn được tính riêng; đây không phải số lượng tính năng của ứng dụng.

| # | Thay đổi đã triển khai | Cách sử dụng / kết quả |
|---|---|---|
| 1 | Mở đầu ở chế độ Xem | Bảng nhập và công cụ sửa điểm chỉ xuất hiện khi cần. |
| 2 | Gộp phần đầu trang | Thương hiệu, phân hệ, tên ca và thao tác chính nằm trong một hàng. |
| 3 | Bỏ tiêu đề ca lặp trên màn hình mặc định | Có thể bật lại trong Tùy biến; bản xuất giữ thông tin ca. |
| 4 | Cụm công cụ nổi ở cạnh dưới | Bản vẽ được dùng toàn bộ chiều rộng khi đóng bảng. |
| 5 | Chọn công cụ ở cạnh phải | Tùy biến → Vị trí công cụ. Điện thoại luôn giữ công cụ ở cạnh dưới. |
| 6 | Bật/tắt tên công cụ | Chọn chỉ biểu tượng hoặc biểu tượng kèm chữ. |
| 7 | Chú thích công cụ theo ngữ cảnh | Hover/focus trên desktop để xem tên và phím tắt; có nhãn cho screen reader. |
| 8 | Bấm lại công cụ để thu bảng | Không cần tìm nút đóng ở đầu bảng. |
| 9 | Chạm điểm trong chế độ Xem để sửa nhanh | Mở ô sửa đúng thông số; chưa mở biểu mẫu đầy đủ. |
| 10 | Focus dành màn hình cho bản vẽ | `F` ẩn thanh đầu và cụm công cụ; có nút quay lại. |
| 11 | Quay lại bằng bàn phím | `Esc` đóng lớp đang thao tác; `0` trở về Xem. |
| 12 | Ba cấu hình hiển thị | Tối giản / Cân bằng / Đầy đủ, áp dụng ngay. |
| 13 | Mật độ khoảng cách tùy chọn | Gọn hoặc Thoáng cho bảng chỉnh sửa. |
| 14 | Bảng chỉnh sửa ghim hoặc nổi | Chọn thu chiều rộng bản vẽ hoặc mở bảng trên bản vẽ. |
| 15 | Nhớ chiều rộng bảng | Kéo mép hoặc dùng phím mũi tên; giữ lựa chọn sau khi tải lại. |
| 16 | Nhớ cách bố trí cá nhân | Lưu vị trí công cụ, mật độ và các mục hiển thị trên thiết bị. |
| 17 | Đặt lại riêng giao diện | Khôi phục bố trí mặc định, giữ dữ liệu ca, thiết kế sản đồ và theme. |
| 18 | Bộ chọn ca gọn | Khi có nhiều ca, dùng một ô chọn; có thể bật lại dải ca mở rộng. |
| 19 | Gom các mục phụ của ca | Đề bài, chú giải và thao tác nằm trong một ngăn chung. |
| 20 | Chú giải theo dõi mặc định thu lại | Mở khi cần đọc; cách kèm chú giải trong bản xuất vẫn được chọn riêng. |
| 21 | Bật/tắt dải mốc giờ | Hiện khi thiết kế nếu cần; Rà soát luôn có điều hướng mốc. |
| 22 | Bật/tắt gợi ý và thông tin kỹ thuật | Giảm chữ hướng dẫn và kích thước ảnh ngoài lúc cần tra cứu. |
| 23 | Điều hướng thiết kế bằng biểu tượng | Năm nhóm công cụ nằm trên một hàng gọn, có tên truy cập và tooltip. |
| 24 | Xem trước tỷ lệ bản vẽ | Hình thu nhỏ và kích thước cập nhật theo thay đổi thật. |
| 25 | Thu gọn kích thước chính xác | Chọn mẫu nhanh trước; mở số pixel và thanh kéo khi cần. |
| 26 | Thu gọn thiết lập thời gian nâng cao | Khoảng đệm, số giờ và chế độ biểu mẫu nằm trong một mục mở rộng. |
| 27 | Gom các nút xem vào menu | Zoom, kéo xem, khớp chiều rộng và toàn màn hình mở từ một nút. |
| 28 | Zoom quanh vị trí con trỏ | `Ctrl + cuộn`, giới hạn 100–600%, giữ vùng đang xem. |
| 29 | Đóng điều khiển theo ngữ cảnh | Menu zoom đóng khi bấm ngoài, bắt đầu kéo điểm hoặc bấm `Esc`; chỉ mở một hộp thoại chính. |
| 30 | Hoàn thiện các trạng thái nhỏ | Thông báo Hoàn tác tránh cụm công cụ; thanh đầu 320 px không cắt chữ; vùng bấm chính từ 44 px; dialog trả focus. |

## Kiểm chứng

- `node verify.cjs`: **718 checks passed**.
- `node verify-ui.cjs`: các luồng sửa số đo, mouse/touch drag, undo/redo, bảo vệ bản nháp, thiết kế, kiểu thế, lưu phiên, clipboard và tải SVG/PNG/PDF thực tế; **120 cấu hình công cụ** ở 320 / 390 / 768 / 1024 / 1440 px.
- `node verify-workspace.cjs`: bố cục mặc định, cấu hình cá nhân, reset, persistence, dữ liệu lưu lỗi, phím tắt, focus, chạm điểm, Ctrl-wheel và **160 tổ hợp responsive**.
- Đã xem ảnh chụp desktop, điện thoại, bảng tùy biến và bảng thiết kế; không có lỗi runtime trong các bộ kiểm tra trình duyệt đã chạy.

Hai bộ kiểm tra browser dùng Playwright có sẵn. Nếu không có trong module path, đặt `PLAYWRIGHT_MODULE` tới thư mục Playwright đã cài; có thể đặt `CHROME_EXECUTABLE` tới Chrome. Không thêm dependency vào dự án.

Chỉ lưu cấu hình giao diện trong `partograph-workspace-v2`; không lưu dữ liệu ca vào cấu hình này. Quy tắc lâm sàng và tài liệu nguồn không thay đổi.
