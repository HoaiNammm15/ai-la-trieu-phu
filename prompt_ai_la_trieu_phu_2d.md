# PROMPT — WEBSITE AI LÀ TRIỆU PHÚ (SÂN KHẤU HOẠT HÌNH 2D VUI NHỘN)

> **Bản thiết kế đã chốt:** Tái hiện không khí gameshow “Ai Là Triệu Phú”, nhưng nhân vật là hoạt hình 2D vui nhộn, đáng yêu, hơi chibi. Đây là **phong cách được chọn cuối cùng**, không dùng phong cách bán thực hay 3D.
>
> **Ảnh tham chiếu:** Sử dụng ảnh sân khấu mẫu đã chốt trong cuộc trò chuyện làm visual reference khi tạo hình/triển khai. Bản prompt này có thể đưa cho AI tạo giao diện, AI hỗ trợ code hoặc nhóm phát triển.

---

## A. PROMPT CHÍNH — THIẾT KẾ VÀ LẬP TRÌNH WEBSITE

Bạn là **Senior Frontend Developer và Game UI/UX Designer**. Hãy thiết kế và triển khai website chơi **“Ai Là Triệu Phú”** có giao diện lấy cảm hứng từ trường quay truyền hình, với **MC ảo và người chơi hoạt hình 2D hài hước, dễ thương**. Ưu tiên trải nghiệm thực tế, animation mượt, tương tác rõ ràng và khả năng mở rộng.

### 1. Công nghệ bắt buộc

- **React + Vite**, JavaScript/JSX.
- **CSS thuần hoặc CSS Modules**, **không dùng Tailwind CSS**.
- `react-router-dom` để chuyển trang.
- React hooks để quản lý trạng thái; có thể dùng reducer/custom hooks cho game flow.
- Có thể dùng SVG, CSS animation, WebP/PNG trong suốt để ghép nhân vật và dựng sân khấu.
- Âm thanh có thể dùng HTMLAudioElement hoặc Howler.js khi tích hợp.
- Bản đầu chạy hoàn toàn trên frontend với dữ liệu câu hỏi JSON. Có thể thiết kế sẵn giao diện kết nối NestJS API trong giai đoạn tiếp theo, nhưng không bắt buộc backend cho V1.

### 2. Phong cách hình ảnh — yêu cầu quan trọng nhất

- **Cartoon 2D/chibi đơn giản, vui nhộn**, đầu hơi to, mắt và nét mặt giàu cảm xúc, tay chân ngắn gọn, đường nét tròn, biểu cảm hài hước.
- **Không** tạo nhân vật theo kiểu người thật, bán thực, hình 3D hoặc gương mặt quá nghiêm túc.
- Sân khấu tương phản rõ: nền **xanh navy/đen tím**, đèn **xanh dương và tím neon**, điểm nhấn **vàng kim**.
- Ghế nóng bo tròn có viền xanh phát sáng; sàn diễn là các vòng elip neon đồng tâm; phía sau có khán giả dạng silhouette và các luồng spotlight.
- **Logo tròn “AI LÀ TRIỆU PHÚ” đặt chính giữa phía sau**, có nhiều lớp viền xanh/vàng sáng; dùng thiết kế nguyên bản lấy cảm hứng từ gameshow, không cần sao chép nguyên xi logo thương mại.
- MC ngồi **bên trái**, người chơi ngồi **bên phải**; giữa có một bục điều khiển nhỏ phát sáng màu xanh lục.
- Giữ cảm giác vui vẻ, gần gũi, dễ thương giống ảnh mẫu đã chốt; hình ảnh rõ nét, bố cục cân đối và không quá nhiều chi tiết gây rối.

**Bảng màu gợi ý:** `#080E29` (nền), `#142B66` (sân khấu), `#256BEB` (neon xanh), `#8154D5` (tím), `#F6CC73` (vàng kim), `#FFFFFF` (chữ).

### 3. Tạo hình hai nhân vật

**MC ẢO (bên trái)**
- Nam hoạt hình với mái tóc đen vuốt phồng, mặt tròn, má hồng, nụ cười lớn; thân thiện, hơi tinh nghịch.
- Mặc sơ mi trắng, áo vest đen/xanh navy, cà vạt vàng; có thể cầm thẻ chương trình.
- Ngồi vắt chân tự nhiên trên ghế xanh neon; một tay cầm thẻ, tay còn lại đưa ra giới thiệu người chơi.
- Các biểu cảm: `idle`, `smile`, `talking`, `thinking`, `serious`, `surprised`, `celebrating`, `sympathetic`.
- Các cử chỉ: gật đầu, vẫy tay, chỉ vào câu hỏi, nâng tay giới thiệu, chống cằm, giơ ngón cái, vỗ tay.

