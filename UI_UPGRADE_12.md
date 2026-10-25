# Đợt 12 — gọn, mềm mại, chuyên nghiệp

## Vòng 1 — Gộp thanh điều khiển sản đồ

- Màn hình rộng (> 1100 px): hàng chọn thông số (**CTC / Đầu trên vệ**) và hàng **Quy chuẩn · Ghi nhanh · Vừa màn hình** gộp làm một hàng; sản đồ lên cao thêm khoảng 60 px.
- Khi cuộn, nhóm CTC / Đầu trên vệ vẫn bám ở trên như một thẻ nhỏ bo góc.
- Màn hình hẹp giữ bố cục cũ (đủ chỗ cho nút lớn).

## Vòng 2 — Một chỗ cho công cụ

- Bỏ nút **Công cụ** trên thanh trên cùng khi đã có thanh công cụ (trùng chức năng). Menu vẫn bật lên khi hướng dẫn cần chỉ vào mục AI.
- Hướng dẫn **Mở công cụ** chỉ vào thanh công cụ mới. Đóng bảng công cụ hoặc thoát Tập trung trả focus về thanh công cụ.

## Vòng 3 — Điện thoại: sản đồ lên cao hơn

- ≤ 760 px: Quy chuẩn, Ghi nhanh (chỉ biểu tượng) và Thu phóng nằm chung một hàng; ẩn dòng gợi ý "Ô trống: thêm…" (vẫn có trong Hướng dẫn). Sản đồ bắt đầu cao hơn khoảng 75 px.

## Vòng 4 — Bố cục theo Canva: thanh biểu tượng → bảng → sản đồ

Nguyên tắc học từ Canva: công cụ mở ra **ngay cạnh** nút đã bấm; mắt đi một chiều trái → phải (chọn công cụ → chỉnh → xem kết quả); thanh trên cùng tối giản (tên ca, lưu/xuất).

- Màn hình rộng: bảng công cụ (Nhập / Trình bày / Kiểm tra / Lưu…) mở **bên trái**, sát thanh biểu tượng, sản đồ ở bên phải. Trước đây bảng ở mép phải, cách nút bấm cả màn hình.
- Tay nắm kéo giãn chuyển sang mép phải của bảng; kéo sang phải hoặc phím → để rộng thêm.
- Chế độ bảng nổi (overlay) và điện thoại giữ nguyên.

## Vòng 5 — ▶ Diễn biến (trình chiếu kiểu Canva Present)

- Nút **Diễn biến** trên thanh công cụ dọc (cả Soạn đề và Theo dõi) phát lần lượt từng mốc có số đo, mỗi 2,6 giây; sản đồ nhảy theo đúng mốc.
- Thẻ chú thích ở mỗi mốc: kết luận chung, chip số đo (đỏ nếu ngoài ngưỡng), dấu hiệu **mới xuất hiện tại mốc đó** kèm nguồn. Mỗi mốc chỉ đọc dữ liệu **đã biết đến thời điểm đó** — đúng cách đọc sản đồ thực tế, không "nhìn trước".
- Điều khiển: ⏮ ▶/⏸ ⏭, thanh tiến độ; bàn phím Space / ← → / Esc. Máy tính: thẻ nổi góc phải dưới, không che giữa sản đồ; điện thoại: trên thanh công cụ.
- Dùng để giảng dạy (trình chiếu một ca) hoặc tự rà lại diễn biến trước khi xuất đề.

## Gộp với đợt 10 trên `main`

- Lấy cấu trúc của đợt 10 làm chuẩn: thư viện sản phẩm ở trang đầu, thanh công cụ dọc `creation-rail`, thanh sáng tạo và dải thời gian.
- Bỏ thanh công cụ riêng của đợt 11 (trùng chức năng với `creation-rail`). Nút **Diễn biến** được đặt vào `creation-rail`.
- Giữ các phần không trùng: đèn ngưỡng, khung hướng dẫn khi sản đồ chưa có số đo, nhận định theo quy chuẩn trong Kiểm tra, nhãn nhập đầy đủ, bảng công cụ mở bên trái, gộp hàng điều khiển.
- Điện thoại: thanh dưới đáy giữ 7 nút trên một hàng (ẩn Tập trung, Tùy chỉnh — có trong menu ⋯); thanh nằm trên lớp nút CTC / Đầu trên vệ.
- Câu chữ: chuyển sang giọng trung tính, phù hợp người dùng là giảng viên (ví dụ "Nhận định theo quy chuẩn", "Có thể bấm trực tiếp vào ô trống…", "Thời gian mỗi cơn co · giây").

