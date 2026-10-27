# Đợt nâng cấp 3 — bản vẽ và bản xuất đồng nhất

Ngày thực hiện: 17/10/2026. Giữ công cụ chỉnh sửa bên phải, bổ sung các nhóm thu gọn theo ngữ cảnh.

## 32 thay đổi

| # | Thay đổi | Cách sử dụng / kết quả |
|---|---|---|
| 1 | Khôi phục Nhập JSON thành thao tác chính trên đầu trang | Luôn truy cập được ở desktop và điện thoại; có thêm trong Ctrl K. |
| 2 | Không gian nhập JSON riêng | Ô nhập và sản đồ cạnh nhau trên desktop, xếp dọc trên điện thoại. |
| 3 | Xem trước JSON trực tiếp | JSON hợp lệ mới dựng hình; dữ liệu ca hiện tại chưa bị thay đổi. |
| 4 | Xem trước từng ca trong một lần nhập | Chọn giữa 1–12 ca trước khi áp dụng toàn bộ. |
| 5 | Mở tệp JSON, TXT hoặc Markdown trong luồng soạn đề | Giới hạn 2 MB; dùng chung bộ kiểm tra với thao tác dán. |
| 6 | Định dạng và chuẩn hóa JSON | Sắp xếp hiển thị dễ đọc; chuyển mã ối Việt sang dữ liệu WHO nội bộ. |
| 7 | Kiểm tra tức thì trước khi vẽ | Hiện số ca, số mốc, lỗi dữ liệu; khóa Vẽ khi chưa hợp lệ. |
| 8 | Khai báo mã ối của JSON | Chọn WHO hoặc Việt; không tự đoán ý nghĩa chữ C. |
| 9 | Trình soạn prompt từ đề bài | Nhập nguyên đề; prompt hoàn chỉnh thay placeholder bằng nội dung thật. |
| 10 | Trình soạn prompt tạo ba tình huống | Nhập chủ đề và chuyển mục công việc trong tab Prompt AI. |
| 11 | Đọc, chọn và sao chép toàn bộ prompt | Nút Sao chép có trạng thái; sửa nội dung sẽ bỏ xác nhận sao chép cũ. |
| 12 | Chuyển liền mạch từ prompt về JSON | Nút Dán JSON kết quả đưa về đúng ô nhập; mở lại vẫn giữ văn bản trong phiên. |
| 13 | Bảo toàn số đang gõ khi chuyển công cụ | Điểm hợp lệ được ghi trước khi chuyển; điểm sai giữ lại và mở chỗ sửa. |
| 14 | Áp dụng & tải trong một thao tác | Bản nháp biểu mẫu được kiểm tra, áp dụng rồi xuất đúng dữ liệu mới. |
| 15 | Xuất đồng thời các mốc nhập nhanh | Các bản nháp Theo dõi được kiểm tra cùng nhau, ghi trong một bước lịch sử. |
| 16 | Chụp dữ liệu và thiết kế nhất quán khi xuất | SVG, PNG, PDF và ảnh sao chép dùng cấu hình đã chốt cho lượt xuất. |
| 17 | Chú giải và đề bài hiện ngay khi thiết kế | Cùng tùy chọn với bản xuất; không còn chỉ xuất hiện sau khi tải tệp. |
| 18 | Tên tệp tự đặt | Giữ tên mặc định khi để trống; lọc ký tự không phù hợp, thêm đuôi theo định dạng. |
| 19 | Chọn khổ và hướng giấy PDF | A4/A3; dọc/ngang/tự động. |
| 20 | Chọn cách phân trang và lề PDF | Vừa một trang, nhiều trang theo chiều rộng hoặc tự động; ba mức lề. |
| 21 | Bộ xuất theo mục đích | Word, In A4, Slide đặt nhanh định dạng, độ phân giải và màu in. |
| 22 | Thư viện thiết kế cá nhân | Lưu tối đa 12 mẫu trên trình duyệt; hình nhỏ thể hiện màu đường của mẫu. |
| 23 | Quản lý mẫu | Áp dụng, đổi tên, xóa và hoàn tác xóa; có xử lý lỗi lưu trữ. |
| 24 | Chuyển mẫu thiết kế giữa máy | Nhập/xuất JSON chỉ chứa các thuộc tính thiết kế được cho phép. |
| 25 | Ba bảng màu có sẵn | Lâm sàng, Dễ phân biệt, Mực xanh; vẫn giữ tùy chỉnh từng đường. |
| 26 | Màu và độ rõ của lưới | Color picker và thanh kéo, cập nhật ngay trên bản vẽ và tệp xuất. |
| 27 | Kiểu chữ và nhãn số | Chọn Arial/Times New Roman; bật số cạnh điểm CTC, đầu trên vệ, tim thai. |
| 28 | Thông tin và trục giờ linh hoạt | Ẩn mã/họ tên ở đầu phiếu; chọn nhãn giờ mỗi 30 phút/1 giờ/2 giờ; bật/tắt nền tham chiếu tim thai. |
| 29 | Tìm tùy chỉnh ngay trong inspector | Tìm không dấu, Enter để tới đúng nhóm, mở mục thu gọn và focus ô cần chỉnh. |
| 30 | Duyệt mốc bằng thanh trượt và hình diễn biến | Xem nhanh CTC, đầu trên vệ, tim thai; mở biểu mẫu đúng mốc từ bên phải. |
| 31 | Bảng phím tắt riêng | Nhấn ? hoặc tìm Bảng phím tắt trong Ctrl K; có thao tác kéo, thu phóng và lưu. |
| 32 | Ký hiệu và thuật ngữ Việt | C/T/K/X mặc định; nút chọn ối trực tiếp; ngày dd/mm/yyyy; lần/phút; Chồng khớp; nhãn LCG dễ đọc. |

