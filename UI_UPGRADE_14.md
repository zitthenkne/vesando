# Đợt tiếp theo: thêm 20 vòng cải tiến giao diện và AI

> Đã dừng lịch theo yêu cầu người dùng ngày 26/10/2026. Việc đối chiếu và ghép bản PC sau đó là yêu cầu riêng, xem COMPARISON_RECOVERY_2026-10-26.md. Các số vòng dưới đây là lịch sử trước khi dừng.

## Chỉ dẫn mới nhất của người dùng

Người dùng đánh giá giao diện **chưa hoàn thành** và yêu cầu thực hiện liên tục
**thêm 20 vòng**. Chỉ dẫn mới nhất bổ sung: **mỗi vòng phải có ít nhất 10 thay đổi
đáng kể, mang tính đột phá trong trải nghiệm sử dụng**. Kết luận hoàn thành ở
cuối UI_UPGRADE_13.md không còn là điều kiện dừng của đợt này.

- Đã hoàn thành theo tiêu chuẩn mới: **0 / 20 vòng đủ chuẩn ≥10 cải tiến**.
- Hai vòng nhỏ đã ghi bên dưới được giữ làm lịch sử trước khi người dùng nâng
  yêu cầu; không tính là vòng đạt tiêu chuẩn mới. Năm vòng của đợt cũ cũng không tính.
- Đang triển khai **vòng đủ chuẩn 1/20**, hiện có **13 / 14 hạng mục** hoàn thành
  và được kiểm chứng, xem bảng công việc ở cuối tệp.
- Baseline: `main`, commit `e3f956a61e773d7d0aeffb88b4f6b5b49d59dd72` đã có trên GitHub.
- Một vòng có thể cần nhiều lần scheduler đánh thức. Chỉ tăng số vòng khi đã
  có ít nhất 10 cải tiến đáng kể được triển khai và kiểm chứng trong cùng bảng
  công việc. Không tính nhịp lịch, lần chạy test hay việc cập nhật báo cáo là cải tiến.
- Không chia một chức năng thành nhiều sửa màu/khoảng cách/nhãn để đủ 10;
  mỗi mục phải giải quyết một nhu cầu sử dụng hoặc điểm nghẽn riêng có bằng chứng.
- Không dừng sớm chỉ vì test PASS hoặc tự nhận xét giao diện đã đủ tốt.
- Sau đủ 20 vòng, bàn giao kết quả thật, phần còn chưa đạt nếu có; dừng đúng lịch.
- Không thay đổi mã chỉ để đủ số vòng. Mỗi vòng cần quan sát một vấn đề sử dụng,
  triển khai chỉnh sửa có ích khi có bằng chứng, và kiểm tra kết quả.

## Trọng tâm và thứ tự công việc

Đây là hàng đợi kiểm tra theo nhu cầu người dùng, không phải cam kết thêm đủ
20 tính năng mới. Đọc mã và thao tác thật trước mỗi mục; điều chỉnh thứ tự khi
phát hiện vấn đề quan trọng hơn, ghi rõ lý do và kết quả.

1. Đánh giá lại các luồng thực tế từ đầu, ảnh desktop/mobile; ghi rõ điểm nào
   còn rối hoặc làm người dùng phải đoán. Ưu tiên thiết kế và khả năng sử dụng.
2. Trang mở đầu: hành động chính, cách bắt đầu, số nút và trạng thái chưa có sản phẩm.
3. Mở lại công việc gần đây và tìm đúng sản phẩm mà không qua nhiều bộ lọc.
4. Điều hướng công cụ: nhóm, thứ tự, nhãn và các lối mở đang trùng lặp.
5. Bắt đầu một sản đồ trống: bước đầu rõ ràng, không mở quá nhiều biểu mẫu.
6. Nhập/sửa số liệu: chỉ hiện đúng nhóm, đúng mốc và đúng thao tác đang cần.
7. Bảng bên và không gian bản vẽ: chiều rộng, cuộn, đóng/mở và giữ ngữ cảnh.
8. Không gian AI: giữ công việc đang làm giữa yêu cầu, phản hồi và xem trước;
   không mất nội dung khi đóng/mở, đổi bước hoặc thao tác sai.
9. Chọn việc cho AI: phân biệt tạo tình huống, hoàn thiện bản nháp và chuyển đề;
   lời giải thích, ví dụ và hành động tiếp theo phải rõ theo lựa chọn.
10. Soạn yêu cầu AI: mục tiêu, dữ kiện cố định, ràng buộc và đầu ra mong muốn
    được tổ chức dễ hiểu, không bắt người dùng phải biết JSON.
11. Dữ liệu ca đang mở đưa vào AI: người dùng biết chính xác đang lấy gì;
    phần tham chiếu dễ xem và điều chỉnh trong phạm vi phù hợp.
12. Nhận phản hồi AI: phản hồi lỗi có thể xử lý được, dán/tệp không gây mất dữ liệu;
    các chi tiết kỹ thuật chỉ mở khi cần.
13. Đối chiếu kết quả: nhìn rõ tình huống, bản vẽ và số liệu AI đưa về;
    kiểm tra nhu cầu so sánh với ca cũ trước khi áp dụng.
