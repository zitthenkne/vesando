# Không gian sản đồ

## Phạm vi thực hiện

- [x] Hệ màu ngữ nghĩa, chữ điều khiển 14–16 px, giấy trắng và chọn đối tượng màu lam.
- [x] Ba không gian dùng chung ca/mốc/vùng xem; thanh công cụ cố định và ghim công cụ.
- [x] Bố cục theo không gian, ranh giới kéo được, phiếu nhập trên di động và thuận tay.
- [x] Điều hướng theo mốc/ngày, phóng theo công việc, quay lại và bản đồ nhỏ.
- [x] Phiếu theo mốc: đơn vị, dữ liệu trước ngoài ô, bàn phím, nháp bền vững và xem trước.
- [x] Chọn trực tiếp/nhiều đối tượng, thanh ngữ cảnh, thuộc tính Nội dung/Hiển thị, khóa lớp.
- [x] Chú thích có vị trí nhãn riêng và xem trước sắp xếp; phong cách xem trước bằng dữ liệu thật.
- [x] Bảng dữ liệu đồng bộ và luồng Dán → Ghép cột → Xem trước → Nhập có xử lý trùng.
- [x] Vấn đề có vị trí xử lý; lịch sử có thay đổi dữ liệu/trình bày và so sánh.
- [x] Trạng thái nháp/ghi/lưu, lưu riêng xuất, thư viện bên và phạm vi trợ lý AI.
- [x] Kiểm tra cú pháp, luồng thao tác trình duyệt, bàn phím, desktop/tablet/phone và hồi quy.

## Tích hợp

Giữ bộ dựng SVG, quy chuẩn, kiểm định ca và nhật ký hoàn tác hiện có. `workspace-next.js` điều phối các view của cùng ca, bản nháp theo sản phẩm và lựa chọn; `workspace-next.css` chỉ thay bề mặt điều khiển trên màn hình. Mọi thay đổi dữ liệu được kiểm định trước khi ghi và ghi một lần vào nhật ký dùng chung. Bản nháp lưu riêng, không tự trở thành số đo đã ghi. Bản xuất tiếp tục đi qua bộ dựng SVG chính thức.


## Hành vi đã triển khai

| Phần | Hành vi |
| --- | --- |
| Không gian | Nhập & theo dõi / Thiết kế / Trình chiếu cùng dùng một ca. Giữ mốc và khôi phục vùng xem; nhớ chiều rộng riêng từng không gian. |
| Công cụ | Năm mục chính cố định; AI ở thanh đầu; công cụ phụ có menu ghim và mở trực tiếp. Bỏ các mục nâng cao cũ trùng lối vào. |
| Nhập | Phiếu bốn nhóm, nhóm ghim, huyết áp cạnh nhau, đơn vị trong ô, phân loại bằng nút có nhãn, ghi chú mở rộng. Lần trước nằm ngoài ô trống. |
| Nháp | Lưu riêng theo sản phẩm và mốc, hiện điểm nét đứt “Chưa ghi”, bỏ từng trường/mốc. Phát hiện số đo đã đổi sau khi tạo nháp trước khi ghi đè. |
| Bàn phím | Enter sang trường kế; Ctrl Enter ghi; Ctrl Shift Enter ghi và chuyển theo khoảng đã chọn. Tab / Alt + mũi tên điều hướng bảng. |
| Chọn và kéo | Shift + chọn và kéo khung chọn cùng loại; thanh ngữ cảnh báo loại/số lượng; sửa dữ liệu hàng loạt qua xem trước. Kéo có Giữ giờ / Giữ giá trị / Tự do, bắt mốc tùy chọn và nhập phút chính xác. |
| Thuộc tính | Nội dung / Hiển thị theo đối tượng, nguồn nhập, khôi phục từng nhóm, công cụ gần điểm và chi tiết bên cạnh. |
| Lớp | Nhóm thông tin, tim thai, CTC/độ lọt, cơn co, thuốc, thông số mẹ, chú thích. Ẩn/hiện và khóa; chọn tên làm sáng vùng. Giữ thứ tự cấu trúc chuyên môn. |
| Chú thích | Dời nhãn độc lập với neo; nhãn ngắn / hộp / mũi tên; thứ tự đưa trước/sau. Xem trước sắp xếp cả trang trước khi áp dụng. |
| Phong cách | Bốn phong cách dùng dữ liệu hiện tại để xem trước; chỉ lấy chữ/lưới/màu/nét/khoảng cách và lưu mẫu cá nhân. |
| Điều hướng | Trục mốc kèm ngày, dấu dữ liệu/nháp/sự kiện/kiểm tra; đến giờ chính xác. Phóng theo chiều ngang, vùng chọn, mốc nhập, quay lại; bản đồ nhỏ khi phóng. |
| Bảng và Excel | Tên hàng và giờ cố định; chọn ô đồng bộ với sản đồ, đánh dấu ô sửa. Dán → Ghép cột → Xem trước → Nhập, bỏ qua/cập nhật/hủy khi trùng; đếm theo dữ liệu thực sự sẽ được ghi. |
| Kiểm tra | Tách dữ liệu, trình bày, nhận định theo quy chuẩn; mỗi mục có đường đến vị trí xử lý. Dùng lại quy chuẩn hiện có. |
| Phiên bản | Nhãn thay đổi, so hai bản với ảnh đánh dấu và danh sách trước/sau; lọc dữ liệu/trình bày. Vị trí và kiểu chú thích được xếp vào lịch sử trình bày. |
| Lưu và xuất | Nháp / ghi / lưu được nói bằng chữ, kèm nơi và thời điểm lưu. Lưu riêng Xuất; bản xuất có mục đích và cấu hình nhớ riêng, giấy PDF với lề/ngắt trang thật. Chọn vùng bản xuất quay về chỉnh. |
| Thư viện và AI | Mở thư viện trong bảng bên, ảnh/loại/giờ sửa/dấu nháp và bộ sưu tập; AI có phạm vi rõ và phần Thêm / Sửa / Giữ / Giả định, nhận theo nhóm. |
| Cảm ứng | Bảng dưới gọn/nửa/toàn màn hình, xử lý visualViewport khi bàn phím thay đổi, không khóa tương tác trục giờ phía sau. Máy tính bảng có đổi bên thuận tay. |
| Khả năng tiếp cận | Focus rõ, phản hồi bằng chữ, trạng thái bận/vô hiệu/lỗi, giảm chuyển động; kiểm tra tương phản cho thông báo/nút chính/không gian ở cả hai giao diện sáng tối. |

