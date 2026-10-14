-- =====================================================================
-- SEED MẪU — idempotent (chạy lại nhiều lần không trùng nhờ external_key)
-- =====================================================================

-- ---------- Discover (30 food, 20 drink, 20 place, 30 activity) ----------
insert into public.random_items (external_key, kind, title, description, tip, price_level) values
  ('food-pho-bo', 'food', 'Phở bò tái nạm', 'Tô phở nóng hổi với nước dùng hầm xương ngọt thanh và thịt bò mềm thơm.', 'Gọi thêm quẩy giòn và trứng chần béo ngậy.', 1),
  ('food-bun-cha', 'food', 'Bún chả nướng than hoa', 'Chả viên và thịt ba chỉ nướng thơm lừng, chấm nước mắm chua ngọt ấm nóng.', 'Ăn kèm một đĩa nem rán giòn rụm.', 1),
  ('food-com-tam', 'food', 'Cơm tấm sườn bì chả', 'Hạt cơm tấm thơm dẻo cùng miếng sườn nướng mỡ màng đẫm sốt.', 'Chan thêm chút mỡ hành và tóp mỡ giòn cay.', 1),
  ('food-lau-thai', 'food', 'Lẩu Thái chua cay', 'Nồi lẩu bốc khói nghi ngút, đậm đà vị sả ớt, tôm mực tươi rói.', 'Hai đứa vừa nhúng thịt vừa gắp cho nhau.', 2),
  ('food-pizza-thu-cong', 'food', 'Pizza thủ công nướng củi', 'Đế bánh mỏng giòn thơm mùi khói củi, phô mai kéo sợi hấp dẫn.', 'Gọi nửa nọ nửa kia để thử được 2 vị cùng lúc.', 2),
  ('food-bbq-nuong-han', 'food', 'Thịt nướng Hàn Quốc', 'Dẻ sườn bò cuộn lá kim mè, chấm sốt ssamjang cay nồng ngọt bùi.', 'Gắp một cuốn thật to đút cho người ấy.', 3),
  ('food-sushi-sashimi', 'food', 'Sushi & Sashimi tươi', 'Cá hồi mọng béo, cơm dấm thanh mát cuộn rong biển giòn tan.', 'Gọi một set thuyền tình yêu chụp ảnh xinh lung linh.', 3),
  ('food-banh-mi-chao', 'food', 'Bánh mì chảo xèo xèo', 'Pate thơm bùi, trứng ốp la lòng đào và xúc xích đẫm sốt sánh đặc.', 'Chấm bánh mì ngập sốt khi còn đang sôi xèo xèo.', 1),
  ('food-bun-bo-hue', 'food', 'Bún bò Huế cay nồng', 'Sợi bún to mềm cùng móng giò, chả cua và nước dùng ngập hương sả ruốc.', 'Thêm chút ớt chưng cay tê lưỡi ăn mới đã.', 1),
  ('food-lau-ga-la-e', 'food', 'Lẩu gà lá é', 'Nước lẩu ngọt thanh mát dịu từ thịt gà đồi và vị the cay của lá é.', 'Thả lá é vừa chín tới là vớt ăn ngay kẻo nồng.', 2),
  ('food-mi-cay-7-cap', 'food', 'Mì cay Hàn Quốc', 'Tô mì hải sản sôi ùng ục trong niêu đất thách thức độ ăn cay.', 'Mỗi người chọn một cấp độ cay xem ai giỏi hơn.', 1),
  ('food-oc-hai-san', 'food', 'Ốc & Hải sản hè phố', 'Ốc hương sốt trứng muối, ốc móng tay xào rau muống bơ tỏi thơm ngậy.', 'Chấm bánh mì chấm sốt trứng muối vét sạch đĩa.', 2),
  ('food-dimsum', 'food', 'Dimsum xửng hấp nóng', 'Há cảo tôm nõn căng mọng, bánh bao kim sa tan chảy béo ngọt.', 'Ăn từ tốn khi còn bốc khói để cảm nhận vị ngọt thịt.', 2),
  ('food-nem-nuong-nt', 'food', 'Nem nướng Nha Trang', 'Từng cuốn bánh tráng đầy đặn chả giòn, xoài chua, chấm sốt thịt ấm nóng.', 'Thi cuốn xem ai cuốn khéo tay và đẹp mắt hơn.', 1),
  ('food-banh-xeo-mientay', 'food', 'Bánh xèo giòn rụm', 'Vỏ bánh mỏng vàng ươm ôm trọn tôm thịt, gói cùng rổ rau rừng tươi xanh.', 'Cắt miếng vừa ăn, cuộn bánh tráng chấm mắm tỏi.', 1),
  ('food-steak-bo-my', 'food', 'Steak bò Mỹ sốt tiêu', 'Thịt thăn bò mềm mọng chín vừa medium rare kèm khoai tây nghiền.', 'Một bữa tối nến và nhạc nhẹ nhàng lãng mạn.', 4),
  ('food-bun-dau-mam-tom', 'food', 'Bún đậu mắm tôm', 'Đậu rán phồng giòn rụm, chả cốm dẻo thơm, mắm tôm đánh sủi bọt ngập quất.', 'Nếu không ăn mắm tôm có thể đổi nước mắm chua ngọt.', 1),
  ('food-ga-ran-han-quoc', 'food', 'Gà rán sốt cay ngọt', 'Gà giòn rụm phủ sốt cay ngọt óng ả, củ cải muối chua ngọt giòn tan.', 'Bật một bộ phim hay rồi vừa ăn vừa xem.', 2),
  ('food-tokbokki-lau', 'food', 'Lẩu Tokbokki tự chọn', 'Bánh gạo dẻo quánh cùng chả cá xiên que và phô mai sợi béo ngậy.', 'Tự tay nêm nếm nồi lẩu theo công thức hai đứa thích.', 1),
  ('food-chao-suon-sun', 'food', 'Cháo sườn sụn nóng', 'Cháo mịn sánh mịn ngọt thịt sườn non hầm nhừ, rắc ruốc và hành phi.', 'Ăn vào buổi tối se lạnh là ấm bụng nhất.', 1),
  ('food-com-nieu-sg', 'food', 'Cơm niêu cá kho tộ', 'Cơm đập cháy giòn rụm chấm nước sốt cá lóc kho tộ quánh đậm đà.', 'Món cơm nhà ấm cúng như mẹ nấu.', 2),
  ('food-pasta-y', 'food', 'Mỳ Ý sốt kem nấm béo', 'Sợi mỳ dẻo dai quyện sốt kem nấm truffle thơm lừng béo ngậy.', 'Rắc thêm phô mai parmesan mịn màng lên trên.', 2),
  ('food-banh-cuon-nong', 'food', 'Bánh cuốn nóng tráng tay', 'Lớp bánh mỏng tang nhân mộc nhĩ thịt băm, chấm chả quế thơm.', 'Xin thêm bát nước mắm có vắt tinh dầu cà cuống.', 1),
  ('food-lau-bo-nhung-dam', 'food', 'Lẩu bò nhúng dấm', 'Bò bắp hoa tươi thái mỏng nhúng nước dấm thanh mát, cuốn bánh tráng chuối chát.', 'Chấm mắm nêm đậm vị miền Trung.', 2),
  ('food-burger-bo-phomai', 'food', 'Burger bò phô mai tan chảy', 'Bánh mì nướng bơ mềm mại kẹp miếng bò nướng than hoa và phô mai cheddar.', 'Kèm khoai tây lắc phô mai giòn rụm.', 2),
  ('food-banh-canh-cua', 'food', 'Bánh canh cua nguyên con', 'Nước dùng sền sệt đỏ au từ gạch cua, thịt cua chắc ngọt tự nhiên.', 'Vắt thêm chanh và một thìa ớt sa tế cay nồng.', 2),
  ('food-hu-tieu-nam-vang', 'food', 'Hủ tiếu Nam Vang khô', 'Sợi hủ tiếu dai trộn sốt xì dầu đặc biệt, ăn kèm bát nước súp tôm thịt ngọt lịm.', 'Trộn đều hành phi, hẹ và tỏi ngâm giấm.', 1),
  ('food-com-ga-hoi-an', 'food', 'Cơm gà Hội An vàng óng', 'Hạt cơm nấu nước luộc gà béo thơm, thịt gà xé trộn rau răm hành tây.', 'Ăn cùng tương ớt rim phố cổ Hội An.', 1),
  ('food-lau-ech-mang-cay', 'food', 'Lẩu ếch măng cay', 'Thịt ếch xào săn vàng ruộm rim măng ớt chua cay đậm đà.', 'Nhúng thật nhiều rau muống non giòn ngọt.', 2),
  ('food-xoi-xeo-ruoc-hanh', 'food', 'Xôi xéo mỡ hành thịt kho', 'Hạt nếp vàng óng đậu xanh bùi bùi cùng thịt ba chỉ kho trứng đậm vị.', 'Gói trong lá chuối mang đi picnic công viên.', 1),
  ('drink-tra-dao-cam-sa', 'drink', 'Trà đào cam sả', 'Vị ngọt thanh của đào quyện cùng hương sả nồng ấm và vị chua dịu từ cam tươi.', 'Uống kèm những miếng đào miếng giòn sần sật.', 1),
  ('drink-ca-phe-muoi', 'drink', 'Cà phê muối xứ Huế', 'Lớp kem mặn béo ngậy phủ trên nền cà phê phin đậm đà thơm ngát.', 'Khuấy đều từ dưới lên để vị mặn ngọt hòa tan hoàn hảo.', 1),
  ('drink-tra-sua-tran-chau', 'drink', 'Trà sữa trân châu đường đen', 'Trà sữa béo thơm vị trà đen, trân châu mềm dẻo nóng hổi rim đường mía.', 'Chọn mức 50% đường và 70% đá là vừa miệng.', 1),
  ('drink-matcha-latte', 'drink', 'Matcha latte đá xay', 'Vị chát nhẹ thanh tao từ bột trà xanh Nhật Bản hòa cùng sữa tươi béo ngọt.', 'Chọn thêm lớp kem whipping cream ngọt ngào.', 2),
  ('drink-sinh-to-bo', 'drink', 'Sinh tố bơ sầu riêng', 'Độ ngậy béo mềm mượt của bơ sáp hòa quyện hương sầu riêng khó cưỡng.', 'Thêm một chút sữa đặc béo ngậy.', 1),
  ('drink-nuoc-ep-dua-hau', 'drink', 'Nước ép dưa hấu bạc hà', 'Ly nước ép đỏ mọng mát lạnh giải nhiệt ngày nắng gắt, thoảng hương bạc hà.', 'Không cần thêm đường để giữ vị ngọt tự nhiên.', 1),
  ('drink-cocktail-nhe', 'drink', 'Cocktail Mocktail chill', 'Một ly cocktail vị hoa quả nhẹ nhàng có cồn nhẹ trong quán pub có nhạc acoustic.', 'Nhâm nhi tâm sự những chuyện trong lòng.', 3),
  ('drink-tra-trai-cay-nhiet-doi', 'drink', 'Trà trái cây nhiệt đới', 'Trà lài ngâm cùng dâu tây, chanh leo, dưa lưới và thanh long tươi mát.', 'Vừa uống vừa ăn kèm các lát hoa quả mọng nước.', 2),
  ('drink-bac-xiu-da', 'drink', 'Bạc xỉu đá Sài Gòn', 'Nhiều sữa ít cà phê, béo ngậy ngọt ngào dành cho người thích sự ngọt ngào.', 'Khuấy bọt sữa thật bông trước khi uống.', 1),
  ('drink-kombucha-hoa-qua', 'drink', 'Kombucha lên men tự nhiên', 'Vị chua thanh mát lành giàu lợi khuẩn sảng khoái từng ngụm.', 'Rất tốt cho tiêu hóa sau một bữa ăn no nê.', 2),
  ('drink-tra-hoa-cuc-mat-ong', 'drink', 'Trà hoa cúc mật ong', 'Ấm trà gốm nóng hổi ngan ngát hương hoa cúc vàng và vị mật ngọt lành.', 'Uống vào buổi tối giúp ngủ thật ngon giấc.', 2),
  ('drink-ca-phe-trung', 'drink', 'Cà phê trứng Hà Nội', 'Lớp kem trứng đánh bông mịn như mây béo ngậy trên ly cà phê đen ấm nóng.', 'Dùng thìa múc từng muỗng kem trứng thưởng thức trước.', 2),
  ('drink-sua-chua-tran-chau', 'drink', 'Sữa chua trân châu Hạ Long', 'Sữa chua dẻo mịn ăn cùng cốt dừa ấm béo và trân châu dai giòn sần sật.', 'Rắc thêm chút dừa nạo sấy khô giòn tan.', 1),
  ('drink-nuoc-mia-sau-rieng', 'drink', 'Nước mía sầu riêng cốt dừa', 'Vị ngọt lịm mát rượi của mía tươi thêm vị béo thơm lừng của sầu riêng.', 'Ly đồ uống hè phố bình dị mà gây thương nhớ.', 1),
  ('drink-cacao-nong', 'drink', 'Cacao nóng kẹo marshmallow', 'Ly cacao đắng nhẹ ấm sực lòng bàn tay với những viên kẹo dẻo mềm tan.', 'Cực kỳ thích hợp cho những ngày mưa lạnh.', 2),
  ('drink-tra-o-long-sen', 'drink', 'Trà ô long hạt sen vàng', 'Vị trà ô long đậm đà lắng đọng cùng hạt sen bùi bở ngọt thanh.', 'Thêm lớp kem cheese mặn mặn beo béo.', 2),
  ('drink-nuoc-dua-tuoi', 'drink', 'Dừa xiêm tươi nạo cùi', 'Trái dừa tươi ngọt lành mát lịm, nạo lớp cùi non mềm béo.', 'Uống trực tiếp từ quả dừa tươi mát rượi.', 1),
  ('drink-ruou-vang-nhe', 'drink', 'Rượu vang đỏ nhâm nhi', 'Một ly vang đỏ thơm mùi gỗ sồi và quả mọng chín bên ánh nến.', 'Cùng nhau nâng ly chúc cho tình yêu hai đứa.', 3),
  ('drink-tra-chanh-via-he', 'drink', 'Trà chanh hạt hướng dương', 'Cốc trà chanh chua ngọt mát lạnh cắn hạt hướng dương ngắm phố xá.', 'Ngồi ghế nhựa vỉa hè hóng gió tán gẫu rôm rả.', 1),
  ('drink-soda-viet-quat', 'drink', 'Soda việt quất xanh biếc', 'Màu xanh tím lấp lánh sủi tăm mát lạnh cùng vị chua ngọt bùng nổ.', 'Khuấy đều cùng vài lá bạc hà thơm mát.', 2),
  ('place-cafe-sach', 'place', 'Quán cà phê sách tĩnh lặng', 'Không gian thoang thoảng mùi giấy cũ, nhạc lofi êm ái và ánh đèn vàng ấm.', 'Mỗi người chọn một cuốn sách hay rồi đọc trích đoạn cho nhau.', 2),
  ('place-cong-vien-ho', 'place', 'Công viên ven hồ thoáng đãng', 'Hàng cây xanh mát, gió hồ lồng lộng, ghế đá dưới bóng mát.', 'Mang theo tai nghe chung để cùng nghe một playlist yêu thích.', 1),
  ('place-rap-chieu-phim', 'place', 'Rạp chiếu phim ghế đôi Sweetbox', 'Ghế sofa đôi êm ái riêng tư, màn hình lớn sống động và bỏng ngô bơ thơm nức.', 'Chọn một bộ phim mà cả hai cùng hào hứng muốn xem.', 2),
  ('place-bao-tang-my-thuat', 'place', 'Bảo tàng mỹ thuật cổ kính', 'Kiến trúc cổ điển kiểu Pháp với những góc cầu thang và khung cửa sổ ngập nắng.', 'Cùng nhau chụp thật nhiều ảnh chân dung cho người kia.', 1),
  ('place-nha-sach-lon', 'place', 'Nhà sách trung tâm thành phố', 'Hàng ngàn kệ sách ngập tràn sắc màu, khu văn phòng phẩm đáng yêu.', 'Chọn cho nhau một tấm thiệp hoặc một cuốn sổ nhỏ xinh.', 1),
  ('place-trung-tam-thuong-mai', 'place', 'Trung tâm thương mại nhộn nhịp', 'Tổ hợp mua sắm, trò chơi gắp thú, ăn uống mát mẻ cả ngày dài.', 'Thi xem ai gắp được chú gấu bông xinh nhất tặng đối phương.', 2),
  ('place-cho-dem-am-thuc', 'place', 'Chợ đêm ẩm thực đường phố', 'Con phố lung linh ánh đèn ngập tràn mùi thơm từ các quầy xiên que nướng.', 'Mỗi người cầm một món chia sẻ cho nhau nếm thử.', 1),
  ('place-ho-tay-ngam-hoang-hon', 'place', 'Bờ hồ lộng gió đón hoàng hôn', 'Ngắm mặt trời đỏ rực từ từ lặn xuống mặt nước lấp lánh ánh vàng.', 'Mua hai que kem tươi vừa ăn vừa ngắm hoàng hôn buông.', 1),
  ('place-vuon-thuc-vat', 'place', 'Vườn thực vật cây xanh', 'Rợp bóng cây cổ thụ ngút ngàn, tiếng chim hót líu lo trong trẻo.', 'Trải thảm picnic ngồi trò chuyện dưới bóng râm mát rượi.', 1),
  ('place-rooftop-bar', 'place', 'Quán cà phê sân thượng Rooftop', 'Ngắm toàn cảnh thành phố lung linh ánh đèn xe cộ từ trên cao.', 'Chọn một góc bàn sát lan can để tận hưởng trọn vẹn gió trời.', 3),
  ('place-pho-co-di-bo', 'place', 'Phố đi bộ cuối tuần', 'Không gian đi bộ sôi động với các ban nhạc acoustic và người vẽ tranh truyền thần.', 'Nắm tay nhau đi dạo thong thả không vội vã.', 1),
  ('place-thuy-cung', 'place', 'Thủy cung đường hầm kính', 'Đường hầm đại dương huyền ảo với những đàn cá bơi lội ngay trên đầu.', 'Check-in dưới ánh sáng xanh dương lung linh kỳ ảo.', 3),
  ('place-san-bowling', 'place', 'Sân chơi bowling sôi nổi', 'Tiếng bóng lăn rộn rã, những cú ném strike ăn mừng đầy phấn khích.', 'Cá cược người thua sẽ phải đấm lưng cho người thắng.', 2),
  ('place-tiem-gom-thu-cong', 'place', 'Xưởng gốm thủ công ấm cúng', 'Tự tay nặn chiếc cốc hay chiếc đĩa sứ kỷ niệm mang về.', 'Khắc tên hai đứa và ngày hẹn hò lên đáy sản phẩm.', 3),
  ('place-cau-di-bo-anh-sao', 'place', 'Cây cầu đi bộ lung linh ánh đèn', 'Cây cầu rực rỡ sắc màu bắc qua mặt nước êm đềm về đêm.', 'Đứng giữa cầu cùng ngắm sao trời và thành phố lên đèn.', 1),
  ('place-vuon-hoa-da-ngoai', 'place', 'Vườn hoa ngoại ô bạt ngàn', 'Cánh đồng cúc họa mi, hoa thạch thảo hay hướng dương rực rỡ sắc màu.', 'Chuẩn bị trang phục hợp tông để có những bức ảnh thật đẹp.', 2),
  ('place-khu-tro-choi-boardgame', 'place', 'Quán board game hẹn hò', 'Hàng trăm bộ trò chơi từ vui nhộn đến cân não dành cho hai người.', 'Chơi những trò hợp tác hoặc so tài suy luận hài hước.', 2),
  ('place-san-truot-bang', 'place', 'Sân trượt băng trong nhà', 'Không gian băng giá mát lạnh, nắm tay nhau trượt từng bước giữ thăng bằng.', 'Cơ hội tuyệt vời để nắm chặt tay người ấy không rời.', 3),
  ('place-tram-tau-dien-tren-cao', 'place', 'Chuyến tàu điện trên cao', 'Ngắm nhìn phố phường từ những toa tàu lướt êm ru trên không trung.', 'Chụp những bức ảnh mang phong cách điện ảnh thanh xuân.', 1),
  ('place-lang-co-ngoai-thanh', 'place', 'Làng cổ thanh bình ngoại thành', 'Cổng làng rêu phong, giếng nước mái đình và sự yên ả hiếm có.', 'Thuê hai chiếc xe đạp đôi thong thả đạp quanh làng.', 2),
  ('act-nau-an-cong-thuc-la', 'activity', 'Cùng nấu một món ăn hoàn toàn mới', 'Chọn một công thức hai đứa chưa từng nấu bao giờ và cùng chuẩn bị.', 'Một người phụ trách sơ chế, một người phụ trách nêm nếm.', 1),
  ('act-chup-anh-film', 'activity', 'Đi dạo chụp 1 cuộn ảnh film/retro', 'Mang một máy ảnh film hoặc app giả lập film chụp lại những khoảnh khắc tự nhiên.', 'Không xem lại ảnh ngay, để dành vài ngày sau mới cùng ngắm.', 1),
  ('act-to-tuong-mau', 'activity', 'Đi tô tượng đôi kỷ niệm', 'Chọn hai bức tượng hoạt hình đáng yêu và cùng tô màu cho nhau.', 'Tô bức tượng mang đặc điểm tính cách của người đối diện.', 1),
  ('act-lam-banh-ngot', 'activity', 'Cùng làm mẻ bánh quy thơm nức', 'Nhào bột, cán hình trái tim và nướng mẻ bánh bơ thơm lừng cả căn bếp.', 'Viết chữ viết tắt tên hai đứa bằng sốt socola lên bánh.', 2),
  ('act-viet-thu-tuong-lai', 'activity', 'Viết thư gửi cho nhau 1 năm sau', 'Viết những lời muốn nói với nhau trong tương lai và niêm phong vào phong bì.', 'Hẹn đúng ngày này năm sau mới cùng mở ra đọc.', 1),
  ('act-gap-sao-giay', 'activity', 'Cùng gấp một lọ sao giấy ước nguyện', 'Mỗi ngôi sao gấp xong ghi một điều cảm ơn hoặc ước nguyện nho nhỏ vào trong.', 'Lọ sao sẽ là vật trang trí phòng chung của hai đứa.', 1),
  ('act-ve-chan-dung-doi-phuong', 'activity', 'Thi vẽ chân dung người ấy trong 5 phút', 'Vẽ chân dung người đối diện mà không được nhìn xuống giấy quá nhiều.', 'Chuẩn bị tinh thần để cười nghiêng ngả trước tác phẩm của nhau.', 1),
  ('act-rap-lego-mini', 'activity', 'Cùng lắp ráp một bộ Lego đôi', 'Một bộ lego hoa hoặc ngôi nhà tí hon cùng nhau tìm từng mảnh ghép.', 'Trưng bày bộ lego đã hoàn thành ở góc học tập hay làm việc.', 2),
  ('act-doi-vai-chon-do', 'activity', 'Phối đồ cho người kia khi đi mua sắm', 'Mỗi người tự chọn cho đối phương một bộ trang phục mà mình nghĩ họ mặc đẹp nhất.', 'Mặc thử trang phục vừa được chọn và chụp ảnh kỷ niệm.', 2),
  ('act-ngam-sao-dem', 'activity', 'Trải bạt ngắm trăng sao ngoài trời', 'Tìm một khoảng trời thoáng đãng, nằm bên nhau ngắm bầu trời đầy sao.', 'Dùng app thiên văn để cùng tìm chòm sao cung hoàng đạo.', 1),
  ('act-lam-playlist-chung', 'activity', 'Cùng tạo chung một Playlist Spotify', 'Mỗi người luân phiên thêm vào 1 bài hát gợi nhớ về những kỷ niệm bên nhau.', 'Bật playlist này mỗi khi hai đứa cùng đi xe hay nấu ăn.', 1),
  ('act-chay-xe-khong-dich-den', 'activity', 'Chở nhau đi một con đường chưa từng đi', 'Chạy xe thong dong rẽ vào những con phố ngõ ngách chưa từng ghé qua.', 'Dừng lại ở bất kỳ quán nước nào trông xinh xắn ven đường.', 1),
  ('act-tam-su-khong-dien-thoai', 'activity', '1 giờ tắt điện thoại chỉ trò chuyện', 'Cất hết điện thoại vào ngăn kéo, pha ấm trà và ngồi tâm sự mọi chuyện.', 'Hỏi nhau những câu hỏi sâu lắng về cảm xúc dạo gần đây.', 1),
  ('act-hoc-nhay-tiktok-doi', 'activity', 'Tập một điệu nhảy đôi ngắn vui nhộn', 'Chọn một bài nhảy đôi dễ thương trên mạng và cùng nhau tập theo từng nhịp.', 'Quay lại video hậu trường những lần nhảy sai vụng về.', 1),
  ('act-di-cho-troi-do-cu', 'activity', 'Săn đồ vintage ở chợ đồ cũ', 'Tìm kiếm những món đồ cổ điển, đĩa than hay đồ chơi tuổi thơ thú vị.', 'Tìm một món đồ giá rẻ nhưng mang ý nghĩa biểu tượng cho cả hai.', 1),
  ('act-dap-mat-na-duong-da', 'activity', 'Buổi tối dưỡng da spa tại gia', 'Đắp mặt nạ hoa quả mát lạnh, bật nhạc spa nhẹ nhàng thư giãn.', 'Thoa kem và massage nhẹ nhàng cho nhau.', 1),
  ('act-lam-album-anh-in', 'activity', 'Chọn ảnh và làm một cuốn photobook', 'Lựa ra 30 bức ảnh đáng yêu nhất trong điện thoại để in ra dán vào sổ.', 'Tự tay viết chú thích ngày tháng và cảm xúc bên dưới mỗi bức ảnh.', 2),
  ('act-trao-doi-sach', 'activity', 'Đọc cho nhau nghe một chương sách', 'Mỗi người chọn một trang sách mình tâm đắc nhất và đọc diễn cảm cho người kia nghe.', 'Chia sẻ cảm nghĩ về bài học rút ra từ trang sách đó.', 1),
  ('act-dap-xe-buoi-sang-som', 'activity', 'Thức sớm đạp xe đón bình minh', 'Dậy sớm lúc 5h30 sáng khi đường phố còn vắng tanh và không khí trong lành.', 'Thưởng thức bữa sáng nóng hổi sau buổi đạp xe sảng khoái.', 1),
  ('act-nau-an-cho-thu-cung', 'activity', 'Đi cafe mèo/cún cưng chơi đùa', 'Cùng nhau vuốt ve những chú mèo cưng hay cún con dễ thương.', 'Cho các bé thú cưng ăn bánh thưởng và chụp hình đáng yêu.', 2),
  ('act-choi-tro-choi-cam-on', 'activity', 'Trò chơi nói lời biết ơn', 'Thay phiên nhau nói một điều cụ thể mà bạn biết ơn người ấy trong tuần qua.', 'Mỗi lời nói đi kèm một cái ôm thật chặt.', 1),
  ('act-thu-lam-pha-che', 'activity', 'Tự pha chế đồ uống mới tại nhà', 'Mua nguyên liệu trái cây, soda, siro về tự sáng tạo món nước mang tên hai đứa.', 'Chấm điểm xem thức uống của ai ngon và bắt mắt hơn.', 1),
  ('act-gap-thu-bong-doi', 'activity', 'Quyết tâm gắp bằng được 1 chú gấu', 'Đổi một túi xu tại khu trò chơi và cùng nhau nhắm chuẩn chiếc máy gắp.', 'Tặng chú gấu bông đó cho nhau làm bạn gối đầu.', 1),
  ('act-ngam-thanh-pho-xe-bus', 'activity', 'Đi xe buýt 2 tầng ngắm phố', 'Ngồi trên tầng 2 lộng gió ngắm nhìn những góc phố thân quen từ góc nhìn mới.', 'Cùng ngắm cây cối và các tòa nhà lướt qua tầm mắt.', 1),
  ('act-chup-anh-photobooth', 'activity', 'Chụp hình máy ảnh photobooth Hàn Quốc', 'Đội bờm ngộ nghĩnh, đeo kính hề và tạo 4 dáng ảnh siêu đáng yêu trong buồng chụp.', 'Dán dải ảnh ngay vào ốp lưng điện thoại của mỗi người.', 1),
  ('act-lam-nen-thom', 'activity', 'Tự làm hũ nến thơm thủ công', 'Chọn mùi hương tinh dầu yêu thích và đổ sáp nến vào hũ thủy tinh nhỏ.', 'Thắp nến thơm mỗi khi hai đứa có buổi hẹn hò ấm cúng.', 3),
  ('act-thi-ke-chuyen-hai', 'activity', 'Cuộc thi ai cười trước là thua', 'Mỗi người chuẩn bị 3 câu chuyện cười hoặc biểu cảm mặt hề để chọc người kia cười.', 'Ai bật cười trước sẽ phải đồng ý với một yêu cầu của người kia.', 1),
  ('act-di-cho-hoa-som', 'activity', 'Đi chợ hoa mua một bó hoa tươi', 'Cùng đi chợ hoa lúc sáng sớm chọn những bông hoa tươi thắm nhất về cắm lọ.', 'Để đối phương tự chọn loài hoa mình thích nhất.', 1),
  ('act-xep-hinh-puzzle', 'activity', 'Ghép bức tranh xếp hình Puzzle', 'Cùng nhau tìm từng góc cạnh để hoàn thiện bức tranh ghép 500 mảnh.', 'Kiên nhẫn hỗ trợ nhau ghép những mảng màu phức tạp.', 2),
  ('act-nghe-nhac-duoi-mua', 'activity', 'Ngồi bên cửa sổ ngắm mưa nghe nhạc', 'Pha hai ly sữa nóng, ngồi bên khung cửa kính ngắm mưa rơi lộp độp.', 'Cùng tựa vai nhau lắng nghe tiếng mưa rơi bình yên.', 1)