14. Chỉnh tiếp với AI: yêu cầu sửa, phản hồi mới, quay lại bản trước và tiếp tục
    mà không phải nhập lại từ đầu.
15. Áp dụng AI: thêm, thay, chỉ dùng ca được chọn, chuyển sang Theo dõi;
    tác động rõ ràng và hoàn tác thực sự hoạt động.
16. Hướng dẫn AI theo ngữ cảnh, ví dụ sử dụng và cách quay lại công việc chính;
    tránh thêm hướng dẫn dài hoặc hộp thoại chồng lên nhau.
17. Xuất sản phẩm: cấu hình theo nhu cầu, bản xem trước và tệp thực tế khớp nhau.
18. Thư viện và quản lý sản phẩm: tìm, tên, ghim, nhãn, phiên bản; giữ giao diện gọn.
19. Điện thoại, tablet, chiều ngang và bàn phím ảo: các hành động chính dễ tới,
    không bị che; điều hướng bàn phím và focus nhất quán.
20. Đi xuyên suốt một công việc hoàn chỉnh trên Live Server, rà ảnh trước/sau,
    kiểm tra dữ liệu và xuất tệp, sửa tồn đọng rồi bàn giao trung thực.

## Quy trình mỗi vòng đủ chuẩn

1. Đọc số vòng và nhật ký này, `git status`, xác định không có lượt trước đang chạy.
2. Quan sát web và đọc phần mã liên quan; lập bảng ít nhất 10 vấn đề/cải tiến
   có ý nghĩa thuộc phạm vi được giao. Mỗi mục có điều kiện nghiệm thu riêng.
3. Sửa tối thiểu theo `luat-lap-trinh` và `sieu-thiet-ke-ui`, tận dụng thành phần có sẵn.
4. Kiểm tra chức năng thực tế và ảnh khi bố cục đổi. Chỉ chạy bộ test liên quan;
   mở rộng hồi quy khi có thay đổi hoặc lỗi mới cần kiểm chứng.
5. Ghi vấn đề, thay đổi, tệp, kiểm chứng và phần còn thiếu của từng mục. Chỉ khi
   đủ ít nhất 10 mục đã nghiệm thu mới tăng số vòng; lượt đánh thức kế tiếp phải
   nối phần đang dở thay vì mở một vòng khác.

Giữ dữ liệu/thư viện, các quy chuẩn lâm sàng và mọi thay đổi không thuộc đợt này.
Không thêm backend, dependency, API trả phí hay gửi dữ liệu đến AI tự động.
Dùng `luat-y-khoa` và nguồn thẩm quyền nếu thật sự phải đổi nội dung y khoa.
Không gửi tin ra ngoài. Không tạo thêm lịch hoặc agent khi chưa có chỉ dẫn phù hợp.

## GitHub và kiểm chứng

Quyền commit/push `main` trong yêu cầu trước vẫn có hiệu lực cho các thay đổi
thuộc đợt nâng cấp này. Tạo mốc bàn giao sau khoảng mỗi 5 vòng mới khi các kiểm
tra cần thiết đã đạt; không force push, reset hay ghi đè thay đổi remote.
Trước mỗi push: kiểm tra diff, stage đúng tệp, cập nhật remote, xử lý thay đổi
đồng thời an toàn, và xác minh SHA sau push. Không tính commit/push thành vòng riêng.

Runtime và các bộ kiểm tra có sẵn xem UI_UPGRADE_13.md. Live Server của người dùng:
`http://127.0.0.1:5501/index.html`. Lỗi injection vào chuỗi HTML đã sửa; phải giữ sửa này.

## Nhật ký trước khi nâng ngưỡng 10 cải tiến/vòng

### Vòng mới 1/20 — bỏ công cụ vô nghĩa ở thư viện trống

- Quan sát lại đúng Live Server 5501 bằng browser context mới, không có sản phẩm.
  Khu thư viện vẫn hiện 10 điều khiển, gồm tìm kiếm, sắp xếp, ghim/lưu trữ,
  nhãn và đổi cách xem dù chưa có gì để quản lý. Đây là điểm gây rối thực tế
  chưa được xử lý trong 5 vòng trước.
- Ẩn bộ lọc/tìm kiếm/sắp xếp/đổi cách xem khi thư viện đang chọn chưa có sản phẩm;
  tự hiện lại ngay khi có sản phẩm. Điều kiện dựa trên tổng thư viện, không dựa
  trên kết quả lọc nên vẫn mở được các sản phẩm đã lưu trữ hoặc đang bị lọc.
- Đưa tùy chỉnh/sao lưu vào header để vẫn nhập được backup từ màn hình trống.
  Không bỏ khả năng phục hồi chỉ để giảm số nút.
- Đo lại: số điều khiển trong khu thư viện trống **10 → 1**; nút tùy chỉnh được
  chuyển ra header, nên tổng trang giảm 8 điều khiển chưa có tác dụng.
