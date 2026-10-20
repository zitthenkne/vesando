# Đợt nâng cấp 4 — bố cục theo vai trò, lập sản đồ bằng AI, mũi tên chú thích

Ngày thực hiện: 20/10/2026. Cách xuất SVG/PNG/PDF giữ nguyên; JSON có thêm trường tùy chọn `events`, dữ liệu cũ vẫn đọc được.

## Bố cục và thao tác

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 1 | Thanh Ghi nhanh / Vừa màn hình thành hàng riêng phía trên giấy | Không còn che phần đầu phiếu ("Tự gọn theo dữ liệu", thông tin sản phụ). |
| 2 | Nút đầu trang xếp theo vai trò | Tiện ích: Tìm → Hướng dẫn → Tùy biến → ⋯. Thao tác chính bên phải: Lập sản đồ bằng AI → Xuất sản đồ. |
| 3 | Ô Tìm thao tác có chữ và Ctrl K từ 1280 px | Màn hẹp hơn giữ nút kính lúp. |
| 4 | Menu ca trên tên ca | Ca mới, Thư viện ca, Nhân bản ca này, Mở trong Theo dõi, Bỏ ca này. Ở Theo dõi: Lưu/Mở phiên JSON. |
| 5 | ⋯ không lặp lại nút đã có trên màn rộng | Từ 761 px ẩn Tìm thao tác và các mục của menu ca; từ 1101 px ẩn Hướng dẫn sử dụng. Điện thoại giữ đủ. |
| 6 | Menu ⋯ và menu ca tự đóng khi bấm ra ngoài | Escape cũng đóng và trả focus về nút mở. |
| 7 | Hoàn tác / Làm lại trên thanh sản đồ | Hiện khi có thay đổi, kể cả lúc bảng công cụ đang đóng. Theo dõi chỉ có Hoàn tác. |
| 8 | Bảng Dữ liệu: sửa điểm trước, tùy chọn sau | Ô "Khi kéo điểm" chuyển xuống dưới phần điểm đang chọn. |
| 9 | Thanh công cụ có nhãn mặc định | Xem, Dữ liệu, Thiết kế, Rà soát, Xuất đề, Tập trung. Có thể tắt trong Tùy biến (Ctrl ,). |
| 10 | Tab Thiết kế có tên dưới biểu tượng | Kích thước, Khung & hàng, Kiểu thế, Nét vẽ, Mẫu & chuẩn; tự xuống hàng khi bảng hẹp. |
| 11 | Điện thoại: nút rõ chữ | Nút AI và nút Xuất có chữ; ô chế độ đủ rộng cho "Theo dõi". Dưới 360 px ẩn nút Tùy biến (vẫn có trong ⋯). |
| 12 | Giao diện tối: chữ nút Xuất màu trắng | Đủ tương phản trên nền xanh. |

## Lập sản đồ bằng AI

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 13 | Nút **Lập sản đồ bằng AI** nổi bật trên thanh trên | Thay cho "Nhập JSON"; cùng lệnh trong Ctrl K. |
| 14 | Hộp thoại hai bước | **Bước 1 · Soạn prompt** mở mặc định; **Bước 2 · Nhập kết quả** để dán phản hồi, xem trước và vẽ. |
| 15 | Chọn tác vụ dạng thẻ | Chuyển đổi đề bài (1 ca) hoặc Tạo tình huống mới (3 ca theo chủ đề). |
| 16 | Hướng dẫn 4 bước và mục "Lưu ý để kết quả chính xác" | Hiển thị ngay dưới nút Sao chép prompt; có liên kết mở ChatGPT, Gemini, Claude. |
| 17 | Nhận toàn bộ phản hồi của AI | Không cần tách khối JSON; ứng dụng tự nhận diện. |
| 18 | **Yêu cầu AI sửa lỗi** | Khi dữ liệu báo lỗi, sao chép sẵn yêu cầu sửa (thông báo lỗi + quy tắc + dữ liệu hiện tại) để gửi lại AI. |
| 19 | Prompt nâng cấp | Vai trò; cách đọc đề từng bước (quy đổi giờ có ví dụ, làm tròn 0,5 giờ, gộp mốc trùng); từ điển trường có đơn vị và miền giá trị; quy tắc khi tạo ca mới (tần suất ghi theo WHO, không đưa đáp án); danh sách tự kiểm tra; trả lời đúng hai phần với một khối JSON duy nhất. |