**NGƯỜI CHƠI (bên phải)**
- Nhân vật chibi trẻ trung, đầu hơi to, gương mặt dễ thương, má hồng; mặc áo hoodie hồng/tím hoặc trang phục tùy chọn.
- Ngồi trên ghế xanh neon, hai tay đặt gần cằm khi hồi hộp; chân đặt hoặc vắt thoải mái.
- Các biểu cảm: `idle`, `thinking`, `nervous`, `surprised`, `happy`, `sad`.
- Các cử chỉ: nhìn MC, ngập ngừng, chụm tay hồi hộp, vui mừng giơ tay, cúi đầu khi trả lời sai.
- Người chơi có **tên hiển thị tùy chỉnh**; về sau cho chọn avatar và trang phục. Ở demo có thể dùng tên “nemnguynx” đúng như ảnh mẫu.

> Ưu tiên làm nhân vật bằng **sprite/layer PNG hoặc WebP trong suốt**: thân, đầu, mắt, miệng, tay, phụ kiện. Đồng bộ khung hình để thay biểu cảm mà không giật vị trí. Nếu chưa có sprite, dùng SVG/CSS dựng bản minh họa nhất quán, không để hình bị vỡ hoặc đường dẫn ảnh bị lỗi.

### 4. Bố cục các trang

**Trang chủ (`/`)**
- Nền sân khấu tối có spotlight và logo tròn phát sáng.
- Tiêu đề lớn “AI LÀ TRIỆU PHÚ”, slogan “Bạn đã sẵn sàng bước vào ghế nóng?”.
- Nút nổi bật **BẮT ĐẦU CHƠI** màu vàng, cùng các tùy chọn Luật chơi và Cài đặt âm thanh.
- Có thể thêm hoạt ảnh MC vẫy tay chào khi mở trang.

**Màn chuẩn bị (`/setup`, có thể là modal)**
- Cho nhập tên người chơi, chọn avatar/trang phục (có thể làm đơn giản ở V1).
- Nút “SẴN SÀNG” để bắt đầu chương trình.

**Màn chơi (`/game`) — layout desktop**
- Phía trên: thanh header có logo/tên chương trình, thông tin câu hiện tại, bật/tắt tiếng và nút dừng chơi.
- **Khu sân khấu chính chiếm phần trên bên trái hoặc trung tâm:** MC trái, người chơi phải, logo tròn chính giữa, ghế nóng và spotlight.
- Ngay dưới sân khấu: **hộp thoại MC** hiện lời dẫn và tên người nói, có thể phát giọng đọc tiếng Việt.
- Phía dưới: khung câu hỏi kéo ngang kiểu gameshow; bốn đáp án A/B/C/D chia thành **hai hàng, mỗi hàng hai ô** với khung viền xanh/vàng.
- **Thang tiền thưởng 15 mức** bên phải desktop, làm nổi bật mốc hiện tại và mốc an toàn.
- **3 quyền trợ giúp:** 50:50, hỏi khán giả, gọi điện người thân. Các nút neon/biểu tượng dễ bấm.
- Có nút **CHỐT ĐÁP ÁN** và xác nhận trước khi công bố kết quả.

**Màn kết quả (`/result`)**
- MC chúc mừng hoặc chia sẻ khi thất bại.
- Hiển thị câu đạt được, tiền thưởng, trạng thái thắng/thua/dừng chơi.
- Nút Chơi lại hoặc Về trang chủ.

### 5. Gameplay & trạng thái