## Kết quả kiểm tra

- `node --check workspace-next.js`: đạt.
- Biên dịch cú pháp tất cả script nội tuyến trong `index.html`: đạt.
- `verify-next-workspace.cjs`: **22 kịch bản đạt**, không có lỗi JavaScript trong trình duyệt. Có thao tác chuột, Shift, kéo khung, kéo điểm, kéo nhãn và cảm ứng mô phỏng thật của Playwright.
- `verify-descent-convention.cjs`: đạt, giữ một đường độ lọt và các cặp trục qua 9 tổ hợp mẫu/bố cục, giữ số liệu gốc.
- `verify-boot.cjs`: đạt, gồm Vue tải chậm/không tải được và tài liệu xuất.
- `verify-ai-comparison.cjs`, `verify-ai-session.cjs`: đạt, đối chiếu và phiên AI không ghi đè lẫn nhau.
- `verify-direct-title.cjs`: đạt, gồm 320/390/768/1440 px, tên rỗng, lỗi bộ nhớ và dữ liệu chưa ghi.
- `git diff --check`: đạt.

Chạy các bài kiểm tra trình duyệt bằng Node với `PLAYWRIGHT_MODULE` trỏ tới Playwright có sẵn trong môi trường. Không thêm dependency cho ứng dụng.

Ảnh kiểm tra được tạo tại `%TEMP%/vesando-next-workspace/`: `desktop.png`, `capture.png`, `tablet.png`, `phone.png`, `export.png`.

Giới hạn xác minh: đã chạy trên Chrome desktop và mô phỏng cảm ứng/viewport thu hẹp; chưa chạy bàn phím ảo trên thiết bị iOS/Android vật lý. Cơ chế lưu tiếp tục dùng bộ nhớ của trình duyệt trên thiết bị hiện tại.

## Tiến độ 30 thay đổi vòng 2

