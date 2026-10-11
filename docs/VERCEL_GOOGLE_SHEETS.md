# Vercel + Google Sheets + giọng nam MC

Ứng dụng đã có API đọc Sheets và phát giọng MC, cùng cấu hình Vercel. Sheet đã chọn là [1000 Câu hỏi Ai Là Triệu Phú](https://docs.google.com/spreadsheets/d/1kprlF40w_97eJ4T9GBGw_2Vn0fqdG5bfXeybuD9Q5jA/edit), tab **Trang tính1**. Chưa kết nối API của ứng dụng với Sheet hoặc deploy công khai; còn cần thông tin xác thực service account và cấu hình Vercel.

## 1. Chuẩn bị kho câu hỏi

Sheet đã chọn có hàng tiêu đề phù hợp với ứng dụng. Thêm câu hỏi từ dòng 2 trở đi, mỗi câu một dòng; có thể lưu 1000 câu trong cùng tab **Trang tính1**. Nếu tạo Sheet mới, có thể chọn **File → Import → Upload** và nhập `docs/questions-template.csv` để lấy cấu trúc cùng 15 câu mẫu.

| Cột | Giá trị |
| --- | --- |
| id | ID duy nhất, ví dụ 1–1000; giữ nguyên khi sửa câu hỏi |
| level | Tùy chọn: để trống hoặc nhập số nguyên 1–15 để ghi độ khó |
| question | Nội dung câu hỏi |
| a, b, c, d | Bốn phương án trả lời, không để trống |
| correct | Chữ A, B, C hoặc D |
| category | Chủ đề |
| explanation | Giải thích sau công bố |
| active | TRUE để sử dụng, FALSE để bỏ qua |

Cần ít nhất 15 câu hợp lệ có `active=TRUE`. Mỗi lượt mới lấy ngẫu nhiên 15 câu từ toàn bộ kho đang bật, không trùng ID trong lượt và không chia theo `level`. Thứ tự 15 câu cũng ngẫu nhiên, không sắp xếp theo độ khó. Giữa các lượt vẫn có thể gặp lại câu cũ.

`id` là mã của câu hỏi; `level` chỉ ghi độ khó, không phải số câu trong lượt. Không điền `level` từ 1 đến 1000. Có thể để toàn bộ cột này trống nếu chưa phân loại độ khó. Giữ nguyên tiêu đề cột; thứ tự cột có thể thay đổi nếu vẫn nằm trong range đã cấu hình. Range hiện đọc tới dòng 5000, gồm hàng tiêu đề, nên đủ chỗ cho 1000 câu.

Dữ liệu sai, ID trùng hoặc kho có dưới 15 câu đang bật sẽ báo lỗi ở màn chuẩn bị và có nút thử lại. Không tự đổi sang câu mẫu khi Sheet đã được cấu hình nhưng bị lỗi. Bộ câu mẫu chỉ dùng khi không đặt `GOOGLE_SHEET_ID`.

Kho câu hỏi được cache 60 giây ở API và tối đa 60 giây ở CDN. Game nạp kho khi mở/tải lại ứng dụng; sau khi sửa Sheet, chờ khoảng hai phút rồi tải lại trang để bắt đầu với dữ liệu mới. Bắt đầu lượt mới hoặc chơi lại sẽ bốc một bộ 15 câu mới. Bộ câu hỏi của lượt đã bắt đầu được lưu trong sessionStorage; tải lại trang để tiếp tục vẫn giữ nguyên bộ này và tiến độ. Nếu nội dung câu hỏi đã đổi trong Sheet, API giọng đọc từ chối đọc phiên bản mới cho lượt cũ; trình duyệt dùng giọng nam cục bộ nếu có hoặc giữ phụ đề.

## 2. Cho API đọc Sheet riêng tư

1. Tạo/chọn project ở Google Cloud Console và bật **Google Sheets API**.
2. Tạo **Service Account** rồi tạo key dạng JSON. Không đưa key vào mã nguồn.
3. Trong Sheet, bấm **Share** và chia sẻ quyền **Viewer** cho địa chỉ `client_email` trong key JSON. Sheet có thể giữ chế độ Restricted.
4. Lấy Sheet ID từ URL: phần nằm giữa `/spreadsheets/d/` và `/edit`.

API dùng service account và scope `spreadsheets.readonly`; không ghi hoặc sửa Sheet. Cơ chế xác thực dựa trên [tài liệu OAuth cho service account của Google](https://developers.google.com/identity/protocols/oauth2/service-account); đọc dữ liệu dùng [Sheets values API](https://developers.google.com/workspace/sheets/api/guides/values).

Quyền truy cập Google Drive/Sheets đã kết nối trong cuộc trò chuyện không thay thế xác thực cho API chạy trên máy hoặc Vercel. Vẫn cần chia sẻ Sheet cho service account và đặt `GOOGLE_SERVICE_ACCOUNT_JSON` ở môi trường chạy ứng dụng.

## 3. Giọng nam tiếng Việt

API cố định giọng **vi-VN-Standard-B**, được Google liệt kê là giọng nam trong [danh sách giọng Text-to-Speech](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types).

Bật **Cloud Text-to-Speech API** và billing cho project Google Cloud. Dùng service account đã cấu hình, cấp quyền sử dụng Text-to-Speech theo chính sách project. Có thể dùng API key server trong `GOOGLE_TTS_API_KEY` thay cho service account khi gọi TTS; nếu dùng key, giới hạn key cho Cloud Text-to-Speech API. Chi phí phụ thuộc mức sử dụng: xem [bảng giá chính thức](https://cloud.google.com/text-to-speech/pricing).

API chỉ đọc câu trong kho đã kiểm tra, không nhận văn bản TTS tùy ý. MP3 được cache tối đa 100 nội dung trong mỗi instance; cache có thể mất khi function khởi động lại. Đây không phải kho audio lâu dài. Với lượng người chơi lớn nên tạo sẵn file MP3, lưu ở object storage/CDN để giảm số lượt tổng hợp.

Không có cấu hình TTS: trình duyệt chỉ chọn giọng nam tiếng Việt nhận diện được theo tên (ví dụ Microsoft An hoặc NamMinh), không lấy giọng tiếng Việt đầu tiên. Web Speech không cung cấp thuộc tính giới tính; giọng không nhận diện được sẽ không được chọn. Nếu không có giọng nam, game báo trạng thái và vẫn chơi bằng phụ đề. Âm thanh mặc định tắt, người chơi bật ở header hoặc Cài đặt. Trình duyệt có thể yêu cầu bấm nút đọc lại để cho phép phát audio.

Bấm **CHỐT ĐÁP ÁN** ngắt lời MC ngay khi mở xác nhận. Bấm **Đúng, tôi chốt!** khóa đáp án, trợ giúp và nút đọc lại. Tác vụ tải giọng còn chờ cũng bị hủy, không được phát muộn. Bấm **Suy nghĩ thêm** mở lại lựa chọn; MC chỉ đọc lại khi người chơi yêu cầu. Tắt âm thanh hoặc rời màn game cũng ngắt lời MC.

## 4. Triển khai Vercel

[Vercel hỗ trợ Vite và API trong thư mục api](https://vercel.com/docs/frameworks/frontend/vite). Dự án có `vercel.json` với cấu hình build và đường dẫn SPA.

1. Đưa dự án vào repository Git rồi push lên GitHub/GitLab/Bitbucket, hoặc dùng Vercel CLI từ thư mục dự án. Không commit file `.env.local` hay key JSON.
2. Trong Vercel, chọn **Add New → Project** và import repository. Framework **Vite**, build **npm run build**, output **dist**, root là thư mục có `package.json`. Node.js 22 phù hợp.
3. Vào **Settings → Environment Variables**, thêm các biến sau cho môi trường muốn dùng:

| Biến | Nội dung |
| --- | --- |
| GOOGLE_SHEET_ID | `1kprlF40w_97eJ4T9GBGw_2Vn0fqdG5bfXeybuD9Q5jA` |
| GOOGLE_SHEET_RANGE | `'Trang tính1'!A1:K5000` |
| GOOGLE_SERVICE_ACCOUNT_JSON | Toàn bộ nội dung JSON key, có thể rút gọn thành một dòng |
| GOOGLE_TTS_API_KEY | Tùy chọn, chỉ cần nếu dùng API key cho giọng MC |

Không thêm tiền tố `VITE_` cho các biến này: chúng chỉ được đọc phía server. Nếu dùng service account cho cả Sheets và TTS, không cần `GOOGLE_TTS_API_KEY`. Để deploy bản câu mẫu trước, có thể bỏ toàn bộ biến Google.

4. Chọn **Deploy**. Nếu thêm biến sau khi deploy, cần redeploy để áp dụng.
5. Kiểm tra `/api/questions` trả JSON, tải lại trực tiếp `/setup`, `/game`, `/result`, thử bắt đầu lượt mới và bật âm thanh. Nếu TTS lỗi, kiểm tra API đã bật, billing, quyền và Vercel function logs. Không chia sẻ key JSON trong chat hoặc commit vào repository.

## 5. Chạy và kiểm tra trên máy

Sao chép `.env.example` thành `.env.local`, điền cấu hình rồi chạy `npm run dev`. Dev server đã có hai API cùng đường dẫn như Vercel. Khởi động lại dev server sau khi đổi biến môi trường.

```bash
npm test
npm run build
npm run dev
python tests/feedback_smoke.py
python tests/browser_smoke.py
python tests/studio_layout.py
```

`npm run preview` chỉ xem bundle frontend; để thử chức năng API, dùng `npm run dev` hoặc `vercel dev`.

Sheet riêng tư bảo vệ quyền truy cập và key, nhưng game hiện trả câu hỏi lẫn đáp án đúng cho trình duyệt để chấm điểm và mô phỏng trợ giúp. Thiết kế này phù hợp trò chơi giải trí có tiền thưởng mô phỏng. Nếu tổ chức thi có giải thưởng thật, cần chuyển chấm điểm và quản lý lượt chơi sang server trước.