## Phạm vi dữ liệu

- JSON cũ tiếp tục đọc theo mã WHO. JSON mới dùng mã Việt và khai báo `fluidNotation: "vn"` trong từng ca; C = còn, T = trắng, K = khô, X = xanh. Các mức phân su và trường `headMarker` được giữ nguyên.
- Ẩn danh tác động mã và họ tên ở đầu phiếu. Nội dung tự do của đề bài vẫn do người soạn quản lý.
- Thư viện mẫu lưu thiết kế, màu và phạm vi hiển thị; không lưu hồ sơ sản phụ. Nhập tệp mẫu không thay đổi số đo.
- Bản xuất ở bước Xuất có cùng nội dung và hình học với tệp tải. Các vòng chọn, vùng bắt điểm và nút kéo không nằm trong tệp.

## Kiểm tra

- `node verify.cjs`: 780 kiểm tra đạt sau bổ sung sửa ô và JSON Việt.
- `node verify-ui.cjs`: kiểm tra thao tác, chuột/cảm ứng, undo, clipboard giả lập, tệp xuất thật và 120 tổ hợp bố cục.
- `node verify-workspace.cjs`: 160 tổ hợp responsive, tùy biến, giữ bản nháp và điều khiển bên phải.
- `node verify-upgrade.cjs`: nhập JSON đa ca/Markdown/tệp, chuyển mã ối, prompt, thư viện mẫu, xuất SVG khớp bản xem trước, PNG khớp từng pixel; PDF A3 ngang chứa cùng ảnh với PNG; số đang gõ, bản nháp biểu mẫu và nhiều mốc nhập nhanh; 5 kích thước JSON/Prompt.

Các kiểm tra browser dùng `PLAYWRIGHT_MODULE` và `CHROME_EXECUTABLE` như các đợt trước. Clipboard hệ điều hành được mô phỏng bằng promise để kiểm tra trạng thái; tệp SVG/PNG/PDF/JSON được tạo và đọc thật. Đã xem ảnh desktop, mobile, prompt và PNG tải xuống. Không có lỗi runtime/console trong các lượt kiểm tra đã qua.