- [x] 15. Bấm tên lớp chọn và mở thuộc tính, không tự phóng; nút kính lúp riêng (zoomLayer) mới phóng tới vùng. Đã chạy lại erify-next-workspace.cjs: đạt.
- [ ] Còn lại 29 mục (1-14, 16-30). Node dùng từ `~/.cache/codex-runtimes/.../node/bin/node.exe`.
- [x] 2 (một phần). Vùng/đường chỉ có thuộc tính trình bày mở thẳng tab Hiển thị, ẩn tab Nội dung. Chưa gộp `Mở thuộc tính chi tiết` vào bảng.
- [x] 5 (một phần). Bảng Hiển thị ghi `Áp dụng cho: …`. Chưa đổi phạm vi và chưa gắn nhãn Toàn sản đồ trên từng ô màu/chữ/lưới.
- Kiểm tra vòng này: `verify-next-workspace.cjs` đạt, không có lỗi chạy.
- [x] 8. Vùng/đường/điểm thuộc lớp khóa vẫn chọn được; bảng thuộc tính hiện `<Lớp> đang khóa` kèm nút Mở khóa (`selectionLayer`). Có bài kiểm tra mới trong `verify-next-workspace.cjs`; 23 kịch bản đạt. Chưa có lý do cố định theo mẫu ở từng điều khiển.
- [x] 26 (một phần). Phiếu nhập báo rõ `Đang nhập mốc …` và liệt kê nháp ở mốc khác (bấm để quay lại); nháp theo mốc nên không bị ghi sang mốc mới. Có bài kiểm tra mới; 24 kịch bản đạt. Chưa có chế độ ghim `mốc đang sửa` tách khỏi `mốc đang xem`.
- [x] 30 (một phần). Escape trong bảng công cụ có thứ tự: rời trường đang gõ → bỏ chọn → đóng bảng (trừ phiếu nhập); không đụng dữ liệu ca. Hủy kéo vẫn do biểu đồ xử lý trước. Có bài kiểm tra mới; 25 kịch bản đạt. Chưa phân biệt Ctrl+Z trong ô gõ với hoàn tác toàn ca, chưa có hủy thử màu.
- [x] 27 (một phần). Thẻ mốc báo số thông số đã ghi (`Đã ghi N thông số`); tiêu đề phiếu ghi `các ô trống chưa nhập` thay vì `Đã ghi vào ca`. Chưa phân biệt trạng thái từng ô (đã ghi / chưa nhập / đang sửa) khi mở phiếu. Kiểm tra: 25 kịch bản đạt.
- [x] 12. Thanh ngữ cảnh nổi ở đầu vùng sản đồ (`position:absolute`), không còn chèn hàng làm sản đồ nhảy xuống ~78 px khi chọn. Bài kiểm tra mới đo hộp `svg.partograph` trước/sau khi chọn; 26 kịch bản đạt. Lưu ý: thanh nổi có thể che phần đầu trang trong lúc có lựa chọn; chưa kiểm tra bằng mắt trên phone.
- [x] 9 (đo, chưa đạt). Bài kiểm tra mới chỉ ghi số đo, chưa ép ngưỡng: viewport 1440x1000, vùng cuộn sản đồ chiếm ~41% (`panel=''`, nhưng khung bên vẫn mở) và ~28% khi mở phiếu nhập; mục tiêu đề xuất 70–80% / 55–65%. Phần lớn do chiều rộng (sản đồ co theo bề ngang 868 px còn 470 px cao) và ~470 px chrome ngang: thanh công việc 82, thanh không gian 73, trục thời gian 138, viewbar 54, điều khiển phóng 56. Chưa giải quyết; cần thiết kế lại.
- [x] 10 (một phần). Dải `N ca trong phiên` chỉ hiện khi có từ 2 ca; khi chỉ có 1 ca, nút `Thêm ca` nằm ở thanh không gian (`work.newCase`). Chưa gộp thanh đầu thành một hàng, chưa có menu cạnh tên ca.
- Kiểm tra: `verify-next-workspace.cjs` đạt, không lỗi chạy. Đặt `LAYOUT_PROBE=1` để in chuỗi bố cục phía trên sản đồ.
- [x] 16 (một phần). Bài kiểm tra mới xác nhận trên desktop 1440x1000 trang ngoài không cuộn (`scrollHeight<=innerHeight`); sản đồ và bảng công cụ có vùng cuộn riêng. Chưa kiểm tra ca dài, nhiều bảng mở, cuộn chạm tới cuối bảng và tràn cuộn (`overscroll-behavior`).
- Mục 16: thêm `overscroll-behavior:contain` cho bảng công cụ, sản đồ và bảng dữ liệu; cuộn tới cuối không kéo trang. Kiểm tra: đạt.

### Đợt 7 mục (theo yêu cầu: tối thiểu 7 nâng cấp mỗi vòng)
- [x] 1 (một phần). Chọn vùng/đường/nhãn tiêu đề (không qua danh sách lớp) mở ngay bảng Thuộc tính ở tab Hiển thị. Chưa sửa vùng bấm trong `index.html` (nhãn hàng, viền, khoảng đệm).
- [x] 4 (một phần). Đường dẫn `Trang giấy › Vùng … › Điểm/Đường/Chú thích` trong bảng; bấm cấp cha để chọn vùng.
- [x] 6 (một phần). Nhớ tab Nội dung/Hiển thị theo loại đối tượng (`tabByType`).
- [x] 7. Từ phiếu nhập/bảng dữ liệu mở thiết kế rồi đóng (hoặc Escape, hoặc `Quay lại phiếu nhập`) trở về đúng bảng, đúng mốc, giữ nháp. Có bài kiểm tra mới.
- [x] 14/19 (một phần). Mở bảng hoặc chọn đối tượng chỉ cuộn sản đồ khi đối tượng nằm ngoài tầm nhìn (`centerMoment(…,onlyIfHidden)`), không căn giữa lại mỗi lần. Chưa chặn việc co lại khi mở bảng bên.
- [x] 5 (một phần). Nhãn `Toàn sản đồ` trên các điều khiển phông/cỡ chữ/căn tiêu đề.
- [x] 11 (một phần). Chú giải trục thời gian chỉ hiện ở không gian Nhập & theo dõi.
- Kiểm tra: 27 kịch bản đạt, không lỗi chạy.

### Đợt 7 mục thứ hai
- [x] 23 (một phần). `Sao chép kiểu` / `Áp kiểu` giữa đường và điểm: lấy màu, nét, ký hiệu, không đụng số đo. Chưa có lựa chọn chỉ-màu/chỉ-chữ, chưa áp cho nhãn/vùng.
- [x] 27. Mỗi ô nhập hiện trạng thái `đã ghi` / `chưa nhập` / `đang sửa` (`data-state`); ô trống không bị coi là 0.
- [x] 30 (một phần). Ctrl+Z trong ô gõ không lan lên hoàn tác của ca (`guardUndo`).
- [x] 13 (một phần). Mở lại ca khôi phục bảng bên làm việc gần nhất của không gian đó (`lastPanel`). Chưa gắn với ý định `Ghi mốc mới`.
- [x] 6. Đổi loại đối tượng đưa bảng về đầu; nhớ tab theo loại.
- [x] 5 (một phần). Chip `Áp dụng: …` trên điều khiển màu/nét/ký hiệu.
- [x] 11 (một phần). Trục mốc thu gọn (một dòng) ngoài không gian Nhập & theo dõi.
- Kiểm tra: 28 kịch bản đạt, không lỗi chạy.