## Vòng 6 — Kho "Mẫu tình huống" và bổ sung quy tắc nhận định

Học từ mục **Mẫu** của Canva: bắt đầu từ một mẫu có sẵn, nhìn thấy trước kết quả, một lần bấm là mở.

- Trang chủ có dải **Mẫu tình huống**: mỗi thẻ có hình thu nhỏ vẽ trực tiếp từ dữ liệu ca, nhãn chủ đề và mô tả ngắn; bấm để mở thành đề mới, chỉnh sửa được.
- Thêm 4 ca mẫu (tổng 7):
  - **Pha tiềm thời kéo dài** — CTC 1 → 2 cm sau 8 giờ, cơn co thưa.
  - **Sốt · ối vỡ lâu** — nhiệt độ 37,4 → 38,4 °C, mạch mẹ 92 → 112, tim thai nền 150 → 168.
  - **Tăng huyết áp · đạm niệu** — HA 150/100 → 165/110 mmHg, đạm niệu ++ → +++, nước tiểu giảm.
  - **Tăng co bằng oxytocin** — cơn co 2/10′ không tiến triển, oxytocin 10 IU/L tăng 8 → 16 giọt/phút, CTC 5 → 9 cm.
- Mỗi ca có phần **Yêu cầu** viết theo dạng câu hỏi tình huống, không khẳng định chẩn đoán thay người học.
- **Bổ sung quy tắc nhận định cho mô hình WHO 1993 / Modified** (trước đây chỉ có ở LCG):
  - Huyết áp ≥ 140/90 mmHg (≥ 160/110: mức khẩn), kèm đạm niệu nếu có — *ISSHP 2021*.
  - Nhiệt độ ≥ 38 °C — *ACOG CO 712*.
  - Mạch mẹ > 100 lần/phút.
  - Pha tiềm thời ≥ 8 giờ chưa đạt mốc hoạt động — *WHO 1994, hướng dẫn sử dụng sản đồ*.
  Áp dụng cho cả Soạn đề (Kiểm tra, Diễn biến) và Theo dõi.

## Vòng 7 — Trình chiếu từng bước có che dữ liệu

Dành cho giảng dạy trên lớp: người học đọc sản đồ đúng như khi diễn biến đang xảy ra.

- Trong **Diễn biến** có nút mắt **Che dữ liệu sau mốc hiện tại**. Khi bật, sản đồ chỉ vẽ số đo và sự kiện đến mốc đang chiếu; mỗi lần sang mốc mới thì phần tiếp theo mới xuất hiện.
- Áp dụng cho cả Soạn đề và Theo dõi. Chỉ ảnh hưởng hình đang hiển thị; dữ liệu ca, bản xuất và lịch sử không thay đổi. Đóng trình chiếu hoặc tắt nút thì sản đồ hiện đầy đủ.
- Gợi ý dùng: bật che dữ liệu → dừng ở từng mốc để người học nhận định → sang mốc kế để đối chiếu.

## Vòng 8 — Đề & đáp án gợi ý

- **Lưu / Xuất → Đề & đáp án** (Soạn đề): **In đề + đáp án**, **In đề**, **Tải tệp HTML**. Bản in khổ A4; "In" mở hộp thoại in của trình duyệt (có thể chọn Lưu thành PDF).
- Trang đề: tên tình huống, thông tin sản phụ, quy chuẩn, sản đồ (vector) và phần Tình huống / Yêu cầu.
- Trang đáp án (in sang trang riêng): kết luận chung; bảng diễn biến theo mốc (CTC, đầu, tim thai, cơn co, mạch, HA, nhiệt độ, ối) và các dấu hiệu tại mốc đó kèm nguồn — chỉ dùng dữ liệu đã biết đến mốc; mục Lưu ý khi đọc. Có câu ghi chú: nhận định tự động, giảng viên rà soát trước khi sử dụng.

## Vòng 9 — So sánh quy chuẩn

