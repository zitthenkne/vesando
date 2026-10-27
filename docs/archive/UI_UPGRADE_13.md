# Giao diện gọn và không gian AI

> Cập nhật chỉ dẫn: người dùng đánh giá đợt này chưa hoàn thành và yêu cầu thêm
> 20 vòng. Tiếp tục theo **UI_UPGRADE_14.md**; không dùng kết luận dừng ở cuối
> báo cáo cũ làm điều kiện dừng của đợt mới.

## Mục tiêu

Mở web với ít lựa chọn; công cụ phụ mở khi cần. AI là lối bắt đầu rõ ràng,
phục vụ việc soạn tình huống và chuyển dữ liệu sang sản đồ bằng các công cụ AI hiện có.

## Checklist triển khai

- [x] Trang chủ ưu tiên bắt đầu với AI, thư viện dễ tiếp cận; mẫu thu gọn.
- [x] Thanh công cụ chính gọn; công cụ kiểm tra, diễn biến và xuất đặt trong nhóm Thêm.
- [x] AI có ba bước: yêu cầu, phản hồi, xem trước và áp dụng.
- [x] Tùy chọn chi tiết mở theo nhu cầu; hỗ trợ dùng dữ liệu ca hiện tại và yêu cầu bổ sung.
- [x] Có lựa chọn thêm ca hoặc thay phiên, mô tả rõ tác động trước khi áp dụng.
- [x] Kiểm tra thực tế desktop, tablet, mobile, dark mode, bàn phím và lỗi console.
- [x] Hoàn tất kiểm tra hồi quy, bao gồm các nhánh lỗi storage và AI.

Không thay tiêu chuẩn lâm sàng, thêm backend/dependency, gọi API AI trả phí
hoặc gửi dữ liệu ra ngoài tự động. Luồng AI tiếp tục dùng prompt, công cụ
do người dùng chọn và phản hồi được người dùng đưa về để xem trước.

## Tiến độ

Đã đọc mã nguồn và xem giao diện thực tế trên Chrome. Nền tảng là Vue qua CDN,
không cần build. Chỉnh trực tiếp template/component hiện có và lớp CSS liên quan.

## Loop và quyền GitHub

- Yêu cầu mới nhất: hoàn thành khoảng 5 loop rồi commit/push lên `main` GitHub;
  sau đó tiếp tục loop nếu còn thiếu so với yêu cầu gốc.
- Nhịp: 5 phút, trong chính chat này. Đếm lượt thực thi đã xong, không đếm nhịp lịch.
- Số vòng đã xong: **5**. Kiểm chứng hoàn tất; trạng thái GitHub được xác nhận
  riêng sau bước push trong tin nhắn bàn giao.
- Checkout hiện tại: `main`; HEAD lúc bắt đầu: `11ee290`. Ban đầu working tree sạch.
- Chỉ stage các tệp thuộc nâng cấp này; không force push, không reset/ghi đè remote.
- Mốc tiếp theo: vòng 2 kiểm tra lỗi storage và các nhánh phục hồi AI; vòng 3 kiểm tra
  chi tiết responsive/a11y/keyboard; vòng 4 hồi quy thư viện và xuất tệp; khoảng vòng 5
  tổng kiểm tra, cập nhật báo cáo và push `origin/main` sau khi mọi kiểm tra bắt buộc đạt.
- Nếu đã đủ chức năng sớm, các vòng còn lại tập trung kiểm chứng; không sửa chỉ để có diff.
- Khi đã push và không còn lỗi có bằng chứng hoặc yêu cầu chưa xử lý, tắt đúng heartbeat.

### Vòng 1 — đã triển khai và kiểm tra

- `node --check enhancements.js`, `node --check verify-ai-studio.cjs`: exit 0.
- `node verify.cjs`: **812 checks PASS**.
- `node verify-ai-studio.cjs`: **PASS**, gồm 24 tổ hợp bước AI/theme/viewport,
  4 bố cục trang chủ/theo dõi, JSON lỗi, xem trước không thay ca, thêm ca giữ ca cũ,
  xử lý ID trùng, chỉ nhập ca được chọn, hoàn tác, yêu cầu chỉnh tiếp, đổi AI.
  Không có lỗi console/runtime trong bài kiểm tra này.
