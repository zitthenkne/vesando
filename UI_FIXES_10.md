# Đợt 10 — sửa lỗi bố cục và giảm vướng khi thao tác

## Công việc đã thực hiện

- [x] Tái hiện ảnh lỗi bằng Chrome và đo kích thước thực tế.
- [x] Sửa nguyên nhân chung của bảng giờ trong cả Soạn đề và Theo dõi.
- [x] Rà luồng mở/đóng bảng, chọn điểm, nhập nhanh, kiểm tra lỗi và hoàn tác.
- [x] Kiểm chứng bố cục mở rộng và thao tác; giữ lại kiểm tra hồi quy có thể chạy lại.

## Phát hiện và cách sửa

| Vướng mắc | Cách xử lý |
| --- | --- |
| Mở đồng hồ làm toàn bộ nội dung co thành cột hẹp | Bỏ `display: contents` trên `<details>`. Khung native giữ nguyên và trải hết chiều rộng; các nút giờ không đổi vị trí khi mở. Trước sửa: khung 1.780 px nhưng nội dung chỉ 44 px; sau sửa nội dung 1.756 px. |
| Ô giờ, ô chọn và bảng đối chiếu khó đọc | Chia vùng điều hướng và số liệu trên desktop; chuyển về một cột ở khung hẹp. Giữ số đo trên một dòng và tách kiểu chữ đồng hồ khỏi lớp CSS cũ trùng tên. |
| Bảng mở dài, không rõ cách trở về biểu đồ | Có nút Xong và Esc trả focus về đồng hồ; nhảy giờ thành công tự thu gọn bảng. |
| Trên điện thoại, phần điều hướng đẩy số liệu xuống xa | Đặt hai ô chọn cạnh nhau, gọn phần giải thích và ưu tiên chỗ cho bảng số; nút Xong bám trong vùng cuộn. |
| Ô giờ còn hiện nội dung tìm cũ hoặc báo lỗi đã hết | Xóa nội dung cũ khi đổi mốc, xóa thông báo lỗi khi sửa ô. |
| Danh sách nhảy hàng cho chọn cả hàng đang ẩn | Chỉ liệt kê những hàng có trên bản vẽ hiện tại. |
| Menu điểm mở ra ngoài màn hình laptop | Đo khoảng trống trên/dưới điểm, tự chọn hướng và giới hạn chiều cao trong vùng nhìn thấy. Khi có khung nhập điện thoại, menu tránh vùng bị khung nhập che. |
| Menu chuột phải ở gần mép bị khuất | Giới hạn vị trí và chiều cao theo vùng nhìn thấy. |
| Menu điểm dùng bàn phím chưa thuận tiện | Focus lệnh đầu khi mở; hỗ trợ ↑/↓, Home/End. Esc đóng menu trước, Esc tiếp đóng thanh điểm. |
| Focus đã ra khỏi ô sửa thì Esc không đóng được ô | Ưu tiên đóng ô sửa đang mở từ phím Esc chung. |
| Gõ số vào điểm khác khi ô cũ lỗi có thể đụng nhầm bản nháp | Hàm mở ô trả trạng thái thành công; chỉ đưa chữ số mới vào đúng ô đã mở thành công. |
| Khung nhập nhanh chiếm chiều rộng desktop dù chỉ muốn xem | Có thể thu gọn khung; biểu đồ nhận lại toàn bộ chiều rộng. Ghi mốc mở lại đúng dữ liệu đang nhập; số bản nháp vẫn hiện ở nút mở. |
| Enter ở ô cuối tự ghi ngoài dự tính | Chuyển focus sang nút Ghi, chờ xác nhận; loại checkbox khỏi chuỗi nhập số. Enter trong ô chọn giữ hành vi native. |
| Ghi tất cả báo lỗi nhưng khó tìm mốc sai | Đưa về mốc lỗi, mở khung nhập và focus ô không hợp lệ. Tất cả bản nháp còn nguyên và chưa ghi một phần. |
| Thông báo cũ còn hiện sau khi sửa lỗi hoặc đổi mốc | Xóa phản hồi lỗi theo ngữ cảnh đang nhập. |
| Thông báo Ghi che sản đồ vừa cập nhật | Xác nhận ngay trong khung nhập, có Hoàn tác gần nhất. Không cần banner nổi cho lần Ghi/Ghi tất cả thành công. |
| Hoàn tác không đưa về mốc trước thao tác | Lưu cả mốc đang chọn trong bản chụp hoàn tác; xóa phản hồi thành công đã lỗi thời. |
| Đổi chế độ còn mang thông báo của chế độ trước | Dọn thông báo theo ngữ cảnh khi đổi chế độ. |

## Kiểm chứng

`verify-comfort10.cjs` kiểm tra kích thước nội dung, khả năng đọc số khi đối chiếu, menu ở mép màn hình, focus/Esc, bản nháp, Ghi/Hoàn tác và 24 bố cục mở bảng từ 320 đến 1.920 px ở hai chế độ, hai theme. Có kiểm tra mật độ điểm ảnh 1.25/1.5/2 và sự kiện touch.

Các kiểm tra hồi quy: `verify.cjs`, `verify-ui.cjs`, `verify-ux9.cjs`, `verify-bedside.cjs`, `verify-clinical.cjs`, `verify-comfort.cjs`, `verify-drag.cjs`.

Các kiểm tra tự động dùng Chrome; chưa phải đánh giá sử dụng với nhân viên tại phòng sanh hoặc bàn phím ảo trên thiết bị thật. Các điểm đã phát hiện trong các luồng trên đã được xử lý; đây không phải cam kết web không còn mọi lỗi có thể xảy ra.