on conflict (external_key) do update set
  title = excluded.title,
  description = excluded.description,
  tip = excluded.tip,
  price_level = excluded.price_level,
  is_active = excluded.is_active;

-- ---------- Play ----------
insert into public.questions (external_key, kind, category, intimacy_level, text) values
  ('daily-fun-1',     'daily', 'fun',      1, 'Nếu được ăn một món suốt một tuần, bạn chọn món nào?'),
  ('daily-fun-2',     'daily', 'fun',      1, 'Siêu năng lực vô dụng nhưng buồn cười nhất bạn muốn có là gì?'),
  ('daily-discover-1','daily', 'discover', 2, 'Một kỷ niệm tuổi thơ bạn nhớ rõ nhất là gì?'),
  ('daily-discover-2','daily', 'discover', 2, 'Điều gì ở thành phố này bạn thích nhất?'),
  ('daily-emotion-1', 'daily', 'emotion',  3, 'Khoảnh khắc nào gần đây khiến bạn thấy được yêu thương?'),
  ('daily-deep-1',    'daily', 'deep',     4, 'Một điều bạn mong hai ta cùng làm được trong năm tới là gì?'),
  ('truth-1',         'truth', 'fun',      1, 'Món ăn kỳ lạ nhất bạn từng thử là gì?'),
  ('truth-2',         'truth', 'discover', 2, 'Lần đầu thấy mình thích người ấy là khi nào?'),
  ('truth-3',         'truth', 'emotion',  3, 'Điều gì ở bản thân bạn muốn người ấy hiểu hơn?'),
  ('dare-1',          'dare',  'fun',      1, 'Nhắn cho người ấy một tin nhắn chỉ bằng emoji để mô tả ngày hôm nay.'),
  ('dare-2',          'dare',  'fun',      1, 'Bắt chước giọng của người ấy trong 10 giây.'),
  ('dare-3',          'dare',  'emotion',  2, 'Kể ba điều bạn biết ơn ở người ấy.')
