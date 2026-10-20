# Đợt nâng cấp 5 — chữ trên sản đồ, quy chuẩn, JSON kiểm tra, phần cuối phiếu, quy chuẩn, JSON kiểm tra, dời mốc giờ, hệ màu thống nhất, điện thoại, Lập sản đồ bằng AI

Ngày thực hiện: 20/10/2026. Dữ liệu JSON, cách xuất SVG/PNG/PDF và lịch sử hoàn tác giữ nguyên. Thêm tệp `theme.css` (nạp sau cùng) và bộ kiểm tra `verify-refresh.cjs`.

## Chữ trên sản đồ

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 1 | Hết lỗi "Bup…", "Rin…" ở hàng Thuốc khác, Dịch truyền | Nội dung chạy sang các ô trống bên phải đến mốc ghi kế tiếp, hiện đủ "Bupivacain 0,1% + Fentanyl 2 mcg/ml (NMC)". Áp dụng cho cả hàng Ngôi và Kiểu thế chi tiết. |
| 2 | Tự xuống hai dòng, rút gọn theo từ | Khi hai mốc sát nhau: chữ nhỏ lại, chia hai dòng; chỉ thêm "…" khi vẫn hết chỗ và không cắt đôi một từ. Nội dung đầy đủ vẫn có trong chú thích khi rê chuột và bảng "Thuốc & dịch truyền · chi tiết theo mốc". |
| 3 | Vạch mốc giờ và viền chữ | Mỗi mục có vạch đứng đánh dấu đúng mốc ghi; chữ có viền trắng nên không lẫn với đường lưới. Có trong mọi tệp xuất và bản in đơn sắc. |

## Quy chuẩn và gửi bản kiểm tra

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 4 | Ô **Quy chuẩn** ngay trên sản đồ | Đầu thanh công cụ của sản đồ, luôn hiện ở mọi bước (Xem, Dữ liệu, Thiết kế, Rà soát, Xuất đề) và cả phân hệ Theo dõi: WHO 1993 · UMP, Modified · mốc 4 cm, WHO LCG 2020 (nền tím chàm để phân biệt). Trên điện thoại chiếm trọn một hàng để đọc đủ tên. Mục Mẫu & chuẩn trong Thiết kế chỉ còn ghi quy chuẩn đang dùng, tránh hai nơi chỉnh cùng một thiết lập. |
| 5 | **Gửi bản để kiểm tra** (JSON) | Xuất đề → thẻ "Gửi bản để kiểm tra": **Tải JSON**, **Sao chép JSON** (dán vào tin nhắn, email) hoặc **Chia sẻ** tệp trên điện thoại. Tệp gồm số liệu sau khi đã vẽ lại và chỉnh, mũi tên chú thích, quy chuẩn, toàn bộ thiết kế, chế độ đơn sắc/rút gọn. Có trong menu tên ca, Ctrl K ("Xuất JSON để kiểm tra") và cả phân hệ Theo dõi. |
| 6 | Chọn phạm vi | Khi phiên có nhiều ca: Ca đang mở hoặc Tất cả ca trong phiên. |
| 7 | Người nhận mở đúng sản đồ | Lập sản đồ bằng AI → Bước 2 → Dán hoặc Mở tệp: hiện nhãn "Bản kiểm tra từ Sản đồ Studio · quy chuẩn", bản xem trước dùng đúng quy chuẩn và thiết kế của người gửi; chọn Vẽ sản đồ là áp dụng cả hai (hoàn tác thiết kế được). JSON thường của AI không bị ảnh hưởng. |