### Đợt 7 mục thứ ba
- [x] 17 (cửa sổ thời gian; mục này trước ghi nhầm số 17). Trong `Phóng tới`: 2/4/8 giờ và ‹ › trước/sau; chỉ đổi vùng xem, không đổi dữ liệu. Có bài kiểm tra.
- [x] 28 (một phần). `Thêm chú thích` lấy mốc của điểm đang chọn. Chưa đặt vị trí nhãn gần vùng CTC.
- [x] 21 (một phần). Đặt con trỏ vào ô nhập thì làm sáng các điểm cùng thông số trên sản đồ (`next-focus-row`); chưa làm sáng cột giờ.
- [x] 2 (một phần). Vùng có sẵn `Ẩn/Hiện` và `Khóa/Mở khóa` ngay trong bảng.
- [x] 25 (một phần). Điểm đã chọn có nút `Mở cả mốc`; sửa một ô dùng lại trình sửa một trường.
- [x] 26 (một phần). Rời mốc đang có nháp báo rõ nháp được giữ riêng, không ghi sang mốc mới.
- Kiểm tra: 29 kịch bản đạt, không lỗi chạy. Chưa làm: 3, 18, 20, 22, 24, 29.

### Đợt thứ tư
- [x] 3 (một phần). Bấm nhãn hàng luôn chọn vùng dù gần đó có điểm số đo (`pickItem`). Chưa tách nét nối / khoảng giữa hai vùng.
- [x] 18 (một phần). Khi phóng >120% hiện nhãn hàng cố định bên trái (chỉ trong giao diện biên tập, không vào bản xuất). Chưa có cột giờ cố định khi kéo dọc.
- [x] 8 (thêm). Ô nhập thuộc lớp khóa hiện `Đang khóa` kèm nút Mở khóa tại chỗ. Chưa có lý do cố định theo mẫu.
- [x] 5 (thêm). Chip `Áp dụng: chú thích này` cho màu/cỡ chú thích.
- [x] 16 (thêm). Bảng công cụ `touch-action:pan-y` để cử chỉ chạm bắt đầu ở bảng thì điều khiển bảng.
- [x] 19. Con trỏ vào ô nhập: cột giờ hiện tại sẵn được làm sáng (`next-active-column`) và nay hàng cùng thông số cũng sáng; không cuộn thêm.
- [x] 9 (đo lại). Đóng cả `inspectorOpen` vẫn ~41%: nguyên nhân chính là chiều ngang/thanh trên, không phải bảng bên. Cần thiết kế lại thanh trên và khung sản đồ.
- Kiểm tra: 30 kịch bản đạt, không lỗi chạy. Chưa làm: 20, 22, 24, 29.

### Đợt thứ năm
- [x] 29 (một phần). Dán không có cột giờ sẽ bắt đầu từ ô số đo đang chọn theo khoảng nhập (`importAnchor`); chưa dán theo cả khối nhiều thông số theo vị trí ô.
- [x] 24 (một phần). Chip `Theo mẫu <tên>` / `Tùy chỉnh` cho đường; đổi phong cách mặc định giữ chỉnh sửa riêng từng đường (`keepCustom`). Chưa có nút công tắc trong bảng Phong cách và chưa phủ nhãn/vùng.
- [x] 23 (thêm). Chọn lấy tất cả / chỉ màu / nét & ký hiệu.
- [x] 2 (thêm). Phần ít dùng gộp trong `Tùy chọn khác`.
- [x] 21 (một phần). Bảng vùng ghi rõ chiều cao vùng không co giãn chữ, phóng màn hình chỉ đổi cách xem. Chưa có tùy chọn `Co giãn chữ theo vùng`.
- [x] 11 (thêm). Ngày chỉ hiện ở mốc đầu mỗi ngày; mốc trống thu hẹp.
- [x] 12 (giữ). Thanh nổi chỉ mang điều khiển gọn (`compact`) vì bản rộng đã che điểm đo ở bài kiểm tra Shift-click.
- Kiểm tra: 31 kịch bản đạt, không lỗi chạy. Chưa làm: 20 (tay nắm), 22 (đã bảo đảm một bước hoàn tác cho mỗi lần đổi nhưng chưa có bài kiểm tra riêng).

### Đợt thứ sáu
- [x] 20 (một phần). Tay nắm ngay trên sản đồ ở không gian Thiết kế: ranh giới cột nhãn/lưới (`labelWidth`) và đáy mỗi vùng (`sectionHeights`); rê hiện tên và giá trị; kéo rồi thả mới ghi (một bước hoàn tác), phím mũi tên chỉnh từng nấc, Escape hủy. Chưa xem trước trực tiếp khi đang kéo (chỉ tay nắm di chuyển), chưa có tay nắm khoảng trống tiêu đề và lề giấy (thiết kế hiện chưa có thuộc tính tương ứng).
- [x] 22 (một phần). Mỗi lần thả tay nắm hoặc đổi màu/nét là một bước; chưa có bài kiểm tra đếm số bước lịch sử.
- [x] 30 (thêm). Escape hủy kéo tay nắm. Bài kiểm tra mới xác nhận.
- [x] 1 (thêm). Bấm nền ngoài trang giấy trong vùng cuộn thì bỏ chọn.
- [x] 18 (thêm). Khi phóng hiện nhãn `Đang xem hh:mm – hh:mm` cố định phía trên.
- [x] 10/9 (một phần). Thanh không gian 73→61 px, trục mốc thu gọn 100→92 px; thanh điều khiển phóng chuyển thành nổi khi là con trực tiếp của khung sản đồ. Tỷ lệ diện tích vẫn 41%/28% vì sản đồ bị giới hạn theo chiều ngang (cần đổi bố cục rộng hơn).
- Kiểm tra: 32 kịch bản đạt, không lỗi chạy.