Kết quả cuối ngày 17/10/2026: cả bốn lệnh trên đều **exit code 0**. Hai bộ hồi quy giữ đủ 120 + 160 tổ hợp bố cục; bộ mới kiểm tra thêm JSON/Prompt ở 320/390/768/1024/1440 px và nút chọn ối C/T trong biểu mẫu.

## Bổ sung: sửa ngay trên sản đồ

- Bấm trực tiếp ô ối, chồng khớp, nhiệt độ, đạm/acetone/nước tiểu, thuốc/dịch, oxytocin hoặc hàng bổ sung LCG. Các ô trống ở mốc hợp lệ cũng nhập được.
- Ký hiệu chọn một lần để ghi; số dùng Enter hoặc Lưu tại ô; văn bản nhiều dòng dùng Ctrl Enter. Xóa giá trị và Esc để hủy có sẵn trong hộp sửa.
- Bấm vùng mạch/huyết áp để sửa cả nhóm trong một lần kiểm tra. Bấm cột cơn co để sửa tần số và thời gian cơn; phần nâng cấp bên dưới chuyển sang chọn nguyên cột ở cả chế độ chọn và thêm.
- Nhấp đúp điểm CTC, đầu trên vệ hoặc tim thai để nhập số ngay cạnh điểm. Kéo điểm và bộ sửa bên phải vẫn sử dụng được.
- Mã/tên/Para/tuổi thai, ngày giờ bắt đầu, tên ca, đề bài và các ghi chú đang hiển thị cũng có vùng bấm riêng. Tên mô hình và thang đo là cấu trúc của biểu mẫu.
- Hộp sửa theo vị trí ô khi cuộn, mở trong màn hình điện thoại; dùng phím trái/phải để chuyển ô cùng hàng, Enter để sửa.
- Mọi lần lưu dùng `validateCase` và cùng lịch sử hoàn tác. Huyết áp sai, số ngoài giới hạn, dữ liệu cũ hoặc bản nháp nhập chung chưa xử lý không ghi đè âm thầm. Xuất sẽ ghi ô đang nhập hợp lệ trước khi chụp dữ liệu.
- Mẫu/prompt/JSON tải mới đều có mã ối Việt và `fluidNotation: "vn"`; JSON WHO cũ vẫn nhập được. Cấu hình hiển thị WHO cũ được chuyển sang Việt và lưu lại để lần mở sau không quay về tiếng Anh.

Kiểm tra bổ sung: `node verify-inline.cjs` dùng chuột, bàn phím và cảm ứng mô phỏng; kiểm tra tệp SVG tải thật, undo/redo, lỗi và giữ bản nháp, dòng ghi chú, ô trống, đầu phiếu, nhiều phân hệ và hai lần mở lại cấu hình cũ.

Kết quả cuối của phần bổ sung: **780 checks**, `verify-ui.cjs`, `verify-workspace.cjs`, `verify-upgrade.cjs`, `verify-inline.cjs` đều đạt, exit code 0. Kiểm tra mới còn bao gồm đóng một ca khác khi ô đang mở và mô phỏng vùng nhìn thấy thu nhỏ khi bật bàn phím điện thoại. Các mẫu thiết kế cũ giữ quy ước ngôn ngữ hiện tại khi áp dụng.

## Đợt tối ưu cơn co, huyết áp và thuốc

- [x] Thêm điều khiển tại ô phù hợp từng nhóm, giữ nguyên schema và kiểm tra dữ liệu.
- [x] Mở nhanh nhóm cần ghi, chọn mốc ngay trong hộp sửa; giữ bản nháp khi có lỗi.
- [x] Giúp ghi tên thuốc, liều, đơn vị và cách dùng; gộp nồng độ/tốc độ Oxytocin.
- [x] Kiểm tra thao tác thật, hoàn tác, bản xuất và màn hình điện thoại; chạy hồi quy.