- Tệp sửa: `index.html`, các assertion tương ứng trong `verify-library.cjs`.
- `verify-library.cjs`: **toàn bộ PASS**, kể cả công cụ tự hiện lại sau khi tạo,
  thư viện/nháp, nhập/xuất SVG, 20 bố cục, storage hỏng/quota, migration, touch
  và nhiều tab. `git diff --check`: exit 0.
- Kiểm tra trực tiếp trang trống tại 320/390/768 px: không tràn ngang;
  nút tùy chỉnh 44 × 44 px; mở được bảng sao lưu trước khi tạo sản phẩm.
  Không có page error trong phiên quan sát.
- Đã xem ảnh trước/sau desktop và ảnh mobile trong
  `C:\Users\admin\AppData\Local\Temp\vesando-focused-ui`:
  `round-01-home-before.png`, `round-01-home-after.png`, `round-01-home-mobile.png`.
- Tồn đọng nhìn thấy: header/breadcrumb và phần giới thiệu AI vẫn chiếm nhiều
  chiều cao mobile; lối tạo Theo dõi chưa hiện trọn trong màn đầu 390 × 844.
  Vòng 2 cần xử lý thứ bậc và chiều cao màn mở đầu; vòng 3 ưu tiên mở lại công việc.
- Chưa commit/push đợt mới; giữ mốc bàn giao sau khoảng 5 vòng mới.

### Vòng mới 2/20 — đưa lựa chọn bắt đầu lên màn đầu điện thoại

- Đo trực tiếp tại 390 × 844: breadcrumb lặp lại điều hướng chiếm 75 px;
  khối giới thiệu/nhập AI cao 351,6 px; nút Theo dõi kết thúc ở y=853,3,
  bị cắt khỏi màn đầu. Bản này còn rườm rà dù ít nút hơn vòng trước.
- Chuyển một nút tùy chỉnh/sao lưu duy nhất vào hàng thương hiệu trong sidebar;
  mobile bỏ cả hàng breadcrumb lặp, desktop vẫn có breadcrumb.
- Thu gọn phần giới thiệu, khoảng cách và form ý tưởng trên mobile; giữ input
  16 px, nút AI 44 px và hai lối tạo Soạn đề/Theo dõi có mô tả.
- Sau sửa tại 390 × 844: khối AI còn 269,4 px; nút AI từ y=575,3 xuống y=385,8
  (xuất hiện sớm hơn 189,5 px); nút Theo dõi kết thúc ở y=655,8. Cả 3 lựa chọn
  bắt đầu hiện đầy đủ ngay trong màn đầu.
- Đo phát hiện nút tùy chỉnh chồng nút tạo mới ở 320 px trong bản thử đầu;
  đã sửa vị trí và kiểm tra lại: thương hiệu kết thúc x=145,7, tùy chỉnh
  x=152–196, tạo mới bắt đầu x=201,4; không còn chồng vùng bấm.
- Kiểm tra 320/390/768/1440 px không tràn ngang; mở được tùy chỉnh ở 320 px;
  gõ ý tưởng rồi mở AI giữ đúng nội dung. Không có page error trong phiên này.
- Tệp sửa: `canvas.css`, `index.html`; bổ sung assertion màn đầu, kích thước
  và không chồng nút trong `verify-library.cjs`.
- `verify-library.cjs`: **toàn bộ PASS**, gồm kiểm tra mới và các nhánh bảo toàn
  dữ liệu, 20 bố cục thư viện/editor, xuất thật và lỗi storage. `git diff --check`: exit 0.
- Đã xem ảnh `round-02-mobile-before.png`, `round-02-mobile-after.png`,
  `round-02-mobile-320.png`; ảnh desktop `round-02-desktop.png` được lưu cùng
  thư mục ảnh kiểm tra. Không gán kết quả 390 × 844 cho màn 320 × 568:
  màn ngắn vẫn cần cuộn để thấy các lựa chọn phụ.
- Tiếp theo: vòng 3 cần ưu tiên việc mở lại sản phẩm của người quay lại, thay vì
  luôn bắt họ đi qua khối bắt đầu lớn; chưa commit/push trước mốc 5 vòng mới.

## Bảng công việc vòng đủ chuẩn 1/20 — đang làm, chưa chốt

Chỉ dẫn nâng ngưỡng đến khi đang triển khai phần mở lại công việc. Những mục
đã xong dưới đây thuộc lượt đang làm, được kiểm chứng bằng browser và bộ test;
chưa được tính thành một vòng hoàn thành.