- **Kiểm tra → So sánh 3 quy chuẩn**: cùng dữ liệu ca, đặt cạnh nhau WHO 1993 · Modified · WHO LCG. Mỗi cột có hình sản đồ theo mô hình, kết luận chung và danh sách dấu hiệu kèm nguồn.
- Dấu hiệu không có ở mọi mô hình được đánh dấu **Khác giữa các mô hình** (ví dụ tiêu chí ALERT riêng của LCG, đường báo động/hành động của mô hình lịch sử).
- Hộp thoại nhận focus khi mở; Esc hoặc nút đóng trả focus về nút đã mở. Màn hình hẹp xếp ba cột thành một.
- Khi bật che dữ liệu trong Diễn biến, dải **Lướt theo thời gian** cũng chỉ hiện các mốc đến thời điểm đang chiếu.

## Vòng 10 — Prompt tạo câu hỏi trắc nghiệm

- **Lưu / Xuất → Đề & đáp án → Sao chép prompt tạo câu hỏi**: prompt gồm tình huống, thông tin sản phụ, quy chuẩn, số đo theo từng mốc (chú giải ký hiệu ối), dấu hiệu tại mốc kèm nguồn và kết luận theo quy chuẩn.
- Yêu cầu trong prompt: 5 câu trắc nghiệm 4 lựa chọn, đáp án và giải thích dẫn chiếu dữ liệu; chỉ dùng dữ liệu đã cho, không bổ sung số liệu, không khẳng định chẩn đoán vượt quá dữ liệu; văn phong trung tính, học thuật.
- Có mục **Xem nội dung prompt** để sao chép thủ công khi trình duyệt chặn clipboard.
- Câu nhận định huyết áp ghi rõ ngưỡng: tâm thu ≥ 140 hoặc tâm trương ≥ 90; mức nặng: tâm thu ≥ 160 hoặc tâm trương ≥ 110.

## Vòng 11 — Hai chế độ cảnh báo trong Theo dõi

Công tắc **Cảnh báo: Học tập | Lâm sàng** ở đầu thẻ sản đồ (Theo dõi); lựa chọn được nhớ trên trình duyệt.

- **Học tập** (mặc định): giữ cách hiển thị nhận định kèm giải thích và nguồn như trước.
- **Lâm sàng**: ngay khi ghi một số đo làm phát sinh dấu hiệu mới:
  - Toàn màn hình nhuộm hồng nhạt, viền đỏ nhấp nháy 3 lần (mức cần đối chiếu: vàng nhạt).
  - Băng **Báo động / Cảnh báo · giờ** ở đầu màn hình, nêu ngắn gọn từng dấu hiệu (ví dụ "Tim thai 92 lần/phút ngoài ngưỡng").
  - Trên sản đồ: **vòng tròn đỏ khoanh đúng điểm** dữ liệu báo động (tim thai, CTC, đầu) và dải hồng dọc cột giờ đó (áp dụng cả cho cơn co, mạch, huyết áp, nhiệt độ).
  - **Xem trên sản đồ** cuộn tới điểm; **Đã xem** tắt nhuộm màu và vòng khoanh.
- Chỉ dấu hiệu mới phát sinh mới kích hoạt; mở hồ sơ, đổi hồ sơ hoặc chuyển chế độ không gây báo động. Không hiện khi in.

## Vòng 12 — Cảnh báo lâm sàng: dấu cố định, ngưỡng, nhật ký

- Chế độ **Lâm sàng**: mọi điểm đang ngoài ngưỡng (tim thai, CTC theo đường báo động/hành động, đầu không xuống tương ứng) có **vòng đỏ mảnh cố định** vẽ trong sản đồ, giữ nguyên sau khi bấm Đã xem; không đi vào bản xuất SVG/PNG/PDF.
- Băng báo động ghi kèm ngưỡng tham chiếu, ví dụ "Tim thai 92 lần/phút … (ngưỡng 120–160 lần/phút)".
- **Nhật ký cảnh báo**: mỗi lần bấm Đã xem ghi lại giờ trên sản đồ, nội dung và thời điểm xác nhận (30 mục gần nhất trong phiên).

## Vòng 13 — Khoanh đủ mọi thông số

