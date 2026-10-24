# Đợt 11 — dễ dùng như Canva, đủ kiến thức y khoa

Mục tiêu: người mới (kể cả học sinh) nhìn là hiểu cần làm gì, nhưng vẫn thể hiện đúng ngưỡng lâm sàng.

## Vòng 1 — Đèn ngưỡng trong Nhập nhanh

- Dưới các ô Tim thai, Mạch mẹ, Cơn co, Thời gian cơn co, Huyết áp, Nhiệt độ có dòng **Ngưỡng …**.
- Ô trống: chấm xám. Gõ số trong ngưỡng: viền và chấm **xanh** "Trong ngưỡng". Ngoài ngưỡng: viền, nền và chấm **đỏ** "Ngoài ngưỡng".
- Ngưỡng theo quy chuẩn đang chọn, dùng cùng logic cảnh báo của ứng dụng: tim thai 120–160 (WHO 1993/Modified) hoặc 110–159 (LCG); cơn co ≤ 5 cơn/10 phút (LCG 3–5); mạch 60–119; thời gian cơn co 20–60 giây; HA tâm thu 80–139, tâm trương < 90; nhiệt độ 35–37,4 °C.
- Đây là ngưỡng đối chiếu của mẫu, không thay cho đánh giá lâm sàng (ghi trong chú thích khi rê chuột).
- Độ mở CTC và đầu trên vệ không có ngưỡng cố định nên không hiện đèn.

## Vòng 2 — Thanh công cụ luôn hiện (kiểu Canva)

- Máy tính (> 1100 px): thanh dọc nổi bên trái sản đồ, nút lớn có biểu tượng kèm chữ. Điện thoại/máy tính bảng: thanh dưới đáy màn hình.
- Soạn đề: **Nhập · AI · Trình bày · Kiểm tra · Lưu · Trợ giúp**. Theo dõi: **Ghi số · Bảng · Sản phụ · Đọc · Trình bày · Lưu · Trợ giúp**.
- Một chạm mở đúng công cụ; nút đang mở tô màu; chạm lại để quay về sản đồ.
- Trên điện thoại: ẩn Trợ giúp (vẫn có trong ⋯) để nút đủ to; thanh tự ẩn khi đang gõ để nhường chỗ cho bàn phím; không hiện khi Tập trung sản đồ hoặc in.
- Menu **Công cụ** cũ vẫn giữ để hướng dẫn từng bước hiện có tiếp tục chỉ đúng chỗ.

## Vòng 3 — Sản đồ trống có chỉ dẫn 3 bước

- Khi ca chưa có số đo nào, phía trên sản đồ hiện thẻ **Sản đồ đang trống · bắt đầu trong 3 bước**: ① Chọn mốc giờ ② Gõ số đo ③ Bấm ghi. Kèm mẹo bấm thẳng vào lưới.
- Nút làm ngay: **Ghi số đo đầu tiên**, **Lập bằng AI**; Soạn đề có thêm **Mở ca mẫu**.
- Thẻ tự biến mất khi đã ghi số đo đầu tiên; không hiện khi Tập trung, khi xuất hoặc in.
- Sửa thanh trên cùng trên máy tính: trải hết chiều ngang, không còn dải trống bên trái do thanh công cụ dọc.

## Vòng 4 — Kiểm tra biết "đọc" sản đồ

- Bảng **Kiểm tra** (Soạn đề) có mục **Sản đồ đang cho thấy**: kết luận chung (chấm xanh/cam/đỏ), từng dấu hiệu theo giờ với màu mức độ và **nguồn** (UMP 2020, WHO LCG…). Dùng cùng bộ quy tắc với Theo dõi, đổi theo quy chuẩn đang chọn.
- Ca chưa có số đo: không hiện câu "chưa có dấu hiệu vượt ngưỡng" để tránh trấn an sai.
- Sửa lỗi điện thoại: nút nổi "mở lại bảng công cụ" và nút đóng bị thanh công cụ dưới đáy che; nay nằm phía trên thanh.

## Kiểm chứng

- `verify.cjs`: 812 kiểm tra đạt.
- `verify-easy.cjs` (mới): đèn ngưỡng và thanh công cụ trên desktop và điện thoại, đổi quy chuẩn LCG, ẩn khi gõ, bật/tắt công cụ, không lỗi runtime.
- Ghi chú: phần lớn bộ kiểm tra trình duyệt cũ (`verify-ui.cjs`, `verify-bedside.cjs`, …) đã hỏng từ trước đợt này vì chưa đi qua màn hình chọn "Bạn muốn làm gì?". Đã xác nhận cùng lỗi trên mã gốc.
