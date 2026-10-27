# Theo dõi: nhập theo mốc, nhận định và làm việc với AI

Mục tiêu: giữ sản đồ là vùng làm việc chính, đưa hành động đến gần dữ liệu và tách rõ số liệu đã ghi với bản nháp.

## 28 thay đổi về giao diện và thao tác

| # | Thay đổi | Cách sử dụng |
|---|---|---|
| 1 | Hồ sơ sản phụ gọn, có tên ngay trên thanh tóm tắt | Mở Thông tin hành chính khi cần chỉnh. |
| 2 | Cảnh báo có tóm tắt ngắn và vùng đọc có giới hạn chiều cao | Không đẩy sản đồ xuống nhiều màn hình khi có nhiều lý do. |
| 3 | Một thanh chọn mốc chung cho biểu đồ và form | Đổi giờ một lần, các vùng nhập và số đo cùng chuyển mốc. |
| 4 | Nút đi tới mốc đã ghi trước/sau | Bỏ qua khoảng giờ chưa có mốc; nút vô hiệu ở hai đầu. |
| 5 | Dải mốc theo dõi cuộn ngang | Mỗi mốc có giờ thực và thông số đã ghi. |
| 6 | Trạng thái riêng cho mốc trống, mốc đã ghi và mốc có bản nháp | Không đánh đồng một mốc trống với dữ liệu đã đo. |
| 7 | Sáu số đo có thể bấm để nhập | Chạm huyết áp sẽ mở đúng nhóm và focus HA tâm thu. |
| 8 | Chênh lệch số đo so với mốc trước | Chỉ tính khi cả hai mốc đều có giá trị; không nội suy dữ liệu thiếu. |
| 9 | Hướng dẫn khởi đầu chỉ hiện khi chưa có số liệu | Có đường vào nhập tay hoặc nhập qua AI. |
| 10 | Một nút Ghi mốc chính bên cạnh dữ liệu | Bỏ menu Ghi nhanh trùng chức năng trên thanh sản đồ của Theo dõi. |
| 11 | Các trường bổ sung chia thành ba nhóm gập/mở | Thai & ối; Huyết áp, nhiệt độ & nước tiểu; Thuốc, dịch & chăm sóc. |
| 12 | Mỗi nhóm cho biết số mục đã nhập | Đếm dữ liệu đang có; không coi số mục là tiêu chuẩn hoàn tất khám. |
| 13 | Ghi & mốc tiếp | Ghi mốc hiện tại rồi chuyển sang ô thời gian kế; không tự tạo số liệu hoặc mốc đã ghi. |
| 14 | Thanh ghi nhận bám cuối form | Hai nút xếp dọc trên điện thoại, có vùng chừa khi cuộn tới ô nhập. |
| 15 | Các mốc có bản nháp hiện thành nút giờ | Chạm để quay đúng bản nhập dở; có thể hủy và hoàn tác. |
| 16 | Công tắc Cảnh báo tự động | Lưu tùy chọn trên thiết bị; tắt nhấn cảnh báo ở vùng theo dõi, vẫn xem nhận định thủ công. |
| 17 | Công tắc Nhắc đánh giá CTC độc lập | Có thể tắt nhắc lịch mà vẫn bật cảnh báo thông số. |
| 18 | Một menu chuông gom hai tùy chọn cảnh báo | Không đặt thêm hàng công tắc thường trực. |
| 19 | Công cụ Rà soát đổi thành Đọc sản đồ trong Theo dõi | Mở bảng chuyên đọc diễn biến; Soạn đề giữ luồng rà soát cũ. |
| 20 | Nhận định chia Dấu hiệu / Cần bổ sung / Prompt AI | Hiện rõ mốc dùng để nhận định; dấu hiệu ưu tiên xuất hiện trước. |
| 21 | Mỗi dấu hiệu có nguồn, giờ và đường quay tới dữ kiện | Mở đúng mốc và ô nhập để kiểm tra lại. |
| 22 | Danh sách thông tin còn thiếu có thể bấm để nhập | Không lấy số đo cũ làm số đo hiện tại. |
| 23 | Nhánh đánh giá theo dạng sản đồ và bản tóm tắt có thể sao chép | Tái sử dụng nội dung UMP đã đối chiếu; không tự kết luận chẩn đoán. |
| 24 | Prompt phân tích từ số liệu đã ghi | Bỏ tên, mã, ID, tiêu đề gốc và ghi chú tự do cấp ca; có bản xem trước để kiểm tra phần văn bản còn lại. |
| 25 | Dán đề nhanh và tải prompt thành .txt | Dùng clipboard hoặc tệp để chuyển prompt sang công cụ AI. |
| 26 | Tự lưu đề bài là tùy chọn chủ động | Mặc định chỉ giữ trong phiên; tắt sẽ xóa bản lưu đề bài trên thiết bị. |
| 27 | Chọn đích nhận kết quả AI | Soạn đề nhận các ca; Theo dõi nhận ca đang xem trước, giữ các ca đang soạn. |
| 28 | Bảo vệ bản nháp và hoàn tác khi nhập AI | Chặn nhập khi còn bản nhập dở; hoàn tác khôi phục hồ sơ và mốc đã chọn trước khi nhập. |