- Chế độ Lâm sàng khoanh trực tiếp trên sản đồ cả các thông số không phải điểm: **mạch** (vòng quanh điểm mạch), **huyết áp** (khung bo quanh mũi tên tâm thu–tâm trương), **cơn co** (khung quanh cột cơn co), **nhiệt độ, nước ối, uốn khuôn, đạm niệu** (vòng quanh ô trong bảng).
- Khi vừa ghi, vòng nhấp nháy xuất hiện đúng tại từng thông số báo động; sau khi bấm Đã xem, vòng mảnh cố định giữ lại.
- Băng báo động gọn hơn: bỏ phần ngoặc trùng, chỉ giữ "(ngưỡng …)".
- Sửa kiểu chữ tiêu đề băng báo động về cùng phông giao diện.

## Vòng 14 — Lịch đo (chế độ Lâm sàng)

- Dải **Lịch đo** ở đầu thẻ sản đồ: Tim thai, Cơn co, Mạch, Nhiệt độ, Huyết áp, Khám CTC — mỗi ô ghi giờ đến hạn.
- Khoảng cách đo theo quy chuẩn: WHO 1993 / Modified — tim thai, cơn co, mạch mỗi 30 phút; nhiệt độ 2 giờ; huyết áp, khám CTC 4 giờ (WHO 1994, hướng dẫn sử dụng sản đồ). LCG — mạch, nhiệt độ, huyết áp 4 giờ.
- Mốc so sánh là thời điểm muộn hơn giữa lần ghi cuối và đồng hồ thực (khi ngày/giờ bắt đầu của hồ sơ khớp hôm nay). Quá hạn: ô màu cam, ghi "Quá hạn N phút"; còn dưới 15 phút: viền cam; chưa đo: viền nét đứt.
- Bấm một ô: chuyển tới mốc kế tiếp và đặt con trỏ vào đúng ô nhập của thông số đó.

## Vòng 15 — Bản bàn giao ca

- Nút **Bàn giao** cạnh công tắc chế độ cảnh báo (Theo dõi): in một trang A4 gồm thông tin sản phụ, quy chuẩn, giờ in; nhận định hiện tại và các dấu hiệu kèm nguồn; số đo gần nhất (kèm giờ đo); lịch đo (quá hạn / đến hạn); cảnh báo đã xem; sản đồ.
- Dùng chung cơ chế in với Đề & đáp án (hộp thoại in của trình duyệt, có thể lưu PDF). Ghi chú cuối trang: bản tóm tắt tự động, không thay thế hồ sơ bệnh án.

## Vòng 16 — Gọn đầu thẻ sản đồ (Theo dõi)

- Lịch đo, công tắc Học tập / Lâm sàng và nút Bàn giao gộp thành **một thanh** phía trên sản đồ; nhật ký cảnh báo xếp ngay dưới khi có. Bớt hai hàng so với trước; không còn bị cắt ở mép phải.
- Ô Lịch đo gọn hơn: chỉ ghi "Quá hạn N phút"; giờ đến hạn và lần đo gần nhất hiện khi rê chuột.
- Báo động chỉ phát sinh khi ghi/sửa từng mốc. Nạp nhiều mốc cùng lúc (nhập tệp, khôi phục phiên bản) chỉ cập nhật trạng thái, không bật báo động hàng loạt.

## Vòng 17 — Ghi chú dễ hiểu hơn, "Học nhanh" → "Hướng dẫn"

- Nút **Học nhanh** đổi thành **Hướng dẫn** (biểu tượng dấu hỏi), cả trên thanh sáng tạo và tab trong bảng; tiêu đề trang: "Hướng dẫn sử dụng · thực hành trên hình minh họa".
- Thống nhất tên **Ghi chú sự kiện** (trước là "Mũi tên chú thích") ở menu, bảng sửa, chuột phải, hướng dẫn, thông báo lỗi và prompt AI — khớp với hàng **Sự kiện** trên sản đồ.
- Menu **Ghi nhanh**: dòng đầu "Ghi tại mốc đang chọn trên sản đồ"; mỗi mục có mô tả ngắn (ví dụ Cơn co tử cung — "Số cơn / 10 phút và thời gian mỗi cơn"; Ghi chú sự kiện — "Nhãn đánh số chỉ vào giờ: bấm ối, gây tê, chuyển phòng…").
- Bảng sửa ghi chú sự kiện không còn bị khuất dưới mép màn hình: trang tự cuộn để thấy đủ nút Lưu / Xóa. Nút phụ ghi rõ "Áp dụng màu và cỡ cho mọi ghi chú".