| # | Nhu cầu/cải tiến | Điều kiện nghiệm thu | Trạng thái |
|---|---|---|---|
| 1 | Mở lại sản phẩm vừa sửa trực tiếp từ đầu trang | Mở đúng sản phẩm, thiết kế, mốc và bản nhập dở; không tự áp dụng bản nháp; loại trừ sản phẩm đã lưu trữ | Đạt |
| 2 | Trang quay lại ưu tiên công việc, tạo mới mở theo nhu cầu | Các biểu mẫu tạo mới thu gọn mặc định; nút Tạo mới mở lựa chọn; lần đầu dùng vẫn hiện đủ lối bắt đầu | Đạt |
| 3 | AI vẫn truy cập ngay khi biểu mẫu tạo mới bị thu gọn | Một nút AI độc lập mở đúng luồng 3 bước; không mất yêu cầu chi tiết đã soạn | Đạt |
| 4 | Gom thao tác quản lý từng sản phẩm thành menu có nhãn rõ | Không cần đoán các icon ghim/đổi tên/lưu trữ/nhân bản; dùng được touch và bàn phím | Đạt |
| 5 | Nhân bản rồi tiếp tục biên soạn ngay | Có lựa chọn mở bản sao độc lập; giữ dữ liệu gốc, thiết kế và bản nháp | Đạt |
| 6 | Tìm và chuyển sản phẩm từ màn đang biên soạn | Tìm đúng cả Soạn đề/Theo dõi, mở đúng loại và giữ dữ liệu đang nhập | Chưa làm |
| 7 | Tách phản hồi AI khỏi JSON tự đồng bộ của sản đồ | Sửa/hoàn tác số liệu hoặc đổi công cụ không làm mất phản hồi đang xử lý | Đạt |
| 8 | Tiếp tục phiên AI khi đóng/mở hoặc quay lại từ AI ngoài | Giữ đúng bước, nội dung và ca xem trước; dữ liệu tham chiếu chỉ gửi khi chọn rõ ràng | Đạt |
| 9 | Đối chiếu kết quả AI với dữ liệu gốc trước khi áp dụng | Thấy được phần thay đổi ở số đo/thời điểm/nội dung, không cần tự so hai khối JSON | Đạt |
| 10 | Chỉnh tiếp với AI có đường quay lại kết quả trước | Phản hồi mới không phá bản trước; có thể so sánh/khôi phục rồi áp dụng đúng bản | Đạt |
| 11 | Chuyển đề qua ngày và giờ lẻ đúng dữ kiện | Giữ 7 mốc của đề, 25 giờ và 15:20; không bịa năm hoặc thông số thiếu; mở lại/nhập bảng không làm tròn | Đạt |
| 12 | Biểu diễn đầy đủ dữ kiện khám sản khoa trên sản đồ | /5 và station dùng MỘT đường độ lọt; 2/5 ↔ 0, 0/5 ↔ +2; giữ ngôi/xóa/kiểu thế và dữ kiện nguồn | Đạt |
| 13 | Đọc vị trí từng lần khám so với hai đường tham chiếu | Bảng AI dùng cùng mốc căn với toàn ca; phân biệt WHO 1993/Modified/LCG, không đổi dữ kiện để đổi vùng | Đạt |
| 14 | Đổi tên ngay tại tiêu đề sản đồ | Một lần bấm, Enter lưu/Esc hủy, giữ nháp cả hai phân hệ; báo lỗi lưu đúng, không áp dụng nhầm số đo | Đạt |

Bốn mục 11–14 được thêm theo yêu cầu trực tiếp mới nhất về đề thi, độ lọt và
đổi tên. Gộp schema/vẽ/nhập liệu của cùng nhu cầu vào một mục, không tính từng
field hoặc sửa CSS thành cải tiến riêng. Mục 6 còn cần làm; mục 7–10 đã nghiệm thu trong nhật ký nối tiếp. Chưa chốt vòng.

### Kiểm chứng 3 mục đã xong trong lượt đang làm

- Màn có sản phẩm ở 1440 px: trước đây thẻ sản phẩm đầu tiên nằm y=949,6;
  sau sửa có nút mở nhanh tại y=238,4, thẻ thư viện được đưa lên y=675,6.
- 390 × 844: trước đây thẻ đầu tiên nằm y=1197,0; sau sửa nút mở nhanh nằm
  y=188,4 và thấy trọn trong màn đầu; thẻ thư viện ở y=752,7.
- Đã xem ảnh `round-03-return-before.png`, `round-03-return-after.png`,
  `round-03-return-mobile.png`; mở đúng đề vừa lưu chỉ bằng một lần bấm.
- `verify-library.cjs`: toàn bộ PASS, có assertion mới cho mở nhanh, giữ thiết kế,
  bản nháp không tự áp dụng, loại trừ lưu trữ và mở lựa chọn tạo mới theo yêu cầu.
- `verify-ai-studio.cjs`: toàn bộ PASS sau cập nhật đường tạo mới và mở lại;
  24 tổ hợp AI/theme/viewport và các nhánh phục hồi vẫn đạt.
- `verify-focused-access.cjs`: PASS, gồm bàn phím, touch, nhập AI sang Theo dõi
  và hoàn tác. Đã cập nhật đường mở lựa chọn tạo mới trong bài kiểm tra.
- Tệp hiện đổi thêm: `index.html`, `canvas.css`, `verify-library.cjs`,
  `verify-ai-studio.cjs`, `verify-focused-access.cjs`.
- Chưa commit/push đợt mới. Không đánh dấu vòng đủ chuẩn 1 là hoàn thành
  trước khi 7 mục còn lại được triển khai và nghiệm thu.

### Tiếp nối vòng 1: menu sản phẩm, chuyển đề, cột station và đổi tên