on conflict (external_key) do nothing;

-- ---------- Learn: một bài 10 từ chủ đề Communication ----------
insert into public.vocabulary_words
  (external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level) values
  ('communication-improve',      'improve',      '/ɪmˈpruːv/',       'verb', 'Cải thiện',       'I want to improve my speaking skills.',        'Tôi muốn cải thiện kỹ năng nói của mình.',                 'communication', 'A2'),
  ('communication-express',      'express',      '/ɪkˈspres/',       'verb', 'Bày tỏ, diễn đạt','It is hard for me to express my feelings in English.', 'Tôi thấy khó diễn đạt cảm xúc của mình bằng tiếng Anh.', 'communication', 'B1'),
  ('communication-explain',      'explain',      '/ɪkˈspleɪn/',      'verb', 'Giải thích',      'Can you explain what this word means?',        'Bạn có thể giải thích từ này nghĩa là gì không?',          'communication', 'A2'),
  ('communication-share',        'share',        '/ʃeər/',           'verb', 'Chia sẻ',         'I like to share my day with you.',             'Tôi thích chia sẻ một ngày của mình với bạn.',             'communication', 'A2'),
  ('communication-listen',       'listen',       '/ˈlɪsn/',          'verb', 'Lắng nghe',       'Please listen to me for a moment.',            'Làm ơn lắng nghe tôi một chút.',                           'communication', 'A1'),
  ('communication-understand',   'understand',   '/ˌʌndərˈstænd/',   'verb', 'Hiểu',            'We understand each other very well.',          'Chúng tôi hiểu nhau rất rõ.',                              'communication', 'A2'),
  ('communication-mention',      'mention',      '/ˈmenʃn/',         'verb', 'Đề cập',          'She forgot to mention the time.',              'Cô ấy quên đề cập đến thời gian.',                         'communication', 'B1'),
  ('communication-agree',        'agree',        '/əˈɡriː/',         'verb', 'Đồng ý',          'I agree with your idea.',                      'Tôi đồng ý với ý kiến của bạn.',                           'communication', 'A2'),
  ('communication-conversation', 'conversation', '/ˌkɒnvərˈseɪʃn/', 'noun', 'Cuộc trò chuyện', 'We had a nice conversation at dinner.',       'Chúng tôi đã có một cuộc trò chuyện vui vẻ trong bữa tối.', 'communication', 'A2'),
  ('communication-message',      'message',      '/ˈmesɪdʒ/',        'noun', 'Tin nhắn',        'I will send you a message later.',             'Tôi sẽ gửi tin nhắn cho bạn sau.',                         'communication', 'A1')