- `verify-library.cjs`: 5 nhóm đầu PASS (lưu thư viện, bản sao, tìm/sắp xếp,
  SVG thật, chỉnh điểm, undo, hướng dẫn, nhập phiên, 20 bố cục).
  **Chưa PASS toàn bộ**: timeout ở dòng 75 khi chờ thông báo role=alert của
  thư viện hỏng. Cần xác định lỗi chức năng hay race của test trước khi push.
- Đã xem ảnh thật trang chủ, bước yêu cầu desktop và bước xem trước mobile;
  chỉnh lại bước 3 để bản vẽ xuất hiện trước các tùy chọn áp dụng mở rộng.
- Ảnh kiểm tra: `C:\Users\admin\AppData\Local\Temp\vesando-focused-ui`.
- Runtime có sẵn: `C:\Program Files\nodejs\node.exe`;
  `PLAYWRIGHT_MODULE=C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright`;
  `CHROME_EXECUTABLE=C:\Program Files\Google\Chrome\Application\chrome.exe`.
  Chạy các script với hai biến môi trường này; không cài thêm dependency.

### Vòng 2 — phục hồi AI và lỗi storage

- Xác định lỗi thật của vòng 1: thông báo lỗi thư viện bị đặt nhầm bên trong
  thư viện mẫu đang thu gọn. Đã đưa thông báo ra ngoài để luôn thấy được,
  kể cả khi đang lọc thư viện Theo dõi; giữ nguyên các cơ chế bảo toàn dữ liệu.
- `verify-library.cjs`: **toàn bộ PASS**, gồm thư viện hỏng, quota,
  migration một lần, touch thật và đồng bộ nhiều tab, ngoài 5 nhóm đã đạt ở vòng 1.
- Yêu cầu chi tiết AI (mục tiêu, ràng buộc) được giữ khi đóng/mở cửa sổ;
  chỉ lưu qua reload khi bật lựa chọn nhớ nội dung. Tắt lựa chọn sẽ bỏ bản nháp đã lưu.
  Dữ liệu tham chiếu vẫn cần bật chủ động mỗi lần mở AI.
- Lối bắt đầu AI mới từ trang chủ có ô phản hồi trống; không còn dùng JSON
  của ca trống làm phản hồi AI giả sẵn có.
- Chặn mở nhầm AI nếu người dùng đổi nhà cung cấp trong lúc clipboard còn chờ.
- `verify-ai-studio.cjs`: **PASS** sau khi bổ sung kiểm tra giữ brief và opt-in
  qua reload, bỏ tên/mã/narrative khỏi tham chiếu, clipboard bị từ chối,
  popup bị chặn, đổi nội dung/AI khi đang sao chép, paste chậm không ghi đè
  nội dung đang gõ và tệp quá lớn không thay phản hồi.
- Bài kiểm tra vẫn đạt 24 tổ hợp AI/theme/viewport và 4 bố cục trang chủ/Theo dõi;
  không có lỗi runtime/console. `node verify.cjs`: **812 PASS**.
- `node --check enhancements.js`, `node --check verify-ai-studio.cjs`,
  `git diff --check`: exit 0.

### Vòng 3 — sửa lỗi khởi tạo thật trên Live Server

- Người dùng gửi ảnh ở `http://127.0.0.1:5501/index.html`: biểu thức Vue hiện
  nguyên văn và nhiều overlay chồng nhau. Đã tái hiện trực tiếp: Vue tải được
  nhưng script ứng dụng báo `Invalid or unexpected token`.
- Nguyên nhân xác định từ response HTTP: Live Server chèn reload script trước
  thẻ đóng body đầu tiên, nằm trong chuỗi HTML của `examPackHTML`, làm hỏng
  cú pháp JavaScript. Các server fixture cũ không chèn script nên không bắt được.
- Đã escape hai thẻ đóng body trong chuỗi HTML của đề/đáp án và bàn giao;
  mã Live Server nay được chèn đúng cuối tài liệu. HTML xuất vẫn có thẻ đóng chuẩn.
- Đổi `#app[v-cloak]` sang ẩn toàn bộ ứng dụng trước mount. Khi Vue tải chậm
  hoặc lỗi, chỉ hiện thông báo khởi tạo/lỗi, không hiện template và overlay giả.
- `verify-boot.cjs`: **PASS**, kiểm tra injection như Live Server, Vue chậm,
  Vue không tải được, HTML hai loại bản xuất, và **đúng URL 5501 của người dùng**.
