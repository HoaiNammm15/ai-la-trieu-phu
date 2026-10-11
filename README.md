# Ai Là Triệu Phú · Sân khấu hoạt hình 2D

Website trò chơi tiếng Việt được xây dựng từ `prompt_ai_la_trieu_phu_2d.md`. React + Vite, JavaScript/JSX, React Router và CSS thuần/CSS Modules; API Vercel đọc Google Sheets và phát giọng nam MC.

## Cập nhật feedback

- MC chỉ dùng giọng nam tiếng Việt; có API Google Text-to-Speech với giọng `vi-VN-Standard-B`. Khi chưa cấu hình và thiết bị không có giọng nam nhận diện được, dùng phụ đề.
- Bấm chốt ngắt lời MC và hủy tác vụ tải giọng; sau xác nhận khóa đáp án, trợ giúp và nút đọc lại.
- Chọn nhân vật nam hoặc nữ ở hậu trường, xem trước ngay trên sân khấu và giữ lựa chọn trong suốt lượt chơi, kể cả khi tải lại trang. Phiên cũ chỉ có màu áo được chuyển sang nhân vật nữ.
- MC và người chơi được vẽ lại theo hướng biếm họa: gương mặt nổi bật, tóc bồng, nụ cười tinh nghịch và cử chỉ, biểu cảm rõ hơn theo diễn biến game.
- Có cấu hình Vercel và API đọc Google Sheet riêng tư, hỗ trợ kho 1000 câu. Mỗi lượt lấy ngẫu nhiên 15 câu từ toàn bộ kho đang bật, không trùng trong lượt. `level` là độ khó tùy chọn; không chia câu theo cấp độ. Tải lại để tiếp tục giữ nguyên bộ câu hỏi, bắt đầu lượt mới sẽ bốc lại và có thể gặp câu đã chơi.

Xem **[hướng dẫn Vercel + Google Sheets](docs/VERCEL_GOOGLE_SHEETS.md)** và **[file mẫu để import](docs/questions-template.csv)**. `.env.example` liệt kê các biến server cần thiết.

