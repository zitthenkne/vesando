# Đợt nâng cấp 6 — Hồ sơ ca, chú giải tương tác, vùng nguy cơ, màu nhấn

Ngày thực hiện: 20/10/2026. Dữ liệu JSON, cách xuất SVG/PNG/PDF và lịch sử hoàn tác giữ nguyên; các tùy chọn thiết kế mới đều có giá trị mặc định tắt nên sản đồ cũ không đổi hình. Bộ kiểm tra mới: `verify-dossier.cjs`.

**Nguyên tắc màu.** Giao diện dùng một màu nhấn (mặc định xanh y khoa) trên nền trung tính. Màu khác chỉ xuất hiện khi mang thông tin: chấm trạng thái đánh giá (xanh / hổ phách / đỏ), mẫu đường trong chú giải và bảng màu đường. Bản đầu của đợt này tô màu riêng cho từng thẻ, từng công cụ và từng loại thuật ngữ; sau góp ý, các màu đó đã được bỏ vì làm giao diện kém chuyên nghiệp.

## Hồ sơ ca (thay cho "Đề bài, chú giải & thao tác" và "Thông tin bản vẽ")

Trước đây một thao tác xem đề bài phải mở ba tầng mục lồng nhau, còn thông tin bản vẽ nằm riêng ở một dòng khác. Nay gom thành một khối dưới sản đồ, một tầng, bốn thẻ.

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 1 | **Một hàng, bốn thẻ** | Đề bài · Chú giải · Bản vẽ · Thao tác. Bấm thẻ để mở; bấm lại thẻ đang mở hoặc mũi tên để thu gọn. Khi thu gọn chỉ còn một hàng cao 46 px. Mặc định thu gọn; vào bước Rà soát thì tự mở thẻ Đề bài. |
| 2 | **Số đo mới nhất và trạng thái** | Cùng hàng với các thẻ: CTC · Đầu · Tim thai · Cơn co (rê chuột để xem giờ ghi) và nhãn đánh giá có chấm màu theo mức. |
| 3 | **Đề bài dạng dòng thời gian** | Tự tách "Lúc 08:00 …; 10:00 …" thành các mốc giờ nối nhau bằng một trục; câu dẫn nhập đứng trên cùng, câu chung giữa hai mốc giữ dạng ghi chú. Giờ nằm giữa câu ("vào viện lúc 07:30") không bị tách. Đề không có giờ vẫn đọc như đoạn văn. |
| 4 | **Khối Yêu cầu** | Phần sau "Yêu cầu:" tách thành khung riêng trên nền xám nhạt. |
| 5 | **Số đo trong đề được in đậm** | Cổ tử cung, đầu trên vệ, tim thai — ba thông số được vẽ trên sản đồ — in đậm để đọc lướt như đọc biểu đồ. |
| 6 | **Bấm giờ để xem mốc trên sản đồ** | Giờ trong đề khớp một mốc ghi nhận (lệch tối đa 45 phút) thì bấm được: chuyển sang Rà soát, chọn mốc, cuộn tới sản đồ. Giờ chưa có mốc hiện nét đứt. |
| 7 | **Ba cách sao chép** | Sao chép đề bài · **Kèm bảng mốc** (đề + bảng Markdown Giờ, CTC, đầu, tim thai, cơn co để dán vào tài liệu) · **Chỉ yêu cầu**. |
| 8 | **Thẻ Bản vẽ dạng bảng số liệu** | Khung giờ, số mốc, số nhóm hàng đang hiện, quy chuẩn (kèm "Hai đường đầy đủ đến 10 cm"); ghi chú khi khung giờ được nới. Bật "Thông tin kỹ thuật" trong Tùy biến để thêm kích thước ảnh xuất. |
| 9 | **Chỉnh khung giờ và nhóm hàng ngay tại thẻ** | Khung giờ: Tự động · Cố định (nút − / + từng giờ, 4–48) · 24 giờ. Nhóm hàng: Tự gọn · Hiện đủ. Không cần mở Thiết kế. |
| 10 | **Thẻ Thao tác** | Một hàng nút: Nhân bản ca · Mở trong Theo dõi chuyển dạ · Xuất đề, và Bỏ ca tách về bên phải (chỉ chuyển đỏ khi rê chuột; mờ kèm lý do khi chỉ còn một ca). |
| 11 | **Nhớ thẻ đang xem, điều hướng bằng bàn phím** | ← → chuyển thẻ, Home / End về thẻ đầu / cuối; thẻ và trạng thái mở được nhớ trên thiết bị. |
| 12 | **Dùng chung ở Theo dõi chuyển dạ** | Phân hệ Theo dõi dùng cùng khối (hai thẻ Chú giải và Bản vẽ), thay cho dòng "Chú giải ký hiệu" rời. |