- Đã xem screenshot `live-preview-5501.png`; trang chủ lên đúng, không có lỗi page.
- `node verify.cjs`: **812 PASS**; syntax và `git diff --check`: exit 0.
- Phần đo a11y/keyboard chi tiết được chuyển sang vòng 4 cùng các nhánh Theo dõi;
  ưu tiên sửa lỗi khởi tạo người dùng đang gặp trước.

### Vòng 4 — bàn phím, cảm ứng, AI sang Theo dõi và hồi quy nâng cao

- Thêm `verify-focused-access.cjs`: đo vùng chạm khi mở các tùy chọn AI ở cả
  3 bước; chỉnh ô mục tiêu và select để đạt tối thiểu 44 px trên mobile.
- Đã đo tương phản chữ ở các điều khiển AI chính: đạt từ 4.5:1 trong light/dark.
  Đây là kiểm tra các mẫu được chọn, không phải chứng nhận WCAG toàn trang.
- Phát hiện và sửa vòng Tab thoát khỏi dialog; thêm chặn hai đầu danh sách focus.
  Đóng AI trả focus về nút mở hợp lệ, hoặc nút AI ở rail nếu nút trang chủ đã bị gỡ.
- Chặn shortcut của màn nền khi dialog AI đang mở; Ctrl K không mở thêm command
  dialog chồng lên AI. Kiểm tra provider menu bằng Enter/Tab/Escape đạt.
- Nhập AI sang Theo dõi: bản nhập dở được giữ và chặn thay hồ sơ; sau khi ghi
  nhận mới nhập được; hoàn tác phục hồi số liệu và mốc giờ, không đổi các ca Soạn đề.
  Nhãn mục áp dụng nêu rõ việc thay hồ sơ Theo dõi ngay khi đang thu gọn.
- `verify-focused-access.cjs`: **toàn bộ PASS**.
- `verify-studio-plus.cjs`: **toàn bộ PASS**, gồm lớp/khóa/nét, PNG/PDF thật,
  CSV, thao tác bảng, phiên bản/so sánh/khôi phục có checkpoint, metadata thư viện,
  backup, hướng dẫn tương tác, 80 bố cục dialog, storage hỏng và touch.
  Chỉ cập nhật đường mở thư viện mẫu thu gọn trong test; giữ các assertion dữ liệu.
- `verify-ai-studio.cjs`: **PASS** lại sau các sửa về focus/shortcut.
- `node verify.cjs`: **812 PASS**; syntax và `git diff --check`: exit 0.
- Remote xác minh: `https://github.com/zitthenkne/vesando.git`, `origin/main`
  vẫn là `11ee29029bee3d3ed88fa807519f6b9258cff751` lúc kiểm tra vòng 4.

### Vòng 5 — tổng kiểm chứng và bàn giao

- Đã rà diff cuối của 9 tệp trong đợt nâng cấp, gồm giao diện, AI, ba bài kiểm tra
  mới, cập nhật đường thao tác của hai bài hồi quy và báo cáo này.
- `verify-boot.cjs` chạy lại **PASS** với đúng Live Server 5501: khởi tạo không
  lỗi, không hiện overlay giả, cả hai bản xuất HTML vẫn hợp lệ.
- `verify-focused-access.cjs` chạy lại **PASS** sau thay đổi cuối: cảm ứng,
  tương phản các mẫu AI, bàn phím và nhánh nhập AI sang Theo dõi/hoàn tác.
- `node verify.cjs`: **812 PASS**. Syntax các tệp JS mới/sửa và `git diff --check`
  đều exit 0. Các bộ AI/thư viện/Studio nâng cao đã đạt tại vòng 2 và 4;
  không thay chức năng của những phần đó sau lần kiểm tra đạt.
- Đã fetch `origin/main` trước commit; HEAD và FETCH_HEAD cùng là
  `11ee29029bee3d3ed88fa807519f6b9258cff751`, không có thay đổi remote cần hợp nhất.
- Bước phát hành: stage đúng 9 tệp, commit/push `main` không force, đối chiếu
  SHA remote với HEAD; chỉ báo push thành công khi đối chiếu đạt.
- Phạm vi kiểm thử AI dùng phản hồi giả định và popup fixture. Không gọi model
  trả phí hoặc gửi dữ liệu người dùng tới nhà cung cấp AI để kiểm thử.
- Không còn lỗi có bằng chứng hoặc phần triển khai còn dang dở trong phạm vi này.
  Sau khi xác minh push thành công, tắt đúng heartbeat để tránh sửa không cần thiết.