- Có **15 câu hỏi**, tăng dần độ khó, mỗi câu có 4 đáp án; dữ liệu JSON ban đầu.
- Người chơi **chọn đáp án trước**, ô đã chọn chuyển **vàng kim**; chỉ khi bấm Chốt mới khóa kết quả.
- Luồng: `welcome → asking → selecting → confirming → locked → suspense → reveal → next-question/result`.
- Khi trả lời **đúng**, đáp án chuyển **xanh lá**, MC và người chơi vui mừng; chuyển sang câu tiếp theo.
- Khi trả lời **sai**, đáp án đã chọn chuyển **đỏ**, đáp án đúng chuyển **xanh lá**; MC tiếc nuối và hiển thị kết quả.
- **50:50:** loại ngẫu nhiên hai đáp án sai.
- **Hỏi khán giả:** hiển thị biểu đồ bình chọn A/B/C/D dạng mô phỏng, phân bổ tỷ lệ hợp lý.
- **Gọi điện:** mở hội thoại tư vấn mô phỏng, có thể đúng hoặc không chắc chắn tùy câu.
- Mỗi quyền trợ giúp chỉ dùng một lần mỗi lượt chơi.
- Có quyền **Dừng cuộc chơi** để bảo toàn mức thưởng theo quy tắc đã định.
- Tùy chọn bật/tắt bộ đếm thời gian; V1 có thể chưa bật mặc định.
- Không để người chơi đổi câu trả lời sau khi đã khóa.

### 6. Tương tác với MC

MC phải phản ứng dựa trên trạng thái game, không chỉ là ảnh trang trí:

| Trạng thái | Lời thoại mẫu | Biểu cảm MC | Biểu cảm người chơi |
|---|---|---|---|
| Vào game | “Chào mừng bạn đến với ghế nóng!” | Vui vẻ, vẫy tay | Hào hứng |
| Đọc câu hỏi | “Và đây là câu hỏi dành cho bạn...” | Đang nói | Tập trung |
| Người chơi chọn đáp án | “Bạn đang nghiêng về phương án B phải không?” | Tò mò | Suy nghĩ |
| Chốt | “Đây có phải là câu trả lời cuối cùng?” | Nghiêm túc | Hồi hộp |
| Chờ kết quả | “Và đáp án chính xác là...” | Hồi hộp | Lo lắng |
| Đúng | “Chính xác! Xin chúc mừng!” | Giơ tay, chúc mừng | Vui mừng |
| Sai | “Rất tiếc, đáp án đúng là...” | Tiếc nuối | Buồn |

- Dùng thư viện câu thoại có nhiều biến thể để tránh quá lặp lại.
- Không để MC tiết lộ đáp án trước khi công bố.
- V1: **MC theo kịch bản**, hiển thị phụ đề, có thể thêm giọng đọc tiếng Việt từ các file âm thanh/TTS.
- Khi có audio: chuyển động miệng khi âm thanh phát, dừng khi kết thúc. Có nút bật/tắt âm thanh.
- Người chơi có thể bấm **“MC nhắc lại”** để nghe/xem lại câu hỏi.

### 7. Animation và camera 2D

- **Idle:** nhịp thở, chớp mắt, chuyển động rất nhẹ.
- **Talking:** thay đổi miệng, gật đầu/cử chỉ tay nhẹ.
- **Thinking:** chống cằm hoặc nghiêng đầu.
- **Suspense:** ánh sáng giảm, nhạc hồi hộp, nhân vật ngừng chuyển động mạnh.
- **Correct:** ánh đèn xanh, tia sáng, MC chúc mừng, người chơi ăn mừng.
- **Wrong:** ánh sáng trầm xuống, nhân vật buồn nhưng không quá nặng nề.
- Mô phỏng ba góc máy bằng CSS transform: `wide`, `host-focus`, `player-focus`. Không bắt buộc WebGL/Three.js.
- Tôn trọng `prefers-reduced-motion` để giảm animation với người không muốn hiệu ứng mạnh.

### 8. Responsive

- Desktop: sân khấu rộng, bảng tiền thưởng ở bên phải, câu hỏi và đáp án rõ ràng.
- Mobile: thu nhỏ sân khấu nhưng vẫn thấy cả MC và người chơi; đáp án **xếp một cột**, các nút đủ lớn để chạm; bảng thưởng có thể mở bằng drawer.
- Không để sân khấu che khuất câu hỏi, không có cuộn ngang, không làm chữ quá nhỏ.

### 9. Kiến trúc React đề xuất

```text
src/
  components/
    Stage/
      StageScene.jsx
      HostCharacter.jsx
      PlayerCharacter.jsx
      Character2D.jsx
      DialogueBox.jsx
      CameraController.jsx
      StageLighting.jsx
      StageScene.module.css
    Game/
      QuestionPanel.jsx
      AnswerOption.jsx
      LifelinePanel.jsx
      MoneyLadder.jsx
    Layout/
  pages/
    Home.jsx
    GamePage.jsx
    Result.jsx
  hooks/
    useGameController.js
    useDialogueAudio.js
  data/
    questions.js
    hostDialogues.js
    moneyLadder.js
  styles/
public/
  assets/
    characters/host/
    characters/player/
    stage/
    audio/
```

