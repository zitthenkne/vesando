# Lần nâng cấp 2 — thao tác chính xác, công cụ ở bên phải

Yêu cầu trọng tâm: chuyển toàn bộ cụm **Thêm điểm / Nhập bảng / Kéo điểm** sang bên phải, giảm bước chọn–sửa–ghi và làm giao diện chỉn chu hơn.

## 24 thay đổi mới

| # | Thay đổi | Hiệu quả khi dùng |
|---|---|---|
| 1 | Mặc định đặt thanh công cụ ở cạnh phải trên desktop | Không cần tự đổi vị trí sau khi mở trang. Cấu hình cũ được chuyển sang bố trí mới. |
| 2 | Chuyển cả cụm Chọn / Thêm điểm / Nhập bảng vào inspector | Không còn hàng thao tác nằm ngang chiếm chỗ trên sản đồ. |
| 3 | Chuyển biểu mẫu nhập chi tiết của ca thi sang phải | Nhìn bản vẽ và nhập số cạnh nhau; bản nháp vẫn xem trước trực tiếp. |
| 4 | Chuyển Nhập nhanh của phân hệ Theo dõi sang phải | Không phải đi xuống dưới sản đồ để tìm biểu mẫu. |
| 5 | Thay ô sửa nổi bằng bộ sửa cố định trong inspector | Ô nhập không che điểm hoặc nhảy vị trí khi cuộn. |
| 6 | Kéo trực tiếp từ chế độ Xem | Không cần chọn Dữ liệu trước khi kéo một điểm đã có. |
| 7 | Kéo không tự mở bảng chỉnh sửa | Giữ không gian bản vẽ; chạm một điểm mới mở công cụ của điểm đó. |
| 8 | Mặc định kéo chỉ đổi giá trị | Tránh vô tình dịch giờ khi muốn sửa số đo. |
| 9 | Chế độ kéo chỉ đổi thời điểm | Di chuyển ngang và giữ nguyên giá trị. |
| 10 | Giữ Shift để kéo tự do | Đổi cả giờ và giá trị ngay trong một cử chỉ; vẫn có tùy chọn cố định Đổi cả hai. |
| 11 | Nút tăng / giảm một bước và ghi ngay | Dùng đúng bước của từng thông số; không cần bấm Lưu thêm. |
| 12 | Chuyển đến điểm trước / sau cùng thông số | Ví dụ chỉ đi qua các điểm CTC, bỏ qua những mốc chỉ có tim thai. |
| 13 | Ghi số đang sửa trước khi chuyển điểm | Nhập số hợp lệ rồi bấm Tiếp, không cần Lưu riêng. |
| 14 | Giữ lại số sai khi chuyển điểm | Sai bước hoặc giá trị không hợp lệ sẽ được giữ để sửa, không âm thầm bỏ đi. |
| 15 | Các tab thông số ngay tại mốc đang chọn | Chuyển giữa CTC, đầu trên vệ và tim thai; số hợp lệ đang sửa được ghi trước khi chuyển. |
| 16 | Chỉnh giờ chính xác bằng ô số | Di chuyển điểm theo bước thời gian hiện có; hiển thị giờ cũ → giờ mới trước khi ghi. |
| 17 | Xóa riêng một điểm và hoàn tác | Giữ các thông số khác tại cùng mốc. Xóa điểm đầu trên vệ sẽ xóa hình kiểu thế gắn với chính điểm đó; Undo khôi phục cả hai. |
| 18 | Xóa điểm bằng Delete / Backspace | Áp dụng khi focus điểm trên bản vẽ, không can thiệp việc gõ trong ô nhập. |
| 19 | Lối tắt Định dạng ngay từ điểm | Mở đúng màu, nét và ký hiệu của thông số đang chọn. |
| 20 | Lối tắt Kiểu thế đúng mốc | Từ điểm đầu trên vệ đi thẳng đến hình của mốc đó. |
| 21 | Đánh dấu điểm chọn bằng vòng tròn | Đồng bộ bản vẽ và inspector, có chỉ báo focus bàn phím; không xuất vòng chọn vào tệp. |
| 22 | Thu phóng nổi gọn trên mặt giấy | Bỏ hàng trống dành riêng cho nút xem ở trên sản đồ. |
| 23 | Làm lại hệ thống thị giác | Thanh công cụ xanh đậm, mặt giấy trắng, nền xám lạnh, khoảng cách và kích thước chữ nhất quán; trạng thái trống minh họa đúng thao tác. |
| 24 | Chọn điểm rồi gõ số ngay trên desktop | Focus và chọn sẵn số trong ô; Enter để ghi. Trên điện thoại vẫn giữ bàn phím đóng cho đến khi người dùng chạm ô. |

## Những trường hợp đã đưa vào kiểm thử

- Kéo thật từ chế độ Xem; khóa giá trị, khóa thời gian và Shift.
- Chạm chọn bằng màn hình cảm ứng, không ghi thêm và không bấm nhầm nút vừa xuất hiện.
- Tăng số một bước, lưu khi chuyển điểm / thông số, giữ số nhập sai.
- Đổi giờ, chặn trùng thông số, xóa điểm, Undo và bảo toàn hình kiểu thế.
- Biểu mẫu ca thi và Nhập nhanh nằm trong inspector bên phải.
- Xuất SVG / PNG / PDF, bảo vệ bản nháp, clipboard và JSON.
- 120 cấu hình công cụ và 160 tổ hợp responsive ở 320 / 390 / 768 / 1024 / 1440 px.

Chạy `node verify.cjs`, `node verify-ui.cjs`, `node verify-workspace.cjs`. Hai bộ kiểm tra browser dùng `PLAYWRIGHT_MODULE` và `CHROME_EXECUTABLE` như lần nâng cấp trước.

Kết quả chạy sau cùng: **735 checks passed**; hai bộ kiểm tra browser đều **exit code 0**, gồm 120 cấu hình công cụ, 160 tổ hợp responsive và các luồng thao tác mới ở trên. Không ghi nhận lỗi runtime. Đã xem ảnh desktop và điện thoại của bộ sửa điểm mới.

Cấu hình giao diện mới được lưu trong `partograph-workspace-v3`. Dữ liệu ca và quy tắc lâm sàng không được lưu vào cấu hình này. Dữ liệu của ca chỉ thay đổi khi người dùng thực hiện thao tác chỉnh số đo.