Tiến độ cập nhật: **0/20 vòng đủ chuẩn; vòng 1 có 9/14 mục đã nghiệm thu**.
Các mục 6–10 vẫn còn. Không đếm việc đổi hướng bố cục hoặc sửa kiểm thử thành vòng mới.

- Mục 4–5: thẻ sản phẩm còn một menu với 5 hành động có nhãn, mở được bản sao
  để chỉnh ngay. Sửa lỗi nhân bản tự áp dụng tên trong nháp và lỗi lưu nhãn làm
  đổi tên gốc. Giữ riêng dữ liệu đã lưu, thiết kế và nháp chưa áp dụng.
- Mục 11: prompt/validator cũ ép bước 0,5 giờ và tối đa 24 giờ nên không nhận
  đề có 15:20, kết thúc sau 25 giờ. Nay giữ phút, giới hạn tài nguyên 72 giờ/
  300 mốc; picker, bản lưu, sửa điểm, nhập bảng và điều hướng dùng cùng kiểm tra.
  Giờ đồng hồ trùng ở nhiều ngày cần +số giờ để tránh cập nhật nhầm ngày.
  Thiếu năm giữ ngày nguyên văn, không tự chọn năm hiện tại.
- Mục 12 theo sửa ý mới nhất của người dùng: **độ lọt vẫn chung lưới CTC**;
  cột /5 và station −3…+3 ở cạnh phải. Không còn biểu đồ station tách riêng.
  Hai đường dùng ký hiệu khác, dữ liệu độc lập, không biến −3 thành 3/5.
  Giữ độ xóa và kiểu thế từng lần khám; CTT/LOA dựng hình dù không có /5.
  Không tự vẽ kiểu thế ở mốc chỉ nói ngôi đầu. Dữ liệu có ±4/±5 thì cột mở rộng.
  Nguồn và phạm vi mẫu số thích nghi ghi trong CLINICAL_REFERENCES.md.
- Mục 13: bảng xem trước AI có giờ, CTC, % xóa, /5, station, ngôi/kiểu thế
  và vùng so với hai đường tham chiếu. Tính từ cùng mốc căn như bản vẽ, không
  tịnh tiến lại từng hàng. LCG ghi rõ không có hai đường lịch sử.
- Prompt chuyển đề phân biệt ối vỡ chưa cho màu với khô, cơn co thưa với số 0,
  số cơn với thời gian mỗi cơn, tăng liều với liều thực tế. Giữ tiền căn và
  câu hỏi trong narrative; không giải câu hỏi hoặc bổ sung y lệnh.
- Mục 14: bấm tên trên header để sửa, tự chọn tên cũ, Enter/dấu kiểm lưu và
  Esc/hủy trả về. Chặn tên trống; nếu storage đầy, báo tên mới chỉ ở trong
  phiên và cho thử lưu lại. Đổi tên không áp dụng CTC/tim thai đang nhập dở.
  Đã sửa va chạm nút lịch sử trên mobile và bảng bước trên tablet.

Kiểm tra đã chạy thực tế:

- `node verify.cjs`: **812 PASS**, giữ kiểm tra hình học/quy chuẩn cũ.
- `verify-project-actions.cjs`: **PASS**, bàn phím, 8 viewport/grid-list,
  bản sao độc lập exam/clinical và lỗi storage.
- `verify-exam-conversion.cjs --browser`: **PASS**, đề 7 mốc/25 giờ, phút lẻ,
  ngày thiếu năm, /5+station đồng thời, CTT, JSON khứ hồi, nhập bảng, điều hướng
  thật đến 15:20/+25h, cả ba mẫu SVG, 4 chiều rộng và áp dụng thật. JSON là
  **fixture kiểm thử theo đề, không phải phản hồi gọi AI thật**.
- `verify-direct-title.cjs`: **PASS**, Enter/Esc/chọn tên, tên trống, 4 viewport,
  quota/thử lại, mở lại sản phẩm, giữ nháp cả hai phân hệ.
- `verify-ai-studio.cjs`: **toàn bộ PASS**, gồm 24 tổ hợp bước/theme/viewport,
  handoff, brief, clipboard, JSON lỗi, thêm/thay/hoàn tác.
- `verify-library.cjs`: **toàn bộ PASS**, 20 layout, sửa điểm/hoàn tác, storage,
  migration, touch, nhiều tab và bản nháp.
- `verify-focused-access.cjs`: **PASS**, bàn phím, tương phản, touch và nhập AI
  sang Theo dõi có mốc đang nhập, hoàn tác dữ liệu/giờ gốc.
- `verify-boot.cjs`: **PASS** nhánh injection Live Server và Vue chậm/mất.
  URL thật 127.0.0.1:5501 hiện **connection refused**; các lượt trình duyệt chạy
  bằng server cô lập với cùng mã nguồn, không ghi là đã kiểm chứng phiên 5501 thật.
- `verify-ux9.cjs --unit`: **PASS** bộ đọc thời gian mới. Lượt full đầu bị
  chặn bởi harness cũ chưa vào workspace; lượt sau dừng ở nhãn “Mới nhất”
  trong khi giao diện dùng “Mốc mới nhất”. Đã cập nhật lối vào/nhãn/kỳ vọng phút,
  **chưa xác nhận toàn bộ lượt full sau sửa**; không tính là full PASS.