Sheet đã chọn: **[1000 Câu hỏi Ai Là Triệu Phú](https://docs.google.com/spreadsheets/d/1kprlF40w_97eJ4T9GBGw_2Vn0fqdG5bfXeybuD9Q5jA/edit)**, range `'Trang tính1'!A1:K5000`. Kho cần ít nhất 15 câu hợp lệ có `active=TRUE` và ID duy nhất. Còn cần cấu hình service account để ứng dụng đọc Sheet; quyền truy cập Sheets của cuộc trò chuyện không cấp quyền cho API trên Vercel.

## Chạy trên máy

Yêu cầu Node.js 20.19+ hoặc 22.12+.

```bash
npm install
npm run dev
```

Vite sẽ in địa chỉ localhost trong terminal. Trên Windows, nếu PowerShell chặn `npm.ps1`, dùng `npm.cmd install` và `npm.cmd run dev`.

```bash
npm test
npm run build
npm run preview
```

Build production được xuất vào `dist/`. Khi đưa lên hosting, cấu hình SPA fallback về `index.html` để các đường dẫn `/setup`, `/game`, `/result` hoạt động khi tải lại trang.

Kiểm thử trình duyệt tùy chọn (Python + Playwright, chạy khi Vite đang mở):

```bash
pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
python tests/character_smoke.py
python tests/studio_layout.py
```

Bộ kiểm tra đi qua lượt thắng đủ 15 câu, lượt thua, quyền trợ giúp, dừng chơi, lưu phiên và đồng hồ. `character_smoke.py` kiểm tra xem trước nhân vật nam/nữ, lưu lựa chọn đến màn kết quả và chuyển phiên cũ dùng màu áo. `studio_layout.py` kiểm tra các phần tử quan trọng không bị cắt ở 11 kích thước màn hình, gồm laptop, điện thoại dọc/ngang và cả lúc công bố đáp án. Ảnh kiểm tra được lưu vào `qa-artifacts/`.

## Chức năng hiện có

- Trang chủ `/`, chuẩn bị `/setup`, trò chơi `/game` và kết quả `/result`.
- Sân khấu SVG nguyên bản: logo xanh/vàng ở giữa, MC bên trái, người chơi bên phải, ghế neon, bục điều khiển, khán giả silhouette và sàn elip.
- Nhân vật hoạt hình phẳng; chớp mắt, thở nhẹ và biểu cảm theo trạng thái game. Ba góc máy CSS.
- Trường quay phủ toàn viewport ở cả 4 màn; chiều cao dùng `100dvh`, sân khấu tự co giãn để các nút chính luôn ở trong khung nhìn. Nút Toàn màn hình dùng Fullscreen API khi trình duyệt hỗ trợ.
- Đổi tên và chọn nhân vật nam hoặc nữ, mặc định là nữ; điện thoại cao hiển thị đáp án một cột, điện thoại thấp chuyển hai cột để tránh cuộn trang. Khi xoay ngang màn hình thấp, sân khấu và câu hỏi nằm cạnh nhau. Thang thưởng mở bằng nút khi màn hình hẹp/thấp; hộp thoại nội dung dài có thể cuộn bên trong.
- 15 câu mẫu JSON hoặc ngân hàng Google Sheets; chọn đáp án, xác nhận trước khi khóa, chờ kết quả, công bố đúng/sai, giải thích và chuyển câu.
- 50:50 ngẫu nhiên; bình chọn khán giả và cuộc gọi mô phỏng, mỗi quyền chỉ dùng một lần. Tư vấn gọi điện có thể sai.
- Mốc an toàn 2 triệu ở câu 5, 22 triệu ở câu 10. Sai/hết giờ nhận mốc đã bảo toàn; chủ động dừng nhận số tiền câu vừa trả lời đúng. Trả lời đúng 15 câu nhận 150 triệu mô phỏng.
- Phụ đề MC, nhắc lại câu hỏi, hiệu ứng âm thanh tổng hợp. Giọng nam qua API Google TTS hoặc giọng nam tiếng Việt nhận diện được trên thiết bị.
- Đồng hồ 60 giây/câu tùy chọn, mặc định tắt; tạm dừng trong hộp thoại. Cài đặt lưu localStorage; lượt chơi lưu sessionStorage trong tab hiện tại. Tải lại khi đã chốt vẫn giữ đáp án khóa và tiếp tục công bố kết quả.
- Dialog hỗ trợ bàn phím, giữ focus, Escape; tôn trọng `prefers-reduced-motion`. Font đóng gói cùng ứng dụng, không cần tải Google Fonts lúc chơi.

## Cấu trúc

```text
src/
  components/Stage/     Sân khấu, nhân vật SVG và hội thoại
  components/Game/      Câu hỏi, quyền trợ giúp và thang thưởng
  components/Layout/    Header và dialog
  pages/                Bốn màn chính
  hooks/                Reducer, điều phối game và âm thanh
  data/                 Câu hỏi JSON, mức thưởng và thoại MC
  styles/               CSS nền và responsive
tests/                  Kiểm thử quy tắc gameplay
api/                    Vercel Functions: câu hỏi và giọng MC
lib/                    Xác thực Google, đọc và cache kho câu hỏi
docs/                   Hướng dẫn deploy và mẫu Google Sheets
```

`gameEngine.js` là nguồn trạng thái duy nhất cho luật chơi. `useGameController.js` điều phối lưu phiên và thời gian chờ công bố. Các component đọc chung trạng thái này.

## Thiết kế sân khấu

Sân khấu và nhân vật được dựng bằng SVG, đã chỉnh theo ảnh feedback ngày 10/10/2026 và yêu cầu chọn nam/nữ ngày 11/10/2026. MC và hai phiên bản người chơi có diện mạo riêng; biểu cảm, cử chỉ thay đổi khi suy nghĩ, nói, hồi hộp, trả lời đúng/sai. Trợ giúp vẫn được mô phỏng; câu hỏi lấy từ Sheet hoặc bộ mẫu. Chưa cấu hình xác thực Google cho API hoặc deploy công khai; xem hướng dẫn cấu hình trong `docs/`.