### Đợt thứ bảy
- [x] 9 (cải thiện). Nguyên nhân thật: vùng cuộn sản đồ bị `max-height:calc(100dvh - 530px)` còn sản đồ cao 1388 px nên chỉ thấy 470 px. Đổi sang `100dvh - 380px` (desktop): tỷ lệ 41→54% khi đóng bảng, 28→38% khi mở, không phát sinh cuộn trang. Chưa đạt mục tiêu 70–80% / 55–65%; còn cần giảm chrome (~335 px) và chiều rộng bảng bên.
- [x] 13 (một phần). `+ Ghi mốc mới` trong phiếu nhập và lệnh `Thêm mốc theo dõi` mở phiếu nhập tại mốc kế tiếp (`newMoment`). Chưa gắn ý định lúc mở ca (xem/thiết kế/ghi).
- [x] 14/9 (thêm). Bề rộng bảng bên mặc định: Nhập 360, Thiết kế 320.
- [x] 8 (thêm). Màu/nét/ký hiệu của đường bị khóa bị vô hiệu kèm lý do ở nhãn.
- [x] 24 (thêm). Công tắc `Giữ chỉnh sửa riêng của từng đường` trong bảng Phong cách.
- [x] 5 (thêm). Bảng Phong cách ghi `Áp dụng cho: Toàn sản đồ`.
- Kiểm tra: 33 kịch bản đạt; verify-boot, descent-convention, ai-session, direct-title vẫn đạt.

### Đợt thứ tám
- [x] 1/25 (thêm). Bấm thông tin đầu sản đồ (Họ tên, Mã, Para, Tuổi thai, Ngày, Giờ, Ngôi/Kiểu thế) mở bảng Thông tin ca với con trỏ đã nằm trong đúng trường; ô trống vẫn bấm được. Đóng bảng quay lại phiếu nhập. Có bài kiểm tra. Bố cục header dạng dòng (`headerLayout=line`) chưa có vùng bấm theo trường.
- [x] 1/3 (thêm). Vùng bấm nhãn hàng phủ gần hết cột nhãn và cả chiều cao hàng (chừa 14 đơn vị sát lưới để điểm đầu tiên vẫn bấm được).
- [x] 19 (thêm). Ô thuộc hàng không có điểm đo (ví dụ cơn co) làm sáng nhãn vùng tương ứng.
- [x] 30 (thêm). Escape hủy lấy kiểu / xem trước hàng loạt / xem trước dán trước khi bỏ chọn hoặc đóng bảng.
- [x] 11 (thêm). Vạch ngăn ngày trên trục mốc.
- [x] 7 (thêm). Từ phiếu nhập, mở Thông tin ca rồi đóng cũng quay lại đúng phiếu.
- Kiểm tra: 34 kịch bản đạt; boot, descent, direct-title vẫn đạt.

## Tổng kết 30 thay đổi (theo đúng thứ tự trong yêu cầu)

Số thứ tự ở các mục "Đợt" phía trên có lúc lệch so với bảng này; bảng này là bản đúng.