Các thay đổi đã thực hiện:

- Hàng Oxytocin, Thuốc khác và Dịch truyền luôn hiện trong chế độ tự gọn, kể cả khi chưa có dữ liệu; bản rút gọn cũng giữ các hàng này và phần ghi thuốc đầy đủ. Lựa chọn ẩn chủ động trong chế độ nhóm tùy chọn vẫn áp dụng. Bản xuất dùng cùng quy tắc.
- Mỗi mốc cơn co có một vùng chọn nguyên cột gồm 5 ô, thay cho 5 nút đổi hoa văn. Cột được viền rõ; hộp chỉnh nằm bên cạnh khi đủ chỗ.
- Thanh cơn co trong hộp sửa hỗ trợ chạm, kéo chuột, kéo cảm ứng và bàn phím; các nút số và ô nhập vẫn có sẵn. Số trên 5 tiếp tục nhập được, sản đồ ghi số vượt mức phía trên cột.
- Xem trước cả cột ngay trên giấy khi đổi số cơn/thời gian; Hủy bỏ bản xem trước, Lưu ghi một lần vào lịch sử hoàn tác. 0 cơn bỏ thời gian co; thiếu số liệu giữ trống.
- Huyết áp nhập cả cặp, ví dụ 120/80, hoặc chỉnh từng số bằng bước 5 mmHg; mạch bước 1 lần/phút. Kiểm tra dữ liệu dùng chung chặn cặp sai và số ngoài giới hạn.
- Oxytocin mở chung nồng độ IU/L và tốc độ giọt/phút; nút tăng/giảm giữ số thập phân chính xác. Không tự điền số ban đầu hoặc quy đổi liều.
- Thuốc có bộ nhập tên, liều/lượng, đơn vị, cách dùng; thêm nhiều dòng và giữ nguyên ghi chú tự do. Dòng nhập theo từng mục có nút sửa riêng để đổi liều/cách dùng; các dòng khác được giữ nguyên.
- Ghi nhanh ở góc phải tờ sản đồ mở bốn nhóm; chọn mốc 0–24 giờ, lùi/tiến 30 phút ngay trong hộp sửa. Đổi mốc ghi bản nháp hợp lệ trước; dữ liệu sai giữ tại mốc cũ.
- Lấy nhóm số liệu từ mốc trước là thao tác chủ động, giữ cả ô trống của nguồn; không tự lặp dữ liệu. Thuốc đang soạn phải được xử lý trước khi dùng nhóm số liệu khác.
- Bản nháp bộ nhập thuốc được tính là dữ liệu chưa lưu: thao tác xuất sẽ ghi nội dung hợp lệ trước; thiếu tên hoặc quá 240 ký tự giữ nguyên để sửa.

Kiểm chứng cuối đợt: `node verify.cjs` đạt **795 checks**. Cả năm bộ `verify-ui.cjs`, `verify-workspace.cjs`, `verify-upgrade.cjs`, `verify-inline.cjs`, `verify-adjustments.cjs` đều exit code 0. Bộ mới kiểm tra chọn cột từ trên/dưới, kéo chuột/cảm ứng thật qua Chrome, thao tác bàn phím, xem trước SVG chưa lưu, Hủy/Hoàn tác, xuất khi cột đang chỉnh, nhóm thuốc trống trong bản thường/rút gọn, nhập cặp huyết áp, bộ nhập và sửa từng dòng thuốc, lỗi và giới hạn dữ liệu, cùng 320/390/768 px và vùng nhìn thu nhỏ khi bật bàn phím. Trên thiết bị cảm ứng, mở hộp sửa không tự focus ô nhập để tránh ép bật bàn phím. Các bộ hồi quy giữ 120 + 160 tổ hợp bố cục, SVG/PNG/PDF tải thật; không có lỗi runtime/console. Đã xem ảnh desktop, điện thoại và các hàng thuốc được khôi phục.
