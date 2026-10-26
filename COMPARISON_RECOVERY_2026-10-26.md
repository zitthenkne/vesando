# Đối chiếu và giữ bản tốt hơn — 26/10/2026

Người dùng yêu cầu so bản cập nhật tối 25/10 với bản chỉnh trên PC ngày 26/10,
giữ phần tối ưu hơn. Lịch 20 vòng đã dừng theo yêu cầu, không được bật lại trong việc này.

## Hai nguồn được bảo toàn

- Bản tối: working tree trên `e3f956a61e773d7d0aeffb88b4f6b5b49d59dd72`,
  còn đầy đủ các thay đổi chưa commit. Không bị mất trong thư mục máy này.
- Bản PC: `origin/main` tại `41d764791039be788cff05f6bb1fdd481c13846d`,
  gồm ba commit mới ngày 26/10. Được lấy bằng fetch, không ghi đè working tree.
- Snapshot đầy đủ 21 tệp đang sửa và patch:
  `C:\Users\admin\.codex\backups\vesando\compare-20261026-c95eef8d`.
- Bản PC và bản ghép được kiểm tra độc lập tại:
  `C:\Users\admin\AppData\Local\Temp\vesando-compare-ea42b740`.

## Quyết định theo kết quả thực tế

| Luồng | Kết quả đối chiếu | Phần được giữ |
|---|---|---|
| Editor, bảng thuộc tính, lịch sử, chọn/kéo, thu phóng và xuất | Bản PC có công cụ theo ngữ cảnh, tìm thao tác, bảng ghim/nổi, sửa ô và xuất thật đã kiểm tra | Editor PC, ghép tên ca có Enter/Esc và giữ nháp của bản tối |
| Đề thực tế thiếu năm | Bản PC từ chối `date=""`; bản tối giữ được ngày ghi trong đề mà không bịa năm | Schema và bộ vẽ của bản tối; bước AI mới chấp nhận trường ngày rỗng được ghi rõ |
| Giờ lẻ và ca qua ngày | PC từ chối 25 giờ và 15:20; bản tối giữ đủ 7 mốc, 25 giờ, đúng phút | Giới hạn phần mềm 0–72 giờ/300 mốc và đọc phút; nhập bảng mới dùng cùng điều kiện |
| Độ lọt /5 và station | PC bỏ trường station khi đọc dữ liệu; bản tối giữ trường gốc và một đường đọc chung hai cột | Quy ước người dùng chốt: 5/5↔−3 … 2/5↔0 … 0/5↔+2; không thêm kết quả khám |
| Phản hồi AI khi đổi ca | Trình duyệt tái hiện PC thay phản hồi bằng JSON của ca mới; bản tối giữ nguyên phản hồi | `aiReply` tách khỏi JSON sản đồ; các đường thêm/thay/cập nhật chọn lọc đều đọc đúng nguồn |
| Chỉnh tiếp và đối chiếu AI | PC có sửa ô, nguồn AI khai báo, chặn sửa số ngoài phạm vi trình bày, nhập chọn lọc và hồ sơ phương án khác; bản tối có lịch sử 8 phản hồi và chọn bản gốc để so | Ghép hai nhóm, reset đúng phạm vi sau một lần áp dụng, giữ lịch sử/ca/notation |
| Lưu phiên AI qua reload | PC có lưu cả phiên; bản tối mặc định chỉ giữ phản hồi trong bộ nhớ | Giữ chức năng lưu cả phiên với lựa chọn rõ ràng; cờ nhớ prompt cũ không tự cấp quyền lưu phản hồi. Có báo lỗi quota và giữ bản lưu trước |
| Trang đầu | PC có ba nguồn mô tả/bảng/tệp và sản đồ mẫu thật; bản tối ưu tiên công việc gần nhất, thu gọn tạo mới, ẩn lọc vô nghĩa khi trống | Ghép cả hai; ví dụ thu gọn. Sau sửa, lối Theo dõi kết thúc y≈806 tại 390×844, trước sửa bị đẩy tới y≈942 |