on conflict (external_key) do nothing;

insert into public.vocabulary_collocations (word_id, phrase, position)
select w.id, c.phrase, c.pos
  from (values
    ('communication-improve',      'improve your English', 1), ('communication-improve',      'improve your skills', 2),
    ('communication-express',      'express your feelings', 1), ('communication-express',      'express an opinion', 2),
    ('communication-explain',      'explain the reason', 1),   ('communication-explain',      'explain how it works', 2),
    ('communication-share',        'share your thoughts', 1),  ('communication-share',        'share a meal', 2),
    ('communication-listen',       'listen carefully', 1),     ('communication-listen',       'listen to music', 2),
    ('communication-understand',   'understand each other', 1),('communication-understand',   'understand clearly', 2),
    ('communication-mention',      'mention a problem', 1),    ('communication-mention',      'as I mentioned', 2),
    ('communication-agree',        'agree with someone', 1),   ('communication-agree',        'agree on a plan', 2),
    ('communication-conversation', 'have a conversation', 1),  ('communication-conversation', 'a long conversation', 2),
    ('communication-message',      'send a message', 1),       ('communication-message',      'leave a message', 2)
  ) as c(key, phrase, pos)
  join public.vocabulary_words w on w.external_key = c.key
on conflict (word_id, phrase) do nothing;

-- Bài học của hôm nay (múi giờ Việt Nam) với đúng 10 từ ở trên
insert into public.daily_lessons (lesson_date, topic, level)
values ((now() at time zone 'Asia/Ho_Chi_Minh')::date, 'communication', 'A2')
on conflict (lesson_date) do nothing;

insert into public.lesson_words (lesson_id, word_id, position)
select l.id, w.id, k.pos
  from (values
    ('communication-improve', 1), ('communication-express', 2), ('communication-explain', 3),
    ('communication-share', 4),   ('communication-listen', 5),  ('communication-understand', 6),
    ('communication-mention', 7), ('communication-agree', 8),   ('communication-conversation', 9),
    ('communication-message', 10)
  ) as k(key, pos)
  join public.vocabulary_words w on w.external_key = k.key
  join public.daily_lessons l on l.lesson_date = (now() at time zone 'Asia/Ho_Chi_Minh')::date
on conflict do nothing;