## Vòng 18 — Tab Chú giải tự giải thích

- Dòng chỉ dẫn đầu tab: biểu tượng mắt = ẩn/hiện đường trên sản đồ (dữ liệu giữ nguyên); bấm tên đường = đổi màu, nét, ký hiệu.
- Mỗi đường có biểu tượng bút cạnh tên (đậm lên khi rê chuột/focus) để thấy rõ có thể chỉnh.
- Bốn công tắc hiển thị (Vùng nguy cơ, Vạch nhóm hàng, Đường dóng sự kiện, Chú giải trong bản xuất) hiện mô tả ngay dưới tên thay vì chỉ trong tooltip.

## Vòng 19 — Danh sách ghi chú sự kiện

- Mỗi ghi chú trong danh sách có **số thứ tự cùng màu** với thẻ đánh số trên sản đồ, nên dễ đối chiếu danh sách ↔ hình.
- Khung nhập có tiêu đề rõ: **Thêm ghi chú mới** hoặc **Sửa ghi chú số N**.
- Câu nhắc lỗi gọn: "Nhập nội dung ghi chú."; nhãn đọc màn hình đổi từ "mũi tên" sang "ghi chú".

## Vòng 20 — Thanh công cụ phía trên sản đồ tự giải thích

- Bỏ nhãn "Mới" đã cũ ở **Lớp & nét**.
- Mỗi nút có chú thích khi rê chuột: Lớp & nét (ẩn/hiện vùng, khóa đường, đổi màu và nét nhiều đường), Bàn dữ liệu (dời/xóa theo khoảng giờ, dán bảng Excel, xuất CSV), Phiên bản (lưu bản có tên, so sánh, khôi phục).
- Nút biểu tượng mặt trời đổi thành nút có chữ **Hiển thị** (sắc thái nền và cỡ chữ giao diện).

## Vòng 21 — Sắp theo trình tự thao tác thật

1. **Nhập nhanh theo nhịp theo dõi tại giường**: nhóm **Theo dõi thường xuyên** (tim thai, số cơn co, mỗi cơn kéo dài, mạch mẹ) đứng trước; nhóm **Khám trong** (độ mở CTC, đầu còn trên vệ) đứng sau. Thứ tự Enter/Tab đi theo đúng trình tự này.
2. **Ngày và giờ bắt đầu chỉ nhập một lần**: sau khi có số đo, hai ô thu lại thành dòng "Bắt đầu theo dõi 08:00 · ngày …" với nút Sửa; bấm Xong để thu lại.
3. **Thông tin sản phụ theo thời điểm thu thập**: **Khi tiếp nhận** (họ tên, mã, para, tuổi thai, khởi phát, thời điểm vỡ ối, nguy cơ) hiện sẵn; **Trong quá trình theo dõi** (ngôi, kiểu thế, bắt đầu rặn) gọn trong mục mở rộng.
4. **Trang chủ giọng trung tính**: "Bắt đầu làm việc", "Soạn đề sản đồ hoặc lập hồ sơ theo dõi chuyển dạ.", "Chưa có sản phẩm", "Các đề và hồ sơ đã tạo sẽ hiển thị tại đây.", chân trang "Biên soạn và theo dõi sản đồ chuyển dạ."
5. **Kiểu chữ tiêu đề kho mẫu** đồng bộ với các tiêu đề khác; nhãn "Mỗi cơn kéo dài · giây" ngắn hơn, không xuống dòng; thẻ chỉ dẫn liệt kê theo thứ tự mới (tim thai, cơn co, CTC).
6. **Kiểm tra toàn vẹn giao diện**: `verify-easy.cjs` báo lỗi nếu trên trang còn chữ `{{…}}` chưa biên dịch (đã bắt được một lỗi thẻ thừa trong quá trình làm vòng này), và kiểm tra thứ tự ô nhập, nhóm, thu gọn ngày/giờ.

## Vòng 22 — Luồng soạn đề theo thứ tự công việc