| # | Nội dung | Trạng thái | Còn thiếu |
| --- | --- | --- | --- |
| 1 | Bấm vùng mở ngay thiết kế | Một phần | Bấm viền/khoảng đệm vùng; lề trong trang → thiết lập trang |
| 2 | Bỏ tầng trung gian | Một phần | Gộp hết thuộc tính trong "Mở hộp thiết kế đầy đủ" vào bảng |
| 3 | Vùng bấm theo ý nghĩa | Một phần | Nét nối, khoảng giữa hai vùng bằng bấm trực tiếp (đã có tay nắm) |
| 4 | Chọn đúng cấp | Một phần | Cấp "Nhãn" riêng ngoài vùng |
| 5 | Ghi rõ phạm vi | Một phần | Công tắc đổi phạm vi; nhãn trên mọi ô màu/chữ/lưới |
| 6 | Đổi đối tượng tới đúng điều khiển | Gần xong | |
| 7 | Sửa tạm thiết kế rồi quay lại | Xong cho vùng/tiêu đề/thông tin ca | Các bảng khác |
| 8 | Đối tượng khóa | Một phần | Lý do "cố định theo mẫu" |
| 9 | Ngân sách diện tích | **Chưa đạt** | Đo hiện 54% (đóng) / 38% (mở) so với mục tiêu 70–80% / 55–65% |
| 10 | Thanh đầu một hàng | Một phần | Hợp nhất thanh không gian vào thanh đầu |
| 11 | Trục thời gian co lại | Gần xong | |
| 12 | Chọn không làm sản đồ nhảy | Xong | |
| 13 | Bảng bên theo ý định | Một phần | Ý định lúc mở ca (xem/thiết kế) |
| 14 | Mở bảng giữ vị trí | Một phần | Sản đồ vẫn co theo bề rộng khi mở bảng bên |
| 15 | Tên lớp không phóng | Xong | |
| 16 | Hết cuộn lồng | Một phần | Kiểm tra ca dài và cảm ứng thật |
| 17 | Nhãn hàng/trục cố định | Xong (nhãn hàng + khoảng giờ) | Cột giờ cố định khi kéo dọc |
| 18 | Cửa sổ thời gian | Xong | |
| 19 | Làm nổi khi nhập | Gần xong | |
| 20 | Tay nắm khoảng cách/lề | Một phần | Xem trước khi đang kéo; tay nắm lề giấy, khoảng trống tiêu đề |
| 21 | Tách kích thước vùng/chữ/phóng | Một phần | Tùy chọn "Co giãn chữ theo vùng" |
| 22 | Sao chép kiểu | Gần xong | Áp cho nhãn/vùng |
| 23 | Theo mẫu / Tùy chỉnh | Một phần | Phủ nhãn/vùng; khôi phục từng thuộc tính về mẫu |
| 24 | Gom lượt thử thành một bước | Một phần | Bài kiểm tra đếm số bước lịch sử; hủy thử màu |
| 25 | Trình sửa nhỏ cho một ô | Một phần | Trình sửa nổi ngay cạnh ô (hiện dùng bảng thuộc tính + "Mở cả mốc") |
| 26 | Thông tin đầu sản đồ | Một phần | Bố cục đầu dạng dòng |
| 27 | Danh tính mốc đang nhập | Một phần | Ghim "mốc đang sửa" tách khỏi "mốc đang xem" |
| 28 | Chưa hoàn tất theo từng trường | Gần xong | |
| 29 | Nút Thêm kế thừa ngữ cảnh | Một phần | Vị trí nhãn gần vùng; dán theo khối nhiều thông số |
| 30 | Hoàn tác/Escape/đóng bảng | Gần xong | Kiểm thử Ctrl+Z trong ô; hủy thử màu |

Kiểm tra cuối: ``verify-next-workspace.cjs`` 34 kịch bản đạt; ``verify-boot``, ``verify-descent-convention``, ``verify-ai-comparison``, ``verify-ai-session``, ``verify-direct-title`` đạt; ``git diff --check`` đạt. Chưa commit/push.

### Đợt thứ chín
- [x] 9 (cải thiện). `w.fitCanvas` đo vị trí thật của vùng cuộn và đặt `--next-chart-max`, nên sản đồ lấp hết chiều cao còn lại (không phát sinh cuộn trang). Rút gọn thanh đầu (tiêu đề và trạng thái cùng một dòng), thanh không gian, trục mốc, thanh xem. Đo: 54%→60% khi đóng bảng, 38%→42% khi mở bảng. Vẫn chưa đạt 70–80% / 55–65%: phần còn lại bị chiếm bởi hai thanh đầu (62+55 px), trục mốc (48 px) và thanh quy chuẩn (48 px), và bảng bên mở làm sản đồ hẹp lại.
- [x] 11/10. Trục mốc tự thu gọn ngoài không gian Nhập; nút `Hiện trục mốc / Thu trục mốc`.
- [x] 25 (một phần). Thanh ngữ cảnh có ô `Giá trị` sửa nhanh một ô ngay trên sản đồ (khóa nếu lớp khóa).
- [x] 23 (thêm). Nút `Về mẫu` đưa một đường từ `Tùy chỉnh` về đúng mẫu.
- Kiểm tra: 36 kịch bản đạt, các kịch bản còn lại đạt.

### Đợt thứ mười
- [x] 9/14 (đạt phần diện tích mở bảng). Bảng bên nay nổi phía trên sản đồ (từ 1100 px, bên phải; thuận tay trái thì bên trái) nên sản đồ không đổi vị trí/kích thước khi mở/đóng bảng. Diện tích đo: 60% đóng, 60% mở (trước đó 42% khi mở). Đổi lại bảng che phần sản đồ phía sau; chưa cho `ensureSelected` tránh vùng bị che.
- Kiểm tra: 36 kịch bản đạt; các script khác đạt. Hai kịch bản kéo chuột phải đóng bảng/ẩn thanh phóng nổi vì chúng chồng lên sản đồ.

### Đợt thứ mười một (vòng "như Canva")
- [x] 10. Một thanh đầu duy nhất trên máy tính (≥1100 px): thanh không gian (Nhập/Thiết kế/Trình chiếu, bố cục, tay thuận, ghim) nằm giữa thanh phiên; dưới 1100 px giữ thanh riêng. Tiêu đề rút gọn bằng dấu …, ẩn chữ của Tìm/Trợ lý AI dưới 1600 px.
- [x] 9. Đạt ngân sách: Nhập 73% (đóng và mở bảng), Thiết kế 71% ở 1440×1000.
- [x] 11. Trục mốc ở không gian Nhập nằm một hàng (giờ bên trái, dải mốc cuộn ngang), bỏ chú giải dài.
- [x] 9/13. Không gian Nhập ẩn thanh quy chuẩn/chế độ xem (thuộc Thiết kế); thanh phóng góc phải dưới vẫn có.
- [x] 14/12. Bảng nổi có "bàn làm việc": sản đồ được chừa lề bằng bề rộng bảng để kéo phần bị che ra.
- [x] 12. `centerMoment` tránh phần bị bảng nổi che; có kịch bản kiểm tra điểm cuối không nằm dưới bảng.
- [x] 6/25. Thanh ngữ cảnh bám theo điểm đang chọn (đặt phía trên, sát mép thì xuống dưới), theo cả cuộn/phóng, không còn che điểm kế bên.
- [x] Thanh `Phóng tới / Chọn khung` dời sang góc phải dưới cạnh thanh phóng, gọn hơn.
- Kiểm tra: 37 kịch bản đạt; boot, descent, ai-comparison, ai-session, direct-title đạt.

