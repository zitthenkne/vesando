# Đối chiếu nguồn sản đồ

## Bổ sung biểu diễn dữ kiện đề thi — 25/10/2026

- Theo xác nhận mới nhất của người dùng, bản vẽ dùng **một đường độ lọt** và
  hai cột đọc chung: **5/5 ↔ −3; 4/5 ↔ −2; 3/5 ↔ −1; 2/5 ↔ 0;
  1/5 ↔ +1; 0/5 ↔ +2**. Bỏ đường station thứ hai. Đây là quy ước hiển thị do
  người soạn chốt cho bài học, không gán bảng này thành quy đổi lâm sàng phổ quát.
- Dữ liệu vẫn giữ nguyên cách ghi nguồn: `descent` (/5) hoặc `station`. Hàm vẽ
  định vị một điểm theo quy ước trên, không điền thêm kết quả khám chưa được cho.
  Nếu cả hai trường không khớp quy ước, vẽ theo /5 gốc và ghi rõ sai khác;
  station ngoài −3…+2 được giữ và thông báo ngoài thang, không ép về mốc cuối.
- Nguồn phân biệt phép đo: [MedlinePlus/NLM, Your baby in the birth canal](https://medlineplus.gov/ency/article/002060.htm),
  mục Fetal station; đầu trên vệ /5 giữ nguồn WHO/ICM 2008 đã đối chiếu bên dưới.
- Ngôi, kiểu thế nguyên văn, độ xóa CTC và mã kiểu thế chẩm được giữ theo từng
  lần khám. Mã LOA hoặc mô tả rõ “chẩm trái trước (CTT)” dựng hình tại đúng mốc;
  “ngôi đầu” không tự tạo kiểu thế. Nguồn thuật ngữ: [MSD Manual Professional,
  Fetal Presentation, Position, and Lie](https://www.msdmanuals.com/professional/gynecology-and-obstetrics/intrapartum-complications/fetal-presentation-position-and-lie-including-breech-presentation).
- Số giờ qua ngày và phút lẻ được giữ, không làm tròn để ép về ô nửa giờ.
  Giới hạn phần mềm mở từ 24 lên 72 giờ và tối đa 300 lần ghi; đây là giới hạn
  tài nguyên phần mềm, không phải thời gian theo dõi hoặc ngưỡng can thiệp y khoa.
  Thiếu năm thì để trống ngày ISO và giữ ngày nguyên văn, không tự lấy năm hiện tại.
- Bảng AI đối chiếu từng lần khám dùng cùng mốc căn và hình học với bản vẽ.
  Không đổi độ dốc, điểm khởi đầu hoặc ngưỡng cảnh báo của các mô hình hiện có;
  không bổ sung chẩn đoán, liều thuốc, phác đồ Anti-D hoặc đáp án câu hỏi của đề.
- Kiểm tra bằng đề người dùng đưa: 7 lần khám qua 25 giờ, mốc 15:20, station
  −3 → −2 → +1; /5, tim thai và liều tăng co chưa cho được giữ trống. Hình CTT
  chỉ xuất hiện ở 17:30; thiếu độ xóa ở mốc cuối không tự suy thành 100%.
  `verify-exam-conversion.cjs` kiểm tra JSON khứ hồi, ba mô hình, bảng nhập,
  ngày thiếu năm, hai phép đo đồng thời và SVG không chứa đích chỉnh sửa.

## Cập nhật ký hiệu hiển thị — 17/10/2026

Theo yêu cầu người dùng, nhãn mặc định hiển thị Việt là **C = còn ối; T = nước ối trắng; K = khô/không thấy dịch sau vỡ ối; X = xanh/phân su**. Chữ T được đổi từ “Trong” thành “Trắng” theo cách gọi người dùng yêu cầu. Trống là chưa ghi nhận, không tự chuyển thành K. Các mức phân su (+/++/+++) được giữ, lẫn máu ghi rõ “Máu”.

Dữ liệu nội bộ tiếp tục dùng WHO I/C/A/M/B. JSON mẫu, prompt và tệp JSON mới dùng C/T/K/X và có `fluidNotation: "vn"` trong từng ca. Bộ đọc chuyển mã theo khai báo riêng từng ca; JSON WHO cũ không khai báo vẫn được đọc theo WHO. Chỉ đổi nhãn, định dạng trao đổi và chuyển mã đầu vào có khai báo; không đổi ngưỡng cảnh báo.

Không coi C/T/K/X là quy ước duy nhất của mọi biểu mẫu tại Việt Nam. [Tài liệu Bộ Y tế, Quyết định 2919/QĐ-BYT 2014, tr. 149](https://extranet.who.int/ncdccs/Data/VNM_D1_QD%20so%202919_QD-BYT%20huong%20dan%20kham%20chua%20benh%20tram%20y%20te%20xa.pdf) còn trình bày D/P cho dạng đầu ối chưa vỡ và M cho nước ối có máu. Ứng dụng giữ nhãn “Máu” để phân biệt với M = phân su trong dữ liệu WHO.

Ngày đối chiếu: 16/10/2026. Phạm vi: quy ước vẽ, tịnh tiến, cảnh báo và lưu đồ đọc sản đồ trong Sản đồ Studio. Đây là hồ sơ đối chiếu cho phần mềm học tập, không phải phác đồ điều trị của một cơ sở.

## Thứ tự sử dụng nguồn

- **WHO 1993 và Modified trong bài học UMP:** ưu tiên handout có tác giả Âu Nhựt Luân và hai lưu đồ Hồ Viết Thắng – Âu Nhựt Luân, Bộ môn Phụ Sản ĐHYD TP.HCM, 2020.
- **LCG:** dùng biểu mẫu WHO 2020/2021 và User’s manual riêng; không ghép đường báo động/hành động cũ vào LCG.
- **Slide, đề OSCE, ghi chú, ngân hàng câu hỏi:** dùng để nhận diện tình huống và điểm dễ nhầm. Không nâng một đáp án hoặc ghi chú thứ cấp thành tiêu chuẩn chẩn đoán.
- **Biểu mẫu Từ Dũ:** là mẫu khác, có các hàng EFM, cường độ cơn co và cách ghi độ lọt riêng. Không gắn nhãn “mẫu Từ Dũ” cho sản đồ WHO thích nghi của ứng dụng.

## Các quyết định được đưa vào phần mềm

| Nội dung | Căn cứ | Cách xử lý |
|---|---|---|
| WHO 1993: mốc 3 cm, báo động từ (8,3), hành động lệch 4 giờ | Handout trang in 36–37; Nguyên lý sản đồ tr. 2–3; hình mẫu WHO 1998 | Thêm mô hình riêng. Tịnh tiến một lần; giữ giờ thực độc lập với hoành độ. Khoảng trống do tịnh tiến không nhận thao tác ghi dữ liệu. |
| Modified: mốc 4 cm | Handout trang in 37 | Điểm đầu pha hoạt động luôn trên báo động, kể cả khi xuất hiện muộn trong chuỗi dữ liệu. Không ép độ dịch phải không âm. |
| Đầu trên vệ /5 | Handout hình 2–3; WHO/ICM 2008 hình 4.2 | 0–5/5 ở nửa dưới lưới CTC 0–10; không đổi station sang /5. |
| Trên đường báo động | Handout trang in 38 | Điểm đầu hoặc đường trùng báo động không tự tạo cảnh báo tiến triển chậm. |
| CTC bên trái, đầu không xuống | Handout tr. 38; lưu đồ tr. 91 | Gợi ý đánh giá sự xuống và trở ngại cơ học; không kết luận bình thường chỉ từ CTC. Không gán khoảng thời gian chẩn đoán đình trệ mới. |
| CTC bên phải | Handout tr. 39; lưu đồ tr. 92 | Mở các nhánh đánh giá 3P, ối, cơn co và can thiệp trước đó. Không tự chẩn đoán CPD. |
| Chạm/vượt hành động | Handout tr. 40; Nguyên lý tr. 3 | Nhắc đánh giá và quyết định quản lý; không tự chỉ định mổ hoặc tăng co. Mở trọn không xóa cảnh báo đã có tại mốc khám đó. |
| Đánh giá sau can thiệp | Handout tr. 39–40 | Trong mô hình cổ điển: đường CTC trở lại song song báo động kèm đầu xuống là đáp ứng thuận lợi; không cần quay về bên trái. |
| Ối Việt C/T/X/K và WHO I/C/M/A | Handout tr. 35, chú thích 5 | Chỉ đổi ký hiệu hiển thị. JSON lưu WHO: I=còn, C=trong. Phân su có mức được bảo toàn. Prompt chuyển đề giải thích rõ hai nghĩa của C. |
| LCG: ngưỡng cảnh báo | Biểu mẫu LCG, cột ALERT | Một hàm `lcgAlert` dùng chung cho đánh dấu trên hình và cảnh báo. M/M+/M++ không tự nâng thành M+++. Dữ liệu trống không bị coi là số 0. |
| LCG: CTC không tiến triển | LCG User’s manual | Chỉ đánh giá thời gian không đổi qua các lần khám thực sự. Không suy diễn đình trệ từ thời gian trôi qua hoặc làm tròn CTC 5,5 thành 5. |
| Tần số cơn co >5 | Cột ALERT của LCG; đọc cơn co trong handout | Nhắc đánh giá tần số và thai. Không suy ra cường độ, trương lực nền hay chẩn đoán nguyên nhân từ số cơn. |
| Tốc độ 1 cm/giờ | WHO 2018, khuyến cáo 7–8 | Gắn rõ đây là mô hình lịch sử để học/đọc đề; không lấy riêng tốc độ này làm chỉ định can thiệp hiện hành. |

## Những khác biệt không được chép thành quy tắc

1. `.qbank/topics/5.3 Sản Đồ WHO 1993.md` mang tên WHO 1993 nhưng ghi mốc 4 cm; còn khẳng định uốn khuôn độ 3 là dấu hiệu chắc chắn CPD. Ứng dụng ưu tiên handout có tác giả: 3 cm cho WHO 1993, đánh giá CPD theo tổng hợp lâm sàng.
2. `2. Đọc sản đồ.pdf` có đoạn mốc ≥4 cm nhưng ngay sau ghi pha hoạt động 3–10 cm. Không dùng đoạn này để chọn hệ tọa độ.
3. Tên tệp `Biểu đồ chuyển dạ WHO 1998.pdf` không đủ để tạo một mô hình mới: hình thực tế có pha tiềm thời và điểm (8,3). Dùng để đối chiếu hình dạng với WHO 1993, không suy diễn lịch sử xuất bản từ tên tệp.
4. `Nguyên Lý Sản Đồ WHO.pdf` và handout mô tả lịch sử tên phiên bản khác nhau. Giao diện hiển thị rõ mốc và hình học thay vì khẳng định mọi bản Modified là bản sao chính thức.
5. Tài liệu OSCE có các khuyến nghị xử trí theo ca và theo thời kỳ. Ứng dụng không trích liều thuốc, không tự ra y lệnh phá ối/tăng co/mổ từ các đáp án này.

## Nguồn WHO trực tuyến đã kiểm tra

- [WHO Labour Care Guide – biểu mẫu](https://cdn.who.int/media/docs/default-source/reproductive-health/maternal-health/who-labour-care-guide.pdf)
- [WHO Labour Care Guide – User’s manual](https://www.who.int/publications/i/item/9789240017566)
- [WHO 2018 – giải thích thay đổi mốc 1 cm/giờ](https://www.who.int/news/item/15-02-2018-individualized-supportive-care-key-to-positive-childbirth-experience-says-who)
- [WHO/ICM 2008 – Managing prolonged and obstructed labour](https://cdn.who.int/media/docs/default-source/mca-documents/maternal-nb/midwifery/midwifery-education-module_3_managing-prolonged-and-obstructed-labour.pdf?download=true&sfvrsn=51584b42_1)

## Tài liệu người dùng cung cấp

Đã mở đủ 16 tệp. Các trang có lớp chữ được trích xuất để đối chiếu; hình lưu đồ và mẫu sản đồ được render xem trực tiếp. Các bản scan được đọc bằng OCR và kiểm tra hình ở phần liên quan. Một số tệp chứa nội dung ngoài sản đồ; không xem đó là căn cứ cho các quy tắc của ứng dụng. Không sửa các tệp nguồn trên ổ G:.

1. [3. Handout thực hành ghi và lí giải sản đồ.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/Sản chị Thuỳ Dung/0. ATCS/3. Handout thực hành ghi và lí giải sản đồ.pdf>)
2. [8. Nguyên Lý Sản Đồ WHO.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/Sản chị Thuỳ Dung/5. Chương 5/8. Nguyên Lý Sản Đồ WHO.pdf>)
3. [[SK] Lưu đồ - Lí Giải Các Dạng Sản Đồ WHO Bên Trái Đường Báo Động.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/LÝ THUYẾT/Chương 5. Chuyển Dạ Bình Thường/[SK] Lưu đồ - Lí Giải Các Dạng Sản Đồ WHO Bên Trái Đường Báo Động.pdf>)
4. [[SK] Lưu đồ - Lí Giải Các Dạng Sản Đồ WHO Bên Phải Đường Báo Động.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/LÝ THUYẾT/Chương 5. Chuyển Dạ Bình Thường/[SK] Lưu đồ - Lí Giải Các Dạng Sản Đồ WHO Bên Phải Đường Báo Động.pdf>)
5. [CHUYỂN DẠ BẤT THƯỜNG VÀ PARTOGRAPH.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/LÝ THUYẾT/Chương 5. Chuyển Dạ Bình Thường/CHUYỂN DẠ BẤT THƯỜNG VÀ PARTOGRAPH.pdf>)
6. [ÔN SẢN ĐỒ CHỊ UYÊN.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/OSCE CẦN ĐỌC/ÔN SẢN ĐỒ CHỊ UYÊN.pdf>)
7. [8 - giải đề chuyển dạ - CTG - sản đồ.docx](<G:/.shortcut-targets-by-id/1x5vGyHFgiprAye4jvH8EERK8BCRuhAuo/SẢN Y4/1. SẢN/13. ÔN OSCE SẢN/OSCE sản y4/Ôn OSCE/8 - giải đề chuyển dạ - CTG - sản đồ.docx>)
8. [IUGR-Partograph-1.pdf](<G:/.shortcut-targets-by-id/1x5vGyHFgiprAye4jvH8EERK8BCRuhAuo/SẢN Y4/1. SẢN/13. ÔN OSCE SẢN/Osce/IUGR-Partograph-1.pdf>)
9. [5.-Theo-dõi-chuyển-dạ-Sản-đồ.pdf](<G:/.shortcut-targets-by-id/1x5vGyHFgiprAye4jvH8EERK8BCRuhAuo/SẢN Y4/1. SẢN/13. ÔN OSCE SẢN/Osce/5.-Theo-dõi-chuyển-dạ-Sản-đồ.pdf>)
10. [2. Đọc sản đồ.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/OSCE/CĐ 5/2. Đọc sản đồ.pdf>)
11. [Sản Đồ.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/TÀI LIỆU THAM KHẢO/Sản Đồ.pdf>)
12. [Biểu đồ chuyển dạ - Từ Dũ.pdf](<G:/.shortcut-targets-by-id/1LGkoGmu2vsQz17j40FGYtpQ2Q28pnHOO/Y4 chị Mai Bùi/SẢN KHOA/BỆNH ÁN/Biểu đồ chuyển dạ - Từ Dũ.pdf>)
13. [Biểu đồ chuyển dạ WHO 1998.pdf](<G:/.shortcut-targets-by-id/1x5vGyHFgiprAye4jvH8EERK8BCRuhAuo/SẢN Y4/1. SẢN/2. LÝ THUYẾT/LT (Elearning)/CHỦ ĐỀ 5 QUẢN LÍ MỘT CUỘC CHUYỂN DẠ (BÌNH THƯỜNG VÀ BẤT THƯỜNG)/TÀI LIỆU THÊM/Biểu đồ chuyển dạ WHO 1998.pdf>)
14. [07. Sản đồ — Prompt video.md](<G:/Drive của tôi/Obsidian Vault/Y4/sản/Sản Y4/Video NotebookLM/Chương 5/07. Sản đồ — Prompt video.md>)
15. [Bài 23 - Sản Đồ WHO 1993.md](<G:/Drive của tôi/Obsidian Vault/Y4/sản/Sản Y4/Ngân hàng Y18 trở lên theo bài/Chủ đề 5 - Theo dõi và Quản lý chuyển dạ/Bài 23 - Sản Đồ WHO 1993.md>)
16. [5.3 Sản Đồ WHO 1993.md](<G:/Drive của tôi/Obsidian Vault/Y4/sản/Sản Y4/.qbank/topics/5.3 Sản Đồ WHO 1993.md>)

## Kiểm chứng triển khai

Chạy `node verify.cjs`. Bộ kiểm tra gồm hình học đầu trên vệ, ánh xạ giờ thực–hoành độ, tịnh tiến nguyên bản và Modified, mở rộng lưới khi dữ liệu vượt 24 ô giờ sau căn chỉnh, các biên ALERT của LCG, dữ liệu thiếu, và xuất SVG hữu hạn.

Kiểm tra ngày 16/10/2026: 138 mục đạt. Đã kiểm tra trên trình duyệt ở chiều rộng 390, 1024 và 1440 px; ba bảng công cụ không làm tràn ngang màn hình 390 px. Đã thao tác ghi điểm, hoàn tác, chỉnh dữ liệu và đổi thiết kế. Bản xuất của ca mẫu đầu tiên, cấu hình “Đề thi · ngang gọn”, ở cả ba mô hình đều có SVG hợp lệ, PNG 300 DPI và PDF một trang A4 ngang; đã render và xem lại PDF. Nội dung dài hơn vẫn có thể được chia nhiều trang. Không có lỗi hoặc cảnh báo trong console ở lần kiểm tra cuối.

Việc qua kiểm tra phần mềm không phải chứng nhận thiết bị y tế hoặc xác nhận một phác đồ điều trị.

## Bổ sung: khung theo dữ liệu và biên soạn nhanh

- Khung tự động giữ cả dữ liệu lẫn toàn bộ hai đường tham chiếu: Modified tối thiểu 10 giờ; WHO 1993 tối thiểu hoành độ 19; LCG tối thiểu 4 giờ. Mốc hoàn toàn trống không kéo dài hình. WHO 1993 vẫn giữ gốc và khoảng tịnh tiến, không dịch lại gốc để giả thành thời gian thực.
- Chọn khung thủ công hoặc chừa thêm giờ không cắt mất dữ liệu đã ghi: khung tự mở rộng và thông báo khi cần. Mốc cuối có dữ liệu dạng ô được cấp thêm một ô 30 phút, tránh đè lên mốc ngay trước đó.
- Bề rộng ô tự tăng cho ca ngắn; hình học đường tham chiếu được tính theo cùng tỷ lệ giờ. Cả hai đường được vẽ trọn đến CTC 10 cm; khung luôn chứa điểm cuối, kể cả khi chọn ít giờ hơn hoặc thiết kế cũ từng ẩn đường. Không thay đổi độ dốc tính bằng cm/giờ. Ngưỡng LCG nằm ở phần chú thích, tránh che diễn biến.
- Tự ẩn nhóm trống hoặc chọn nhóm thủ công chỉ tác động bản vẽ. Thông số số 0 vẫn được giữ. Xuất hình ẩn nhóm đã có dữ liệu mang nhãn “BẢN TRÍCH”; đánh giá vẫn sử dụng toàn bộ dữ liệu gốc. CTC, đầu trên vệ và trục giờ luôn hiện. Các hàng LCG chưa ghi nhận được thu gọn trong chế độ tự động.
- Thao tác ghi điểm dùng phép đổi tọa độ ngược theo đúng khung giờ và các hàng đã thu gọn. Chọn mốc tương lai hoặc di chuyển con trỏ bàn phím sẽ mở rộng khung đang nhập.
- Nhân bản tạo ca độc lập; hoàn tác/làm lại giữ tối đa 30 bước thay đổi ca thi trong phiên. Sao chép ảnh cần trình duyệt hỗ trợ Clipboard API và cho phép ghi clipboard. Độ phân giải PNG có các mức 1×–4×, vẫn gắn thông số mật độ 300 DPI.

Kiểm tra ở phiên bản trước: 195 mục tự động đạt; đã thao tác nhân bản, hoàn tác, làm lại, bỏ ca và khôi phục, sao chép ảnh thực tế, ghi điểm đầu trên vệ/tim thai/cơn co trên lưới đã thu gọn. Đã thử khung tự động/thủ công, nhóm tùy chọn và màn hình 390 px. Đã xác minh mức 4× có số pixel mỗi chiều gấp bốn mức 1×. Quy tắc cắt khung sát mốc cuối của phiên bản đó đã được thay bằng quy tắc giữ trọn hai đường ở trên theo yêu cầu mới.

## Không gian biên soạn theo bốn bước

Dữ liệu → Thiết kế → Rà soát → Xuất đề. Trang chỉ tập trung một ca trong phiên; trình chỉnh dữ liệu nằm cạnh hình trên desktop. Bản nháp cập nhật hình nhưng không ghi vào ca cho đến khi Áp dụng. Hủy trả về dữ liệu gốc. Khi có bản nháp chưa áp dụng, việc đổi ca và xuất ca đó được chặn với hướng dẫn quay lại chỉnh dữ liệu. Rà soát dùng dữ liệu đang xem trước và chỉ ghi rõ mục nào đã/chưa được ghi nhận, không đồng nhất thiếu dữ liệu với bất thường lâm sàng.

Bản xem trước ở bước Xuất dùng cùng hàm dựng SVG và cùng tùy chọn với tệp tải xuống, gồm chú giải, đề bài, màu và độ phân giải. Bấm hoặc nhấn Enter trên điểm CTC/đầu trên vệ/tim thai sẽ mở đúng mốc và nhóm nhập liệu. Dữ liệu tại mốc đang chọn được trình bày thành dải thông số cạnh thanh diễn biến.

Kiểm tra bản nâng cấp không gian biên soạn ngày 16/10/2026:

- `node verify.cjs`: 281 kiểm tra đạt, gồm giữ nguyên điểm cuối cả hai đường ở các khung tự động/thủ công/24 giờ, bản đầy đủ/rút gọn và cấu hình cũ từng ẩn đường.
- 19 kiểm tra thao tác trên trình duyệt đạt: xem trước bản nháp, giữ bản nháp qua các bước và phân hệ, bảo vệ chuyển ca/xuất tệp, áp dụng/hủy, hoàn tác/làm lại, sửa điểm bằng chuột/bàn phím và đồng bộ mốc khám.
- 32 tổ hợp bố cục (4 bước × 2 phân hệ × 4 chiều rộng 390/768/1024/1440 px) không tràn ngang trang. Nội dung SVG xem trước ở bước Xuất khớp với hàm xuất ở cả hai phân hệ và cả bốn kích thước màn hình. Trình nhập liệu nằm cạnh sản đồ ở desktop; đã xem ảnh giao diện điện thoại.
- Xuất thực tế ca mẫu đầu tiên ở ba mô hình, yêu cầu khung thủ công 4 giờ, bản rút gọn, độ phân giải 2×: Modified tự nới đến 10; WHO 1993 đến hoành độ 19; LCG đến 6 theo dữ liệu. SVG hợp lệ, Modified và WHO 1993 đều có trọn hai đường; LCG không có đường tham chiếu lịch sử. PNG lần lượt 2064 × 1450, 2352 × 1450 và 2192 × 1592 pixel, đều có mật độ 300 DPI. PDF của từng mẫu là một trang A4 ngang; đã render và xem lại cả ba. Đây là kết quả của ca mẫu/cấu hình nêu trên, không bảo đảm mọi nội dung dài đều nằm trong một trang.
- Không ghi nhận lỗi hoặc cảnh báo console trong phiên kiểm tra cuối.


## Chọn kiểu thế và thóp trên hình — 17/10/2026

- Nguồn đối chiếu: [MSF, 5.1 Normal delivery](https://medicalguidelines.msf.org/en/viewport/ONC/english/5-1-normal-delivery-51416916.html), phần nhận diện ngôi và kiểu thế; [NCBI Bookshelf, Anatomy, Head and Neck: Fontanelles](https://www.ncbi.nlm.nih.gov/books/NBK542197/), hình dạng thóp trước và thóp sau. Thóp sau là mốc nhận diện chẩm; thóp trước hình thoi, thóp sau hình tam giác.
- Bộ chọn gồm OA, OP, LOA, ROA, LOT, ROT, LOP và ROP, áp dụng cho ngôi chỏm. Quy ước hình: nhìn từ dưới, khớp vệ ở trên, trái mẹ ở bên phải trang. Không đổi ý nghĩa góc đã lưu ở phiên bản trước: 0° vẫn là chẩm hướng xuống trang.
- Trường tùy chọn `headMarker.fontanelles` nhận `both`, `posterior`, `anterior`; dữ liệu cũ không có trường này tiếp tục hiện cả hai. Lựa chọn là cách thể hiện hình do người dùng chỉ định, không tự xác định ngôi, độ cúi hoặc kết quả thăm khám. Việc chọn kiểu thế giữ nguyên thời gian và thông số đầu trên vệ; không ghi đè trường mô tả lâm sàng `fetalPosition`.
- Mỗi mốc lưu độc lập góc, cỡ hình và lựa chọn thóp. Cùng hàm vẽ được dùng trong bảng chọn, trên sản đồ và bản xuất; JSON giữ các thuộc tính này khi mở lại.


## Thao tác cùng bên và phạm vi điều chỉnh — 17/10/2026

- Thanh công cụ đặt sát bên phải bảng chỉnh trên desktop; ở điện thoại, thanh chuyển mục vẫn thao tác được khi bảng chỉnh đang mở. Bảng công cụ hỗ trợ kéo cạnh trái và phím mũi tên để đổi độ rộng.
- Kích thước tách thành Toàn bảng (chiều rộng, chiều cao, cột nhãn) và Từng vùng (chiều cao riêng). Dùng chung trục giờ giữa các vùng. Có mẫu Gọn/Cân đối/Thoáng, tăng giảm 10%, khóa tỷ lệ toàn bảng và lịch sử hoàn tác/làm lại thiết kế tối đa 30 bước.
- `headMarker.color` là thuộc tính tùy chọn, chỉ nhận mã HEX 6 ký tự. Hình không có màu riêng tiếp tục theo màu đường đầu trên vệ; bản in đơn sắc giữ màu riêng trong dữ liệu để khôi phục khi về chế độ màu.
- Bộ chọn kiểu thế có chuyển mốc trước/sau, định vị hình trên sản đồ, bảng màu và nhập mã HEX. Áp dụng nhiều mốc giữ góc của hình đã có; điểm chưa vẽ dùng góc đang chọn. Đây là sửa hình hiển thị; không sửa thời gian hay giá trị đầu trên vệ.
- Kiểm tra: `node verify.cjs` đạt 696 mục. `verify-ui.cjs` kiểm tra thực tế các thao tác trên, hoàn tác một lần áp dụng hàng loạt, dữ liệu lâm sàng không đổi, xuất SVG/PNG/PDF, bố cục 320/390/768/1024 px và không ghi nhận lỗi runtime trên trình duyệt.


## Chỉnh dữ liệu trực tiếp trên sản đồ — 17/10/2026

- Tab Dữ liệu có ba chế độ: Kéo điểm, Nhấp thêm và Nhập tay. Kéo điểm là mặc định; CTC, đầu trên vệ và tim thai hỗ trợ chuột, cảm ứng và phím mũi tên. Chế độ Thiết kế tiếp tục chỉ thay đổi cách trình bày.
- Kéo hiện điểm xem trước và giờ/giá trị dự kiến; dữ liệu chỉ ghi khi thả. Esc, pointer cancellation hoặc thả ngoài vùng giờ không ghi thay đổi. Mỗi lần kéo thành công là một bước hoàn tác.
- Di chuyển chỉ chuyển thông số đang chọn sang giờ mới; các thông số và ghi chú khác vẫn ở mốc cũ. Hình kiểu thế, góc, màu và cỡ đi theo điểm đầu trên vệ. Mốc đích đã có cùng thông số sẽ bị từ chối để tránh ghi đè.
- Nhập tay nằm dưới sản đồ, giữ nhóm trường và cơ chế xem trước/Áp dụng/Hủy. Ở phân hệ theo dõi, Nhập theo mốc và Bảng thông số đều nằm dưới hình; bản nhập nhanh chưa ghi nhận phải được Ghi nhận hoặc Hủy trước khi chỉnh trực tiếp hay hoàn tác dữ liệu.
- Tất cả thay đổi trực tiếp dùng cùng hàm `changeChartPoint` và `validateCase`; giữ nguyên quy tắc dữ liệu hiện có và cơ chế lịch sử của từng phân hệ. Các lớp bắt điểm và điểm xem trước không xuất vào SVG/PNG/PDF.
- Kiểm tra: `node verify.cjs` đạt 718 mục. `verify-ui.cjs` đạt kiểm tra kéo bằng chuột và cảm ứng qua Chrome DevTools Protocol, xem trước không ghi dữ liệu, hoàn tác một bước, đích trùng, Esc/pointer cancellation, thêm điểm, bàn phím, kéo sau khi đổi kích thước/phóng to, di chuyển hình kiểu thế và xuất SVG sạch. Cả ba chế độ được kiểm tra không tràn ngang ở 320/390/768/1024 px; cả hai phân hệ đã thử chỉnh điểm và bảo vệ bản nhập tay. Không ghi nhận lỗi runtime trong lượt kiểm tra.


## Rút gọn thao tác chỉnh dữ liệu — 17/10/2026

- Mở trang trực tiếp ở Dữ liệu, sẵn sàng kéo điểm. Thanh thao tác mặc định còn Thêm điểm và Nhập bảng; bộ chọn thông số chỉ xuất hiện khi thêm. Điểm cũ vẫn kéo được trong chế độ thêm.
- Bấm điểm mở ô sửa nhanh cạnh điểm: chọn thông số tại cùng mốc, nhập giá trị và Lưu. Chi tiết mở biểu mẫu đầy đủ bên dưới. Ô sửa nhanh né điểm đang chọn, ẩn khi kéo và theo vị trí khi cuộn.
- Thông báo trạng thái không chặn chuột hoặc cảm ứng. Luồng sửa nhanh dùng lại kiểm tra dữ liệu và lịch sử hiện có; thông số khác tại cùng mốc được giữ nguyên.
- Kiểm tra: `node verify.cjs` đạt 718 mục; `verify-ui.cjs` đạt toàn bộ kiểm tra trình duyệt, gồm sửa nhanh, bước số không hợp lệ, chọn thông số trùng vị trí, hoàn tác, kéo khi phóng to và chỉnh kích thước, kéo trong chế độ thêm, cảm ứng mô phỏng qua Chrome DevTools Protocol, nhập bảng và xuất SVG/PNG/PDF. Đã xem ảnh desktop và màn hình 390 px; không ghi nhận lỗi runtime trong lượt kiểm tra.


## Vị trí và kích thước nút trên toàn giao diện — 17/10/2026

- Dùng chung vùng bấm tối thiểu 44 × 44 px cho nút, tiêu đề mở nhóm và lựa chọn màu; tăng khoảng cách, giữ nhãn thao tác chính trên một dòng. Nhãn chuyển phân hệ và Tập trung được hiển thị trên điện thoại.
- Thêm điểm/Nhập bảng đặt bên trái vùng chỉnh dữ liệu; hoàn tác/làm lại thành nhóm riêng. Công cụ xem nằm trên sản đồ, có tên Khớp chiều rộng và Toàn màn hình trên desktop. Bảng thiết kế chia nhóm nút 3 + 2; bộ chuyển mốc kiểu thế rộng hơn, nút định vị tách thành hàng riêng.
- Hủy/Chi tiết ở trái, Lưu/Áp dụng ở phải; thanh cuối biểu mẫu giữ trong tầm bấm khi cuộn. Ghi nhận được đặt sau các ô nhập. Nút xóa có màu riêng và được giãn khỏi nút thêm.
- Khu nhập theo mốc chỉ chứa thao tác nhập; xuất PNG/PDF dùng bảng Xuất. Lưu/mở phiên JSON nằm trong menu của phiên, giữ nút Lưu JSON nhanh ở đầu trang. Clipboard được đặt cạnh ô JSON; Tải là hành động cuối của bảng Xuất. Các thao tác mới chuyển chỗ đã được kiểm tra hoạt động.
- Kiểm tra: `node verify.cjs` đạt 718 mục. `verify-ui.cjs` đạt toàn bộ kiểm tra chức năng, cảm ứng mô phỏng, xuất file và 120 bố cục (12 trạng thái × 2 phân hệ × 5 chiều rộng 320/390/768/1024/1440 px). Kiểm tra kích thước đích bấm, nhãn không bị cắt/xuống dòng ở hành động biểu mẫu, nhóm nút không chồng nhau và thứ tự hành động. Đã kiểm tra thêm bảng công cụ rộng 260/520 px ở 7 nhóm, xem ảnh desktop/điện thoại và thử đổi theme, tải/mở JSON từ menu. Không ghi nhận lỗi runtime. Lighthouse đạt Accessibility 100 cho giao diện mở đầu trên mobile (navigation) và desktop (snapshot), không có audit thất bại ở hai lượt kiểm tra này; không đo hiệu năng.


## Phản hồi tương tác và trạng thái lưu — 17/10/2026

- Nút lưu thiết kế, lưu điểm, ghi nhận, xuất file và sao chép phản ánh kết quả thật bằng nhãn và biểu tượng. Thiết kế đã lưu được đối chiếu với cấu hình hiện tại; sửa tiếp sẽ bỏ trạng thái đã lưu. Nút lưu mặc định có ở mọi nhóm thiết kế. JSON/PNG/SVG/PDF báo đã xuất sau khi tạo và khởi động tải tệp, không khẳng định tệp đã được ghi xong vào đĩa.
- Trạng thái đang xử lý, lỗi và thử lại được nối vào các thao tác bất đồng bộ. Xuất và sao chép ảnh có trạng thái riêng, dùng lại chốt chống chạy trùng. Kết quả cũ bị ẩn khi đổi ca, định dạng hoặc tùy chọn; sao chép JSON còn đối chiếu nội dung để tránh xác nhận nhầm khi văn bản đã đổi trong lúc clipboard đang xử lý.
- Sửa nhanh có bản xem trước giá trị cũ → mới, dấu xác nhận trên nút sau khi dữ liệu đã cập nhật, khóa nút khi không có thay đổi và đánh dấu điểm vừa ghi trên sản đồ. Bật Thêm điểm đóng ô sửa nhanh cũ để không che vị trí cần thêm.
- Ô dữ liệu có bản nháp được đánh dấu; biểu mẫu đầy đủ đếm các mục thay đổi và giữ quy trình Áp dụng/Hủy. Nút Ghi nhận không tạo lịch sử thừa khi chưa sửa thông số. Thông báo cập nhật có nút hoàn tác; chỉ cho dùng nếu ca, dữ liệu, lịch sử và trạng thái bản nháp còn phù hợp với thao tác vừa thực hiện.
- Ctrl Enter gửi đúng biểu mẫu đang có con trỏ, kể cả sửa nhanh điểm. Lỗi validation hiện cạnh ô, đưa con trỏ tới lỗi đầu tiên và mở nhóm đang đóng nếu cần; không sửa các giới hạn dữ liệu hiện có hoặc ghi đè lỗi validation riêng như HEX.
- Hiệu ứng nhấn, dấu xác nhận, mở nhóm và điểm vừa cập nhật ngắn, không dịch bố cục. Tiến trình có biểu tượng và chữ; `prefers-reduced-motion` bỏ chuyển động nhưng giữ trạng thái đọc được. Thông báo tiếp tục cho phép thao tác xuyên qua phần nền, chỉ nút hoàn tác nhận tương tác.
- Kiểm tra: `node verify.cjs` đạt 718 mục. `verify-ui.cjs` đạt kiểm tra hiện có, 120 bố cục và các kiểm tra phản hồi mới: lưu thành công, sửa lại sau lưu, lỗi localStorage/thử lại, Ctrl Enter, validation, đếm bản nháp, hoàn tác tại thông báo, trạng thái JSON, xuất PNG thật với giữ tải SVG để kiểm tra busy/chống chạy trùng, lỗi canvas/thử lại và giảm chuyển động. Nhánh clipboard thành công/thất bại/thử lại được kiểm tra bằng promise mô phỏng, không kiểm tra clipboard của hệ điều hành. Đã xem ảnh desktop/điện thoại; không ghi nhận lỗi runtime. Lighthouse snapshot desktop ở giao diện sáng và tối, cùng navigation mobile ở giao diện sáng đều đạt Accessibility 100 và không có audit thất bại; không đo hiệu năng.
