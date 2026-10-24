# Đợt 11 — dễ dùng như Canva, đủ kiến thức y khoa

Mục tiêu: người mới (kể cả học sinh) nhìn là hiểu cần làm gì, nhưng vẫn thể hiện đúng ngưỡng lâm sàng.

## Vòng 1 — Đèn ngưỡng trong Nhập nhanh

- Dưới các ô Tim thai, Mạch mẹ, Cơn co, Thời gian cơn co, Huyết áp, Nhiệt độ có dòng **Ngưỡng …**.
- Ô trống: chấm xám. Gõ số trong ngưỡng: viền và chấm **xanh** "Trong ngưỡng". Ngoài ngưỡng: viền, nền và chấm **đỏ** "Ngoài ngưỡng".
- Ngưỡng theo quy chuẩn đang chọn, dùng cùng logic cảnh báo của ứng dụng: tim thai 120–160 (WHO 1993/Modified) hoặc 110–159 (LCG); cơn co ≤ 5 cơn/10 phút (LCG 3–5); mạch 60–119; thời gian cơn co 20–60 giây; HA tâm thu 80–139, tâm trương < 90; nhiệt độ 35–37,4 °C.
- Đây là ngưỡng đối chiếu của mẫu, không thay cho đánh giá lâm sàng (ghi trong chú thích khi rê chuột).
- Độ mở CTC và đầu trên vệ không có ngưỡng cố định nên không hiện đèn.

## Kiểm chứng

- `verify.cjs`: 812 kiểm tra đạt.
- `verify-ranges.cjs` (mới): đèn ngưỡng trên desktop và điện thoại, đổi quy chuẩn LCG, không lỗi runtime.
- Ghi chú: phần lớn bộ kiểm tra trình duyệt cũ (`verify-ui.cjs`, `verify-bedside.cjs`, …) đã hỏng từ trước đợt này vì chưa đi qua màn hình chọn "Bạn muốn làm gì?". Đã xác nhận cùng lỗi trên mã gốc.