- Đã xem ảnh xuất đầy đủ `exam-transfer-who1993.png`, `both-descent-scales.png`,
  ảnh AI 390 px, menu mobile và đổi tên 390/1440 px trong thư mục Temp đã ghi.
  Ảnh hai thang đồng thời dùng dữ liệu minh họa; ảnh WHO 1993 dùng đề người dùng.
- Chưa commit/push đợt mới. Tiếp theo ưu tiên mục 7–8 giữ phản hồi/phiên AI,
  rồi mục 6/9/10. Không tăng vòng khi còn thiếu các mục của vòng đang làm.

### Tiếp nối vòng 1: phản hồi AI độc lập và tiếp tục phiên làm việc

Tiến độ mới: **0/20 vòng đủ chuẩn; vòng 1 có 11/14 mục đã nghiệm thu**.
Còn mục 6, 9 và 10; chưa chốt vòng và chưa đến mốc push sau khoảng 5 vòng.

- Đã tái hiện lỗi thật trên trình duyệt: nhập một phản hồi AI đang sửa, đóng
  hộp thoại, mở ca mẫu khác, mở AI lại. Phản hồi bị thay toàn bộ bằng JSON của
  ca mới. Bộ kiểm tra mới thất bại với đúng nội dung bị ghi đè trước khi sửa.
- Nguyên nhân: hộp thoại AI và dữ liệu JSON của sản đồ dùng chung `jsonText`;
  các thao tác lưu/sửa/hoàn tác/mở ca tự đồng bộ biến này.
- Mục 7: tách `aiReply` và lỗi nhập AI khỏi JSON của sản đồ. Nhập trực tiếp
  JSON, nhập AI, file thả vào và mở lại phiên đi đúng nguồn. Hai lối áp dụng
  dùng chung thao tác đưa các ca đã validation vào phiên, giữ thêm/thay, ID,
  thiết kế kèm theo và hoàn tác, không sao chép logic áp dụng hai lần.
- Sau áp dụng AI, JSON của sản đồ đồng bộ đúng các ca đã áp dụng (kể cả khi
  chỉ chọn một ca); phản hồi AI vẫn giữ toàn bộ các lựa chọn ban đầu. Hoàn tác
  sản đồ không đổi phản hồi. Bộ kiểm tra mới đã xác nhận cả lối JSON trực tiếp
  lẫn áp dụng AI và đồng bộ JSON sau đó.

| Nội dung | Nguồn | Khi áp dụng |
|---|---|---|
| JSON đồng bộ của sản đồ / nhập JSON trực tiếp | `jsonText` | Đọc từ ô JSON trực tiếp |
| Phản hồi AI, kể cả phần đang sửa/chưa hợp lệ | `aiReply` | Đọc đúng phản hồi AI đã xem trước |
| Bước/chọn ca/yêu cầu chỉnh tiếp | `aiSession` trong bộ nhớ | Giữ khi đóng/mở hộp thoại |

- Mục 8: mở lại giữ đúng bước, ký hiệu ối, ca xem trước, chỉ dựng ca được chọn,
  thêm/thay, yêu cầu chỉnh tiếp và nội dung trước đó cho thao tác khôi phục.
  Handoff chưa nhận kết quả mở lại ở bước Nhận phản hồi. Nếu đã nhận và đang
  xem trước thì giữ bước xem trước. Giữ lựa chọn nơi nhận trong cùng phân hệ;
  chuyển Soạn đề/Theo dõi thì nơi nhận theo phân hệ mới để tránh áp nhầm.
- Không khôi phục ngầm lựa chọn gửi dữ liệu ca đang mở; mỗi lần mở lại phải
  chọn tham chiếu rõ ràng. Trạng thái busy/focus/clipboard cũng không tái dùng
  từ hộp thoại đã đóng. Phiên này giữ trong bộ nhớ, **chưa phải phục hồi sau
  tải lại trang** và không tự lưu phản hồi AI vào localStorage.
- Đã xem ảnh `ai-session-resumed.png`: mở lại đúng Bước 3 và ca thứ hai của
  phản hồi, không tạo thêm hộp thoại chồng nhau.

Kiểm chứng lần này:

- `verify-ai-session.cjs`: **PASS** tải ca/hoàn tác không đè phản hồi AI; mở
  lại đúng bước/ca/notation/refinement/thêm-thay; một modal, trả focus đúng;
  JSON trực tiếp áp dụng nguồn riêng; tham chiếu phải chọn lại; quay lại từ
  handoff ở bước nhận kết quả; giữ nơi nhận được chọn trong cùng phân hệ.
- `verify-ai-studio.cjs`: **toàn bộ PASS**, 24 tổ hợp bước/theme/viewport,
  handoff, clipboard/race/lỗi, append/replace/ID, lựa chọn ca và undo. Hai điểm
  trong harness nay chọn Bước 1 rõ ràng trước khi sửa brief, vì mở lại giữ bước.
