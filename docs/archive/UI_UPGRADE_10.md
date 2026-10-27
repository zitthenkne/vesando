# Đợt 10 — Không gian sáng tạo và 27 nâng cấp

Trang mở đầu là thư viện sản phẩm, với **Soạn đề** và **Theo dõi** lưu riêng. Từ một sản phẩm, thanh sáng tạo dẫn thẳng tới **Lớp & nét**, **Bàn dữ liệu**, **Phiên bản**, **Học nhanh** và **Không gian**. Các chức năng dưới đây dùng được trong cả hai chế độ.

| # | Nâng cấp | Nơi dùng / hành vi |
| --- | --- | --- |
| 1 | Giao diện mềm, thoáng hơn | Thẻ sản phẩm, bảng công cụ, nền bàn làm việc và khoảng cách được thiết kế lại; có giao diện sáng/tối. |
| 2 | Ba sắc thái không gian | **Không gian** → Sương bạc hà, Giấy ấm hoặc Tím sương; nhớ lựa chọn trên trình duyệt. |
| 3 | Điều chỉnh cỡ chữ | **Không gian** → 90%, 100%, 110%, 120% cho các thành phần giao diện hỗ trợ; không làm đổi kích thước sản đồ xuất ra. |
| 4 | Thanh sáng tạo dễ tìm | Các nhóm công cụ mới có biểu tượng và tên ngay phía trên sản đồ; bảng công cụ thích ứng màn hình nhỏ. |
| 5 | Dải lướt thời gian | Kéo dải giờ để xem đúng mốc, có dấu mốc đã ghi và giá trị CTC, tim thai, đầu tại thời điểm đó. |
| 6 | Phát lại diễn biến | Nút phát đi qua những mốc đã có; chọn tốc độ chậm/vừa/nhanh. Không thêm hoặc nội suy số đo. |
| 7 | Quản lý vùng hiển thị | **Lớp & nét** → ẩn/hiện các vùng phụ; dữ liệu vẫn được giữ. Vùng tiến triển chính luôn có mặt. |
| 8 | Tập trung một vùng | Nút tâm ngắm ưu tiên vùng đang cần xem; **Hiện tất cả** đưa các vùng trở lại. |
| 9 | Khóa sửa từng đường | Khóa CTC, tim thai, đầu, mạch hoặc cơn co để chặn chỉnh trực tiếp và nhập hàng loạt vào đường đó. |
| 10 | Chỉnh nhiều đường cùng lúc | Chọn nhiều đường rồi áp dụng màu, độ dày, cỡ ký hiệu và kiểu nét trong một lần. |
| 11 | Sao chép kiểu đường | **Nhớ kiểu đường đầu** rồi **Dán kiểu đã nhớ** cho các đường được chọn. |
| 12 | Đặt tên hàng | Mở **Tên hàng, tiêu đề & dấu bản thảo** trong Lớp & nét; sửa nhãn các hàng được hỗ trợ. |
| 13 | Căn tiêu đề | Chọn trái, giữa hoặc phải cho đầu phiếu dạng ô trong **Tên hàng, tiêu đề & dấu bản thảo**; vùng bấm sửa đi theo tiêu đề. |
| 14 | Dấu bản thảo | Thêm chữ mờ trên sản đồ; xuất cùng SVG, PNG và PDF. |
| 15 | Dời một khoảng dữ liệu | **Bàn dữ liệu** → chọn từ/đến giờ và độ dời; dời cả mốc và chú thích trong khoảng. Từ chối toàn bộ nếu trùng mốc hoặc vượt giới hạn. |
| 16 | Xóa riêng một thông số | Chọn khoảng giờ và thông số cần xóa; các số đo khác giữ nguyên. Có hoàn tác. |
| 17 | Dán bảng Excel/TSV | Dán hàng tiêu đề và dữ liệu, kiểm tra, xem trước rồi áp dụng cả bảng. Ô trống giữ số hiện có; dữ liệu đổi sau khi xem trước thì phải xem trước lại. |
| 18 | Xuất dữ liệu CSV | **Bàn dữ liệu** → tải bảng số liệu thực; chuỗi có nguy cơ bị Excel hiểu thành công thức được trung hòa. |
| 19 | Phiên bản có tên | **Phiên bản** → đặt tên và giữ tối đa 8 bản gần nhất cho từng sản phẩm. |
| 20 | So sánh và khôi phục | Xem hai hình cạnh nhau và số ô dữ liệu khác nhau; tự giữ bản đang mở trước khi khôi phục. |
| 21 | Ghim sản phẩm | Biểu tượng ghim trên thẻ; bộ lọc **Đã ghim** và ưu tiên sản phẩm ghim trong danh sách. |
| 22 | Nhãn và bộ lọc | Nút sắp xếp trên thẻ → tối đa 6 nhãn; tìm theo nhãn hoặc dùng bộ lọc. |
| 23 | Đổi tên tại thư viện | Nút sắp xếp → đặt tên mà không cần mở trình soạn thảo. |
| 24 | Lưu trữ và khôi phục | Chuyển sản phẩm khỏi danh sách đang làm; mở **Lưu trữ** để đưa trở lại. |
| 25 | Sao lưu cả hai thư viện | **Không gian** → xuất/nhập tệp JSON chứa sản phẩm và nhãn. Nhập tạo bản sao với ID mới và giữ sản phẩm đang có. |
| 26 | Khu thực hành độc lập | **Học nhanh** → kéo điểm bằng chuột/cảm ứng, nhập giá trị minh họa rồi lưu vào hình, thử đổi nét và đặt lại. Không sửa hồ sơ đang mở. |
| 27 | Hướng dẫn bằng hình | Danh mục khóa học có hình, thời lượng ước tính, lối vào thực hành; từng bước tour có minh họa và dẫn tới công cụ thật. Giữ 7 khóa / 39 bước sẵn có. |