## Quy chuẩn và JSON kiểm tra

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 8 | Ô **Quy chuẩn** ngay trên sản đồ | Đầu thanh công cụ của sản đồ, hiện ở mọi bước (Xem, Dữ liệu, Thiết kế, Rà soát, Xuất đề): WHO 1993 · UMP / Modified · mốc 4 cm / WHO LCG 2020. Đổi là sản đồ vẽ lại ngay. Điện thoại: chiếm trọn hàng đầu, đọc đủ tên. Mục Thiết kế → Mẫu & chuẩn chỉ còn ghi quy chuẩn đang dùng để tránh hai nơi chỉnh một việc. |
| 9 | **Gửi bản để kiểm tra** (Xuất đề) | Tải JSON, Sao chép JSON (dán vào tin nhắn/email) hoặc Chia sẻ tệp (điện thoại). Tệp gồm số liệu sau mọi chỉnh sửa, mũi tên chú thích, giờ bắt đầu, quy chuẩn, thiết kế, đơn sắc/rút gọn. Soạn đề nhiều ca: chọn Ca đang mở hoặc Tất cả ca. Cũng có trong menu tên ca và Ctrl K → "Xuất JSON để kiểm tra". |
| 10 | Mở bản kiểm tra | Người nhận: Lập sản đồ bằng AI → Bước 2 → Mở tệp hoặc dán. Có nhãn "Bản kiểm tra từ Sản đồ Studio", xem trước đúng quy chuẩn và thiết kế của người gửi; Vẽ sản đồ áp dụng cả hai. Tệp `san-do-<mã ca>-kiem-tra.json`. |

## Phần cuối phiếu

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 11 | Bảng **Thuốc & dịch truyền** | Thay dòng chữ nối dài bằng bảng ba cột Giờ · Thuốc, liều, đường dùng · Dịch truyền; mỗi thuốc một dòng, ô trống ghi "—". Bấm một hàng để sửa đúng mốc đó. Ngôi và kiểu thế chi tiết cũng thành bảng cùng kiểu. |
| 12 | Khung **Chú giải** ba cột | Đường & ký hiệu (CTC, đầu trên vệ, tim thai, mạch, huyết áp, sự kiện) · Cơn co theo thời gian mỗi cơn · Mã ối Việt/WHO và hình kiểu thế; có nền tiêu đề, đường kẻ chia cột. Bỏ dòng chú giải đường báo động/hành động vì đã có nhãn trên biểu đồ. |
| 13 | **Ghi chú đọc phiếu** | Gom chuẩn áp dụng, căn mốc, lưu ý đầu trên vệ, bản trích thành danh sách gạch đầu dòng chữ nhỏ; cảnh báo dữ liệu ngoài khung đứng đầu, màu đỏ. |
| 14 | Sự kiện bị rút gọn | Khi thẻ sự kiện phải rút gọn, nội dung đầy đủ nằm trong bảng Số · Giờ · Nội dung. |

## Dời mốc giờ thực

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 15 | Sửa giờ thực ngay trên trục thời gian | Bấm một giờ ở hàng "giờ thực" dưới biểu đồ CTC (ví dụ 12:00), nhập giờ mới (13:30) rồi **Lưu tại ô**: giờ bắt đầu đổi theo, mọi mốc giờ khác trên trục, đầu phiếu, mũi tên chú thích và bảng chi tiết dời tương ứng. Số đo và khoảng cách giữa các lần khám giữ nguyên. |
| 16 | Ô **Giờ thực** trong bảng Dữ liệu | Mục "Mốc đang xem" có ô giờ cho mốc đang chọn; đổi giờ tại đây cũng dời toàn bộ các mốc. |
| 17 | Qua nửa đêm và hoàn tác | Ứng dụng dời theo chiều ngắn nhất (tối đa ±12 giờ); nếu giờ bắt đầu lùi qua nửa đêm thì ngày bắt đầu lùi theo (ví dụ 08:00 → 23:00 là tối hôm trước). Ctrl Z hoặc ↶ khôi phục. Ô giờ chỉ nhập đến phút. |

