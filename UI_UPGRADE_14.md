# Đề bài → AI → dữ liệu → sản đồ

## Công việc

- [x] Dùng FIELD_DEFS cho đặc tả prompt; mô tả thông tin ca, kiểu thế, ký hiệu, sự kiện, thuốc/dịch, trình bày và ví dụ hợp lệ.
- [x] Chọn phạm vi AI, dạng đề, tính năng; giữ toàn bộ phiên và tạo yêu cầu sửa có giới hạn.
- [x] Kiểm tra mức đáp ứng, nguồn dữ kiện, thời gian chưa rõ, lỗi định dạng; sửa ngay trong bản xem trước.
- [x] So sánh trước–sau, nhận diện xóa, nhập phần chọn, cập nhật ca hiện tại, thử trên bản sao, bảo vệ số liệu khi sửa trình bày.
- [x] Dán bảng và ánh xạ cột; kiểm tra giờ qua ngày/trùng giờ trước khi áp dụng.
- [x] Trang chủ có ba lối nhập, sản đồ thật, ví dụ, ca gần đây và mẫu theo nhu cầu.
- [x] Nội dung ca có điều hướng, bộ thiết lập cá nhân và trợ giúp tại chỗ.
- [x] Kiểm thử luồng mới, hồi quy AI, dữ liệu sản đồ, giao diện sáng/tối và mobile (chi tiết bên dưới).

Nguồn được AI khai báo phải hiển thị là khai báo cần đối chiếu. Phát hiện thiếu theo từ khóa không được khẳng định là AI bỏ sót. Các mục không rõ giờ/ngày được người dùng xác nhận trước khi áp dụng; không âm thầm điền số đo.

## Đối chiếu 30 yêu cầu

| Yêu cầu | Triển khai |
|---|---|
| 1–3 | `aiSpecification()` sinh từ `FIELD_DEFS`, danh mục kiểu thế, ký hiệu và thiết kế thật; phân biệt bắt buộc/tùy chọn; ví dụ mốc, headMarker, events, design và nhiều ca. |
| 4–5 | Ba chế độ Chuyển nguyên đề / Bổ sung phần thiếu / Sáng tạo tình huống mới; chọn dạng đề, số ca và nhóm tính năng. |
| 6–8 | Yêu cầu sửa ngắn kèm JSON; chọn nội dung / trình bày / cả hai; chặn dữ kiện, mã ca hoặc quy chuẩn thay đổi khi chỉ sửa trình bày; khôi phục dữ liệu và giữ thiết kế mới; tạo prompt sửa từ lỗi thực tế. |
| 9–10 | Bảng mức đáp ứng, số mốc/hình/sự kiện/thuốc; phân biệt đề chưa nêu và mục đề có nhắc; giữ đề, tùy chọn, phản hồi, bước đang làm và prompt đã gửi; lưu qua tải lại khi người dùng bật lưu trên thiết bị. Báo khi lưu thất bại. |
| 11–12 | Xem trước; thêm / thay / cập nhật ca; chọn nhóm dữ liệu cần nhập; danh sách thêm/sửa/xóa và đánh dấu mốc thay đổi trực tiếp trên hình; mục xóa dùng chữ Xóa và màu đỏ. |
| 13–15 | Thông báo dễ hiểu + chi tiết kỹ thuật; sửa giờ/ngày/tên/ô số/ký hiệu/hình/sự kiện tại chỗ, kể cả JSON có cấu trúc đọc được nhưng một trường sai; tách lỗi chặn nhập với dữ kiện cần đối chiếu. Không vẽ giờ/ngày mặc định nếu phản hồi AI thiếu. |
| 16–18 | Sáu dạng đề; bảng tab / chấm phẩy / Markdown, ánh xạ cột và xem hàng; giờ số hoặc HH:mm, hỗ trợ +1d; không tự nhập mốc trùng hay giờ tương đối chưa được quy đổi; xác nhận cách hiểu qua ngày. Khung sản đồ vẫn giới hạn 24 giờ. |
| 19–20 | `provenance` được kiểm tra và giữ qua nhập/xuất; lớp đánh dấu nguồn khi xem trước; sửa tay cập nhật nguồn; thử phương án khác thêm ca trong Soạn đề hoặc tạo hồ sơ Theo dõi riêng, giữ hồ sơ gốc. |
| 21–23 | Một khung nhập chủ đạo với Mô tả đề / Dán bảng / Mở tệp; ảnh SVG từ bộ vẽ thật; bốn ví dụ chỉ điền nội dung, không tự chạy. |
| 24–26 | Bốn sản phẩm gần nhất có ảnh và ngày sửa; mẫu theo nhu cầu Soạn đề / Theo dõi / Trình chiếu / Bản in; luồng ba bước có thể quay lại và giữ nội dung. |
| 27–30 | Nội dung của ca cho cả hai chế độ; tối đa 12 bộ thiết lập cá nhân chỉ chứa thiết kế và cấu hình xuất; xanh ngọc/nền trung tính; trợ giúp tại kiểu thế, nhập phản hồi và xuất bản in. Menu Quản lý ca có lối về thư viện trên màn hình nhỏ. |

## Kiểm chứng

- `node verify.cjs`: 812 kiểm tra dữ liệu, đồ họa và xuất tệp.
- `node verify-ai-workflow.cjs`: đặc tả prompt; sửa lỗi tại ô; đối chiếu nguồn; đánh dấu xóa trên hình; chặn/khôi phục sửa trình bày; xác nhận qua ngày; nhập chọn lọc và hoàn tác; bảng trùng/giờ tương đối; bộ thiết lập; ca gần đây; giữ phiên; tạo hồ sơ phương án khác, giữ bản gốc.
- `node verify-ai-studio.cjs`: clipboard/popup, phản hồi lỗi, nhiều ca, tên trùng, thêm/thay ca, bảo vệ thao tác bất đồng bộ, 24 tổ hợp bước/theme/viewport và 4 bố cục trang chủ/Theo dõi.
- `node verify-boot.cjs`: khởi động và tải thư viện chậm/lỗi.
- Giao diện mới được kiểm tra 320, 390, 768 và 1440 px, sáng/tối; xem ảnh thực tế sau khi chạy.
- `AI_WORKFLOW.html`: sơ đồ tự chứa về luồng dữ liệu; qua self-check của skill diagram-design.

Các phản hồi AI trong kiểm thử là dữ liệu giả lập; không gọi dịch vụ AI thật. Các script cũ `verify-library.cjs` và `verify-clinical.cjs` còn selector từ giao diện cũ (SVG là nút riêng, radio Theo dõi); cần cập nhật nếu chạy toàn bộ kho kiểm thử. Những phần đầu của kiểm thử thư viện (tạo, lưu, tải lại, bản sao độc lập, tìm/sắp xếp) đã chạy qua trước selector cũ.