1. **Thanh "Các bước soạn đề"** phía trên sản đồ (Soạn đề): ① Đề bài & sản phụ → ② Số liệu theo mốc → ③ Ghi chú sự kiện (tùy chọn) → ④ Kiểm tra → ⑤ Xuất đề & đáp án. Mỗi bước bấm một lần là mở đúng công cụ.
2. **Trạng thái tự cập nhật**: dấu ✓ khi bước đã có (tên + đề bài; có số đo; có ghi chú; đã mở Kiểm tra; đã in/tải đề hoặc xuất ảnh/PDF).
3. **Bước tiếp theo được làm nổi** (viền và chữ "Bước tiếp theo"), bỏ qua bước tùy chọn.
4. **Thông tin sản phụ đưa lên ngay sau Nội dung đề bài** trong bảng Nhập / Sửa, tự mở khi soạn đề mới (trước đây nằm cuối, sau mọi ô số liệu).
5. **Câu chữ khung hướng dẫn theo đúng chế độ**: Soạn đề ghi "Bấm Lưu thay đổi…", Theo dõi ghi "Bấm Ghi nhận…" — khớp nút thật.

## Vòng 23 — Tinh gọn: chỉ hiện thứ cần nhất, phần còn lại gom nhóm

Phản hồi: giao diện có quá nhiều nút cùng lúc, gây quá tải thị giác. Nguyên tắc từ vòng này: thao tác thường dùng hiện sẵn; thao tác ít dùng gom vào nhóm, mở khi cần.

1. **Bỏ hàng thanh công cụ trên sản đồ.** Lớp & nét, Bàn dữ liệu, Phiên bản, Hiển thị chuyển vào menu **⋯ → Công cụ nâng cao** (mỗi mục có mô tả ngắn). **Hướng dẫn** thành nút biểu tượng (?) trên thanh tiêu đề.
2. **Các bước soạn đề / Quy trình theo dõi thu thành một nút tròn**: chấm tiến độ + "Bước 2/5 · Số liệu theo mốc"; bấm mới mở danh sách bước.
3. **Lịch đo thu thành một nút**: "Lịch đo · 3 quá hạn" (màu cam khi có quá hạn) hoặc "đúng lịch"; bấm mới hiện các ô chi tiết.
4. **Bỏ nút Bàn giao khỏi thanh trên sản đồ** — đã có trong Lưu / Xuất (mục Bàn giao ca) và trong bước cuối của Quy trình theo dõi.
5. **Khung "Sản đồ chưa có số đo" còn 2 dòng**: tiêu đề + "Chọn mốc giờ → nhập số đo → Ghi nhận / Lưu thay đổi"; giữ các nút hành động.
6. Quy trình theo dõi (Tiếp nhận → Khám lần đầu → Theo dõi định kỳ → Đọc sản đồ → Bàn giao), dòng **Lần đo tiếp theo** dưới nút Ghi nhận kèm "Chuyển tới mốc này", tự thu gọn Thông tin sản phụ sau lần ghi đầu, và mục **Bàn giao ca** trong Lưu / Xuất.

`verify-studio-plus.cjs`: ba lần mở Lớp & nét / Bàn dữ liệu / Phiên bản từ thanh công cụ cũ được đổi sang mở qua menu ⋯ (nội dung kiểm tra giữ nguyên).

## Vòng 24 — Tinh gọn tiếp

1. **Thanh công cụ trái bỏ "Sản đồ" và "Tùy chỉnh".** Sản đồ luôn hiển thị ở giữa nên không cần nút riêng; tùy chỉnh đã có trong menu ⋯. Trên điện thoại còn 6 nút một hàng.
2. **Dải thời gian chỉ còn nút phát và thanh kéo.** Bỏ dòng giá trị và ghi chú lặp lại; ô tốc độ chỉ xuất hiện khi đang phát.
3. **Khung trống của Soạn đề bỏ nút "Mở ca mẫu"** — mẫu đã có trong thư viện và mục Mẫu.
4. **Chế độ Lâm sàng ẩn "Lịch đánh giá cổ tử cung"** vì đã có nút Lịch đo; chế độ Học tập giữ nguyên để giải thích.
5. **Bố cục điện thoại**: thanh công cụ dưới đáy nằm trên các lớp khác, không bị che.

## Vòng 25 — Mỗi màn hình một lời gọi hành động