## Hệ màu và bố cục

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 18 | Một bộ màu thống nhất | Xanh y khoa cho thao tác chính, tím chàm riêng cho tính năng AI, nền xám dịu, màu trạng thái thành công/cảnh báo/lỗi nhất quán; thay cho bốn bộ màu chồng nhau trước đây. |
| 19 | Giao diện tối đồng bộ | Cùng bộ màu ở dạng tối; giấy sản đồ vẫn trắng như bản in. Thanh trình duyệt trên điện thoại đổi màu theo giao diện. |
| 20 | Cỡ chữ dễ đọc hơn | Nút và nhãn từ 10–11 px lên 12,5–13 px; số dùng chữ số đều cột. |
| 21 | Phân cấp nút rõ ràng | Nút chính màu đặc, nút phụ có viền, nút văn bản; trạng thái di chuột, nhấn, vô hiệu và vòng focus bàn phím thống nhất. |
| 22 | Nút gạt **Soạn đề / Theo dõi** | Hai phân hệ cùng hiện trên thanh trên, đổi bằng một lần bấm, thấy ngay đang ở phân hệ nào (thay cho ô chọn). |
| 23 | Thanh trên dạng kính mờ | Tên ca thành thẻ có menu; Tìm thao tác, menu ca và menu ⋯ cùng kiểu thẻ nổi. |
| 24 | Nút **Lập sản đồ bằng AI** nổi bật | Nền chuyển sắc xanh → tím chàm, có ánh sáng lướt khi rê chuột; nút Xuất sản đồ giữ màu xanh chính. Máy tính bảng (761–1100 px) chỉ ghi “AI” để chừa chỗ cho tên ca. |
| 25 | Thẻ sản đồ và thanh công cụ | Thẻ bo góc, đổ bóng nhẹ; thanh công cụ bên phải chuyển nền sáng, mục đang mở có nền xanh nhạt và chữ xanh. |
| 26 | Bảng Tìm thao tác (Ctrl K) và thông báo | Ô tìm không viền, chữ lớn; thông báo nền tối tương phản cao, có nút Hoàn tác rõ ràng. |

## Điện thoại

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 27 | Thanh trên hai tầng | Tầng 1: biểu tượng, AI, Xuất, ⋯. Tầng 2: nút gạt phân hệ và **tên ca đang mở** (trước đây bị ẩn trên điện thoại). |
| 28 | Thanh điều hướng dưới vừa khít | Sáu mục chia đều (Xem, Dữ liệu, Thiết kế, Rà soát, Xuất đề, Tập trung), không còn tràn mép phải; chừa vùng thanh vuốt của máy; mục đang mở có nền xanh nhạt. Màn 320 px vẫn đủ chữ. |
| 29 | Chụm hai ngón để phóng sản đồ | Phóng đến 600% quanh điểm giữa hai ngón; một ngón để cuộn khi đã phóng. |
| 30 | Nút phóng nổi trên sản đồ | − / mức phóng / + ở góc sản đồ; bấm số phần trăm để về khớp chiều rộng. Chỉ hiện trên màn hình cảm ứng. |
| 31 | Bảng công cụ dạng tấm trượt | Có tay nắm; kéo phần tiêu đề xuống để đóng như ứng dụng điện thoại. |
| 32 | Ô nhập 16 px | iPhone không còn tự phóng to trang khi chạm vào ô nhập. |
| 33 | Thanh xem gọn trên màn hẹp | Dưới 420 px nút Thu phóng chỉ còn biểu tượng; dưới 360 px nút Ghi nhanh chỉ còn biểu tượng, không xuống dòng. |

## Lập sản đồ bằng AI