### Đợt thứ mười hai
- [x] 26. Đầu sản đồ dạng dòng (`headerLayout=line`) có vùng bấm riêng cho Mã, Họ tên, Para, Tuổi thai, Ngày, Giờ bắt đầu, Ngôi/Kiểu thế; bấm mở đúng ô trong Thông tin ca.
- [x] 21. Tùy chọn `Chữ co giãn theo chiều cao vùng` (mặc định tắt) trong thuộc tính vùng: bật thì nhãn hàng và chữ tự do lớn/nhỏ theo chiều cao vùng (0,85–1,5 lần); tắt thì kích thước vùng, cỡ chữ và phóng màn hình độc lập như trước.
- [x] 20. Kéo tay nắm hiện ngay giá trị mới (`Cột nhãn 186`, `Tim thai 125%`) trước khi thả.
- [x] Phím tắt phóng kiểu trình thiết kế: Ctrl + / Ctrl − / Ctrl 0 (vừa bề ngang); bỏ qua khi đang gõ trong ô.
- [x] 27. Đầu phiếu nhập (mốc đang nhập và trạng thái) dính ở đầu bảng khi cuộn phiếu, nên luôn thấy đang nhập mốc nào; nháp ở mốc khác vẫn liệt kê riêng.
- [x] 6. Thanh ngữ cảnh bám điểm chuyển động mượt khi đổi lựa chọn.
- [x] `work.patchDesign` dùng chung cho thao tác thiết kế từ bảng thuộc tính.
- Kiểm tra: 38 kịch bản đạt; các script khác đạt.

### Đợt thứ mười ba
- [x] 24. Lượt thử màu gộp thành một bước hoàn tác: kéo bảng màu xem trước trực tiếp trên sản đồ (`@input`), chỉ một bước trong lịch sử khi chốt; có kiểm tra bằng một lần Hoàn tác.
- [x] 24/30. Esc trong ô màu hủy lượt thử và trả về màu trước khi thử, không để lại bước lịch sử.
- [x] 30. Kiểm tra Ctrl+Z trong ô nhập chỉ hoàn tác chữ vừa gõ, không đụng lịch sử thiết kế.
- [x] 3/4. Chuột phải trên sản đồ chọn đúng đối tượng dưới con trỏ (điểm gần nhất, đường, vùng, chú thích, trường đầu sản đồ) và hiện thanh ngữ cảnh thay cho menu trình duyệt.
- [x] 7. Mọi bảng mở từ Phiếu nhập/Bảng dữ liệu (Lớp & nét, Phiên bản, Kiểm tra…) có nút `← Phiếu nhập` ở đầu bảng; đóng bảng cũng quay lại đúng chỗ.
- [x] 13. Mở ca chưa có số đo vào thẳng không gian Nhập với phiếu nhập; ca đã có dữ liệu mở Thiết kế như trước.
- [x] `designTrial` trong lõi lịch sử thiết kế (index.html) để các điều khiển kéo/thử khác dùng lại.
- Kiểm tra: 39 kịch bản đạt; các script khác đạt.

### Đợt thứ mười bốn
- [x] 22. Sao chép kiểu cho vùng: `Sao chép kiểu` trên vùng lấy chiều cao, chọn vùng khác rồi `Áp kiểu …`. Kiểu đường và kiểu vùng tách riêng (không áp nhầm màu đường lên vùng).
- [x] 5. Thuộc tính vùng có `Phạm vi: Chỉ vùng này · Áp cho mọi vùng`; áp cho mọi vùng là một bước hoàn tác.
- [x] 5. Thanh ngữ cảnh của vùng hiện chip `Cao 120%`.
- [x] 1/3. Ở không gian Thiết kế, bấm vào khoảng trống trên lưới của một vùng là chọn vùng đó (mở thiết kế vùng), không còn phải nhắm vào cột nhãn.
- [x] 10 (máy tính bảng). Trạng thái lưu luôn một dòng có dấu …; thanh đầu ở 1024 px từ ~120 px còn ~82 px.
- [x] 11 (điện thoại). Nút mốc trên trục có khoảng cách và bề rộng tối thiểu, hết dính chữ `08:3009:00`.
- [x] Có kịch bản kiểm tra cho sao chép kiểu vùng, áp mọi vùng + một lần hoàn tác, và bấm lưới chọn vùng.
- Kiểm tra: 40 kịch bản đạt; các script khác đạt. Đã xem ảnh chụp máy tính bảng và điện thoại.