Thiết kế bộ quản lý trạng thái game làm **nguồn dữ liệu duy nhất**; StageScene, DialogueBox, âm thanh, biểu cảm MC và màu đáp án đều cập nhật đồng bộ theo cùng trạng thái.

### 10. Yêu cầu đầu ra khi nhờ AI code

1. Tạo project **React + Vite** chạy được, không dùng Tailwind.
2. Viết đầy đủ component JSX, CSS Modules, dữ liệu mẫu và routing.
3. Ưu tiên giao diện đúng ảnh tham chiếu, đặc biệt là **hai nhân vật chibi vui nhộn ngồi trên ghế nóng**.
4. Tương tác thật: bắt đầu game, chọn đáp án, chốt, đúng/sai, chuyển câu, ba quyền trợ giúp và màn kết quả.
5. Có hội thoại MC phù hợp từng trạng thái, không dùng một đoạn lời thoại cố định.
6. Không để nút bấm giả hoặc asset hỏng; nếu thiếu ảnh động thì dùng hình minh họa SVG/CSS hợp lệ và nêu rõ các asset cần thay.
7. Hướng dẫn cách cài dependencies và chạy bằng `npm install`, `npm run dev`.
8. Triển khai **theo từng giai đoạn**; hoàn thành và xác nhận layout sân khấu trước khi làm gameplay nâng cao.

---

## B. PROMPT RIÊNG — TẠO ẢNH THIẾT KẾ SÂN KHẤU

Dùng phần này với công cụ tạo ảnh khi cần tái tạo hình tham chiếu hoặc thiết kế thêm biến thể sân khấu.

> **Create a polished 16:9 concept art of a Vietnamese TV quiz game show stage titled “AI LÀ TRIỆU PHÚ”, in a cute, humorous 2D cartoon/chibi illustration style.** The host sits on the LEFT in a futuristic dark-blue armchair outlined by electric-blue neon; he is a cheerful young Vietnamese cartoon man with oversized expressive head, fluffy black hair, rosy cheeks, broad playful smile, a white shirt, dark vest, yellow tie, and a small cue card in his hand; he gestures warmly toward the contestant. On the RIGHT, a cute youthful Vietnamese cartoon contestant sits in a matching neon chair, wearing a pink-purple hoodie, with oversized head, expressive face, blush cheeks, hands clasped under the chin, and a joyful, slightly nervous expression. In the CENTER BACK is a large original circular gold-and-blue illuminated logo reading “AI LÀ TRIỆU PHÚ”. Between them is a small illuminated game podium. The stage is circular with concentric neon-blue floor rings, deep navy and purple ambiance, bright blue and violet spotlights, silhouetted audience, colorful glowing trim, polished playful TV-show composition. Clean bold rounded line art, flat-to-soft cel shading, strong silhouettes, adorable comedic facial expressions, soft depth with layered foreground/midground/background, professional game UI art direction, symmetrical wide composition. The upper UI header has a gold “AI LÀ TRIỆU PHÚ” label and a “CÂU 1/15” pill. Keep ample space in the lower portion for an interactive question panel in the eventual web application. **Avoid photorealism, realistic human proportions, 3D rendering, overly detailed faces, gloomy or overly serious character designs.** No watermarks.

### Ghi chú cho việc tạo tài nguyên nhân vật

- Khi cần animate, hãy tạo **từng nhân vật riêng trên nền trong suốt**, tư thế nhất quán, thay vì chỉ dùng ảnh sân khấu nguyên khối.
- Tạo ít nhất các sprite `idle`, `talking`, `thinking`, `nervous`, `celebrating`, `sad` cho từng nhân vật.
- Các sprite của cùng nhân vật phải cùng kích thước canvas, vị trí neo và tỷ lệ, để chuyển trạng thái mượt.
- Ảnh sân khấu tổng thể chỉ dùng làm **concept/reference hoặc background**; câu hỏi, đáp án, bảng thưởng và nút tương tác phải là thành phần HTML/React thật.

---

**Tóm tắt phong cách cuối cùng:** *Ai Là Triệu Phú* + *sân khấu truyền hình neon xanh tím* + *MC và người chơi hoạt hình 2D vui nhộn, đầu to, má hồng, giàu biểu cảm* + *gameplay 15 câu tương tác bằng React, CSS Modules*.