## Những sửa lỗi kèm theo

- Vue theo dõi cả khóa bản nháp chưa tồn tại: nhập ô thứ hai và các ô sau cập nhật đúng.
- Dữ liệu dạng chữ/lựa chọn không bị ép thành số khi ghi nhận hoặc áp dụng rồi xuất.
- Nhập thông số khác không xóa các ô cơn co chi tiết đã có.
- Chỉ báo đã sao chép prompt xuất hiện sau khi clipboard thành công.
- Quay lại Xem sau Bảng thông số vẫn hiện hồ sơ sản đồ.
- Trạng thái lưu trên máy nằm trong tiêu đề phiên để không làm tràn thanh nút trên tablet.

## Phạm vi cảnh báo

Các công tắc điều khiển hiển thị cảnh báo và nhắc lịch trong giao diện. Chúng không sửa số liệu, ngưỡng đối chiếu hoặc các đường tham chiếu của bản vẽ. Nhận định là gợi ý cần kiểm chứng từ các quy tắc hiện có, không phải chẩn đoán hoặc y lệnh. Prompt được sao chép hoặc tải để người dùng gửi; ứng dụng không tự gửi dữ liệu tới dịch vụ AI.

Nguồn LCG được đối chiếu với [biểu mẫu WHO](https://cdn.who.int/media/docs/default-source/reproductive-health/maternal-health/who-labour-care-guide.pdf) và [User’s manual](https://www.who.int/publications/i/item/9789240017566). Quy tắc mô hình lịch sử và nguồn UMP giữ theo [CLINICAL_REFERENCES.md](CLINICAL_REFERENCES.md). Việc phân biệt mô hình lịch sử với đánh giá hiện hành dựa trên [giải thích của WHO](https://www.who.int/news/item/15-02-2018-individualized-supportive-care-key-to-positive-childbirth-experience-says-who).

## Kiểm tra

- `node verify.cjs`: hình học, dữ liệu, cảnh báo và xuất sản đồ.
- `node verify-clinical.cjs`: nhập nhiều trường và kiểu dữ liệu, điều hướng mốc, bật/tắt cảnh báo, nhận định thủ công, clipboard, prompt .txt, lưu tùy chọn, đích nhập AI, bản nháp, hoàn tác và xuất SVG; 50 tổ hợp bố cục.
- `node verify-ui.cjs`: các luồng chỉnh điểm, thiết kế, xuất, phản hồi hành động và 120 bố cục điều khiển.
- `node verify-refresh.cjs`: quy trình AI, bản nháp chủ động và thao tác trên điện thoại.
- `node verify-guides.cjs`: các hướng dẫn dùng đúng giao diện đang chạy.

Các bài kiểm tra trình duyệt dùng `PLAYWRIGHT_MODULE` và tùy chọn `CHROME_EXECUTABLE` như các phiên trước; không thêm dependency.

Kết quả kiểm tra trong phiên triển khai: 804 kiểm tra lõi; 50 bố cục Theo dõi; 120 bố cục điều khiển; 160 tổ hợp không gian làm việc; 39 bước hướng dẫn đều đạt. Lighthouse snapshot ở trạng thái Nhận định trên màn hình nhỏ: 31 audit đạt, không có audit thất bại; Accessibility, Best Practices, SEO và Agentic Browsing đều 100. Lượt Lighthouse này không đo Performance.


## Đợt tinh gọn và sửa lưu trên máy

- Đóng bảng công cụ, Xong và Esc đều thoát chế độ thêm điểm. Trên điện thoại, nút gọi lại bảng nổi có nút × riêng để tắt hẳn.
- Thanh sửa điểm chỉ còn tăng/giảm, nhập số, menu thêm và đóng. Dời giờ, chép điểm, xóa và đổi kiểu nằm trong menu; không hiện đồng thời với form bên cạnh. Thu phóng/vẽ lại không làm thanh đã đóng bật lên.
- Đóng bảng vẫn giữ ô nhập điểm đang sửa. Không biến thao tác đóng thành thao tác lưu hoặc xóa.
- Hồ sơ thành dải tóm tắt; số đo và các mốc nằm trong mục gập mặc định. Các nhãn chính là Nhập / Sửa, Trình bày, Kiểm tra hoặc Đọc sản đồ, Lưu / Xuất.
- Lưu / Xuất chia thành lưu trên máy, xuất ảnh/PDF và gửi JSON để kiểm tra. Mở phần lưu không bày cả các thiết lập xuất. Nhãn thanh dưới được xuống dòng trên màn hình hẹp.
- Lưu phiên trên trình duyệt gồm ca đang soạn, hồ sơ Theo dõi, thiết kế, bản nháp hợp lệ và mốc đang chọn. Lưu lần đầu hoặc bật tự lưu là hành động chủ động; mặc định không tự ghi hồ sơ.
- Có bản mới nhất và một bản dự phòng, mở lại, khôi phục và hoàn tác việc mở bản khác. Có thể tải/mở tệp JSON toàn phiên để chuyển máy hoặc giữ thêm bản sao ngoài trình duyệt.
- Ô đang sửa chưa lưu và bản nháp không hợp lệ không được ghi đè bản lưu tốt. Lỗi hết bộ nhớ hoặc tệp hỏng có thông báo; bản cũ vẫn được giữ. Bản lưu mới nhất hỏng không tự ghi đè bản dự phòng.
- Xóa bản lưu cần xác nhận tại chỗ, chỉ xóa các khóa lưu phiên của ứng dụng; phiên đang mở và các tùy chọn khác giữ nguyên.

Bản lưu dùng localStorage của đúng trình duyệt và địa chỉ web đang mở, không phải tệp tự đồng bộ vào thư mục máy. Xóa dữ liệu trình duyệt sẽ làm mất bản lưu này; dùng Tải tệp bản sao để giữ thêm tệp riêng. Tự lưu không đồng nghĩa với ghi nhận bản nháp lên sản đồ.

`verify-comfort.cjs` kiểm tra đóng công cụ ở desktop/mobile; giữ ô nhập; lưu, tải lại, tự lưu và bản dự phòng; hết bộ nhớ; tệp hỏng; bản nháp soạn đề; khôi phục/hoàn tác; xóa có xác nhận và giữ dữ liệu ngoài phạm vi; 4 cỡ màn hình × 2 giao diện sáng/tối.


Kiểm tra đợt tinh gọn: `verify.cjs` đạt 804 kiểm tra; `verify-comfort.cjs`, `verify-clinical.cjs`, `verify-ui.cjs`, `verify-workspace.cjs`, `verify-refresh.cjs`, `verify-upgrade.cjs`, `verify-inline.cjs`, `verify-adjustments.cjs` và `verify-guides.cjs` đều đạt. Đã xem ảnh thực tế trên desktop và điện thoại. Lighthouse snapshot tại mục Lưu trên máy, màn hình 320 px: 32 audit đạt, 0 thất bại; Accessibility, Best Practices, SEO và Agentic Browsing đều 100; không đo Performance.