### Đợt thứ mười lăm
- [x] 4/1. Khung chọn kiểu trình thiết kế: vùng đang chọn có viền liền + nhãn tên vùng trên sản đồ; rê chuột lên nhãn vùng hiện viền đứt. Khung chỉ phủ phần sản đồ, không lan sang bàn làm việc.
- [x] 8. Ghi chú khóa nói rõ lý do (khóa trong Lớp & nét để tránh sửa nhầm); thuộc tính vùng ghi rõ phần cố định theo mẫu (thứ tự, tên, thang đo) và phần vẫn đổi được.
- [x] 29. Nút `Thêm chú thích tại mốc này` trên thanh ngữ cảnh của điểm: chú thích mới lấy đúng giờ của điểm.
- [x] 2. Bảng Thuộc tính không còn nút `Thuộc tính` thừa trong thanh ngữ cảnh khi đã đứng ở bảng đó.
- [x] Có kịch bản kiểm tra khung chọn vùng, lý do theo mẫu và chú thích từ điểm.
- Kiểm tra: 41 kịch bản đạt; các script khác đạt. Đã xem ảnh chụp khung chọn vùng.

## Tổng kết 30 thay đổi — cập nhật sau vòng "như Canva"

| # | Nội dung | Trạng thái |
| --- | --- | --- |
| 1 | Bấm vùng mở ngay thiết kế | Xong (nhãn, lưới trống ở Thiết kế, ô đầu sản đồ) |
| 2 | Bỏ tầng trung gian | Gần xong (vẫn còn lối "Mở hộp thiết kế đầy đủ" cho thuộc tính hiếm) |
| 3 | Vùng bấm theo ý nghĩa | Xong (nhãn > điểm > lưới; chuột phải chọn đúng đối tượng) |
| 4 | Chọn đúng cấp | Xong (Trang › Vùng › Nhãn; khung chọn vùng) |
| 5 | Ghi rõ phạm vi | Xong (chip phạm vi, `Chỉ vùng này · Áp cho mọi vùng`) |
| 6 | Đổi đối tượng tới đúng điều khiển | Xong |
| 7 | Sửa tạm rồi quay lại | Xong (mọi bảng mở từ phiếu nhập có `← Phiếu nhập`) |
| 8 | Đối tượng khóa | Xong |
| 9 | Ngân sách diện tích | Đạt: 73% Nhập, 71% Thiết kế (1440×1000, cả khi mở bảng) |
| 10 | Thanh đầu một hàng | Xong trên ≥1100 px |
| 11 | Trục thời gian co lại | Xong |
| 12 | Chọn không làm sản đồ nhảy | Xong |
| 13 | Bảng bên theo ý định | Xong |
| 14 | Mở bảng giữ vị trí | Xong (bảng nổi) |
| 15 | Tên lớp không phóng | Xong |
| 16 | Hết cuộn lồng | Xong trên máy tính; cảm ứng thật chưa thử |
| 17 | Nhãn hàng/trục cố định | Xong (cột giờ cố định khi kéo dọc chưa làm) |
| 18 | Cửa sổ thời gian | Xong |
| 19 | Làm nổi khi nhập | Xong |
| 20 | Tay nắm khoảng cách/lề | Xong cho cột nhãn và vùng (lề giấy chưa có tay nắm) |
| 21 | Tách kích thước vùng/chữ/phóng | Xong |
| 22 | Sao chép kiểu | Xong (đường và vùng) |
| 23 | Theo mẫu / Tùy chỉnh | Xong cho đường (`Về mẫu`) |
| 24 | Gom lượt thử | Xong (màu, áp mọi vùng) |
| 25 | Trình sửa nhỏ cho một ô | Xong (ô `Giá trị` trên thanh ngữ cảnh bám điểm) |
| 26 | Thông tin đầu sản đồ | Xong (cả dạng lưới và dạng dòng) |
| 27 | Danh tính mốc đang nhập | Xong (đầu phiếu dính, nháp theo mốc) |
| 28 | Chưa hoàn tất theo từng trường | Xong |
| 29 | Nút Thêm kế thừa ngữ cảnh | Xong (mốc mới, chú thích từ điểm, dán từ ô đang chọn) |
| 30 | Hoàn tác/Escape/đóng bảng | Xong |

### Đợt thứ mười sáu
- [x] 17. Trục giờ dính: khi hàng THỜI GIAN trôi khỏi khung nhìn (cuộn dọc), một dải giờ thật (`08:00 … 04:00`) hiện ở mép trên vùng sản đồ, thẳng hàng với lưới và theo cuộn ngang/phóng. Đã xem ảnh chụp: vạch mốc 17:00 trùng nhãn 17:00.
- [x] 23. Vùng có chip `Theo mẫu / Tùy chỉnh` theo chiều cao và nút `Về mẫu` (về 100%) ngay trên thanh ngữ cảnh.
- [x] Có kịch bản kiểm tra dải giờ dính và `Về mẫu` của vùng.
- Kiểm tra: 42 kịch bản đạt; boot, descent, ai-comparison, ai-session, direct-title đạt; `git diff --check` đạt.
- Bảng tổng kết phía trên: mục 17 và 23 nay xong cả phần còn thiếu. Còn lại ngoài tầm kiểm thử tự động: tay nắm lề giấy (20), thử cảm ứng/bàn phím ảo trên thiết bị thật (16), và lối "Mở hộp thiết kế đầy đủ" vẫn giữ cho thuộc tính hiếm (2).