- `verify-focused-access.cjs`: **PASS**, gồm ngăn ghi đè mốc Theo dõi đang nhập,
  nhập sau khi ghi nhận và hoàn tác. Kiểm tra này phát hiện cần đổi nơi nhận
  theo phân hệ mới khi chuyển ngữ cảnh; đã sửa và chạy lại đạt.
- `verify-exam-conversion.cjs --browser`: **PASS**, vẫn giữ đề 7 mốc/25 giờ,
  station cùng lưới, CTT, xem trước/áp dụng và điều hướng phút qua ngày.
- `node verify.cjs`: **812 PASS**; `git diff --check` không có lỗi whitespace.
- Không chạy lại các bộ thư viện/xuất không bị ảnh hưởng. Không gọi dịch vụ
  AI thật, không sửa quy chuẩn y khoa, không thay dữ liệu thư viện.
- Tiếp theo: mục 9/10 đối chiếu và lịch sử chỉnh AI; mục 6 chuyển sản phẩm
  từ editor. Các mục mới này chưa được tính đạt.

### Sửa đúng ý người dùng: một đường độ lọt, hai cột đọc chung

- Người dùng làm rõ cần một đường độ lọt như sản đồ bình thường, không tạo
  thêm đường station. Mốc được xác nhận trực tiếp: **2/5 ↔ 0** và **0/5 ↔ +2,
  mỗi bậc chênh 1**. Bảng hiển thị là 5/5↔−3, 4/5↔−2, 3/5↔−1,
  2/5↔0, 1/5↔+1, 0/5↔+2. Chỉ dẫn này thay phần mô tả hai đường/thang
  −3…+3 trước đó; không triển khai lại cách vẽ cũ.
- Đã bỏ series station, ký hiệu tím và đường thứ hai. Ca chỉ có station,
  chỉ có /5 hoặc cả hai cùng quy ước đều dùng cùng đường và một điểm tại mỗi
  lần khám; cột station đọc cùng hàng với cột /5. Hình CTT tiếp tục nằm trên
  đường độ lọt này. Dùng cùng renderer cho xem trước và xuất SVG/PNG/PDF.
- Hàm định vị chỉ phục vụ quy ước hiển thị của bài, không điền thêm kết quả
  khám vào dữ liệu. Nếu hai trường gốc không khớp, vẽ theo /5 và ghi rõ khác
  biệt; station ngoài thang được giữ và thông báo, không ép vào mốc cuối.
- Prompt AI và chú giải được cập nhật để AI giữ cách ghi gốc, còn web vẽ một
  đường theo quy ước người dùng chốt. Không sửa quy chuẩn hoặc cảnh báo CTC.
- `verify-descent-convention.cjs`: **PASS**, đường vẽ /5/station/cả hai khớp
  nhau; cả 6 cặp nhãn cùng tọa độ trong 9 tổ hợp mô hình/bố cục; giữ CTT,
  JSON gốc, dữ kiện không khớp và dữ kiện ngoài thang.
- `verify-exam-conversion.cjs --browser`: **PASS**, ca thật được cung cấp vẫn
  đủ 7 mốc/25 giờ/15:20, có đúng 7 điểm độ lọt, không tạo series station;
  xem trước/áp dụng, ba mô hình và 4 viewport vẫn đạt.
- `node verify.cjs`: **812 PASS**; `git diff --check`: không lỗi whitespace.
  Đã xem ảnh mới `descent-shared-axis-detail.png`, `both-descent-scales.png`
  và `exam-transfer-who1993.png` trong thư mục Temp đã ghi. Ảnh chi tiết là
  minh họa bố cục, không phải thay thế dữ kiện ca người dùng.
- Đây là sửa lại mục 12 theo xác nhận, **không tính thêm một cải tiến/vòng**.
  Vẫn **0/20 vòng đủ chuẩn**, vòng 1 **11/14 mục**; còn 6/9/10. Phần đối
  chiếu/lịch sử AI đang được phân tích thì ưu tiên yêu cầu này trước, chưa
  triển khai hoặc tính đạt hai mục đó. Chưa commit/push đợt mới.


### Tiếp nối vòng 1: lịch sử phản hồi AI trước khi áp dụng