## Chú giải tương tác và linh hoạt trên sản đồ

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 13 | **Ẩn / hiện từng đường** | Biểu tượng con mắt cạnh CTC, Đầu trên vệ, Tim thai, Mạch mẹ, Báo động, Hành động. Đường bị ẩn biến mất khỏi màn hình, tệp xuất, khung chú giải cuối phiếu và vùng bấm chỉnh điểm; lưu trong thiết kế và JSON kiểm tra (`hiddenSeries`). Nút "Hiện lại tất cả các đường". |
| 14 | **Làm nổi đường khi rê chuột hoặc dùng bàn phím** | Rê vào (hoặc Tab tới) một mục chú giải: các đường khác trên sản đồ mờ đi. Bấm tên mục để chỉnh màu và ký hiệu như cũ. |
| 15 | **Chú giải chia ba cột** | Đường dữ liệu · Đường tham chiếu (ẩn ở WHO LCG) · Cơn co theo thời gian mỗi cơn. |
| 16 | **Sáu bảng màu đường** | Lâm sàng · Dễ phân biệt · **Mù màu (Okabe–Ito)** · Pastel dịu · Tương phản cao · Mực xanh; đặt ngay trong thẻ Chú giải và trong Thiết kế → Khung & hàng. |
| 17 | **Vùng nguy cơ** (tùy chọn) | Tô nền hổ phách nhạt giữa đường báo động và hành động, đỏ nhạt bên phải đường hành động; cắt đúng khung lưới. Không áp dụng cho WHO LCG và bản đơn sắc. |
| 18 | **Vạch nhóm hàng** (tùy chọn) | Vạch nhỏ cạnh nhãn từng nhóm thông số để dò hàng nhanh trên phiếu dài. Bỏ qua ở bản đơn sắc. |
| 18b | **Mũi tên sự kiện chỉ vào cột giờ** | Mũi tên đi qua dải SỰ KIỆN, đầu mũi tên đặc nằm trong hàng trên cùng của đúng cột giờ, rồi một nét đứt mảnh dóng thẳng xuống trục thời gian (vẽ dưới các điểm đo nên không che dữ liệu). Nếu đầu cột đã có điểm CTC/đầu trên vệ, mũi tên dừng ở mép dải để không đè lên điểm. Tắt nét đứt: thẻ Chú giải → "Đường dóng sự kiện" hoặc Thiết kế → Khung & hàng (JSON `eventGuides`). |
| 18c | **Sửa mũi tên ngay trên sản đồ** | Bấm (hoặc Tab tới rồi Enter) một thẻ sự kiện ở bất kỳ bước nào trừ Xuất đề, kể cả Thiết kế: hộp sửa mở ngay dưới thẻ với Nội dung (có gợi ý sẵn), Thời điểm (danh sách giờ thực, nút ±15 phút), Màu (6 màu, mặc định tím) và Cỡ (Nhỏ · Vừa · Lớn). Sản đồ xem trước ngay khi chỉnh. **Lưu** hoặc Enter để lưu, bấm ra ngoài cũng lưu, Esc để hủy; **Xóa** bỏ mũi tên; **Áp dụng kiểu cho mọi mũi tên** dùng chung màu và cỡ cho cả ca. Mọi thay đổi hoàn tác được bằng Ctrl Z. Màu và cỡ lưu trong JSON (`events[].color`, `events[].size`); bản đơn sắc vẫn in đen. |
| 19 | **Hai mẫu thiết kế mới** | **Giảng dạy · màu dịu** (pastel, vùng nguy cơ, vạch nhóm) và **Chiếu lớp · tương phản cao** (nét dày, chữ lớn, màu đậm). Thiết kế → Mẫu & chuẩn. |

## Giao diện

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 20 | **Chọn màu nhấn** | Tùy biến → Màu nhấn: Xanh y khoa (mặc định) · Xanh dương · Xanh lá · Hổ phách · Hồng san hô. Chỉ một màu được dùng tại một thời điểm, cho nút chính, thẻ đang chọn và điểm nhấn; có bản riêng cho giao diện tối. Tím chàm vẫn dành riêng cho tính năng AI. |
| 21 | **Độ bo góc ba mức** | Tùy biến → Độ bo góc: Vuông vắn · Chuẩn · Mềm, áp dụng cho thẻ, nút, ô nhập. |
| 22 | **Lệnh Ctrl K mới** | "Hồ sơ ca · Đề bài / Chú giải / Thông tin bản vẽ / Thao tác với ca", "Đổi màu nhấn", "Tô vùng nguy cơ", "Bật vạch màu nhóm hàng". |
| 23 | **Điện thoại** | Bốn thẻ chia đều chiều ngang (không cuộn), số đo nằm trên một hàng riêng ngay dưới, mốc giờ và nút đủ 44 px, chú giải một cột, nút thao tác xếp dọc. |

## Dọn mã

Bỏ mã giao diện cũ của ba tầng mục lồng nhau, mục "Thông tin bản vẽ" trong sản đồ và quy tắc CSS tương ứng; các tệp `verify-ui.cjs`, `verify-workspace.cjs`, `verify-refresh.cjs` cập nhật theo cấu trúc mới (hạn mức nút nhìn thấy ở màn hình đầu tăng từ 11 lên 16 vì thanh thẻ thay cho mục lồng nhau).