Phần chuyển sản phẩm trực tiếp từ editor đang viết dở ở lượt bị ngắt chưa được
nghiệm thu. Nó được giữ nguyên trong snapshot, chưa đưa vào bản ghép được chọn.
Không tính việc so sánh/ghép này thành vòng cải tiến mới và không khai đã hoàn thành 20 vòng.

## Bằng chứng và giới hạn

- `comparison-results.json` trong thư mục đối chiếu ghi kết quả cùng phép thử
  trên cả ba bản: thiếu năm, 25 giờ, giờ lẻ, giữ station và giữ phản hồi khi đổi ca.
- Kiểm tra AI dùng fixture và clipboard/popup giả lập, không gọi dịch vụ AI thật.
- Kiểm tra số liệu/bộ vẽ và đề thật: `verify.cjs`, `verify-descent-convention.cjs`,
  `verify-exam-conversion.cjs --browser`.
- Editor và tệp thật: `verify-ux24.cjs`; PNG/PDF/JSON, sửa/undo, bảng, 5 kích thước × 2 theme.
- AI: `verify-ai-workflow.cjs`, `verify-ai-session.cjs`, `verify-ai-versions.cjs`,
  `verify-ai-comparison.cjs`, `verify-ai-studio.cjs`, `verify-focused-access.cjs`.
- Thư viện/bản nháp/bản sao: `verify-project-actions.cjs` và phần lưu trữ của
  `verify-library.cjs --storage`. Nhánh kiểm tra công cụ/xuất cũ của bài thư viện
  còn selector trước giao diện mới; các luồng đó được kiểm tra bằng `verify-ux24.cjs`.
- Nguồn AI khai báo được ghi là cần đối chiếu. So sánh cấu trúc không xác nhận
  AI đã trích đúng toàn bộ văn xuôi hoặc xác nhận nội dung y khoa.
- Ảnh đối chiếu: `today-editor.png`, `combined-editor.png`, `combined-mobile.png`;
  ảnh kiểm chứng cuối ở các thư mục Temp `vesando-ux24`, `vesando-ai-workflow`,
  `vesando-focused-ui` và `vesando-library-*`.

Các quy chuẩn và ngưỡng lâm sàng được giữ nguyên. Không thêm dependency, backend,
API trả phí, tự gửi dữ liệu hay sửa thư viện của trình duyệt người dùng.

## Kết quả chốt bản ghép

- Đã đưa đúng bản ghép đã kiểm tra vào thư mục làm việc chính sau khi fast-forward nền Git lên 41d7647.
- Backup Git trước ghép: stash 2cae482a52fa74ef0bce28d44a9a85c108bcd97d; giữ stash và snapshot ngoài repo, không drop/reset/force.
- PASS: verify.cjs (812), verify-descent-convention (9 tổ hợp), verify-exam-conversion --browser (đề thật 7 mốc/25 giờ/phút, 4 viewport).
- PASS: verify-ux24 (sửa, undo/redo, bảng, tệp PNG/PDF/JSON thực tế, 5 kích thước × 2 theme).
- PASS: verify-ai-workflow, verify-ai-session, verify-ai-versions (kể cả reload với lịch sử 8 bản khi chọn lưu), verify-ai-comparison, verify-ai-studio (24 tổ hợp), verify-focused-access.
- PASS: verify-project-actions; verify-library --storage (20 bố cục, nháp chưa áp dụng, quota/hỏng dữ liệu, migration, touch và nhiều tab).
- PASS: verify-direct-title (4 viewport, giữ nháp hai phân hệ và lỗi lưu/thử lại). Mobile có thể thu gọn bảng chứa nháp hợp lệ để đổi tên mà không áp dụng số đo.
- Các kiểm tra dùng server cô lập cùng source; không ghi nhận là kiểm tra phiên Live Server 5501 thật. Lịch vẫn PAUSED.
