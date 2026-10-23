# Đợt 9 — 24 cải tiến thao tác

Áp dụng trên mã nguồn hiện tại. Các mục 1–14 và 23–24 dùng chung cho **Soạn đề** và **Theo dõi**; các mục 15–22 dành cho khung nhập nhanh **Theo dõi**.

| # | Thay đổi | Cách sử dụng / lợi ích |
| --- | --- | --- |
| 1 | Đi thẳng đến giờ thực | Mở đồng hồ trên sản đồ, nhập `HH:mm`. Nhận giờ qua nửa đêm, không tự làm tròn. |
| 2 | Đi theo số giờ từ đầu | Cũng trong ô đó, nhập `+2.5` hoặc `+24`. Chuyển tới mốc chưa ghi mà không tạo số đo. |
| 3 | Duyệt mốc đã ghi | Hai nút cạnh đồng hồ đi tới mốc có trong hồ sơ, bỏ qua các khoảng trống. |
| 4 | Về mốc mới nhất | Nút **Mới nhất** đưa về cuối dữ liệu đã ghi. |
| 5 | Xem và sửa từ bản tóm tắt mốc | Mở đồng hồ để xem các số tại mốc này; chạm từng giá trị để mở ô sửa ngay trên sản đồ. |
| 6 | Đối chiếu hai mốc | Chọn **Đối chiếu với** để xem hai cột số liệu cạnh nhau, không mang số cũ sang mốc mới. |
| 7 | Đi thẳng tới hàng | Chọn **Đến hàng trên sản đồ** để cuộn tới đúng vùng; hàng đang ẩn có thông báo rõ. |
| 8 | Đưa điểm vào giữa khung | Trong menu `…` của điểm, chọn **Đưa điểm vào giữa khung**. |
| 9 | Duyệt điểm cùng thông số | Menu điểm có **Điểm trước / sau cùng thông số**. `Alt ← / →` cũng dùng được ngay từ màn hình Xem. |
| 10 | Dán số vào điểm | Focus điểm rồi dán số, kể cả dấu phẩy thập phân. Ứng dụng mở ô nhập bản nháp, chờ xác nhận lưu. Ô đang sửa được bảo vệ. |
| 11 | Hai đường dóng khi thêm | Rê chuột lên vị trí trống để đối chiếu cả trục giờ và trục giá trị trước khi bấm. |
| 12 | Hover đúng số đã ghi | Ở cột đã có số, chú thích **Sửa** hiển thị giá trị hiện có thay vì giá trị ở độ cao con trỏ. |
| 13 | Kéo xem tạm thời | Khi focus sản đồ, giữ `Space` và kéo; hoặc dùng nút chuột giữa. Nhả phím để trở lại thao tác trực tiếp. |
| 14 | Giảm số lần Tab qua các điểm | Mỗi đường có một điểm trong thứ tự Tab; các điểm khác vẫn focus được bằng điều hướng điểm. |
| 15 | Lối tắt nhóm nhập luôn trong tầm tay | Thanh **Chính / Thai & ối / Mẹ / Thuốc** bám trong khung cuộn, tự mở đúng nhóm và focus ô đầu. |
| 16 | Số đo trước vẫn hiện khi đang gõ | Giá trị trước kèm giờ đo nằm dưới ô, không biến mất khi ô đã có chữ số. |
| 17 | Bỏ sửa riêng từng ô | Nút **Bỏ sửa** tại ô có nháp khôi phục riêng ô đó; các ô khác giữ nguyên. |
| 18 | Hủy nháp riêng mốc hiện tại | Có thể bỏ một mốc mà giữ lại các bản nháp ở mốc khác. |
| 19 | Ghi tất cả bản nháp cùng lúc | Kiểm tra toàn bộ trước khi ghi; có lỗi thì giữ tất cả nháp. Một lần hoàn tác khôi phục toàn bộ dữ liệu và nháp trước lần ghi. |
| 20 | Tùy chọn bước chuyển sau ghi | Chọn 30 phút, 1 giờ hoặc 2 giờ cho **Ghi & mốc tiếp**; có thể dùng `Ctrl/⌘ Shift Enter`. Đây là bước thao tác, không phải lịch đo. |
| 21 | Đi ngược biểu mẫu bằng Shift Enter | `Enter` tới ô kế; `Shift Enter` về ô trước, áp dụng cả ô chọn trong nhóm mở. |
| 22 | Rà soát trước khi ghi | Mục **Rà soát thay đổi** đối chiếu số đã ghi và giá trị sắp ghi, kể cả thao tác xóa số. |
| 23 | Lệnh gần đây ở đầu danh sách | `Ctrl/⌘ K` ưu tiên bốn thao tác gần nhất trong phiên tab. Chỉ lưu ID lệnh, không lưu nội dung hồ sơ hay từ khóa tìm. |
| 24 | Tìm lệnh bằng nhiều từ tự do | Tìm không dấu, không cần các từ nằm cạnh nhau hoặc đúng thứ tự; ví dụ `toi giao` tìm **Giao diện tối**. |

Các nút bổ sung dùng vùng chạm tối thiểu 44 px, màu theo theme và bố cục thích ứng. Thanh giờ cũ được thu gọn khi bộ điều hướng mới hiện để tránh trùng công cụ. Mở bộ điều hướng giữ nguyên vị trí nút đồng hồ. Các lớp thao tác không đi vào SVG/PNG/PDF.

## Kiểm chứng

- `verify.cjs`: 812 kiểm tra dữ liệu, hình học và xuất sản đồ.
- `verify-ux9.cjs`: luồng thực tế của các bổ sung, kiểm tra lỗi/hoàn tác/bảo vệ bản nháp, 10 bố cục sáng/tối ở 320–1440 px và sự kiện touch ở cả hai chế độ.
- `verify-direct.cjs`, `verify-drag.cjs`: thêm/chọn/kéo điểm, va chạm, cuộn tự động, pinch và hoàn tác.
- `verify-bedside.cjs`: nhập cạnh sản đồ, bản nháp theo mốc, tự lưu tùy chọn và khả năng tới nút ghi trên màn hình nhỏ.
- `verify-clinical.cjs`: 50 bố cục theo dõi, các trạng thái nhập/xem/đối chiếu và luồng lưu/xuất dữ liệu.
- `verify-ui.cjs`: luồng công cụ, 120 bố cục điều khiển, xuất SVG/PNG/PDF, phản hồi lưu/lỗi/thử lại và không có lỗi runtime.

Kiểm thử bằng Chrome tự động. Chưa kiểm thử tại phòng sanh hoặc bằng bàn phím ảo trên thiết bị thật; chưa có số liệu đo thời gian thao tác với người sử dụng.