## Mũi tên chú thích

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 20 | Huy hiệu số bo tròn có mũi tên ngắn chỉ xuống mốc giờ | Nằm trong dải trống giữa hàng Chồng khớp và biểu đồ CTC, không đè lên đường biểu diễn. Nhãn đặt cạnh huy hiệu khi đủ chỗ (ưu tiên bên phải, sau đó bên trái); khi quá sát, chỉ hiện số. Các mốc cách nhau dưới 15 phút gộp chung một huy hiệu (ví dụ "2·3"). Bấm huy hiệu để sửa đúng mũi tên đó. Có trong bản xem trước và mọi tệp xuất. |
| 21 | Thêm/sửa/xóa trong bảng Dữ liệu | Mục **Mũi tên chú thích**: chọn thời điểm (bước 15 phút), nhập nội dung (có gợi ý: Chọc ối, Bắt đầu oxytocin…). Ghi nhanh → Mũi tên chú thích mở thẳng ô nhập. |
| 22 | Dùng chung lịch sử hoàn tác | Thêm, sửa, xóa mũi tên đều hoàn tác/làm lại được. |
| 23 | Trường JSON `events` | `[{"time": 2.5, "label": "Chọc ối"}]`; `time` là giờ tính từ `startTime` (làm tròn 15 phút) hoặc giờ đồng hồ `"HH:mm"`; `label` tối đa 60 ký tự; tối đa 30 mũi tên. Prompt hướng dẫn AI tự ghi các can thiệp vào `events`. |

## Ca mẫu mở đầu

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 24 | Ca "Chuyển dạ tiến triển thuận lợi" minh họa đầy đủ khả năng hiển thị | 4 mũi tên chú thích (nhập phòng sinh, gây tê ngoài màng cứng, bấm ối, CTC mở trọn); hình kiểu thế xoay dần từ chẩm chậu trái ngang đến chẩm vệ; ngôi và kiểu thế ở đầu phiếu; thuốc và dịch truyền kèm bảng chi tiết; nước tiểu, acetone, chồng khớp. Diễn biến và đề bài thống nhất với số liệu; các số đo cũ giữ nguyên. |
| 25 | Chú giải trên phiếu có mục "Chú thích sự kiện" | Liệt kê đủ số, giờ và nội dung mọi mũi tên theo hai cột; chỉ hiện khi ca có mũi tên. |
| 26 | Dòng "Ngôi · Kiểu thế" chuyển xuống dưới tên ca | Không còn chạm nhãn trục tim thai. |

## Hướng dẫn trong ứng dụng

Đã đồng bộ, xem phần cuối `ONBOARDING.md`: 39 bước. Có bước Quản lý ca, hướng dẫn Lập sản đồ bằng AI theo hai bước, bước Mũi tên chú thích, câu hỏi "Hoàn tác thay đổi?". Câu chữ dùng giọng trang trọng.

## Kiểm tra

- `verify-ui.cjs`: lối vào Thư viện ca trên desktop đổi sang menu ca.
- `verify-upgrade.cjs`, `verify-inline.cjs`: tên nút và bước mới của hộp thoại AI; chọn tác vụ bằng thẻ.
- `verify-guides.cjs`: 39 bước, bộ đếm Bắt đầu `/ 7`.
- Đã thử phản hồi AI mô phỏng (tóm tắt + khối JSON có `events`, giờ dạng `"10:15"`), yêu cầu sửa lỗi, và giữ `events` qua sửa ô, kéo điểm, nhập bảng, nhân bản, mở Theo dõi.
- Đã xem ảnh 320/360/390/768/1024/1280/1440 px, sáng/tối, Soạn đề/Theo dõi.
