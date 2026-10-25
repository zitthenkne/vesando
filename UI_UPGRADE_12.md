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

## Kiểm chứng

- `verify.cjs` (812), `verify-easy.cjs` (thêm: 7 mẫu có hình thu nhỏ, mở đúng mẫu, nhận định mẹ/pha tiềm thời trên từng mẫu), `verify-library.cjs`, `verify-studio-plus.cjs` đạt; `git diff --check` sạch.
