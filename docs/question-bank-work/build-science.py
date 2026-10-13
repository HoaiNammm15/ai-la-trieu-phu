import json
import re
from collections import Counter
from pathlib import Path

# Each row is individually authored: level|category|stem|correct|three distractors|rationale.
DATA = r'''1|Vật lý|Dụng cụ nào dùng để đo nhiệt độ?|Nhiệt kế|Áp kế|Lực kế|Ampe kế|Nhiệt kế cho biết nhiệt độ của vật hoặc môi trường.
2|Vật lý|Hiện tượng ánh sáng bật trở lại khi gặp mặt gương gọi là gì?|Phản xạ|Bay hơi|Dẫn nhiệt|Nóng chảy|Phản xạ là sự đổi hướng của ánh sáng trở lại môi trường ban đầu.
4|Vật lý|Chiếc đũa nhúng trong nước trông như bị gãy chủ yếu do hiện tượng nào?|Khúc xạ ánh sáng|Nhiễm điện|Cộng hưởng âm|Phóng xạ|Ánh sáng đổi hướng khi đi qua mặt phân cách nước và không khí.
3|Vật lý|Pin đang cấp điện chủ yếu chuyển dạng năng lượng nào thành điện năng?|Hóa năng|Quang năng|Động năng|Năng lượng âm|Phản ứng hóa học trong pin cung cấp năng lượng cho dòng điện.
3|Vật lý|Âm thanh không truyền được trong môi trường nào?|Chân không|Nước|Không khí|Thép|Âm thanh là sóng cơ và cần môi trường vật chất để truyền.
2|Vật lý|Lực nào giúp má phanh làm bánh xe chậm lại?|Lực ma sát|Lực nổi|Lực đàn hồi của không khí|Lực từ của Mặt Trăng|Ma sát giữa má phanh và bộ phận quay cản trở chuyển động.
4|Vật lý|Lực của nước đẩy vật ngâm trong nước lên trên gọi là gì?|Lực đẩy Archimedes|Lực hướng tâm|Lực căng dây|Lực điện|Áp suất chất lỏng tạo hợp lực hướng lên đối với vật chìm trong nó.
3|Vật lý|Nước đá nổi trong nước lỏng vì có đặc điểm nào?|Khối lượng riêng nhỏ hơn nước lỏng|Không chịu trọng lực|Khối lượng riêng lớn hơn nước lỏng|Không có khối lượng|Nước đá có khối lượng riêng nhỏ hơn nước lỏng gần điểm đóng băng.
2|Vật lý|Nam châm thông thường hút mạnh vật làm bằng chất nào sau đây?|Sắt|Gỗ|Thủy tinh|Nhựa|Sắt là vật liệu có tính sắt từ nên bị nam châm hút mạnh.
4|Vật lý|Thấu kính của kính lúp thông thường là loại nào?|Thấu kính hội tụ|Thấu kính phân kỳ|Gương phẳng|Gương cầu lồi|Kính lúp dùng thấu kính hội tụ để tạo ảnh ảo phóng đại khi vật ở đủ gần.
3|Vật lý|Hai điện tích cùng dấu tác dụng lên nhau như thế nào?|Đẩy nhau|Hút nhau|Không tác dụng|Luôn nhập thành một|Theo tương tác tĩnh điện, các điện tích cùng dấu đẩy nhau.
2|Vật lý|Đơn vị cơ bản của khối lượng trong hệ SI là gì?|Kilôgam|Mét|Giây|Kelvin|Kilôgam là đơn vị cơ bản SI dùng cho khối lượng.
5|Vật lý|Đơn vị của lực trong hệ SI là gì?|Newton|Joule|Pascal|Watt|Newton là đơn vị lực, tương ứng kg·m/s².
3|Vật lý|Vật liệu nào sau đây dẫn điện tốt trong điều kiện thường?|Đồng|Cao su|Nhựa PVC|Thủy tinh|Đồng có các electron dẫn điện và được dùng phổ biến làm dây điện.
2|Vật lý|Sự luân phiên ngày và đêm trên Trái Đất chủ yếu do chuyển động nào?|Trái Đất tự quay quanh trục|Mặt Trăng tự quay|Mặt Trời quay quanh Trái Đất mỗi ngày|Trái Đất chuyển động quanh Mặt Trăng|Trái Đất tự quay làm từng khu vực lần lượt hướng về hoặc khuất Mặt Trời.
2|Vật lý|Quá trình nước lỏng chuyển thành hơi nước ở mặt thoáng gọi là gì?|Bay hơi|Đông đặc|Ngưng tụ|Nóng chảy|Bay hơi là sự chuyển từ thể lỏng sang thể khí ở bề mặt chất lỏng.
3|Vật lý|Hơi nước chuyển thành các giọt nước trên nắp nồi lạnh là quá trình nào?|Ngưng tụ|Thăng hoa|Đông đặc|Nóng chảy|Ngưng tụ là sự chuyển từ thể khí sang thể lỏng.
1|Vật lý|Lực nào khiến quả táo thả từ tay rơi xuống mặt đất?|Lực hấp dẫn của Trái Đất|Lực từ của quả táo|Lực nổi của không khí|Lực điện của ánh sáng|Trái Đất hút các vật bằng lực hấp dẫn.
4|Vật lý|Bộ phận cố định mà đòn bẩy quay quanh gọi là gì?|Điểm tựa|Tiêu điểm|Cực từ|Tâm áp suất|Điểm tựa là điểm hoặc trục quay của đòn bẩy.
4|Vật lý|Vì sao tay cầm xoong thường được làm bằng vật liệu cách nhiệt?|Để giảm nhiệt truyền đến tay|Để làm thức ăn chín nhanh hơn|Để tăng nhiệt độ sôi của nước|Để tăng trọng lượng xoong|Vật liệu cách nhiệt hạn chế dẫn nhiệt từ thân xoong đến tay người cầm.
2|Hóa học|Công thức hóa học H₂O biểu diễn chất nào?|Nước|Khí oxy|Muối ăn|Khí nitơ|Một phân tử nước gồm hai nguyên tử hydro và một nguyên tử oxy.
2|Hóa học|Khí nào trong không khí được cơ thể người sử dụng cho hô hấp hiếu khí?|Oxy|Heli|Argon|Hydro|Oxy tham gia các phản ứng tạo năng lượng trong hô hấp hiếu khí.
4|Hóa học|Thành phần hóa học chính của muối ăn là chất nào?|Natri chloride|Calcium carbonate|Natri bicarbonate|Magnesium oxide|Muối ăn chủ yếu là natri chloride, có công thức NaCl.
4|Hóa học|Ký hiệu hóa học Fe thuộc nguyên tố nào?|Sắt|Fluor|Francium|Fermium|Fe là ký hiệu của sắt, bắt nguồn từ tên Latin ferrum.
3|Hóa học|Công thức của khí carbon dioxide là gì?|CO₂|CO|O₂|CH₄|Carbon dioxide chứa một nguyên tử carbon và hai nguyên tử oxy.
5|Hóa học|Kim cương và than chì đều được cấu tạo từ nguyên tố nào?|Carbon|Silic|Lưu huỳnh|Phospho|Kim cương và than chì là hai dạng thù hình của carbon.
3|Hóa học|Sắt để lâu trong không khí ẩm thường xảy ra hiện tượng nào?|Gỉ sắt|Thăng hoa|Trùng hợp|Kết tinh thành muối ăn|Sắt phản ứng với oxy và nước tạo các sản phẩm ăn mòn gọi là gỉ.
5|Hóa học|Dung dịch acid thường làm giấy quỳ tím chuyển sang màu gì?|Đỏ|Xanh|Vàng|Trắng|Quỳ tím chuyển đỏ trong môi trường acid.
3|Hóa học|Khí nào sau đây duy trì sự cháy của nhiều nhiên liệu thông thường?|Oxy|Nitơ|Heli|Carbon dioxide|Oxy là chất oxy hóa tham gia phản ứng cháy thông thường.
4|Hóa học|Khí trơ nhẹ nào thường được bơm vào bóng bay để bóng bay lên?|Heli|Argon|Xenon|Krypton|Heli có khối lượng riêng thấp hơn không khí và ít phản ứng hóa học.
5|Hóa học|Ở 20°C và áp suất 1 atm, phi kim nào sau đây ở thể lỏng?|Brom|Lưu huỳnh|Carbon|Phospho đỏ|Brom có nhiệt độ nóng chảy thấp hơn 20°C và nhiệt độ sôi cao hơn 20°C.
3|Hóa học|Khi đường tan hoàn toàn trong nước, hỗn hợp thu được được gọi là gì?|Dung dịch|Huyền phù|Nhũ tương|Chất đơn nhất|Đường phân bố ở mức phân tử trong nước tạo dung dịch đồng nhất.
5|Hóa học|Acid tạo vị chua đặc trưng của giấm ăn là acid nào?|Acid acetic|Acid sulfuric|Acid hydrochloric|Acid nitric|Giấm ăn chứa acid acetic hòa tan trong nước.
5|Hóa học|Chất NaHCO₃ thường có trong baking soda được gọi là gì?|Natri bicarbonate|Natri chloride|Calcium sulfate|Potassium nitrate|Baking soda là tên thông dụng của natri bicarbonate.
4|Hóa học|Phần trung tâm của nguyên tử chứa proton được gọi là gì?|Hạt nhân|Lớp electron|Liên kết hóa học|Phân tử|Proton nằm trong hạt nhân nguyên tử.
1|Sinh học|Cơ quan nào bơm máu đi khắp cơ thể người?|Tim|Phổi|Dạ dày|Bàng quang|Sự co bóp của tim tạo lực đẩy máu qua hệ tuần hoàn.
2|Sinh học|Cơ quan nào là nơi trao đổi khí chính trong hệ hô hấp người?|Phổi|Gan|Dạ dày|Lách|Trao đổi oxy và carbon dioxide diễn ra chủ yếu ở các phế nang trong phổi.
2|Sinh học|Cơ quan nào tiếp nhận thức ăn từ thực quản và tiết dịch vị?|Dạ dày|Ruột già|Túi mật|Bàng quang|Dạ dày nhận thức ăn từ thực quản và tiết dịch vị hỗ trợ tiêu hóa.
5|Sinh học|Cơ quan nào sản xuất dịch mật ở người?|Gan|Túi mật|Tụy|Dạ dày|Gan sản xuất mật còn túi mật chủ yếu dự trữ và cô đặc mật.
4|Sinh học|Ở người, phần lớn chất dinh dưỡng được hấp thụ tại đâu?|Ruột non|Thực quản|Ruột thừa|Khoang miệng|Ruột non có diện tích hấp thụ lớn nhờ các nếp gấp, nhung mao và vi nhung mao.
2|Sinh học|Cá chép hô hấp chủ yếu bằng cơ quan nào?|Mang|Phổi|Khí quản|Lỗ thở trên đỉnh đầu|Mang lấy oxy hòa tan trong nước.
2|Sinh học|Đặc điểm nào gắn với tên gọi động vật có vú?|Nuôi con bằng sữa|Luôn sống trên cạn|Luôn đẻ trứng|Có sáu chân|Con cái của động vật có vú có tuyến sữa nuôi con.
2|Sinh học|Lớp phủ đặc trưng của cơ thể chim là gì?|Lông vũ|Vảy sừng như rắn|Lông mao như mèo|Vỏ đá vôi như ốc|Lông vũ là đặc điểm đặc trưng của chim.
3|Sinh học|Một côn trùng trưởng thành điển hình có bao nhiêu chân?|Sáu|Bốn|Tám|Mười|Côn trùng có ba đôi chân gắn với phần ngực.
3|Sinh học|Một con nhện điển hình có bao nhiêu chân?|Tám|Sáu|Bốn|Mười|Nhện có bốn đôi chân và không thuộc lớp côn trùng.
3|Sinh học|Bạch tuộc thường có bao nhiêu tay?|Tám|Sáu|Mười|Mười hai|Bạch tuộc có tám tay mang các giác hút.
1|Sinh học|Loài côn trùng nào tạo mật ong?|Ong mật|Chuồn chuồn|Bọ rùa|Ve sầu|Ong mật thu thập mật hoa và chế biến thành mật ong.
2|Sinh học|Ấu trùng của bướm thường được gọi là gì?|Sâu bướm|Nòng nọc|Giòi ruồi|Nhộng ong|Sâu bướm là giai đoạn ấu trùng trước khi hóa nhộng.
2|Sinh học|Con non sống dưới nước của ếch thường được gọi là gì?|Nòng nọc|Sâu non|Nhộng|Cá bột|Ếch thường trải qua giai đoạn nòng nọc trước khi biến thái.
2|Sinh học|Chim cánh cụt thuộc nhóm động vật nào?|Chim|Cá|Bò sát|Động vật có vú|Chim cánh cụt có lông vũ và các đặc điểm của lớp chim dù không bay được.
3|Sinh học|Cá heo thuộc nhóm động vật nào?|Động vật có vú|Cá sụn|Cá xương|Lưỡng cư|Cá heo thở bằng phổi và nuôi con bằng sữa.
3|Sinh học|Trong các động vật có vú sau, loài nào có khả năng bay chủ động?|Dơi|Sóc bay|Mèo|Thỏ|Dơi đập cánh để bay; sóc bay chỉ lượn nhờ màng da.
5|Sinh học|Nấm thường không tự quang hợp vì không có chất nào?|Diệp lục|Protein|Nước|Chất khoáng|Nấm không có diệp lục và lấy chất hữu cơ từ môi trường.
3|Sinh học|Sắc tố nào làm phần lớn lá cây có màu xanh?|Diệp lục|Hemoglobin|Melanin|Keratin|Diệp lục hấp thụ ánh sáng phục vụ quang hợp và tạo màu xanh của lá.
2|Sinh học|Bộ phận nào của cây trên cạn thường hút nước và muối khoáng từ đất?|Rễ|Hoa|Quả|Hạt phấn|Rễ, đặc biệt vùng lông hút, hấp thụ nước và ion khoáng từ đất.
4|Sinh học|Ở thực vật có hoa, cơ quan nào chuyên thực hiện sinh sản hữu tính?|Hoa|Rễ|Lông hút|Vỏ thân|Hoa mang các cấu trúc tạo giao tử và thực hiện thụ phấn, thụ tinh.
3|Sinh học|Hạt khô cần hấp thụ chất nào trước khi bắt đầu nảy mầm trong điều kiện thích hợp?|Nước|Dầu ăn|Cồn|Thủy ngân|Hấp thụ nước giúp các quá trình trao đổi chất trong hạt hoạt động trở lại.
2|Sinh học|Loài nào sau đây chủ yếu ăn thực vật?|Bò|Sư tử|Hổ|Báo săn|Bò là động vật ăn cỏ, có hệ tiêu hóa thích nghi với thức ăn thực vật.
2|Sinh học|Loài nào sau đây là động vật ăn thịt điển hình?|Sư tử|Bò|Dê|Ngựa|Sư tử chủ yếu săn và ăn các động vật khác.
3|Sinh học|Loài nào sau đây là động vật ăn tạp điển hình?|Lợn|Bò|Hươu cao cổ|Koala|Lợn có thể ăn cả thức ăn thực vật và động vật.
2|Sinh học|Gà sinh sản bằng hình thức nào?|Đẻ trứng|Đẻ con có nhau thai|Nảy chồi|Phân đôi|Gà là chim và sinh sản bằng trứng.
3|Sinh học|Hạt táo có thể phát triển thành cây mới là ví dụ của quá trình nào?|Sinh sản bằng hạt|Sinh sản bằng giâm cành|Sinh sản bằng củ|Sinh sản bằng chiết cành|Hạt chứa phôi có thể phát triển thành cây mới.
3|Sinh học|Hệ cơ quan nào tạo khung nâng đỡ và bảo vệ nhiều cơ quan ở người?|Hệ xương|Hệ bài tiết|Hệ nội tiết|Hệ tiêu hóa|Bộ xương nâng đỡ cơ thể và bảo vệ các cơ quan như não và tim.
4|Sinh học|Lỗ nằm ở giữa mống mắt, cho ánh sáng đi vào mắt, gọi là gì?|Đồng tử|Giác mạc|Võng mạc|Thủy tinh thể|Đồng tử là lỗ ở giữa mống mắt, kích thước thay đổi để điều chỉnh lượng ánh sáng.
1|Sinh học|Cơ quan giác quan nào giúp con người nghe âm thanh?|Tai|Mắt|Mũi|Lưỡi|Tai tiếp nhận dao động âm và chuyển thành tín hiệu thần kinh.
1|Thiên văn|Mặt Trời được phân loại là loại thiên thể nào?|Ngôi sao|Hành tinh|Sao chổi|Tiểu hành tinh|Mặt Trời phát sáng nhờ năng lượng từ phản ứng hạt nhân trong lõi.
2|Thiên văn|Mặt Trăng là vệ tinh tự nhiên của thiên thể nào?|Trái Đất|Sao Kim|Sao Hỏa|Sao Thủy|Mặt Trăng chuyển động quanh Trái Đất.
3|Thiên văn|Hành tinh nào ở gần Mặt Trời nhất?|Sao Thủy|Sao Kim|Trái Đất|Sao Hỏa|Quỹ đạo Sao Thủy nằm gần Mặt Trời nhất trong các hành tinh.
4|Thiên văn|Hành tinh nào lớn nhất trong Hệ Mặt Trời?|Sao Mộc|Sao Thổ|Sao Hải Vương|Trái Đất|Sao Mộc có đường kính và khối lượng lớn nhất trong các hành tinh của Hệ Mặt Trời.
3|Thiên văn|Ánh sáng nhìn thấy từ Mặt Trăng chủ yếu có nguồn gốc nào?|Ánh sáng Mặt Trời được phản xạ|Phản ứng cháy trên Mặt Trăng|Đèn do con người lắp toàn bề mặt|Mặt Trăng tự phát sáng như sao|Bề mặt Mặt Trăng phản xạ một phần ánh sáng Mặt Trời.
4|Thiên văn|Ngân Hà là loại cấu trúc thiên văn nào?|Thiên hà|Hành tinh|Vệ tinh|Sao chổi|Ngân Hà là thiên hà chứa Hệ Mặt Trời và rất nhiều ngôi sao.
4|Thiên văn|Thiên thể nhỏ có thể tạo đuôi khí và bụi khi đến gần Mặt Trời gọi là gì?|Sao chổi|Sao neutron|Hành tinh khí|Sao lùn trắng|Băng trên sao chổi thăng hoa khi nóng lên, giải phóng khí và bụi tạo đuôi.
3|Thiên văn|Trong nhật thực, thiên thể nào nằm giữa Mặt Trời và Trái Đất?|Mặt Trăng|Sao Hỏa|Sao Kim|Sao Mộc|Nhật thực xảy ra khi Mặt Trăng che khuất Mặt Trời đối với người quan sát trên Trái Đất.
4|Thiên văn|Trong nguyệt thực, thiên thể nào chắn ánh sáng Mặt Trời chiếu tới Mặt Trăng?|Trái Đất|Sao Thủy|Sao Thổ|Sao Hải Vương|Nguyệt thực xảy ra khi Mặt Trăng đi vào vùng bóng của Trái Đất.
5|Thiên văn|Tên gọi Trăng tròn mô tả trạng thái nào của Mặt Trăng nhìn từ Trái Đất?|Gần như toàn bộ đĩa Mặt Trăng được chiếu sáng|Mặt Trăng hoàn toàn không được chiếu sáng|Mặt Trăng chỉ còn một nửa khối lượng|Mặt Trăng không chuyển động|Trăng tròn là pha mà phía hướng về Trái Đất gần như được chiếu sáng toàn bộ.
2|Môi trường|Nguồn năng lượng nào sau đây được xem là năng lượng tái tạo?|Năng lượng gió|Than đá|Dầu mỏ|Khí tự nhiên|Gió được bổ sung liên tục nhờ các quá trình khí quyển.
3|Môi trường|Hoạt động trồng cây giúp giảm trực tiếp khí nào trong không khí thông qua quang hợp?|Carbon dioxide|Heli|Argon|Neon|Cây cố định carbon từ carbon dioxide vào chất hữu cơ trong quá trình quang hợp.
2|Môi trường|Hành động nào góp phần tiết kiệm điện trong sinh hoạt?|Tắt đèn khi không cần dùng|Bật điều hòa khi phòng trống|Để tủ lạnh mở lâu|Bật mọi thiết bị suốt ngày|Tắt thiết bị không cần thiết làm giảm điện năng tiêu thụ.
3|Môi trường|Rác nào sau đây có nguồn gốc hữu cơ và thường phù hợp để ủ phân?|Vỏ rau quả|Mảnh kính|Pin đã dùng|Túi nylon|Vỏ rau quả có thể được vi sinh vật phân hủy thành vật liệu làm phân hữu cơ.
4|Môi trường|Đa dạng sinh học là sự đa dạng của yếu tố nào?|Sinh vật, nguồn gen và hệ sinh thái|Chỉ nhiệt độ không khí|Chỉ màu sắc của đất|Chỉ lượng mưa mỗi ngày|Đa dạng sinh học thường được xét ở các cấp độ gen, loài và hệ sinh thái.
6|Vật lý|Đơn vị đo năng lượng trong hệ SI là gì?|Joule|Watt|Tesla|Hertz|Joule là đơn vị của năng lượng và công.
6|Vật lý|Đơn vị đo công suất trong hệ SI là gì?|Watt|Joule|Newton|Coulomb|Một watt tương ứng tốc độ trao đổi năng lượng một joule mỗi giây.
7|Vật lý|Đơn vị đo áp suất trong hệ SI là gì?|Pascal|Tesla|Volt|Ohm|Pascal bằng một newton trên một mét vuông.
6|Vật lý|Đơn vị hertz dùng để đo đại lượng nào?|Tần số|Biên độ|Khối lượng|Nhiệt lượng|Hertz biểu thị số chu kỳ lặp lại trong một giây.
6|Vật lý|Đơn vị cơ bản SI của nhiệt độ nhiệt động lực học là gì?|Kelvin|Độ Celsius|Độ Fahrenheit|Joule|Kelvin là đơn vị nhiệt độ nhiệt động lực học trong hệ SI.
8|Vật lý|Máy biến áp thông thường làm thay đổi đại lượng nào của dòng điện xoay chiều?|Điện áp|Tần số nguồn điện|Điện tích của electron|Tốc độ ánh sáng|Máy biến áp dùng cảm ứng điện từ để tăng hoặc giảm điện áp xoay chiều.
6|Vật lý|Đặc điểm xác định dòng điện một chiều là gì?|Chiều dòng điện không đổi|Chiều dòng điện đảo sau mỗi chu kỳ|Không mang điện tích|Chỉ tồn tại trong chân không|Dòng điện một chiều duy trì cùng một chiều, dù độ lớn có thể thay đổi.
7|Vật lý|Trong mạch điện nối tiếp lý tưởng, đại lượng nào giống nhau qua mọi phần tử?|Cường độ dòng điện|Điện trở|Hiệu điện thế|Công suất tiêu thụ|Trong mạch nối tiếp không có nhánh rẽ, dòng điện qua các phần tử có cùng cường độ.
7|Vật lý|Các điện trở mắc song song giữa cùng hai nút có đại lượng nào bằng nhau?|Hiệu điện thế hai đầu|Điện trở|Cường độ dòng điện|Nhiệt lượng tỏa ra|Mọi nhánh nối giữa cùng hai nút có cùng hiệu điện thế.
6|Vật lý|Nhiệt truyền dọc theo chiếc thìa kim loại đặt trong nước nóng chủ yếu bằng cách nào?|Dẫn nhiệt|Đối lưu|Bay hơi|Thăng hoa|Dẫn nhiệt truyền năng lượng trong vật liệu mà không cần chuyển dời khối vật chất.
7|Vật lý|Hình thức truyền nhiệt gắn với sự chuyển động thành dòng của chất lỏng hoặc chất khí là gì?|Đối lưu|Dẫn nhiệt|Tán sắc|Nhiễu xạ|Đối lưu vận chuyển nhiệt nhờ các dòng chuyển động của chất lưu.
7|Vật lý|Năng lượng Mặt Trời truyền đến Trái Đất qua khoảng không chủ yếu bằng cách nào?|Bức xạ điện từ|Đối lưu|Dẫn nhiệt|Truyền sóng cơ|Bức xạ điện từ truyền được qua chân không giữa Mặt Trời và Trái Đất.
7|Vật lý|Ánh sáng trắng đi qua lăng kính tách thành các màu chủ yếu do hiện tượng nào?|Tán sắc|Giao thoa|Nhiễu xạ|Phản xạ toàn phần|Chiết suất phụ thuộc bước sóng khiến các màu bị lệch theo các góc khác nhau.
6|Vật lý|Đoản mạch thường làm dòng điện tăng mạnh vì điều gì?|Điện trở của đường dẫn quá nhỏ|Điện trở của đường dẫn quá lớn|Điện áp nguồn nhất thiết giảm về không|Điện dung dây dẫn tăng đến vô hạn|Khi điện trở tổng rất nhỏ, nguồn có thể tạo dòng điện lớn.
7|Vật lý|Với cùng lực ép vuông góc, giảm diện tích tiếp xúc làm áp suất thay đổi thế nào?|Tăng lên|Giảm xuống|Luôn về không|Không đổi|Áp suất bằng lực ép chia cho diện tích chịu lực.
8|Vật lý|Với dao động nhỏ ở cùng nơi, tăng chiều dài con lắc đơn làm chu kỳ thay đổi thế nào?|Tăng lên|Giảm xuống|Không đổi|Luôn bằng một giây|Chu kỳ con lắc đơn tỉ lệ với căn bậc hai của chiều dài.
6|Vật lý|Độ cao của âm phụ thuộc chủ yếu vào đại lượng nào?|Tần số|Biên độ|Khoảng cách đến nguồn|Khối lượng không khí cả phòng|Âm có tần số cao hơn được cảm nhận là cao hơn.
7|Vật lý|Trong cùng điều kiện truyền âm, tăng biên độ dao động của nguồn thường làm âm thế nào?|To hơn|Cao hơn nhưng không to hơn|Truyền nhanh hơn trong không khí|Mất khả năng truyền trong nước|Biên độ lớn hơn thường tương ứng cường độ âm lớn hơn và âm nghe to hơn.
8|Vật lý|Động lượng của một vật bằng tích của hai đại lượng nào?|Khối lượng và vận tốc|Khối lượng và gia tốc|Lực và quãng đường|Áp suất và thể tích|Trong cơ học cổ điển, động lượng được xác định bởi p = mv.
7|Vật lý|Xu hướng giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều gọi là gì?|Quán tính|Đối lưu|Cộng hưởng|Tán sắc|Quán tính là tính chất chống lại sự thay đổi vận tốc của vật.
8|Vật lý|Theo định luật III Newton, lực và phản lực tác dụng lên đâu?|Hai vật khác nhau|Cùng một vật|Chỉ vật có khối lượng nhỏ hơn|Chỉ vật đang chuyển động|Hai vật tương tác tác dụng lên nhau các lực cùng độ lớn và ngược chiều.
6|Vật lý|Trong chân không, hai vật thả cùng lúc từ cùng độ cao gần mặt đất sẽ thế nào nếu bỏ qua mọi tác động khác?|Chạm đất đồng thời|Vật nặng luôn chạm trước|Vật nhẹ luôn chạm trước|Cả hai không rơi|Khi không có lực cản, các vật cùng chịu gia tốc rơi tự do tại một vị trí.
7|Vật lý|Trong chân không, ánh sáng màu nào có bước sóng dài hơn trong hai màu đỏ và tím?|Đỏ|Tím|Hai màu có bước sóng bằng nhau|Mỗi màu không có bước sóng|Ánh sáng đỏ có bước sóng dài hơn ánh sáng tím trong phổ nhìn thấy.
7|Vật lý|Gương cầu lồi thường được dùng ở góc đường vì ưu điểm nào?|Cho trường nhìn rộng|Luôn tạo ảnh thật|Luôn phóng đại ảnh|Hội tụ toàn bộ ánh sáng tại một điểm|Gương cầu lồi tạo ảnh ảo nhỏ hơn vật và giúp quan sát vùng rộng.
8|Vật lý|Khối lượng riêng của một chất được tính bằng phép nào?|Khối lượng chia cho thể tích|Khối lượng nhân thể tích|Thể tích chia cho thời gian|Lực chia cho diện tích|Khối lượng riêng biểu thị khối lượng trên một đơn vị thể tích.
6|Hóa học|Số hiệu nguyên tử của nguyên tố bằng số hạt nào trong hạt nhân?|Proton|Neutron|Electron tự do|Photon|Số proton quyết định nguyên tố hóa học.
8|Hóa học|Các đồng vị của cùng một nguyên tố khác nhau về số hạt nào?|Neutron|Proton|Proton và electron luôn cùng tăng|Tất cả đều không có hạt nhân|Đồng vị có cùng số proton nhưng khác số neutron.
7|Hóa học|Liên kết cộng hóa trị hình thành chủ yếu bằng cách nào?|Dùng chung các cặp electron|Dùng chung proton giữa hạt nhân|Trao đổi neutron liên tục|Loại bỏ mọi electron|Các nguyên tử dùng chung một hoặc nhiều cặp electron trong liên kết cộng hóa trị.
8|Hóa học|Lực giữ các ion trong tinh thể NaCl chủ yếu là lực nào?|Hút tĩnh điện giữa các ion trái dấu|Hấp dẫn giữa các hành tinh|Lực từ giữa hai nam châm|Lực nổi trong không khí|Ion Na⁺ và Cl⁻ hút nhau bằng tương tác tĩnh điện.
8|Hóa học|Chlorine, brom và iodine thuộc nhóm nguyên tố có tên gì?|Halogen|Khí hiếm|Kim loại kiềm|Kim loại kiềm thổ|Các nguyên tố này thuộc nhóm17 của bảng tuần hoàn.
7|Hóa học|Nguyên tố nào sau đây thuộc nhóm khí hiếm?|Neon|Nitơ|Oxy|Chlorine|Neon thuộc nhóm18, có lớp electron ngoài cùng bão hòa.
8|Hóa học|Nguyên tố nào sau đây thuộc nhóm kim loại kiềm?|Natri|Calcium|Nhôm|Kẽm|Natri thuộc nhóm1 của bảng tuần hoàn, tức nhóm kim loại kiềm.
7|Hóa học|Phản ứng giữa acid hydrochloric và natri hydroxide tạo các sản phẩm chính nào?|Natri chloride và nước|Natri và oxy|Hydro và chlorine|Carbon dioxide và nước|Đây là phản ứng trung hòa: HCl + NaOH tạo NaCl và H₂O.
7|Hóa học|Ở25°C, dung dịch có pH nhỏ hơn7 có tính gì?|Acid|Base|Trung tính|Luôn là kim loại|Ở25°C, pH nhỏ hơn7 đặc trưng cho môi trường acid.
8|Hóa học|Chất xúc tác thường có tác dụng gì đối với một phản ứng hóa học?|Tăng tốc độ phản ứng|Tăng hằng số cân bằng ở cùng nhiệt độ|Tăng năng lượng hoạt hóa|Luôn làm phản ứng tỏa nhiệt hơn|Chất xúc tác cung cấp con đường phản ứng có năng lượng hoạt hóa thấp hơn.
8|Hóa học|Điện phân sử dụng nguồn năng lượng nào để thúc đẩy phản ứng hóa học?|Điện năng|Nhiệt năng của môi trường|Quang năng|Cơ năng|Điện phân dùng dòng điện để thúc đẩy phản ứng oxy hóa khử không tự diễn ra theo chiều đó.
6|Hóa học|Trong một phản ứng hóa học diễn ra trong hệ kín, đại lượng nào được bảo toàn?|Tổng khối lượng|Số phân tử|Tổng thể tích khí trong mọi trường hợp|Màu sắc|Nguyên tử được sắp xếp lại nên tổng khối lượng của hệ kín được bảo toàn.
8|Hóa học|Dung dịch NaCl dẫn điện chủ yếu nhờ các hạt nào chuyển động?|Ion Na⁺ và Cl⁻|Chỉ các phân tử nước trung hòa|Hạt bụi không tích điện|Các hạt nhân nguyên tử tự do|Các ion hòa tan mang điện và vận chuyển điện tích trong dung dịch.
8|Hóa học|Đồng thau là hợp kim chủ yếu của đồng với kim loại nào?|Kẽm|Thiếc|Chì|Thủy ngân|Đồng thau chủ yếu gồm đồng và kẽm; đồng thiếc được gọi là đồng thanh.
9|Hóa học|Nguyên tố nào giúp thép không gỉ tạo lớp bảo vệ chống ăn mòn?|Chromium|Natri|Heli|Brom|Chromium tạo lớp oxide thụ động mỏng bảo vệ bề mặt thép.
7|Hóa học|Thành phần chính của đá vôi là hợp chất nào?|Calcium carbonate|Natri chloride|Silicon carbide|Potassium hydroxide|Đá vôi chủ yếu chứa CaCO₃, tức calcium carbonate.
7|Hóa học|Công thức hóa học của ammonia là gì?|NH₃|NO₂|N₂O|HNO₃|Ammonia gồm một nguyên tử nitơ liên kết với ba nguyên tử hydro.
7|Hóa học|Thành phần khí chủ yếu của khí tự nhiên thông thường là gì?|Methane|Oxy|Sulfur dioxide|Argon|Methane, CH₄, thường là thành phần chính của khí tự nhiên.
8|Hóa học|Công thức phân tử của ethanol là gì?|C₂H₆O|CH₄O|C₃H₈O|C₂H₄O₂|Ethanol có thể viết dưới dạng C₂H₅OH, tương ứng công thức phân tử C₂H₆O.
9|Hóa học|Trong phản ứng oxy hóa khử, quá trình oxy hóa là quá trình nào?|Nhường electron|Nhận electron|Nhận neutron|Không đổi số oxy hóa|Sự oxy hóa gắn với nhường electron và tăng số oxy hóa.
8|Sinh học|Bào quan nào là nơi tạo phần lớn ATP trong hô hấp hiếu khí của tế bào người?|Ti thể|Lysosome|Bộ máy Golgi|Trung thể|Ti thể thực hiện chu trình citric và phosphoryl hóa oxy hóa tạo nhiều ATP.
8|Sinh học|Bào quan nào trực tiếp tổng hợp protein từ thông tin trên mRNA?|Ribosome|Lysosome|Không bào|Trung thể|Ribosome thực hiện dịch mã để nối các amino acid thành chuỗi polypeptide.
7|Sinh học|Quang hợp ở tế bào lá thực vật diễn ra trong bào quan nào?|Lục lạp|Lysosome|Trung thể|Bộ máy Golgi|Lục lạp chứa diệp lục và các hệ thống phản ứng quang hợp.
7|Sinh học|Ở tế bào nhân thực, phần lớn ADN nằm trong cấu trúc nào?|Nhân tế bào|Thành tế bào|Không bào trung tâm|Lysosome|Nhân tế bào chứa các nhiễm sắc thể mang phần lớn ADN của tế bào nhân thực.
7|Sinh học|Cấu trúc nào bao quanh tế bào và kiểm soát có chọn lọc sự trao đổi chất?|Màng sinh chất|Ribosome|Nhiễm sắc thể|Hạch nhân|Màng sinh chất là ranh giới có tính thấm chọn lọc của tế bào.
7|Sinh học|Protein nào trong hồng cầu có vai trò vận chuyển oxy?|Hemoglobin|Collagen|Keratin|Insulin|Hemoglobin gắn oxy ở phổi và giải phóng oxy tại các mô.
6|Sinh học|Nhóm tế bào máu nào có vai trò chính trong bảo vệ cơ thể trước tác nhân gây bệnh?|Bạch cầu|Hồng cầu|Tiểu cầu|Tế bào cơ|Các loại bạch cầu thực hiện nhiều chức năng của hệ miễn dịch.
7|Sinh học|Tế bào chuyên tiếp nhận và truyền tín hiệu trong hệ thần kinh gọi là gì?|Neuron|Hồng cầu|Tế bào biểu bì|Tế bào xương|Neuron truyền thông tin bằng tín hiệu điện và hóa học.
9|Sinh học|Hormone insulin được tuyến tụy tiết ra có tác dụng chính nào?|Hỗ trợ làm giảm glucose máu|Tăng giải phóng glucose từ glycogen gan|Tăng tái hấp thu nước ở ống góp thận|Tăng hấp thụ calcium ở ruột|Insulin thúc đẩy nhiều mô thu nhận hoặc dự trữ glucose.
7|Sinh học|Cơ nào ngăn cách lồng ngực với ổ bụng và giữ vai trò quan trọng trong hít thở?|Cơ hoành|Cơ nhị đầu cánh tay|Cơ tứ đầu đùi|Cơ vòng miệng|Cơ hoành co và hạ xuống khi hít vào, góp phần làm tăng thể tích lồng ngực.
9|Sinh học|Động mạch chủ nhận máu trực tiếp từ buồng tim nào?|Tâm thất trái|Tâm thất phải|Tâm nhĩ trái|Tâm nhĩ phải|Tâm thất trái bơm máu vào động mạch chủ để đi đến tuần hoàn hệ thống.
9|Sinh học|Mạch nào đưa máu giàu oxy từ phổi trở về tim?|Tĩnh mạch phổi|Động mạch phổi|Tĩnh mạch chủ trên|Tĩnh mạch chủ dưới|Tĩnh mạch phổi đưa máu đã được trao đổi khí về tâm nhĩ trái.
8|Sinh học|Mô dẫn nào của cây chủ yếu vận chuyển nước và ion khoáng từ rễ?|Mạch gỗ|Mạch rây|Biểu bì|Mô phân sinh|Mạch gỗ vận chuyển nước và khoáng, thường theo hướng từ rễ lên thân và lá.
9|Sinh học|Mô dẫn nào của cây vận chuyển phần lớn đường từ cơ quan nguồn đến cơ quan nhận?|Mạch rây|Mạch gỗ|Bần|Mô cứng|Mạch rây vận chuyển các chất hữu cơ hòa tan như sucrose.
8|Sinh học|Các lỗ nhỏ trên biểu bì lá tham gia trao đổi khí và thoát hơi nước gọi là gì?|Khí khổng|Lông hút|Mạch rây|Nốt sần|Khí khổng có tế bào bảo vệ điều chỉnh việc đóng mở.
8|Sinh học|Polysaccharide chính cấu tạo thành tế bào thực vật là gì?|Cellulose|Glycogen|Chitin|Tinh bột|Cellulose là thành phần cấu trúc chủ yếu của thành tế bào thực vật.
9|Sinh học|Thành tế bào của nhiều loài nấm chứa chất cấu trúc nào?|Chitin|Hemoglobin|Keratin|Elastin|Chitin là polysaccharide quan trọng trong thành tế bào nấm.
8|Sinh học|Vi khuẩn điển hình thuộc nhóm tế bào nào?|Tế bào nhân sơ|Tế bào nhân thực thực vật|Tế bào nhân thực động vật|Tế bào nhân thực nấm|Vi khuẩn không có nhân được bao bọc bằng màng như tế bào nhân thực.
8|Sinh học|Virus chỉ nhân lên được khi có điều kiện nào?|Ở trong tế bào chủ thích hợp|Trong môi trường dinh dưỡng vô bào thông thường|Trên bề mặt khô không có tế bào|Trong nước tinh khiết vô trùng|Virus cần sử dụng bộ máy của tế bào chủ để tạo virus mới.
6|Sinh học|Trong hệ sinh thái, thực vật xanh thường thuộc nhóm nào?|Sinh vật sản xuất|Sinh vật tiêu thụ bậc một|Sinh vật tiêu thụ bậc hai|Sinh vật phân giải|Thực vật xanh tổng hợp chất hữu cơ từ các chất vô cơ nhờ quang hợp.
7|Sinh học|Nấm và nhiều vi khuẩn phân hủy xác sinh vật thuộc nhóm sinh thái nào?|Sinh vật phân giải|Sinh vật sản xuất|Sinh vật tiêu thụ bậc một chỉ ăn cỏ|Sinh vật tiêu thụ bậc cao chỉ săn mồi|Sinh vật phân giải chuyển chất hữu cơ thành các chất đơn giản hơn.
8|Sinh học|Gregor Mendel chủ yếu dùng loài cây nào trong các thí nghiệm di truyền nổi tiếng?|Đậu Hà Lan|Ngô|Lúa nước|Khoai tây|Mendel nghiên cứu các tính trạng tương phản trên cây đậu Hà Lan.
8|Sinh học|Trong ADN mạch kép thông thường, adenine bắt cặp với base nào?|Thymine|Uracil|Cytosine|Guanine|Quy tắc bổ sung của ADN là A–T và G–C.
8|Sinh học|Quá trình phân bào nào thường tạo hai tế bào con giữ nguyên số nhiễm sắc thể so với tế bào mẹ?|Nguyên phân|Giảm phân|Thụ tinh|Tiếp hợp|Nguyên phân phân chia vật chất di truyền đã nhân đôi cho hai tế bào con.
9|Sinh học|Quá trình nào làm giảm số bộ nhiễm sắc thể từ lưỡng bội xuống đơn bội?|Giảm phân|Nguyên phân|Nhân đôi ADN|Thụ tinh|Giảm phân gồm hai lần phân bào sau một lần nhân đôi ADN.
6|Thiên văn|Hành tinh nào có nhiệt độ bề mặt trung bình cao nhất trong Hệ Mặt Trời?|Sao Kim|Sao Thủy|Sao Hỏa|Sao Hải Vương|Khí quyển dày giàu CO₂ gây hiệu ứng nhà kính mạnh trên Sao Kim.
6|Thiên văn|Hành tinh nào nổi tiếng với hệ vành đai sáng dễ quan sát qua kính thiên văn nhỏ?|Sao Thổ|Sao Thủy|Trái Đất|Sao Hỏa|Sao Thổ có hệ vành đai rộng và sáng, chủ yếu gồm các hạt băng.
9|Thiên văn|Hành tinh nào có trục quay nghiêng khoảng98° nên thường được mô tả là quay nghiêng trên một bên?|Sao Thiên Vương|Sao Mộc|Trái Đất|Sao Thủy|Độ nghiêng lớn khiến Sao Thiên Vương có tư thế quay rất khác phần lớn hành tinh.
7|Thiên văn|Trong tám hành tinh, hành tinh nào có quỹ đạo xa Mặt Trời nhất?|Sao Hải Vương|Sao Thiên Vương|Sao Thổ|Sao Mộc|Quỹ đạo Sao Hải Vương nằm ngoài quỹ đạo của bảy hành tinh còn lại.
7|Thiên văn|Theo định luật Kepler thứ nhất, quỹ đạo hành tinh quanh Mặt Trời có dạng gì?|Elip với Mặt Trời ở một tiêu điểm|Parabol với Mặt Trời ở đỉnh|Đường thẳng qua Mặt Trời|Hình vuông tâm Mặt Trời|Các quỹ đạo hành tinh được mô tả gần đúng bằng elip với Mặt Trời ở một tiêu điểm.
6|Thiên văn|Một năm trên một hành tinh thường được xác định bằng khoảng thời gian nào?|Một vòng chuyển động quanh ngôi sao chủ|Một vòng tự quay quanh trục|Một lần nhật thực|Một lần va chạm thiên thạch|Năm là chu kỳ quỹ đạo của hành tinh quanh ngôi sao chủ.
8|Thiên văn|Khoảng thời gian trung bình từ một lần Trăng mới đến lần Trăng mới kế tiếp gần bằng bao nhiêu?|29,5ngày|24giờ|7ngày|365ngày|Chu kỳ giao hội của Mặt Trăng dài khoảng29,53ngày.
8|Thiên văn|Vì sao Mặt Trăng luôn hướng gần như cùng một mặt về Trái Đất?|Chu kỳ tự quay gần bằng chu kỳ quay quanh Trái Đất|Mặt Trăng hoàn toàn không tự quay|Trái Đất không tự quay|Mặt Trăng phát sáng ở đúng một mặt|Sự khóa thủy triều khiến chu kỳ tự quay và chu kỳ quỹ đạo của Mặt Trăng gần bằng nhau.
7|Thiên văn|Vành đai tiểu hành tinh chính nằm giữa quỹ đạo hai hành tinh nào?|Sao Hỏa và Sao Mộc|Trái Đất và Sao Hỏa|Sao Kim và Trái Đất|Sao Thổ và Sao Thiên Vương|Phần lớn các tiểu hành tinh của vành đai chính nằm giữa Sao Hỏa và Sao Mộc.
9|Thiên văn|Vành đai Kuiper nằm chủ yếu ở phía ngoài quỹ đạo hành tinh nào?|Sao Hải Vương|Sao Thủy|Trái Đất|Sao Hỏa|Vành đai Kuiper là vùng nhiều thiên thể băng ngoài quỹ đạo Sao Hải Vương.
6|Thiên văn|Theo phân loại thiên văn từ năm2006, Pluto được xếp vào nhóm nào?|Hành tinh lùn|Ngôi sao|Vệ tinh của Sao Hải Vương|Thiên hà|Pluto đáp ứng tiêu chí hành tinh lùn và chưa dọn sạch vùng lân cận quỹ đạo.
7|Thiên văn|Trong quan sát bầu trời, chòm sao là gì?|Vùng trời gắn với một mẫu hình sao quy ước|Một hành tinh có nhiều vệ tinh|Một nhóm sao bắt buộc cách nhau cùng khoảng cách|Một đám mây trong khí quyển|Chòm sao xác định các vùng trên thiên cầu; các sao nhìn gần nhau có thể ở rất xa nhau trong không gian.
9|Thiên văn|Sao Bắc Cực Polaris thuộc chòm sao nào?|Tiểu Hùng|Đại Hùng|Lạp Hộ|Thiên Nga|Polaris nằm gần cực Bắc thiên cầu và thuộc chòm Tiểu Hùng.
8|Thiên văn|Mảnh thiên thể rơi tới mặt đất còn lại sau khi đi qua khí quyển được gọi là gì?|Thiên thạch|Sao băng|Sao lùn|Tinh vân|Sao băng là vệt sáng trong khí quyển, còn vật rơi xuống đất được gọi là thiên thạch.
8|Thiên văn|Nguồn năng lượng chủ yếu trong lõi Mặt Trời là phản ứng nào?|Nhiệt hạch tổng hợp hydro thành heli|Phân hạch uranium|Nhiệt hạch tổng hợp sắt thành nguyên tố nặng hơn|Phản ứng oxy hóa hydrogen với oxy|Trong lõi Mặt Trời, phản ứng nhiệt hạch biến hydro thành heli và giải phóng năng lượng.
7|Môi trường|Tầng ozone trong tầng bình lưu giúp hấp thụ loại bức xạ nào?|Tia cực tím|Sóng âm|Sóng nước|Sóng địa chấn|Ozone ở tầng bình lưu hấp thụ phần lớn UV-B và UV-C từ Mặt Trời.
9|Môi trường|Khí nhà kính gây ấm lên chủ yếu nhờ tương tác với bức xạ nào do Trái Đất phát ra?|Bức xạ hồng ngoại|Tia gamma|Tia X|Tia cực tím bước sóng ngắn|Khí nhà kính hấp thụ và phát lại bức xạ hồng ngoại, ảnh hưởng cân bằng năng lượng.
6|Môi trường|Than đá và dầu mỏ thuộc nhóm tài nguyên nào?|Không tái tạo trong thang thời gian đời người|Tái tạo theo từng mùa|Không chứa carbon|Chỉ hình thành trong một ngày|Nhiên liệu hóa thạch hình thành qua thời gian địa chất rất dài.
7|Môi trường|Đặc điểm nào khiến nhiều loại nhựa thông thường tích tụ lâu trong môi trường?|Phân hủy sinh học rất chậm|Vi sinh vật phân hủy chúng rất nhanh|Chúng đều tan hết trong nước|Chúng không thể bị vỡ thành mảnh nhỏ|Nhiều loại nhựa phân hủy sinh học chậm và có thể vỡ thành các mảnh nhỏ.
9|Môi trường|Hồ bị dư thừa nitơ và phospho, dẫn đến tảo phát triển mạnh, là biểu hiện của hiện tượng nào?|Phú dưỡng|Acid hóa do mưa acid|Nhiễm mặn|Sa mạc hóa|Dư thừa chất dinh dưỡng kích thích tảo và có thể làm nước thiếu oxy khi sinh khối bị phân hủy.
8|Môi trường|Hai nhóm khí góp phần quan trọng tạo mưa acid là gì?|SO₂ và các oxide nitơ|Heli và neon|Oxy và argon|Hydro và krypton|SO₂ và các oxide nitơ có thể tạo các acid trong khí quyển.
8|Môi trường|Quá trình ủ phân hữu cơ hiếu khí cần được cung cấp khí nào?|Oxy|Hydro|Methane|Carbon monoxide|Vi sinh vật hiếu khí cần oxy để phân hủy chất hữu cơ.
9|Môi trường|Sự hấp thụ khí nào góp phần gây acid hóa đại dương?|Carbon dioxide|Heli|Neon|Argon|CO₂ hòa tan làm thay đổi cân bằng carbon vô cơ và tăng nồng độ ion H⁺.
7|Môi trường|Trong chuỗi cỏ→châu chấu→ếch, châu chấu là sinh vật thuộc bậc nào?|Tiêu thụ bậc một|Sản xuất|Tiêu thụ bậc ba|Phân giải duy nhất|Châu chấu ăn sinh vật sản xuất là cỏ nên thuộc bậc tiêu thụ một.
6|Môi trường|Việc phá rừng có thể làm suy giảm đa dạng sinh học trực tiếp vì điều gì?|Làm mất và chia cắt sinh cảnh|Làm tăng ổn định mọi nguồn thức ăn|Tăng nơi trú ẩn cho mọi loài sống trong rừng|Loại bỏ cạnh tranh giữa mọi quần thể|Mất sinh cảnh làm giảm nơi sống và nguồn thức ăn của nhiều loài.
10|Vật lý|Tổng động lượng của một hệ được bảo toàn khi điều kiện nào được thỏa mãn?|Tổng ngoại lực tác dụng lên hệ bằng không|Mọi vật trong hệ có cùng khối lượng|Động năng của từng vật luôn bằng nhau|Mọi vật trong hệ đều đứng yên ban đầu|Tổng ngoại lực bằng không thì tổng động lượng của hệ không đổi theo thời gian.
8|Vật lý|Một vật giữ nguyên khối lượng nhưng tăng tốc độ gấp đôi thì động năng cổ điển thay đổi thế nào?|Tăng gấp bốn|Tăng gấp hai|Giảm một nửa|Không đổi|Động năng bằng một nửa khối lượng nhân bình phương tốc độ.
8|Vật lý|Gần mặt đất, thế năng trọng trường của một vật tăng khi đại lượng nào tăng, với mốc và khối lượng không đổi?|Độ cao của vật|Tốc độ ngang của vật|Nhiệt độ của vật|Diện tích bề mặt vật|Trong trọng trường gần đều, thế năng so với mốc đã chọn bằng mgh.
9|Vật lý|Công của một lực không đổi bằng bao nhiêu nếu lực luôn vuông góc với độ dời?|Bằng không|Bằng tích lực và độ dời|Bằng hai lần tích lực và độ dời|Bằng độ lớn của lực|Công bằng F·s·cosθ; khi θ bằng90° thì cosθ bằng không.
9|Vật lý|Trong chuyển động tròn đều, gia tốc hướng tâm có hướng thế nào so với vận tốc tức thời?|Vuông góc với vận tốc|Cùng chiều vận tốc|Ngược chiều vận tốc|Luôn hướng thẳng đứng lên|Vận tốc tiếp tuyến với quỹ đạo còn gia tốc hướng về tâm đường tròn.
13|Vật lý|Mômen động lượng của hệ quanh một điểm được bảo toàn nếu đại lượng nào bằng không?|Tổng mômen ngoại lực quanh điểm đó|Tổng khối lượng của hệ|Tổng động năng của hệ|Tổng điện tích của hệ|Mômen ngoại lực là tốc độ biến đổi mômen động lượng.
8|Vật lý|Hiệu điện thế giữa hai điểm biểu thị công trên mỗi đơn vị đại lượng nào?|Điện tích|Thể tích|Khối lượng|Thời gian|Hiệu điện thế liên hệ với công của lực điện trên một đơn vị điện tích.
8|Vật lý|Một dây dẫn đồng chất giữ nguyên tiết diện và nhiệt độ; tăng chiều dài làm điện trở thay đổi thế nào?|Tăng lên|Giảm xuống|Không đổi|Luôn về không|Điện trở dây dẫn tỉ lệ với chiều dài khi điện trở suất và tiết diện không đổi.
13|Vật lý|Đặc điểm điện trở của vật liệu ở trạng thái siêu dẫn là gì?|Điện trở một chiều bằng không|Điện trở luôn tăng vô hạn|Điện trở phụ thuộc tuyến tính vào chiều cao|Điện trở bằng của không khí khô|Trong trạng thái siêu dẫn, vật liệu có điện trở một chiều bằng không dưới các điều kiện tới hạn.
12|Vật lý|Theo định luật Faraday, độ lớn suất điện động cảm ứng phụ thuộc vào tốc độ biến thiên của đại lượng nào?|Từ thông qua mạch|Khối lượng dây dẫn|Nhiệt dung riêng của dây|Thể tích không khí quanh dây|Suất điện động cảm ứng tỉ lệ với tốc độ biến thiên từ thông liên kết với mạch.
13|Vật lý|Định luật Lenz xác định chiều dòng điện cảm ứng theo nguyên tắc nào?|Chống lại sự biến đổi từ thông gây ra nó|Luôn cùng chiều kim đồng hồ|Luôn làm từ thông tăng|Luôn vuông góc với dây dẫn|Từ trường do dòng cảm ứng tạo ra chống lại sự biến đổi từ thông ban đầu.
10|Vật lý|Tụ điện lý tưởng chủ yếu lưu trữ năng lượng dưới dạng nào?|Năng lượng điện trường|Năng lượng từ trường|Năng lượng phản ứng hóa học|Động năng của bản kim loại|Hai bản tụ tích điện trái dấu và tạo điện trường chứa năng lượng.
13|Vật lý|Trong sóng điện từ phẳng truyền trong chân không, điện trường và từ trường có quan hệ hướng nào?|Vuông góc nhau và cùng vuông góc phương truyền|Song song nhau và cùng phương truyền|Song song nhau và vuông góc phương truyền|Vuông góc nhau nhưng điện trường cùng phương truyền|Sóng điện từ trong chân không là sóng ngang với E, B và phương truyền đôi một vuông góc.
11|Vật lý|Sóng điện từ trong chân không có tần số f thì bước sóng λ thỏa mãn hệ thức nào?|λ=c/f|λ=c×f|λ=f/c|λ=c+f|Vận tốc truyền sóng bằng tích bước sóng và tần số.
12|Vật lý|Một nguồn âm chuyển động ra xa người nghe đứng yên thì tần số nghe được thường thế nào so với khi nguồn đứng yên?|Thấp hơn|Cao hơn|Luôn bằng không|Bằng hai lần|Hiệu ứng Doppler làm các mặt sóng giãn ra khi nguồn đi xa người nghe.
13|Vật lý|Hai nguồn sóng kết hợp cần có cùng tần số và đặc điểm nào?|Hiệu số pha không đổi theo thời gian|Biên độ bắt buộc bằng nhau|Vị trí bắt buộc trùng nhau|Công suất luôn bằng không|Hiệu số pha ổn định giúp hình giao thoa được duy trì.
12|Vật lý|Hiện tượng sóng lan vào vùng bóng hình học khi đi qua khe hẹp được gọi là gì?|Nhiễu xạ|Phản xạ toàn phần|Đối lưu|Phóng xạ|Nhiễu xạ thể hiện rõ khi kích thước khe hoặc vật cản tương đương bước sóng.
13|Vật lý|Phản xạ toàn phần có thể xảy ra khi ánh sáng truyền theo chiều nào?|Từ môi trường chiết suất cao sang thấp với góc tới đủ lớn|Từ môi trường chiết suất thấp sang cao với mọi góc tới|Chỉ từ chân không vào thủy tinh|Chỉ khi góc tới bằng không|Ánh sáng phải đi từ chiết suất lớn sang nhỏ và góc tới vượt góc giới hạn.
13|Vật lý|Việc phân cực được ánh sáng chứng tỏ ánh sáng có tính chất sóng nào?|Sóng ngang|Sóng dọc thuần túy|Sóng cơ chỉ truyền trong chất rắn|Sóng âm trong không khí|Phân cực lựa chọn phương dao động ngang của điện trường.
14|Vật lý|Theo định luật dịch chuyển Wien, khi nhiệt độ tuyệt đối của vật đen tăng, bước sóng tại cực đại phổ thay đổi thế nào?|Giảm xuống|Tăng lên|Không đổi|Luôn bằng tốc độ ánh sáng|Tích bước sóng cực đại và nhiệt độ tuyệt đối của vật đen là một hằng số.
14|Vật lý|Theo định luật Stefan–Boltzmann, công suất bức xạ trên một đơn vị diện tích của vật đen tỉ lệ với gì?|Lũy thừa bậc bốn của nhiệt độ tuyệt đối|Nhiệt độ Celsius|Căn bậc hai của nhiệt độ tuyệt đối|Nghịch đảo nhiệt độ tuyệt đối|Đối với vật đen, suất phát xạ toàn phần bằng σT⁴.
15|Vật lý|Hiệu suất cực đại của động cơ nhiệt hoạt động giữa hai nguồn nhiệt cố định được mô tả bởi chu trình nào?|Carnot|Brayton thực tế bất kỳ|Diesel thực tế bất kỳ|Otto thực tế bất kỳ|Động cơ Carnot thuận nghịch đạt hiệu suất giới hạn giữa hai nguồn nhiệt cho trước.
13|Vật lý|Nếu Q là nhiệt hệ nhận và W là công hệ thực hiện, định luật I nhiệt động lực học có dạng nào?|ΔU=Q−W|ΔU=Q+W|ΔU=W−Q|ΔU=Q×W|Nội năng tăng bằng nhiệt nhận vào trừ công hệ sinh ra theo quy ước đã nêu.
13|Vật lý|Nội năng của một lượng khí lý tưởng thay đổi thế nào trong quá trình đẳng nhiệt?|Không đổi|Luôn tăng|Luôn giảm|Tăng bằng áp suất|Nội năng khí lý tưởng chỉ phụ thuộc nhiệt độ nên không đổi trong quá trình đẳng nhiệt.
12|Vật lý|Hạt alpha là hạt nhân của nguyên tử nào?|Heli-4|Hydro-1|Carbon-12|Oxy-16|Hạt alpha gồm hai proton và hai neutron, tương ứng hạt nhân heli-4.
13|Vật lý|Trong phân rã beta trừ, hạt mang điện được phát ra là hạt nào?|Electron|Positron|Proton|Hạt alpha|Phân rã beta trừ biến neutron thành proton và phát electron cùng phản neutrino.
9|Vật lý|Chu kỳ bán rã của đồng vị phóng xạ mô tả khoảng thời gian nào?|Số hạt nhân chưa phân rã giảm còn một nửa|Toàn bộ hạt nhân phân rã hết|Khối lượng mỗi proton giảm một nửa|Nhiệt độ mẫu giảm một nửa|Sau một chu kỳ bán rã, số hạt nhân phóng xạ chưa phân rã trung bình còn một nửa.
14|Vật lý|Chiếu ánh sáng có tần số dưới ngưỡng quang điện lên kim loại thì tăng cường độ ánh sáng sẽ gây điều gì theo mô hình quang điện một photon?|Vẫn không bật electron quang điện|Luôn bật electron có động năng lớn|Làm giảm công thoát về không|Làm mọi electron trở thành proton|Năng lượng mỗi photon hf phải đạt công thoát; tăng số photon không tăng năng lượng mỗi photon.
15|Vật lý|Trong tán xạ Compton trên electron gần như tự do đứng yên, photon tán xạ ở góc khác không có bước sóng thế nào?|Lớn hơn bước sóng ban đầu|Nhỏ hơn bước sóng ban đầu|Luôn bằng bước sóng ban đầu|Luôn bằng không|Photon truyền một phần năng lượng cho electron nên năng lượng giảm và bước sóng tăng.
14|Vật lý|Theo de Broglie, bước sóng liên kết với một hạt có động lượng p bằng gì?|h/p|h×p|p/h|h+p|Hệ thức de Broglie liên hệ bước sóng vật chất với động lượng qua λ=h/p.
11|Hóa học|Năng lượng ion hóa thứ nhất là năng lượng cần để thực hiện quá trình nào?|Tách một electron khỏi nguyên tử trung hòa ở trạng thái khí|Thêm một neutron vào hạt nhân|Tách một proton khỏi phân tử nước|Làm tan một tinh thể trong nước|Ion hóa thứ nhất biến nguyên tử khí trung hòa thành ion dương đơn điện tích.
11|Hóa học|Trên thang Pauling, nguyên tố nào có độ âm điện lớn nhất?|Fluor|Oxy|Chlorine|Nitơ|Fluor có độ âm điện lớn nhất trên thang Pauling.
12|Hóa học|Chất nào sau đây tạo liên kết hydrogen đáng kể giữa các phân tử của chất tinh khiết?|Nước|Methane|Carbon tetrachloride|Hydro|Các phân tử nước có H liên kết với O và các cặp electron tự do trên O.
12|Hóa học|Theo mô hình VSEPR, hình dạng phân tử nước là gì?|Gấp khúc|Thẳng|Tam giác phẳng|Tứ diện của ba nguyên tử|Hai cặp electron tự do trên O làm hai liên kết O–H tạo dạng gấp khúc.
12|Hóa học|Bốn liên kết C–H trong phân tử methane hướng theo hình học nào?|Tứ diện|Vuông phẳng|Thẳng|Lưỡng tháp tam giác|Bốn miền liên kết quanh carbon của methane sắp xếp gần hình tứ diện.
14|Hóa học|Carbon trong phân tử ethene C₂H₄ thường được mô tả có kiểu lai hóa nào?|sp²|sp³|sp|sp³d²|Mỗi carbon của ethene tạo ba liên kết sigma trong mặt phẳng và một liên kết pi.
14|Hóa học|Một nguyên tử carbon bất đối điển hình liên kết với bốn nhóm như thế nào?|Bốn nhóm khác nhau|Bốn nhóm giống nhau|Chỉ hai nguyên tử hydrogen|Bốn nguyên tử carbon bắt buộc|Carbon tứ diện gắn bốn nhóm khác nhau có thể là tâm bất đối.
13|Hóa học|Trong mô hình hiện đại của benzene, sáu electron pi có đặc điểm nào?|Phi định xứ trên vòng sáu carbon|Chỉ tập trung ở một carbon|Mỗi electron nằm trong một proton|Không tương tác với hệ vòng|Sự phi định xứ electron pi góp phần vào tính thơm và độ bền của benzene.
11|Hóa học|Một mol chứa số thực thể gần bằng giá trị nào?|6,022×10²³|6,022×10²⁰|3,011×10²³|1,000×10²⁴|Hằng số Avogadro xác định số thực thể trong một mol.
11|Hóa học|Nồng độ mol của dung dịch là số mol chất tan trên một đơn vị nào?|Lít dung dịch|Kilôgam dung môi|Lít dung môi trước khi pha|Mét vuông bề mặt dung dịch|Nồng độ mol thường có đơn vị mol/L và tính trên thể tích dung dịch cuối cùng.
12|Hóa học|Một mol khí lý tưởng ở0°C và1atm chiếm thể tích xấp xỉ bao nhiêu?|22,4lít|24,8lít|11,2lít|44,8lít|Thay T=273,15K và áp suất1atm vào phương trình khí lý tưởng cho khoảng22,4L/mol.
12|Hóa học|Phương trình trạng thái của khí lý tưởng cho n mol khí là gì?|PV=nRT|P+V=nRT|P/V=nRT|PV=nR/T|Phương trình khí lý tưởng liên hệ áp suất, thể tích, lượng chất và nhiệt độ tuyệt đối.
14|Hóa học|Với phản ứng thuận tỏa nhiệt đang cân bằng, tăng nhiệt độ thường làm cân bằng chuyển theo chiều nào?|Chiều nghịch|Chiều thuận|Không bao giờ chuyển dịch|Chỉ phụ thuộc màu dung dịch|Theo Le Châtelier, tăng nhiệt độ ưu tiên chiều thu nhiệt, tức chiều nghịch trong trường hợp này.
13|Hóa học|Thêm chất xúc tác vào hệ phản ứng đang cân bằng ở cùng nhiệt độ làm hằng số cân bằng thay đổi thế nào?|Không đổi|Luôn tăng gấp đôi|Luôn giảm một nửa|Trở thành không|Chất xúc tác tăng tốc cả hai chiều và không làm đổi hằng số cân bằng ở cùng nhiệt độ.
13|Hóa học|Cặp chất nào phù hợp để tạo dung dịch đệm acid?|Acid acetic và natri acetate|HCl và NaCl|NaOH và KCl|HNO₃ và nước tinh khiết|Acid yếu và base liên hợp của nó có thể chống lại biến đổi pH khi thêm ít acid hoặc base.
15|Hóa học|Theo Henderson–Hasselbalch, nếu nồng độ acid yếu và base liên hợp bằng nhau thì pH gần bằng gì?|pKa của acid|Ka của acid|Hai lần pKa|Không trong mọi trường hợp|Tỉ số base liên hợp trên acid bằng1 khiến số hạng logarit bằng không.
15|Hóa học|Với một muối ít tan, nếu tích số ion Q vượt tích số tan Ksp thì xu hướng nào xảy ra?|Kết tủa hình thành|Kết tủa chắc chắn tan hết|Không thể có thay đổi|Mọi ion biến thành khí|Khi Q lớn hơn Ksp, hệ quá bão hòa và có xu hướng tạo kết tủa.
14|Hóa học|Thế điện cực chuẩn của điện cực hydrogen chuẩn được quy ước bằng bao nhiêu?|0V|1V|−1V|0,5V|Điện cực hydrogen chuẩn là mốc quy ước0V để xác định các thế điện cực khác.
13|Hóa học|Trong hydrogen peroxide H₂O₂, số oxy hóa của oxy là bao nhiêu?|−1|−2|0|+2|Trong peroxide, mỗi nguyên tử oxy có số oxy hóa−1.
15|Hóa học|Màu của nhiều phức chất kim loại chuyển tiếp thường liên quan đến sự chuyển electron giữa các mức nào?|Các mức orbital d bị tách năng lượng|Các mức proton trong hạt nhân|Các trạng thái neutron tự do|Các mức dao động của khối lượng toàn dung dịch|Trường phối tử tách các mức d; hấp thụ ánh sáng có thể gây chuyển mức electron.
13|Hóa học|Ở cathode của pin điện hóa đang phát điện xảy ra loại quá trình nào?|Khử|Oxy hóa|Phân rã alpha|Trùng hợp bắt buộc|Cathode là điện cực nơi diễn ra sự nhận electron, tức quá trình khử.
14|Hóa học|Theo định luật Faraday, khối lượng chất tạo ở điện cực tỉ lệ với đại lượng nào khi phản ứng điện cực cố định?|Điện lượng đi qua|Điện trở bình điện phân|Áp suất khí quyển|Diện tích đáy bình trong mọi trường hợp|Với phản ứng cố định, lượng chất tạo ra tỉ lệ với số mol electron, tức điện lượng.
12|Hóa học|Công thức chung của alkane mạch hở là gì?|CₙH₂ₙ₊₂|CₙH₂ₙ|CₙH₂ₙ₋₂|CₙHₙ|Alkane mạch hở là hydrocarbon no chỉ có liên kết đơn và công thức CₙH₂ₙ₊₂.
12|Hóa học|Monomer dùng để tạo polyethylene bằng phản ứng trùng hợp là chất nào?|Ethene|Ethanol|Ethanoic acid|Ethane|Liên kết đôi của ethene mở ra để nối nhiều đơn vị thành polyethylene.
11|Hóa học|Các amino acid trong chuỗi protein nối với nhau chủ yếu bằng liên kết nào?|Peptide|Glycosidic|Phosphodiester|Liên kết kim loại|Liên kết peptide hình thành giữa nhóm carboxyl và nhóm amino của các amino acid.
11|Sinh học|Phân tử nào thường được gọi là đồng tiền năng lượng trực tiếp của tế bào?|ATP|ADN|Cellulose|Cholesterol|Thủy phân ATP có thể ghép với các quá trình cần năng lượng trong tế bào.
11|Sinh học|Ở tế bào nhân thực, đường phân diễn ra chủ yếu ở đâu?|Bào tương|Chất nền ti thể|Màng trong ti thể|Trong hạch nhân|Đường phân chuyển glucose thành pyruvate trong bào tương.
12|Sinh học|Ở tế bào nhân thực, phần lớn phản ứng của chu trình citric diễn ra ở đâu?|Chất nền ti thể|Màng sinh chất|Lòng lysosome|Màng ngoài nhân|Chu trình citric diễn ra chủ yếu trong chất nền ti thể.
12|Sinh học|Chất nhận electron cuối cùng của chuỗi vận chuyển electron trong hô hấp hiếu khí là gì?|Oxy|Carbon dioxide|Glucose|ATP|Oxy nhận electron và proton để hình thành nước ở cuối chuỗi hô hấp.
13|Sinh học|Oxy giải phóng trong quang hợp của thực vật có nguồn trực tiếp từ chất nào?|Nước|Carbon dioxide|Glucose|Nitơ|Phản ứng tách nước trong pha sáng cung cấp electron và giải phóng oxy.
13|Sinh học|Chu trình Calvin của lục lạp diễn ra ở đâu?|Chất nền lục lạp|Lòng thylakoid|Màng ngoài ti thể|Bào tương của tế bào|Các phản ứng cố định carbon của chu trình Calvin diễn ra ở chất nền lục lạp.
14|Sinh học|Trong quang hợp C4, sản phẩm ổn định đầu tiên của quá trình cố định CO₂ có bao nhiêu nguyên tử carbon?|Bốn|Hai|Ba|Sáu|CO₂ được cố định ban đầu vào hợp chất bốn carbon như oxaloacetate.
14|Sinh học|Nhiều thực vật CAM mở khí khổng chủ yếu vào thời điểm nào?|Ban đêm|Chỉ giữa trưa|Chỉ lúc quang hợp ngừng hoàn toàn cả năm|Suốt ngày nhưng luôn đóng ban đêm|Mở khí khổng ban đêm giúp thực vật CAM giảm mất nước trong môi trường khô.
12|Sinh học|Nhân đôi ADN theo nguyên tắc bán bảo tồn nghĩa là mỗi ADN con gồm những mạch nào?|Một mạch cũ và một mạch mới|Hai mạch đều cũ|Hai mạch đều mới|Mỗi mạch có đúng một nửa là protein|Mỗi mạch ADN ban đầu làm khuôn tổng hợp một mạch bổ sung mới.
14|Sinh học|ADN polymerase tổng hợp mạch ADN mới theo chiều nào?|5′→3′|3′→5′|Từ giữa ra hai đầu cùng lúc trên một mạch|Theo chiều bất kỳ không cần khuôn|ADN polymerase gắn nucleotide mới vào nhóm3′-OH của mạch đang kéo dài.
11|Sinh học|Base nào có trong ARN thông thường nhưng thay cho thymine của ADN?|Uracil|Adenine|Cytosine|Guanine|ARN thường dùng uracil trong khi ADN dùng thymine.
12|Sinh học|Một codon trên mRNA gồm bao nhiêu nucleotide?|Ba|Hai|Bốn|Sáu|Mã di truyền được đọc theo các bộ ba nucleotide gọi là codon.
13|Sinh học|Codon khởi đầu AUG thường mã hóa amino acid nào trong chuỗi protein?|Methionine|Tryptophan|Glycine|Alanine|AUG thường là codon khởi đầu và mã hóa methionine trong mã di truyền chuẩn.
13|Sinh học|Bộ ba trên tRNA bắt cặp bổ sung với codon của mRNA gọi là gì?|Anticodon|Promoter|Intron|Telomere|Anticodon giúp tRNA nhận đúng codon khi ribosome dịch mã.
15|Sinh học|Thay đổi điều hòa hoạt động gen mà không đổi trình tự nucleotide thường thuộc lĩnh vực nào?|Biểu sinh|Đột biến thay thế base|Đột biến mất đoạn|Đột biến đảo đoạn|Biểu sinh nghiên cứu những thay đổi hoạt động gen, ví dụ do methyl hóa ADN, không cần đổi trình tự.
13|Sinh học|Trong hệ nhóm máu ABO, sự biểu hiện đồng thời allele A và B ở người nhómAB là ví dụ của hiện tượng nào?|Đồng trội|Trội hoàn toàn của A|Trội hoàn toàn của B|Di truyền ngoài nhân|Hai allele A và B đều biểu hiện ở kiểu gen IᴬIᴮ.
13|Sinh học|Nam giới có kiểu nhiễm sắc thểXY thường dễ biểu hiện allele lặn trênX hơn nữXX vì điều gì?|Chỉ có một bản sao của phần lớn gen trênX|Có hai nhiễm sắc thểX|Không có gen trênX|Mọi allele trênY đều trội hơnX|Một allele lặn trênX có thể biểu hiện ở nam do không có allele tương ứng trên mộtX thứ hai.
14|Sinh học|Trao đổi chéo giữa các nhiễm sắc thể tương đồng diễn ra chủ yếu ở giai đoạn nào?|Kỳ đầuI của giảm phân|Kỳ sauII của giảm phân|Kỳ cuối của nguyên phân|Ngay sau khi tế bào chết|Nhiễm sắc thể tương đồng tiếp hợp và có thể trao đổi đoạn trong kỳ đầuI.
14|Sinh học|Sự không phân ly nhiễm sắc thể trong giảm phân có thể trực tiếp tạo giao tử mang đặc điểm nào?|Thừa hoặc thiếu nhiễm sắc thể|Luôn có đúng bộ đơn bội bình thường|Không có bất kỳ protein nào|Có gấp đôi số proton trong mọi nguyên tử|Nhiễm sắc thể không tách đúng làm chúng phân bố không đều giữa các tế bào con.
12|Sinh học|Hai khả năng đặc trưng của tế bào gốc là gì?|Tự đổi mới và biệt hóa|Chỉ co cơ và dẫn điện|Chỉ quang hợp và thoát hơi nước|Chỉ tạo kháng thể và đông máu|Tế bào gốc có thể tạo thêm tế bào gốc và phát triển thành một số loại tế bào chuyên hóa.
15|Sinh học|Mỗi chu kỳ bơmNa⁺/K⁺-ATPase điển hình vận chuyển các ion theo tỉ lệ nào?|3Na⁺ra ngoài và2K⁺vào trong|2Na⁺ra ngoài và3K⁺vào trong|3Na⁺vào trong và2K⁺ra ngoài|1Na⁺ra ngoài và1K⁺vào trong|Bơm tiêu thụ ATP để đưa ba ion natri ra ngoài và hai ion kali vào trong tế bào.
14|Sinh học|Ở neuron điển hình, pha khử cực nhanh của điện thế hoạt động chủ yếu do ion nào đi vào tế bào?|Na⁺|K⁺|Cl⁻|Phosphate|Kênh natri phụ thuộc điện thế mở làmNa⁺đi vào, khiến điện thế màng tăng nhanh.
13|Sinh học|Ở synapse hóa học, chất truyền tin được giải phóng chủ yếu từ cấu trúc nào?|Các túi ở đầu tận cùng trước synapse|Nhân của tế bào sau synapse|Các nhiễm sắc thể của neuron|Màng ngoài của hồng cầu|Túi synapse hòa màng và giải phóng chất truyền tin vào khe synapse.
13|Sinh học|Trong nephron của thận, sự lọc máu ban đầu diễn ra chủ yếu tại cấu trúc nào?|Cầu thận|Ống góp|Niệu quản|Bể thận|Máu được lọc qua các mao mạch cầu thận vào bao Bowman.
11|Sinh học|Nhóm enzyme nào xúc tác thủy phân chất béo trong tiêu hóa?|Lipase|Amylase|Protease|Nuclease|Lipase thủy phân các liên kết ester của chất béo.
11|Thiên văn|Một đơn vị thiên vănAU gần bằng khoảng cách trung bình giữa hai thiên thể nào?|Trái Đất và Mặt Trời|Trái Đất và Mặt Trăng|Mặt Trời và Sao Mộc|Mặt Trời và Polaris|AU gần bằng149,6triệu km, tương ứng khoảng cách trung bình Trái Đất–Mặt Trời.
14|Thiên văn|Một parsec được định nghĩa qua góc thị sai năm có giá trị nào?|Một giây cung|Một phút cung|Một độ|Một radian|Một parsec là khoảng cách mà mộtAU chắn góc một giây cung.
13|Thiên văn|Biểu đồ Hertzsprung–Russell thường thể hiện quan hệ giữa hai đại lượng nào của các sao?|Độ sáng và nhiệt độ bề mặt|Khối lượng và khoảng cách đến Trái Đất|Tốc độ quay và tuổi của thiên hà|Bán kính và số vệ tinh|Biểu đồH–R phân loại sao theo độ sáng và nhiệt độ bề mặt hoặc loại quang phổ tương ứng.
14|Thiên văn|Trong các lớp quang phổO, B, A, F, G, K, M, lớp nào có nhiệt độ bề mặt cao nhất?|O|A|G|M|Dãy quang phổ này được sắp từ nóng đến lạnh, vớiO nóng nhất.
12|Thiên văn|Trong một sao ổn định như Mặt Trời, trạng thái cân bằng thủy tĩnh là sự cân bằng giữa hai tác động nào?|Hấp dẫn hướng vào và gradient áp suất hướng ra|Hấp dẫn hướng ra và áp suất hướng vào|Lực từ của Trái Đất và lực ly tâm của Sao Hỏa|Chỉ lực ma sát và lực nổi của nước|Hấp dẫn kéo vật chất vào tâm còn sự biến thiên áp suất cung cấp tác động nâng đỡ hướng ra.
12|Thiên văn|Khi sao có khối lượng gần Mặt Trời chuyển sang giai đoạn sao khổng lồ đỏ, các lớp ngoài thường thay đổi thế nào?|Nở rộng và có nhiệt độ bề mặt thấp hơn|Co về không và lạnh ngay lập tức|Biến thành vành đai tiểu hành tinh ngay|Giữ nguyên mọi kích thước và nhiệt độ|Lớp ngoài sao khổng lồ đỏ giãn nở, khiến bề mặt nguội hơn dù độ sáng có thể tăng.
15|Thiên văn|Áp suất nào giữ một sao lùn trắng điển hình chống lại sự co sụp hấp dẫn?|Áp suất suy biến electron|Áp suất do gió trên bề mặt|Áp suất do nước lỏng|Áp suất suy biến của các phân tử khí|Sao lùn trắng được nâng đỡ chủ yếu bởi áp suất suy biến của electron.
14|Thiên văn|Pulsar thường là loại thiên thể nào?|Sao neutron quay nhanh phát chùm bức xạ|Sao chổi phát sáng do khí|Hành tinh có vành đai băng|Tiểu hành tinh tự quay chậm|Chùm bức xạ của sao neutron quét qua người quan sát tạo tín hiệu tuần hoàn.
13|Thiên văn|Ranh giới của lỗ đen mà từ phía trong ánh sáng không thể thoát ra ngoài được gọi là gì?|Chân trời sự kiện|Vành đai Kuiper|Quang cầu|Mặt phân cách tầng ozone|Chân trời sự kiện là ranh giới nhân quả ngăn tín hiệu bên trong thoát tới bên ngoài.
14|Thiên văn|Nhiệt độ đặc trưng của bức xạ nền vi sóng vũ trụ hiện nay gần bằng bao nhiêu?|2,7K|27K|270K|2700K|Phổ nền vi sóng gần phổ vật đen ở nhiệt độ2,725K.
13|Thiên văn|Dịch chuyển đỏ vũ trụ của ánh sáng từ nhiều thiên hà xa chủ yếu liên quan đến điều gì?|Sự giãn nở của không gian|Khí oxy nhuộm đỏ mọi thiên hà|Ánh sáng đỏ truyền nhanh hơn ánh sáng xanh|Thiên hà biến thành Sao Hỏa|Sự giãn nở làm kéo dài bước sóng ánh sáng trên đường truyền.
14|Thiên văn|Hiện tượng thấu kính hấp dẫn xảy ra vì điều gì?|Khối lượng làm cong đường truyền ánh sáng trong không-thời gian|Từ trường làm mọi photon có điện tích|Ánh sáng bị ma sát với chân không|Thiên hà chứa một thấu kính thủy tinh khổng lồ|Sự cong không-thời gian quanh vật có khối lượng lớn làm lệch các tia sáng.
12|Thiên văn|Phương pháp quá cảnh tìm ngoại hành tinh dựa trên tín hiệu nào?|Độ sáng của sao giảm định kỳ khi hành tinh đi qua phía trước|Sao tăng nhiệt độ đột ngột mỗi giây|Sao đổi thành màu xanh hoàn toàn|Đường kính sao bằng không|Hành tinh che một phần ánh sáng của sao khi quá cảnh theo góc nhìn của người quan sát.
14|Thiên văn|Phương pháp vận tốc xuyên tâm tìm ngoại hành tinh thường đo biến đổi nào?|Dịch chuyển Doppler tuần hoàn trong phổ của sao|Số lượng núi trên hành tinh|Màu của lớp đất đá trên vệ tinh|Nồng độ ozone trong kính thiên văn|Hấp dẫn của hành tinh làm sao dao động, tạo sự dịch chuyển tuần hoàn các vạch phổ.
13|Thiên văn|Các hồ và biển trên bề mặt Titan chủ yếu chứa chất lỏng nào?|Methane và ethane|Nước ngọt|Dung nham sắt|Acid sulfuric|Nhiệt độ rất thấp trên Titan cho phép methane và ethane tồn tại ở dạng lỏng trên bề mặt.
12|Môi trường|Nồng độ một số chất ô nhiễm tăng qua các bậc dinh dưỡng của chuỗi thức ăn được gọi là gì?|Khuếch đại sinh học|Diễn thế nguyên sinh|Quang hợp|Cố định đạm|Một số chất bền tích tụ với nồng độ cao hơn ở sinh vật ăn sinh vật đã nhiễm chất đó.
12|Môi trường|Sự tích lũy chất ô nhiễm trong mô của một sinh vật theo thời gian được gọi là gì?|Tích lũy sinh học|Chọn lọc tự nhiên|Nảy chồi|Thụ phấn|Chất được hấp thu nhanh hơn tốc độ loại bỏ sẽ tích lũy trong cơ thể sinh vật.
13|Môi trường|Diễn thế bắt đầu trên bề mặt đá mới hình thành, chưa có đất, thuộc loại nào?|Diễn thế nguyên sinh|Diễn thế thứ sinh|Diễn thế chỉ do mùa|Diễn thế không có sinh vật|Diễn thế nguyên sinh bắt đầu ở nơi chưa có đất và quần xã trước đó.
11|Môi trường|Một loài ngoại lai được xem là xâm hại khi có đặc điểm nào?|Lan rộng và gây tác động bất lợi đến hệ sinh thái hoặc loài bản địa|Chỉ cần có màu sắc lạ|Chỉ cần xuất hiện trong vườn thú|Luôn phải có kích thước lớn hơn loài bản địa|Loài ngoại lai xâm hại có khả năng lan rộng và gây hại tại môi trường mới.
13|Môi trường|Sức chứa của môi trường đối với một quần thể mô tả điều gì?|Số cá thể mà môi trường có thể duy trì lâu dài|Số loài từng tồn tại trên Trái Đất|Tổng chiều dài mọi con sông|Khối lượng của hành tinh|Sức chứa phụ thuộc các nguồn lực và điều kiện giới hạn của môi trường.
12|Môi trường|Trong chu trình nitơ, cố định nitơ là chuyểnN₂thành dạng nào có thể tham gia dinh dưỡng sinh vật?|Ammonia hoặc ammonium|Oxy nguyên chất|Carbon dioxide|Muối calcium carbonate|Các sinh vật cố định đạm biến nitơ khí quyển thành dạng khử nhưNH₃ hoặcNH₄⁺.
14|Môi trường|Quá trình nitrate hóa trong chu trình nitơ biến đổi theo chiều nào?|Ammonium thành nitrite rồi nitrate|Nitrate trực tiếp thành protein động vật|N₂thành oxy|Nitrite thành carbon dioxide|Vi sinh vật nitrate hóa oxy hóaNH₄⁺ thànhNO₂⁻ và sau đóNO₃⁻.
14|Môi trường|Quá trình phản nitrate hóa thường đưa nitơ từ nitrate về dạng nào?|KhíN₂|Cellulose|Glucose|Đá vôi|Vi sinh vật phản nitrate hóa khử nitrate qua các bước để tạo nitơ khí, thường trong điều kiện thiếu oxy.
13|Môi trường|Chỉ sốBOD của nước thể hiện điều gì?|Lượng oxy vi sinh vật cần để phân hủy sinh học chất hữu cơ trong điều kiện đo|Tổng lượng muối ăn hòa tan|Độ sâu lớn nhất của hồ|Khối lượng mọi loại kim loại trong nước|BOD là nhu cầu oxy sinh hóa, dùng đánh giá mức chất hữu cơ có thể phân hủy sinh học.
10|Môi trường|Ở cùng áp suất, nước ấm lên thường có khả năng hòa tan oxy thay đổi thế nào?|Giảm xuống|Tăng lên|Luôn giữ nguyên|Tăng đến vô hạn|Độ hòa tan của oxy trong nước thường giảm khi nhiệt độ tăng.
'''