| # | Thay đổi | Cách dùng / kết quả |
|---|---|---|
| 34 | Tiêu đề và thanh bước mới | Bước đã xong chuyển thành dấu ✓ xanh (Bước 1 khi đã sao chép prompt, Bước 2 khi dữ liệu hợp lệ), có đường nối giữa hai bước. |
| 35 | **Dữ kiện trong đề bài** | Ngay khi nhập đề, ứng dụng ước lượng theo từ khóa 10 nhóm: mốc thời gian (đếm số mốc), độ mở cổ tử cung, đầu/ngôi/kiểu thế, tim thai, cơn co, ối, mạch/huyết áp, nhiệt độ, thuốc/dịch truyền, nước tiểu; có thanh mức đầy đủ. Biết đề thiếu gì trước khi gửi cho AI. |
| 36 | **Sao chép và mở ngay** ChatGPT, Gemini, Claude | Một lần bấm: sao chép prompt và mở công cụ AI ở thẻ mới. Nút Sao chép prompt vẫn giữ cho công cụ khác. |
| 37 | **Dùng đề mẫu** và Xóa | Điền một đề bài mẫu đủ 10 nhóm dữ kiện để thử toàn bộ quy trình; bộ đếm ký tự. |
| 38 | Đề bài được lưu trên thiết bị | Tự lưu đề bài và tác vụ đã chọn; không mất khi điện thoại tải lại trang lúc chuyển sang ứng dụng AI. Khóa lưu: `partograph-ai-draft-v1`. |
| 39 | Tự chuyển sang Bước 2 khi quay lại | Sau khi sao chép prompt và rời trang sang công cụ AI, quay lại là hộp thoại mở Bước 2, hiện lời nhắc và đặt focus vào nút **Dán phản hồi**. Cũng áp dụng sau Yêu cầu AI sửa lỗi. |
| 40 | Prompt hoàn chỉnh được thu gọn | Mục "Xem prompt hoàn chỉnh" kèm số ký tự; nhường chỗ cho phần kiểm tra đề bài và hướng dẫn bốn bước. |
| 41 | Bước 2: Dán phản hồi, kéo thả tệp | Nút **Dán phản hồi** nổi bật; kéo thả tệp hoặc đoạn văn bản vào ô để nhập. |
| 42 | **Đối chiếu nhanh** trước khi vẽ | Sáu ô số liệu từ dữ liệu AI trả về: số mốc và khoảng giờ, độ mở CTC đầu → cuối, đầu trên vệ, tim thai thấp–cao, số mốc thuốc/dịch, số sự kiện. Cảnh báo khi thiếu độ mở CTC, thiếu tim thai hoặc độ mở giảm giữa hai lần khám. |
| 43 | Toàn màn hình trên điện thoại | Thanh bước dính phía trên, nút Để sau / Sang Bước 2 / Vẽ sản đồ dính phía dưới; thẻ kiểm tra chia hai cột. |

## Hướng dẫn trong ứng dụng

Cập nhật câu chữ (vẫn 39 bước, mỗi mô tả tối đa 15 từ): Chọn chế độ (nhắc ô Quy chuẩn), bước mới Gửi để kiểm tra thay cho Xem trước trong mục Xuất & lưu, Chọn chế độ (kèm vị trí ô Quy chuẩn), bước mới Gửi để kiểm tra thay cho Xem trước trong Xuất & lưu, Quản lý ca (tên ca hiện cả trên điện thoại), Gửi prompt cho AI (Sao chép và mở ngay), Nhập phản hồi (quay lại trang, Dán phản hồi), Đối chiếu bản xem trước (thẻ số liệu).

## Kiểm tra

- `verify-refresh.cjs` (mới): chữ đầy đủ ở hàng thuốc/dịch, rút gọn theo từ khi chật; phần cuối phiếu có bảng thuốc, khung chú giải và ghi chú; ô Quy chuẩn trên sản đồ; JSON kiểm tra tải/sao chép rồi mở ở trình duyệt khác đúng quy chuẩn và thiết kế; ô Quy chuẩn trên sản đồ; JSON kiểm tra tải về, sao chép, mở ở trình duyệt khác đúng quy chuẩn và thiết kế; nút gạt phân hệ; dời giờ từ trục thời gian và từ bảng Dữ liệu (kể cả lùi qua nửa đêm), hoàn tác; kiểm tra đề bài 0/10 → 10/10; prompt thu gọn; liên kết mở thẻ mới; đề bài còn sau khi tải lại; sao chép → rời trang → quay lại mở Bước 2 và focus Dán phản hồi; thẻ đối chiếu, cảnh báo, kéo thả, dán; 320/390 px: không cuộn ngang, tên ca hiện, 6 mục điều hướng ≥ 44 px không cắt chữ, nút phóng, chụm hai ngón, kéo tấm trượt để đóng, hộp thoại AI toàn màn hình, ô nhập 16 px; giao diện tối; không lỗi runtime/console.
- Các bộ cũ đổi cách chọn phân hệ sang nút gạt; kiểm tra chú giải đổi theo tiêu đề mới (CƠN CO · THỜI GIAN MỖI CƠN, mã ối dạng bảng); nút gạt, thẻ tên ca và nút AI/Xuất đều đạt vùng chạm 44 px ở 320/390/768 px; `verify-workspace.cjs` tính nút gạt thay cho ô chọn cũ khi đếm nút mặc định; các máy chủ kiểm tra phục vụ thêm `theme.css`.