1. **Dải thời gian chỉ xuất hiện khi có từ 2 mốc trở lên** — trước đó không có gì để lướt.
2. **Khung "Sản đồ chưa có số đo" chỉ còn một nút chính**: Ghi số đo đầu tiên. Lập bằng AI vẫn ở thanh trái (Trợ lý AI).
3. **Ẩn menu "Ghi nhanh" và dòng "Mốc đang chọn" khi sản đồ còn trống** — khung trống đã chỉ đường; hai mục này hiện lại sau số đo đầu tiên.
4. **Bỏ tiêu đề và nút ✕ lặp lại trong "Soạn nội dung đề"** — bảng Nhập / Sửa đã có tiêu đề và nút Đóng.
5. **Trang chủ**: bỏ lối tắt "Bắt đầu từ ca mẫu" (các mẫu nằm ngay bên dưới); nút "Mở tệp JSON" ở thanh trên chuyển thành liên kết nhẹ "Mở tệp đã lưu (.json)" cạnh "Soạn từ ý tưởng với AI".

`verify-library.cjs`, `verify-studio-plus.cjs`: mở ca mẫu bằng thẻ mẫu đầu tiên thay cho lối tắt đã bỏ (cùng nội dung CASE-001).

## Vòng 26 — Bớt hai hàng phía trên sản đồ

1. **Nút "Bước x/5" chuyển lên giữa thanh tiêu đề** (cả Soạn đề và Theo dõi), như thanh tiến độ của Canva; trên điện thoại chỉ còn chấm tiến độ.
2. **Dải lướt thời gian chỉ hiện trong chế độ Tập trung.** Ở chế độ thường, chọn mốc bằng thanh ‹ giờ › ngay trên sản đồ; xem lại cả diễn biến bằng **Diễn biến** ở thanh trái.
3. **Hai nút "CTC" / "Đầu trên vệ" gộp thành một nút đổi**: hiện thông số đang ghi khi bấm lưới, bấm để chuyển sang thông số kia.
4. **"Mới nhất" thành nút biểu tượng** ⏭ (có chú thích khi rê chuột).
5. **Bỏ dòng phụ "Thu gọn để xem trọn sản đồ"** dưới tiêu đề Nhập nhanh — mũi tên thu gọn đã đủ nghĩa.

`verify-studio-plus.cjs`: bật Tập trung trước khi kiểm tra lướt/phát thời gian. `verify-easy.cjs`: đọc nội dung nút bước bằng `textContent` (chữ bị ẩn trên màn hình hẹp).

## Vòng 27 — Thanh tiêu đề còn 3 thành phần, bảng bên gom mục phụ

1. **Bỏ nút (?) trên thanh tiêu đề**; **Hướng dẫn** nằm trong menu ⋯ → Trợ giúp (thay mục "Hướng dẫn sử dụng" cũ, mở cùng nội dung với nút (?) trước đây). Thanh tiêu đề còn: tên sản phẩm · Bước x/5 · Lưu / Xuất · ⋯.
2. **Menu ⋯ sắp lại theo mục đích**: Công cụ nâng cao (Lớp & nét, Bàn dữ liệu, Phiên bản) · Không gian (Hiển thị, Tùy biến, Sáng/Tối) · Trợ giúp.
3. **Bảng Kiểm tra**: "Các mục đã có" thu thành một dòng kèm tỉ lệ (vd. 6/6), bấm mới mở danh sách.
4. **Bảng Kiểm tra**: bỏ nút "Quay lại dữ liệu" (đã có Dữ liệu ở thanh trái và "Chỉnh dữ liệu" trên sản đồ); còn một nút chính **Xem bản xuất**.
5. **Bảng Lưu / Xuất**: "Câu hỏi trắc nghiệm bằng AI" thu gọn, bấm mới mở phần giải thích và nút sao chép prompt.
6. **Sửa lỗi điện thoại**: menu ⋯ trước đây tràn ra ngoài cạnh phải màn hình; nay nằm gọn trong khung, cuộn được khi dài.

`verify-studio-plus.cjs`: mở Hướng dẫn qua menu ⋯ (máy tính và cảm ứng).

## Vòng 28 — Xuất tệp linh hoạt: chế độ xuất và bật/tắt từng phần