# Final review calibrates school-level facts below the specialist questions.
LEVEL_REVIEW = {
    'Hạt alpha là': 10,
    'Sóng điện từ trong chân không có tần số': 10,
    'Năng lượng ion hóa thứ nhất': 10,
    'Trên thang Pauling': 9,
    'Một mol chứa': 7,
    'Nồng độ mol của dung dịch': 9,
    'Phương trình trạng thái của khí lý tưởng': 10,
    'Công thức chung của alkane': 10,
    'Các amino acid trong chuỗi protein': 10,
    'Phân tử nào thường được gọi là đồng tiền': 9,
    'Ở tế bào nhân thực, đường phân': 10,
    'Base nào có trong ARN': 9,
    'Một codon trên mRNA': 10,
    'Nhóm enzyme nào xúc tác': 9,
    'Một đơn vị thiên văn': 9,
    'Phương pháp quá cảnh tìm ngoại hành tinh': 10,
    'Một loài ngoại lai được xem': 9,
    'Trong chu trình nitơ, cố định nitơ': 10,
}

TYPOGRAPHY = {
    'ở25': 'ở 25', 'nhóm17': 'nhóm 17', 'nhóm18': 'nhóm 18',
    'nhóm1 ': 'nhóm 1 ', 'khoảng98': 'khoảng 98', 'năm2006': 'năm 2006',
    'bằng90': 'bằng 90', 'ở0°C': 'ở 0°C', 'và1atm': 'và 1 atm',
    'áp suất1atm': 'áp suất 1 atm', 'khoảng22': 'khoảng 22',
    'quy ước0V': 'quy ước 0 V', 'nhómAB': 'nhóm AB',
    'nữXX': 'nữ XX', 'thểXY': 'thể XY', 'trênX': 'trên X', 'trênY': 'trên Y',
    'mộtX': 'một X', 'allele A và B ở người nhómAB': 'allele A và B ở người nhóm AB',
    'Kỳ đầuI': 'Kỳ đầu I', 'Kỳ sauII': 'Kỳ sau II', 'kỳ đầuI': 'kỳ đầu I',
    'bơmNa': 'bơm Na', '3Na⁺ra': '3 Na⁺ ra', '2Na⁺ra': '2 Na⁺ ra',
    '2K⁺vào': '2 K⁺ vào', '3K⁺vào': '3 K⁺ vào',
    '3Na⁺vào': '3 Na⁺ vào', '2K⁺ra': '2 K⁺ ra',
    '1Na⁺ra': '1 Na⁺ ra', '1K⁺vào': '1 K⁺ vào',
    'và2': 'và 2', 'và3': 'và 3', 'và1': 'và 1',
    'làmNa': 'làm Na', 'Na⁺đi': 'Na⁺ đi',
    'vănAU': 'văn AU', 'đồH–R': 'đồ H–R', 'vớiO': 'với O',
    'độ2,725': 'độ 2,725', 'N₂thành': 'N₂ thành', 'nhưNH₃': 'như NH₃',
    'hoặcNH₄': 'hoặc NH₄', 'hóaNH₄': 'hóa NH₄', 'thànhNO₂': 'thành NO₂',
    'đóNO₃': 'đó NO₃', 'KhíN₂': 'Khí N₂', 'sốBOD': 'số BOD',
}