## Thử nhanh

1. Từ trang đầu, chọn **Bắt đầu từ ca mẫu** hoặc mở sản phẩm đã làm.
2. Mở **Lớp & nét**, chọn hai đường rồi đổi màu; thử khóa một đường trước khi kéo điểm.
3. Mở **Phiên bản**, giữ một bản trước khi thay đổi dữ liệu.
4. Mở **Bàn dữ liệu**, dán bảng có tiêu đề `time`, `cervix`, `fhr` phân cách bằng Tab; xem trước rồi áp dụng. `time` nhận số giờ từ đầu hoặc `HH:mm`, theo bước 30 phút trong khoảng 0–24 giờ.
5. Mở **Học nhanh** để thử thao tác trên hình minh họa; trở về thư viện để ghim hoặc gắn nhãn sản phẩm.

## Lưu trữ và giới hạn

- Sản phẩm, tùy chọn và phiên bản lưu trong bộ nhớ trình duyệt. Không có đồng bộ tài khoản trong đợt này.
- Bản sao hai thư viện mang theo sản phẩm và nhãn; lịch sử phiên bản vẫn ở riêng trên trình duyệt hiện tại. Giao diện sao lưu có giải thích giới hạn này.
- Khi bộ nhớ hỏng hoặc đầy, ứng dụng báo lỗi và giữ bản lưu cũ. Nhập thư viện kiểm tra toàn bộ trước khi ghi, có khôi phục dữ liệu cũ nếu ghi thất bại.
- Không thêm dependency. Các công cụ mới dùng bộ kiểm tra dữ liệu, lịch sử hoàn tác và cơ chế xuất hiện có.

## Kiểm chứng

Chạy Chrome tự động bằng Playwright có sẵn trong môi trường:

```powershell
node verify.cjs
$env:PLAYWRIGHT_MODULE='C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node verify-library.cjs
node verify-studio-plus.cjs
node --check enhancements.js
git diff --check
```

- `verify.cjs`: **812 kiểm tra đạt**, gồm dữ liệu, hình học và xuất sản đồ.
- `verify-library.cjs`: đạt các luồng tạo/mở/tự lưu/nhân bản/tìm/lọc của hai thư viện, giữ bản nháp, nhập JSON, chuyển dữ liệu cũ, bộ nhớ lỗi/đầy và hai tab cùng dùng thư viện; kiểm tra **20 bố cục** thư viện/trình soạn thảo.
- `verify-studio-plus.cjs`: đạt các nhóm lớp/khóa/kiểu/chữ, thời gian, sửa khoảng, TSV/CSV, phiên bản, tổ chức thư viện, sao lưu và hướng dẫn. Có tải **PNG/PDF thật** rồi kiểm tra chữ ký và kích thước tệp.
- **80 bố cục bảng nâng cao**: 5 bảng × 4 độ rộng (320, 390, 768, 1440 px) × sáng/tối × cỡ chữ 100%/120%. Không tràn ngang, không có lỗi runtime; kiểm tra vùng chạm trên màn hình nhỏ.
- Đã thử kéo điểm bằng chuột và sự kiện cảm ứng mô phỏng trong khu thực hành; nhập giá trị minh họa không làm đổi ca đang mở. Bộ nhớ tùy chọn/lịch sử bị hỏng được giữ nguyên thay vì ghi đè.
- Kiểm tra syntax JavaScript và `git diff --check` đạt.

Đã rà ảnh giao diện thực tế ở màn hình lớn và nhỏ. Chưa kiểm tra trên điện thoại vật lý hoặc tại phòng sanh. Bản thay đổi nằm trong workspace, chưa triển khai lên website.