- Mục 10: trước đây chỉ có một lần hoàn tác nội dung; nhận A → B → C hoặc bắt đầu yêu cầu AI mới không có danh sách để xem lại A/B. Đã kiểm tra trình duyệt trước sửa: thiếu bộ chọn phiên bản.
- Giữ tối đa 8 phản hồi nguyên văn trong bộ nhớ, kể cả JSON lỗi hoặc văn bản đang gõ. Ghi bản trước khi thay bằng clipboard/tệp/mẫu, sửa văn bản, yêu cầu chỉnh tiếp, khôi phục và bắt đầu yêu cầu mới. Không tạo phiên bản sau mỗi ký tự.
- Bước 2 và 3 có mục thu gọn Phiên bản phản hồi: chọn bản/ca để đọc đề, số liệu và văn bản gốc. Xem bản cũ không đổi phản hồi đang làm hoặc sản đồ; Khôi phục là thao tác riêng, Áp dụng vẫn phải bấm rõ ràng. Bản bị thay lúc khôi phục cũng quay lại được, kể cả khi đủ 8 bản.
- Giữ ký hiệu ối và ca đã chọn khi khôi phục; đóng/mở hộp thoại, mở tệp từ editor và bắt đầu yêu cầu AI mới đều còn lịch sử. Đây là lịch sử trong phiên, chưa phục hồi sau reload; không tự lưu phản hồi vào localStorage hay gửi AI.
- Tệp: enhancements.js, index.html, canvas.css; verify-ai-versions.cjs.
- verify-ai-versions: PASS A/B/C, xem không đổi dữ liệu, khôi phục/áp dụng đúng bản, bản lỗi/gõ dở, nhiều ca/notation, giới hạn 8 và khôi phục bản cũ nhất, tệp/yêu cầu mới; 4 viewport. Đã xem ảnh ai-versions-390.png và ai-versions-1440.png trong Temp/vesando-focused-ui: dialog không tràn ngang, nút Áp dụng vẫn hiện.
- verify-ai-session, verify-ai-studio (24 tổ hợp), verify-focused-access: PASS. Không chạy lại thư viện/xuất hoặc kiểm tra y khoa không liên quan.
- Tiến độ: 0/20 vòng đủ chuẩn; vòng 1 đạt 12/14. Còn mục 9 đối chiếu thay đổi và mục 6 chuyển sản phẩm. Chưa commit/push.


### Tiếp nối vòng 1: đối chiếu AI với dữ kiện gốc

- Mục 9: quan sát bước Xem trước, phần Đối chiếu số liệu cũ chỉ cho số mốc và khoảng giá trị của phản hồi; không chỉ ra AI đã đổi gì. Người soạn vẫn phải tự mở hai khối JSON để tìm số đo, giờ hoặc tiền căn bị đổi.
- Thêm So sánh với dữ liệu gốc trong Bước 3. Người dùng chọn rõ ca đang mở (số liệu đã ghi) hoặc một phản hồi cũ, rồi chọn ca nếu phản hồi đó chứa nhiều ca. Không tự chọn một ca không liên quan để làm bản gốc.
- Bảng trước/sau chỉ hiện khác biệt, chia Thay đổi / Thêm dữ kiện / Bỏ dữ kiện và lọc theo nhóm. So các trường thông tin ca, đề bài, nhận định/kế hoạch đã ghi, toàn bộ số đo/ghi chép theo mốc, ký hiệu đầu/ô cơn co và nội dung sự kiện. Bỏ qua ID và thiết kế; không sửa dữ liệu.
- Ghép mốc theo phút từ giờ bắt đầu, giữ ngày qua đêm và giờ lẻ. Mốc chuyển giờ được báo một mốc bỏ và một mốc thêm, không đoán hai lần khám là một. Giờ/ngày bắt đầu được đối chiếu riêng; không nhầm 0 với chưa ghi. Bản nhiều ca phải chọn đúng ca; bản lỗi có thông báo, không hiện bảng kết luận sai.
- Có chỗ đọc cạnh đề gốc đã nhập với đề trong phản hồi. Văn bản tự do vẫn cần người soạn kiểm tra; đây không phải kiểm định tự động xem AI đã trích đúng mọi số đo/tiền căn từ văn xuôi. Không tuyên bố hai ca đúng về y khoa chỉ vì cấu trúc trùng nhau.
- Giữ lựa chọn bản/ca đối chiếu khi đóng/mở phiên. Xem/đổi bộ lọc hoặc Ctrl Enter khi đang đọc bảng không áp dụng phản hồi; Áp dụng vẫn là thao tác riêng.
- Tệp: enhancements.js, canvas.css; verify-ai-comparison.cjs. Không đổi các quy chuẩn lâm sàng hoặc quy ước một đường độ lọt.
- verify-ai-comparison: PASS đổi số đo/giờ/nội dung, thêm/bỏ tiền căn/ngày/sự kiện, lệch đúng 1 phút, số 0, baseline ca hiện tại/phản hồi cũ, nhiều ca/bản lỗi, không mutation và mở lại; 4 viewport. Nhãn thay đổi đo tương phản ≥4.5:1 ở light/dark; chặn Ctrl Enter áp dụng nhầm.
- Kiểm tra đầu phát hiện CSS bảng chung đè bố cục 320 px; đã sửa độ ưu tiên và đo lại 320/390/768/1440 không tràn. Đã xem ảnh ai-comparison-390.png và ai-comparison-1440.png trong Temp/vesando-focused-ui; mobile có hai ô trước/sau trên từng mục, nút Áp dụng vẫn hiện.
- verify-ai-versions PASS lại; verify-ai-studio toàn bộ PASS (24 tổ hợp); verify.cjs 812 PASS. Syntax JS và git diff --check đạt. Live Server 5501 vẫn connection refused lúc kiểm tra; browser dùng server cô lập cùng source, không gọi AI thật.
- Tiến độ: 0/20 vòng đủ chuẩn; vòng 1 đạt 13/14. Còn mục 6: tìm/chuyển sản phẩm từ editor và giữ bản nhập dở. Không tăng bộ đếm vòng, chưa commit/push.