def polish(value):
    for old, new in TYPOGRAPHY.items():
        value = value.replace(old, new)
    value = re.sub(r'(?<=\d)(?=(?:ngày|giờ|lít|triệu|K\b|V\b|atm\b|L/mol))', ' ', value)
    value = re.sub(r'\s+', ' ', value)
    return value.strip()

def main():
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    questions = []
    for raw in DATA.splitlines():
        if not raw.strip():
            continue
        parts = raw.split('|')
        assert len(parts) == 8, (len(parts), raw)
        level, category, question, good, d1, d2, d3, explanation = parts
        for stem_prefix, reviewed_level in LEVEL_REVIEW.items():
            if question.startswith(stem_prefix):
                level = reviewed_level
        question, explanation = polish(question), polish(explanation)
        answers = [polish(d1), polish(d2), polish(d3)]
        correct = len(questions) % 4
        answers.insert(correct, polish(good))
        questions.append(dict(level=int(level), question=question, answers=answers,
                              correct=correct, category=category, explanation=explanation))
    destination = Path(__file__).with_name('new-science.json')
    destination.write_text(json.dumps(questions, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print('Count:', len(questions))
    print('Levels:', dict(sorted(Counter(q['level'] for q in questions).items())))
    print('Categories:', dict(Counter(q['category'] for q in questions)))
    print('Answers:', dict(Counter(q['correct'] for q in questions)))

if __name__ == '__main__':
    main()
