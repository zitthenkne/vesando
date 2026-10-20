# Hướng dẫn sử dụng trong ứng dụng

- [x] Thêm trung tâm hướng dẫn gồm 7 nhóm cho người mới, tìm kiếm và tiến độ trên thiết bị.
- [x] Thêm chỉ dẫn theo vị trí thật trên giao diện, trước/sau, thử ngay và mở lại.
- [x] Giữ dữ liệu và bản nháp; khôi phục giao diện khi đóng hướng dẫn.
- [x] Kiểm tra bàn phím, desktop/mobile, lưu tiến độ và các luồng đang có.

Các hướng dẫn chỉ thao tác giao diện để minh họa. Không nạp ca mẫu, ghi số đo, kê thuốc, tải tệp hoặc ghi đè JSON trong quá trình xem.

## Sử dụng

- Màn hình rộng: nút **Hướng dẫn** ở thanh trên. Điện thoại/máy tính bảng đến 1100 px: **⋯ → Hướng dẫn sử dụng**. Cuối trang và tìm lệnh Ctrl K cũng mở được trung tâm này.
- 7 hướng dẫn, tổng cộng 39 bước: Bắt đầu (7), Lập sản đồ bằng AI (6), Sửa sản đồ (6), Cơn co & huyết áp (5), Thuốc & dịch truyền (5), Chỉnh bản vẽ (5), Xuất & lưu (5).
- Mỗi bước làm sáng vùng thật của ca đang mở; các hộp nhập, tab prompt và công cụ thiết kế được mở để minh họa. Nút **Thử ngay** rời hướng dẫn, giữ công cụ vừa được chỉ để người dùng thao tác.
- **Trước/Tiếp**, phím trái/phải, **Danh sách**, **Hoàn thành**, Escape và nút đóng đều có sẵn. Đóng hoặc quay về danh sách khôi phục công cụ đã mở trước khi bắt đầu.
- Chỉ lưu tiến độ học tại `partograph-learning-v1`, gồm mã hướng dẫn, bước hiện tại và trạng thái hoàn thành; không chứa dữ liệu ca. Lỗi lưu trữ giữ tiến độ trong phiên.
- Hướng dẫn mở theo yêu cầu, không tự bật lên che ứng dụng. Có tìm kiếm không dấu và bốn câu trả lời ngắn cho các vấn đề thường gặp.
- Khi có ô/điểm/bảng nhập chung chưa lưu, trung tâm vẫn đọc được; bắt đầu các bước đổi giao diện sẽ bị chặn để giữ bản nháp.

## Kiểm tra mới

`verify-guides.cjs` kiểm tra 39 bước trên desktop và 39 bước trên điện thoại, vị trí vùng làm sáng, không thay đổi dữ liệu/JSON/thiết kế/lịch sử, không tự tải tệp, focus và bàn phím, Thử ngay, lưu/mở lại tiến độ, bản nháp, phân hệ Theo dõi, 320/390/768 px, vùng nhìn thu nhỏ, và lỗi cấu hình/lưu trữ. Ảnh kiểm tra được lưu trong thư mục tạm của máy chạy.

Kết quả cuối: `verify.cjs` đạt **795 checks**. Sáu bộ browser `verify-guides.cjs`, `verify-ui.cjs`, `verify-workspace.cjs`, `verify-upgrade.cjs`, `verify-inline.cjs`, `verify-adjustments.cjs` đều exit code 0. Lượt hồi quy giữ 120 + 160 tổ hợp bố cục, các thao tác sửa và xuất SVG/PNG/PDF thật. Đã kiểm tra thêm việc mở hướng dẫn từ Ctrl K khi tab Prompt AI đang mở và khôi phục đúng hộp thoại/tab đó. Không có lỗi runtime/console trong các lượt đạt cuối cùng; đã xem ảnh trung tâm trên desktop và chỉ dẫn prompt trên điện thoại.

## Rút gọn câu chữ

- 37 mô tả giảm từ 4.070 xuống 1.451 ký tự, khoảng 64%. Mỗi mô tả tối đa 15 từ theo khoảng trắng.
- Tiêu đề ngắn, câu bắt đầu bằng thao tác; dùng mũi tên cho chuỗi nhập → xem → lưu.
- Rút gọn tên 7 mục, lời mở đầu, trợ giúp và nút Thử ngay. Chỉ hiện bộ đếm bước một lần.
- Mã hướng dẫn, thứ tự 37 bước và tiến độ đã lưu được giữ nguyên.

## Đồng bộ với bố cục đợt 4 (20/10/2026)

- Thêm bước **Quản lý ca** (Bắt đầu, bước 3): chọn tên ca để tạo mới, mở thư viện hoặc nhân bản; trên điện thoại dùng ⋯.
- **Mở công cụ** gọi đúng nhãn mới trên thanh công cụ: Dữ liệu, Thiết kế, Rà soát, Xuất đề.
- **Hoàn tác** chỉ vào nút ↶ ↷ trên thanh sản đồ (hiện khi đã có thay đổi); chưa có thay đổi thì chỉ vào mục Lịch sử trong bảng Dữ liệu.
- **Lưu để sửa tiếp** và câu hỏi cùng tên: Theo dõi → chọn tên ca → Lưu phiên JSON; trên điện thoại vẫn qua ⋯.
- Thêm câu hỏi **Hoàn tác thay đổi?** → nút ↶ trên thanh sản đồ hoặc Ctrl Z.

## Lập sản đồ bằng AI và mũi tên chú thích (20/10/2026)

- Hướng dẫn **Nhập JSON** đổi thành **Lập sản đồ bằng AI**, đi theo đúng hai bước của hộp thoại: Nhập đề bài → Chọn tác vụ → Gửi prompt cho AI → Nhập phản hồi → Đối chiếu bản xem trước → Dựng sản đồ.
- Bước **Lập sản đồ bằng AI** trong mục Bắt đầu mô tả cả chuỗi: đề bài → prompt → AI → dán phản hồi → sản đồ.
- Mục **Sửa sản đồ** có thêm bước **Mũi tên chú thích** (6 bước): Ghi nhanh → Mũi tên chú thích để thêm; bấm thẻ trên sản đồ để sửa nội dung, giờ, màu và cỡ.
- Toàn bộ câu chữ mới dùng giọng trang trọng, mỗi mô tả tối đa 15 từ.

## Đồng bộ với đợt nâng cấp 5 (20/10/2026)

- **Quản lý ca**: tên ca hiện trên cả điện thoại (tầng 2 của thanh trên), không cần mở ⋯.
- **Gửi prompt cho AI**: có thể chọn ChatGPT, Gemini hoặc Claude để sao chép và mở ngay.
- **Nhập phản hồi**: quay lại trang là hộp thoại tự mở Bước 2; chọn **Dán phản hồi**.
- **Đối chiếu bản xem trước**: dùng thẻ số liệu "Đối chiếu nhanh" phía trên bản xem trước.
- Số bước và mã hướng dẫn giữ nguyên (39 bước).
- **Chọn chế độ** nhắc vị trí ô **Quy chuẩn** ngay trên sản đồ.
- Xuất & lưu: bước **Xem trước** được thay bằng **Gửi để kiểm tra** (thẻ JSON kiểm tra trong Xuất đề); vẫn 5 bước.