Theo đề nghị: phần xuất cần điều chỉnh linh hoạt, có nhiều chế độ và bật/tắt được từng phần. Tất cả nằm trong **Lưu / Xuất → Xuất ảnh hoặc PDF → Nội dung bản xuất**; sản đồ bên cạnh cập nhật ngay.

1. **5 chế độ xuất một chạm** (có nhãn chế độ đang dùng; tự chuyển sang "Tùy chỉnh" khi đổi lẻ một phần):
   - **Đầy đủ** — mọi vùng, chú giải, ghi chú đọc phiếu.
   - **Chỉ tiến triển** — tim thai, CTC & đầu trên vệ, cơn co; bỏ ghi chú.
   - **Đề thi** — kèm đề bài/tình huống, không kèm ghi chú & nhận định (tránh lộ đáp án).
   - **In đen trắng** — đủ vùng, nét đen trắng.
   - **Trình chiếu** — gọn theo dữ liệu, ghi số cạnh điểm, bỏ lưới phụ.
2. **Bật / tắt từng phần trên phiếu** (11 công tắc, thu gọn sẵn, hiện số phần đang bật): tiêu đề ca, họ tên & mã bệnh nhân, đề bài, chú giải, ghi chú đọc phiếu & nhận định, giờ thực, đường dóng sự kiện, ghi số cạnh điểm, dải tim thai bình thường, lưới phụ, đen trắng.
3. **Bật / tắt từng vùng sản đồ**: chọn "Tự gọn theo dữ liệu", "Đầy đủ các vùng" hoặc "Tự chọn từng vùng"; bấm công tắc một vùng sẽ tự chuyển sang tự chọn. Vùng CTC & đầu trên vệ luôn có.
4. **Tùy chọn mới "Ghi chú đọc phiếu & nhận định"** trong bản vẽ (mặc định bật; lưu cùng thiết kế) — trước đây luôn in.
5. Ba ô "Kèm đề bài / Kèm chú giải / Đen trắng để in" rời rạc được gộp vào nhóm trên; công tắc dạng gạt, vùng chạm ≥ 38 px.

`verify-easy.cjs` thêm: chế độ Đề thi ẩn ghi chú & có tình huống; Đầy đủ khôi phục; tắt vùng Nhiệt độ làm mất hàng trên hình và nhãn thành "Tùy chỉnh"; công tắc Đen trắng; Đầy đủ đưa về màu.

## Vòng 29 — Xuất tệp: bộ tùy chọn riêng, áp cho đề & đáp án

1. **Lưu bộ tùy chọn riêng**: trong "Bật / tắt từng phần", đặt tên (vd. "Đề giữa kỳ") → **Lưu bộ**. Bộ đã lưu thành một ô chế độ (viền đứt) cạnh 5 chế độ có sẵn, bấm để áp lại; nút ✕ trên ô để xóa. Tối đa 4 bộ, lưu trên trình duyệt này.
2. **Dòng tóm tắt dưới các chế độ** cho biết bản xuất sẽ gồm gì, vd. "3 vùng · chú giải · không ghi chú · đen trắng".
3. **Gói "In đề + đáp án" theo Nội dung bản xuất**: hình trong đề dùng cùng vùng, chú giải, đen trắng; khi bật ẩn danh thì phần thông tin đầu đề bỏ họ tên và mã. Hình trong đề **không bao giờ kèm ghi chú nhận định** (tránh lộ đáp án) và không in đề bài hai lần.
4. **"Về mặc định"** đưa mọi công tắc và cách chọn vùng về như ban đầu.
5. **"Ký hiệu ối" chuyển vào nhóm Bật / tắt từng phần** — bớt một mục rời trong bảng xuất.

`verify-easy.cjs` thêm: lưu bộ "Đề giữa kỳ", chuyển chế độ khác rồi áp lại bộ đã lưu, lưu đúng vào bộ nhớ trình duyệt, đề & đáp án không có ghi chú đọc phiếu, xóa bộ, về mặc định.

## Kiểm chứng

- `verify.cjs` (812), `verify-easy.cjs` (thêm: 7 mẫu có hình thu nhỏ, mở đúng mẫu, nhận định mẹ/pha tiềm thời trên từng mẫu), `verify-library.cjs`, `verify-studio-plus.cjs` đạt; `git diff --check` sạch.
