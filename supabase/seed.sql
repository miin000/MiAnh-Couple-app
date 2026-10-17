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
-- Daily: Vui vẻ (fun)
insert into public.questions (external_key, kind, category, intimacy_level, text) values
  ('daily-fun-01', 'daily', 'fun', 1, 'Nếu được ăn một món suốt một tuần mà không chán, bạn chọn món nào?'),
  ('daily-fun-02', 'daily', 'fun', 1, 'Siêu năng lực vô dụng nhưng buồn cười nhất bạn muốn có là gì?'),
  ('daily-fun-03', 'daily', 'fun', 1, 'Nếu hai đứa mình xuyên không về thời cổ đại, ai sẽ là người sống sót lâu hơn?'),
  ('daily-fun-04', 'daily', 'fun', 1, 'Bài hát nào hễ bật lên là bạn lập tức muốn nhún nhảy hoặc hát theo?'),
  ('daily-fun-05', 'daily', 'fun', 1, 'Nếu được đổi tên cho người ấy bằng một loại trái cây, bạn sẽ chọn quả gì?'),
  ('daily-fun-06', 'daily', 'fun', 1, 'Bộ phim hoạt hình nào bạn có thể xem đi xem lại mà không bao giờ chán?'),
  ('daily-fun-07', 'daily', 'fun', 1, 'Nếu một ngày thức dậy bạn biến thành một chú mèo, bạn sẽ làm gì đầu tiên?'),
  ('daily-fun-08', 'daily', 'fun', 1, 'Kỷ niệm "quê độ" nhất nhưng mỗi lần nhớ lại đều bật cười của bạn là gì?'),
  ('daily-fun-09', 'daily', 'fun', 1, 'Món đồ linh tinh vô nghĩa nhất mà bạn từng mua trên mạng là gì?'),
  ('daily-fun-10', 'daily', 'fun', 1, 'Nếu chúng mình cùng tham gia một gameshow sinh tồn, nhiệm vụ của bạn là gì?'),
  ('daily-fun-11', 'daily', 'fun', 1, 'Thói quen kỳ quặc nhất khi ở nhà một mình của bạn là gì?'),
  ('daily-fun-12', 'daily', 'fun', 1, 'Trang phục nào của người ấy khiến bạn thấy buồn cười hoặc đáng yêu nhất?'),
  ('daily-fun-13', 'daily', 'fun', 1, 'Nếu trúng số độc đắc ngày mai, điều điên rồ đầu tiên bạn muốn làm là gì?'),
  ('daily-fun-14', 'daily', 'fun', 1, 'Biểu cảm gương mặt nào của người ấy khiến bạn không thể nhịn được cười?'),
  ('daily-fun-15', 'daily', 'fun', 1, 'Nếu được nuôi một con thú cưng kỳ lạ (cánh cụt, gấu trúc), bạn chọn con nào?'),
  ('daily-fun-16', 'daily', 'fun', 1, 'Trò chơi điện tử hay board game nào bạn tự tin sẽ thắng người ấy 100%?'),
  ('daily-fun-17', 'daily', 'fun', 1, 'Thời tiết lý tưởng nhất cho một ngày lười biếng trùm chăn xem phim cùng nhau?'),
  ('daily-fun-18', 'daily', 'fun', 1, 'Nếu một ngày hai đứa bị lạc trên đảo hoang, bạn nghĩ ai sẽ tìm ra lửa trước?'),
  -- Daily: Tìm hiểu (discover)
  ('daily-discover-01', 'daily', 'discover', 2, 'Một kỷ niệm thời thơ ấu mà bạn nhớ rõ và trân trọng nhất là gì?'),
  ('daily-discover-02', 'daily', 'discover', 2, 'Góc phố hay địa điểm nào ở thành phố này mang lại cho bạn cảm giác bình yên nhất?'),
  ('daily-discover-03', 'daily', 'discover', 2, 'Ước mơ thời còn đi học của bạn là gì? Nó có khác nhiều so với hiện tại không?'),
  ('daily-discover-04', 'daily', 'discover', 2, 'Cuốn sách hoặc bộ phim nào đã làm thay đổi góc nhìn cuộc sống của bạn nhiều nhất?'),
  ('daily-discover-05', 'daily', 'discover', 2, 'Ai là người có sức ảnh hưởng lớn nhất đến tính cách và nhân sinh quan của bạn?'),
  ('daily-discover-06', 'daily', 'discover', 2, 'Kỹ năng nào bạn luôn ấp ủ muốn học nhưng chưa có cơ hội thực hiện?'),
  ('daily-discover-07', 'daily', 'discover', 2, 'Chuyến du lịch nào trong đời để lại cho bạn nhiều ấn tượng khó quên nhất?'),
  ('daily-discover-08', 'daily', 'discover', 2, 'Một mùi hương gợi nhớ bạn về những ký ức ngọt ngào trong quá khứ là gì?'),
  ('daily-discover-09', 'daily', 'discover', 2, 'Khi gặp áp lực trong công việc hoặc cuộc sống, cách bạn thường giải tỏa là gì?'),
  ('daily-discover-10', 'daily', 'discover', 2, 'Một lời khuyên ý nghĩa nhất mà bạn từng nhận được từ một người khác?'),
  ('daily-discover-11', 'daily', 'discover', 2, 'Bạn thuộc tuýp người thích đón bình minh thức giấc sớm hay thức khuya ngắm đêm?'),
  ('daily-discover-12', 'daily', 'discover', 1, 'Nỗi sợ vô lý hoặc kỳ lạ nhất của bạn từ bé đến giờ là gì?'),
  ('daily-discover-13', 'daily', 'discover', 2, 'Nếu có cơ hội sống ở một quốc gia khác trong 1 năm, bạn sẽ chọn nơi nào?'),
  ('daily-discover-14', 'daily', 'discover', 2, 'Món ăn do mẹ hoặc người thân nấu khiến bạn luôn thấy ấm lòng mỗi khi nhớ tới?'),
  ('daily-discover-15', 'daily', 'discover', 2, 'Một thành tựu nhỏ bé gần đây khiến bạn cảm thấy tự hào về bản thân?'),
  ('daily-discover-16', 'daily', 'discover', 2, 'Thể loại âm nhạc nào luôn đồng hành cùng bạn những lúc tâm trạng chùng xuống?'),
  ('daily-discover-17', 'daily', 'discover', 2, 'Đối với bạn, một ngày chủ nhật hoàn hảo sẽ diễn ra như thế nào?'),
  ('daily-discover-18', 'daily', 'discover', 2, 'Tính cách nào ở một người bạn mà bạn coi trọng và tìm kiếm nhất?')
on conflict (external_key) do update set text = excluded.text;
  -- Daily: Cảm xúc (emotion)
insert into public.questions (external_key, kind, category, intimacy_level, text) values
  ('daily-emotion-01', 'daily', 'emotion', 3, 'Khoảnh khắc nào gần đây khiến bạn cảm nhận sâu sắc rằng mình được yêu thương?'),
  ('daily-emotion-02', 'daily', 'emotion', 2, 'Điều nhỏ bé nào người ấy làm mỗi ngày luôn khiến bạn mỉm cười ấm lòng?'),
  ('daily-emotion-03', 'daily', 'emotion', 3, 'Lần đầu tiên nhìn thấy người ấy, cảm xúc đầu tiên xuất hiện trong lòng bạn là gì?'),
  ('daily-emotion-04', 'daily', 'emotion', 2, 'Khi ở bên cạnh người ấy, bạn cảm thấy mình giống đứa trẻ hay một phiên bản trưởng thành hơn?'),
  ('daily-emotion-05', 'daily', 'emotion', 3, 'Một cái ôm hay một cái nắm tay từ người ấy có ý nghĩa như thế nào trong ngày mệt mỏi của bạn?'),
  ('daily-emotion-06', 'daily', 'emotion', 3, 'Điều gì ở bản thân mà bạn cảm thấy tự tin và an tâm hơn rất nhiều từ khi yêu người ấy?'),
  ('daily-emotion-07', 'daily', 'emotion', 2, 'Lời khen nào từ người ấy khiến bạn nhớ mãi không quên?'),
  ('daily-emotion-08', 'daily', 'emotion', 3, 'Có khoảnh khắc nào hai đứa không nói lời nào nhưng bạn vẫn cảm thấy vô cùng gắn kết?'),
  ('daily-emotion-09', 'daily', 'emotion', 2, 'Mỗi khi nghĩ về người ấy lúc xa nhau, điều đầu tiên hiện lên trong tâm trí bạn là gì?'),
  ('daily-emotion-10', 'daily', 'emotion', 3, 'Hành động ấm áp nào của người ấy khiến bạn bất ngờ và xúc động nhất?'),
  ('daily-emotion-11', 'daily', 'emotion', 2, 'Một bài hát nào mỗi khi cất lên giai điệu đều khiến bạn nhớ ngay đến người ấy?'),
  ('daily-emotion-12', 'daily', 'emotion', 3, 'Khi chúng mình có chút hiểu lầm hoặc bất đồng, điều gì giúp bạn dễ nguôi ngoai nhất?'),
  ('daily-emotion-13', 'daily', 'emotion', 2, 'Bạn thấy người ấy cuốn hút và đáng yêu nhất vào thời điểm nào trong ngày?'),
  ('daily-emotion-14', 'daily', 'emotion', 3, 'Có khi nào bạn cảm thấy biết ơn vì số phận đã đưa người ấy bước vào cuộc đời mình chưa?'),
  ('daily-emotion-15', 'daily', 'emotion', 3, 'Điều gì bạn rất muốn nói với người ấy hôm nay nhưng chưa có dịp mở lời?'),
  ('daily-emotion-16', 'daily', 'emotion', 2, 'Một thói quen đáng yêu của người ấy mà chỉ có bạn mới nhận ra là gì?'),
  ('daily-emotion-17', 'daily', 'emotion', 3, 'Cảm giác bình yên nhất trong tình yêu của hai đứa mình đối với bạn là gì?'),
  ('daily-emotion-18', 'daily', 'emotion', 3, 'Nếu hôm nay chỉ được nói một câu nhắn nhủ tới người ấy, bạn sẽ nói điều gì?'),
  -- Daily: Sâu sắc (deep)
  ('daily-deep-01', 'daily', 'deep', 4, 'Một điều bạn mong ước hai đứa mình cùng nhau thực hiện được trong năm tới là gì?'),
  ('daily-deep-02', 'daily', 'deep', 4, 'Theo bạn, thử thách lớn nhất mà hai đứa đã cùng nhau vượt qua là gì?'),
  ('daily-deep-03', 'daily', 'deep', 3, 'Ngôi nhà lý tưởng trong tương lai của hai đứa mình trong tưởng tượng của bạn như thế nào?'),
  ('daily-deep-04', 'daily', 'deep', 4, 'Điều gì trong mối quan hệ này giúp bạn trưởng thành và hoàn thiện bản thân hơn mỗi ngày?'),
  ('daily-deep-05', 'daily', 'deep', 4, 'Khi chúng ta già đi, bạn hình dung một buổi chiều của hai đứa sẽ như thế nào?'),
  ('daily-deep-06', 'daily', 'deep', 4, 'Quan điểm của bạn về sự tha thứ và bao dung trong tình yêu đôi lứa?'),
  ('daily-deep-07', 'daily', 'deep', 4, 'Nỗi bất an lớn nhất của bạn về tương lai là gì, và người ấy có thể đồng hành cùng bạn ra sao?'),
  ('daily-deep-08', 'daily', 'deep', 4, 'Điều gì là nền tảng quan trọng nhất giữ cho tình yêu của hai ta luôn bền chặt?'),
  ('daily-deep-09', 'daily', 'deep', 4, 'Một bài học sâu sắc nhất về tình cảm mà bạn đã chiêm nghiệm được qua mối quan hệ này?'),
  ('daily-deep-10', 'daily', 'deep', 4, 'Bạn mong muốn hai đứa mình sẽ cân bằng giữa sự nghiệp cá nhân và thời gian bên nhau thế nào?'),
  ('daily-deep-11', 'daily', 'deep', 3, 'Nếu có một điều bạn có thể thay đổi để giúp hai đứa thấu hiểu nhau hơn nữa, đó là gì?'),
  ('daily-deep-12', 'daily', 'deep', 4, 'Định nghĩa của bạn về một "người bạn đời đích thực" là như thế nào?'),
  ('daily-deep-13', 'daily', 'deep', 4, 'Kỷ niệm khó khăn nào từng khiến bạn lo lắng, nhưng giờ nhìn lại lại thấy trân quý vì đã gắn kết hai đứa hơn?'),
  ('daily-deep-14', 'daily', 'deep', 4, 'Bạn tin rằng điều gì làm nên sức mạnh để hai người có thể bên nhau trọn đời?'),
  ('daily-deep-15', 'daily', 'deep', 4, 'Một giá trị sống cốt lõi nào bạn muốn cả hai cùng vun đắp và giữ gìn cho tổ ấm sau này?'),
  ('daily-deep-16', 'daily', 'deep', 4, 'Khoảnh khắc nào khiến bạn nhận ra người ấy chính là người bạn muốn gắn bó lâu dài?'),
  ('daily-deep-17', 'daily', 'deep', 4, 'Nếu được gửi một bức thư cho phiên bản của hai đứa mình 10 năm sau, bạn muốn viết gì?'),
  ('daily-deep-18', 'daily', 'deep', 4, 'Điều gì khiến bạn tin tưởng vững chắc nhất vào tương lai của hai đứa mình?')
on conflict (external_key) do update set text = excluded.text;


  -- Truth: Thật (42 câu)
insert into public.questions (external_key, kind, category, intimacy_level, text) values
  ('truth-01', 'truth', 'fun', 1, 'Món ăn kỳ lạ hoặc kết hợp kỳ quặc nhất bạn từng thử lén ăn là gì?'),
  ('truth-02', 'truth', 'fun', 1, 'Bạn đã bao giờ giả vờ thích một món quà hoặc một bộ phim để làm vui lòng người khác chưa?'),
  ('truth-03', 'truth', 'fun', 1, 'Nếu bị phát hiện lịch sử tìm kiếm gần nhất trên điện thoại, bạn có thấy ngượng không?'),
  ('truth-04', 'truth', 'fun', 1, 'Thói quen lười biếng nhất bạn hay làm khi không có ai ở nhà?'),
  ('truth-05', 'truth', 'fun', 1, 'Bạn có bao giờ vô tình "stalk" trang cá nhân của ai đó đến vài năm trước chưa?'),
  ('truth-06', 'truth', 'fun', 1, 'Nếu được hóa thân thành một nhân vật phản diện, bạn muốn là ai?'),
  ('truth-07', 'truth', 'fun', 1, 'Điều ngốc nghếch nhất bạn từng làm chỉ để gây sự chú ý với một ai đó?'),
  ('truth-08', 'truth', 'fun', 1, 'Lần gần nhất bạn nói dối vô hại (white lie) là về chuyện gì?'),
  ('truth-09', 'truth', 'fun', 1, 'Món đồ chơi hay gấu bông thời thơ ấu nào bạn vẫn còn giữ hoặc nhớ mãi?'),
  ('truth-10', 'truth', 'fun', 1, 'Bạn sợ con vật gì nhất trên đời dù nó hoàn toàn vô hại?'),
  ('truth-11', 'truth', 'discover', 2, 'Ấn tượng đầu tiên của bạn về người ấy khác với thực tế sau khi yêu nhau ở điểm nào?'),
  ('truth-12', 'truth', 'discover', 2, 'Khoảnh khắc chính xác nào khiến bạn nhận ra "thôi xong, mình đổ người này rồi"?'),
  ('truth-13', 'truth', 'discover', 2, 'Trước buổi hẹn hò đầu tiên với người ấy, bạn đã thay bao nhiêu bộ quần áo?'),
  ('truth-14', 'truth', 'discover', 2, 'Bạn đã từng chụp lén người ấy lúc ngủ hay lúc ngơ ngác chưa?'),
  ('truth-15', 'truth', 'discover', 2, 'Điều gì ở người ấy từng khiến bạn cảm thấy hơi bối rối hoặc ngượng ngùng lúc mới quen?'),
  ('truth-16', 'truth', 'discover', 2, 'Bạn lưu tên người ấy trong danh bạ điện thoại chính xác là gì?'),
  ('truth-17', 'truth', 'discover', 2, 'Mỗi khi hai đứa giận nhau, bạn thường giữ giận được tối đa bao lâu trước khi nhớ người ấy?'),
  ('truth-18', 'truth', 'discover', 2, 'Có tin nhắn nào của người ấy mà bạn đã chụp màn hình lại để đọc lại nhiều lần không?'),
  ('truth-19', 'truth', 'discover', 2, 'Bộ phận nào trên gương mặt người ấy bạn thấy thu hút và thích ngắm nhất?'),
  ('truth-20', 'truth', 'discover', 2, 'Lần đầu tiên người ấy chủ động nắm tay hoặc ôm, tim bạn đập nhanh thế nào?'),
  ('truth-21', 'truth', 'emotion', 3, 'Có điều gì về bản thân mà bạn từng rất tự ti nhưng chưa từng kể với ai ngoại trừ người ấy?'),
  ('truth-22', 'truth', 'emotion', 3, 'Có bao giờ bạn ghen nhưng lại cố tỏ ra là mình hoàn toàn bình thường không?'),
  ('truth-23', 'truth', 'emotion', 3, 'Hành động nhỏ nào của người ấy khiến bạn dễ xúc động hoặc thấy yếu lòng nhất?'),
  ('truth-24', 'truth', 'emotion', 3, 'Khi nào bạn cảm thấy nhớ người ấy đến mức chỉ muốn chạy ngay đến ôm một cái?'),
  ('truth-25', 'truth', 'emotion', 3, 'Có thói quen hay sở thích nào của bạn đã thay đổi tích cực kể từ khi có người ấy bên cạnh?'),
  ('truth-26', 'truth', 'emotion', 3, 'Điều gì ở người ấy khiến bạn thấy mình thật may mắn khi có được người yêu như vậy?'),
  ('truth-27', 'truth', 'emotion', 3, 'Nếu một ngày bạn có chuyện buồn, bạn muốn được người ấy ôm im lặng hay lắng nghe tâm sự?'),
  ('truth-28', 'truth', 'emotion', 3, 'Lần gần nhất bạn rơi nước mắt vì xúc động trước tình cảm của người ấy là khi nào?'),
  ('truth-29', 'truth', 'emotion', 3, 'Có điều gì bạn mong người ấy khen ngợi hoặc công nhận mình nhiều hơn không?'),
  ('truth-30', 'truth', 'emotion', 3, 'Bạn cảm nhận được tình yêu thương của người ấy rõ nhất qua hành động cụ thể nào?'),
  ('truth-31', 'truth', 'deep', 4, 'Nỗi sợ lớn nhất của bạn trong mối quan hệ của hai đứa mình là gì?'),
  ('truth-32', 'truth', 'deep', 4, 'Có bí mật hay suy nghĩ nào bạn từng ngần ngại chưa dám chia sẻ vì sợ người ấy lo lắng?'),
  ('truth-33', 'truth', 'deep', 4, 'Điều gì về tương lai của hai đứa khiến bạn hào hứng nhất mỗi khi nghĩ tới?'),
  ('truth-34', 'truth', 'deep', 4, 'Nếu có thể nhắn nhủ một điều chân thành nhất từ đáy lòng tới người ấy lúc này, đó là gì?'),
  ('truth-35', 'truth', 'deep', 4, 'Bạn nghĩ điều gì đã giữ cho ngọn lửa tình cảm của hai ta luôn ấm áp qua thời gian?'),
  ('truth-36', 'truth', 'deep', 4, 'Khi tưởng tượng về mái ấm gia đình tương lai, hình ảnh nào xuất hiện đầu tiên?'),
  ('truth-37', 'truth', 'deep', 4, 'Điều khó khăn nhất trong quá khứ đã giúp bạn trân trọng tình yêu hiện tại như thế nào?'),
  ('truth-38', 'truth', 'deep', 4, 'Bạn sẵn sàng thay đổi điều gì ở bản thân để mối quan hệ này ngày càng hòa hợp và bền vững?'),
  ('truth-39', 'truth', 'deep', 4, 'Điều gì khiến bạn hoàn toàn tin tưởng trao trọn niềm tin cho người ấy?'),
  ('truth-40', 'truth', 'deep', 4, 'Khoảnh khắc nào làm bạn tin rằng người ấy sẽ là bạn đời tuyệt vời của mình?'),
  ('truth-41', 'truth', 'emotion', 3, 'Nếu được quay lại ngày đầu tiên gặp nhau, bạn có làm điều gì khác đi không?'),
  ('truth-42', 'truth', 'deep', 4, 'Bạn trân trọng nhất đức tính nào ở người ấy mà bạn chưa từng thấy ở ai khác?')
on conflict (external_key) do update set text = excluded.text;

  -- Dare: Thách (42 câu)
insert into public.questions (external_key, kind, category, intimacy_level, text) values
  ('dare-01', 'dare', 'fun', 1, 'Nhắn cho người ấy một chuỗi 10 emoji mô tả lại cảm xúc của bạn lúc này.'),
  ('dare-02', 'dare', 'fun', 1, 'Bắt chước một thói quen hoặc giọng điệu đặc trưng của người ấy trong 15 giây.'),
  ('dare-03', 'dare', 'fun', 1, 'Chụp một bức ảnh tự sướng với biểu cảm mặt xấu hài hước nhất và gửi ngay cho người ấy.'),
  ('dare-04', 'dare', 'fun', 1, 'Hát chay một câu điệp khúc trong bài hát tình yêu mà cả hai đứa đều thích.'),
  ('dare-05', 'dare', 'fun', 1, 'Đọc to 3 tin nhắn ngọt ngào đầu tiên mà hai người từng nhắn cho nhau.'),
  ('dare-06', 'dare', 'fun', 1, 'Làm biểu cảm hình trái tim bằng tay và nháy mắt đáng yêu với người ấy.'),
  ('dare-07', 'dare', 'fun', 1, 'Nói câu "Em/Anh yêu người ấy nhất trên đời" bằng chất giọng hoạt hình ngộ nghĩnh.'),
  ('dare-08', 'dare', 'fun', 1, 'Tìm một vật màu hồng trong phòng và giải thích vì sao nó tượng trưng cho tình yêu của hai đứa.'),
  ('dare-09', 'dare', 'fun', 1, 'Bắt chước tiếng một con vật dễ thương (mèo con, cún con) để xin người ấy một cái ôm.'),
  ('dare-10', 'dare', 'fun', 1, 'Tự chụp một góc bàn làm việc hoặc căn phòng kèm một lời chúc ngọt ngào gửi người ấy.'),
  ('dare-11', 'dare', 'discover', 2, 'Kể tên 5 điều về thói quen ăn uống của người ấy mà bạn nhớ rõ như lòng bàn tay.'),
  ('dare-12', 'dare', 'discover', 2, 'Gửi cho người ấy một bài hát trên Spotify/YouTube kèm lời nhắn: "Bài này làm tớ nhớ cậu".'),
  ('dare-13', 'dare', 'discover', 2, 'Đổi biệt danh của người ấy trên ứng dụng nhắn tin thành một cái tên siêu ngọt ngào trong 24 giờ.'),
  ('dare-14', 'dare', 'discover', 2, 'Kể lại chi tiết trang phục người ấy mặc trong buổi hẹn hò gần đây nhất.'),
  ('dare-15', 'dare', 'discover', 2, 'Ghi âm một đoạn voice note 10 giây chúc người ấy một ngày thật tuyệt vời.'),
  ('dare-16', 'dare', 'discover', 2, 'Lấy điện thoại ra chụp ảnh bàn tay của người ấy (hoặc bàn tay hai đứa đan vào nhau).'),
  ('dare-17', 'dare', 'discover', 2, 'Viết nhanh 3 tính từ mô tả chính xác nhất sức hút của người ấy.'),
  ('dare-18', 'dare', 'discover', 2, 'Tìm lại bức ảnh chụp chung đầu tiên của hai đứa và gửi lại vào tin nhắn.'),
  ('dare-19', 'dare', 'discover', 2, 'Nhắm mắt lại và để người ấy chạm nhẹ vào trán hoặc mũi bạn trong 5 giây.'),
  ('dare-20', 'dare', 'discover', 2, 'Hứa sẽ chuẩn bị một món ăn hoặc thức uống người ấy thích trong buổi gặp tới.'),
  ('dare-21', 'dare', 'emotion', 3, 'Mát-xa vai hoặc gáy cho người ấy nhẹ nhàng trong vòng 2 phút.'),
  ('dare-22', 'dare', 'emotion', 3, 'Nhìn thẳng vào mắt người ấy trong 30 giây không chớp mắt và mỉm cười.'),
  ('dare-23', 'dare', 'emotion', 3, 'Dành cho người ấy một cái ôm thật chặt từ phía sau (hoặc ôm ấm áp) trong 20 giây.'),
  ('dare-24', 'dare', 'emotion', 3, 'Hôn nhẹ lên trán hoặc má người ấy và nói lời cảm ơn vì đã luôn ở bên.'),
  ('dare-25', 'dare', 'emotion', 3, 'Kể 3 điều cụ thể mà bạn vô cùng biết ơn người ấy trong tuần vừa qua.'),
  ('dare-26', 'dare', 'emotion', 3, 'Thì thầm vào tai người ấy một điều ngọt ngào mà bạn chưa từng thổ lộ trước đây.'),
  ('dare-27', 'dare', 'emotion', 3, 'Nắm chặt tay người ấy và đặt lên ngực mình để người ấy cảm nhận nhịp đập.'),
  ('dare-28', 'dare', 'emotion', 3, 'Vuốt nhẹ mái tóc người ấy và nói một lời khen ngợi chân thành nhất.'),
  ('dare-29', 'dare', 'emotion', 3, 'Viết một mẩu giấy nhỏ (hoặc tin nhắn ghi nhớ) với lời chúc yêu thương giấu vào túi áo người ấy.'),
  ('dare-30', 'dare', 'emotion', 3, 'Để người ấy chọn trang phục hoặc kiểu tóc cho bạn trong buổi hẹn hò tiếp theo.'),
  ('dare-31', 'dare', 'deep', 4, 'Viết một đoạn văn ngắn 3-4 câu bày tỏ lý do bạn chọn đồng hành cùng người ấy.'),
  ('dare-32', 'dare', 'deep', 4, 'Cùng người ấy nhắm mắt tưởng tượng về chuyến du lịch trăng mật trong mơ và kể lại.'),
  ('dare-33', 'dare', 'deep', 4, 'Nói lời xin lỗi chân thành về một lần bạn từng vô tâm hoặc làm người ấy buồn.'),
  ('dare-34', 'dare', 'deep', 4, 'Bật một bản nhạc không lời nhẹ nhàng và cùng người ấy khiêu vũ chậm rãi trong phòng.'),
  ('dare-35', 'dare', 'deep', 4, 'Kể cho người ấy nghe về khoảnh khắc bạn nhận ra tình cảm của mình dành cho họ là thật lòng.'),
  ('dare-36', 'dare', 'deep', 4, 'Trao cho người ấy "quyền năng đặc biệt" được yêu cầu bạn làm một điều bất kỳ trong ngày mai.'),
  ('dare-37', 'dare', 'deep', 4, 'Tựa đầu vào vai người ấy và cùng lắng nghe hơi thở bình yên trong 1 phút.'),
  ('dare-38', 'dare', 'deep', 4, 'Nói một lời hứa chân thành về tương lai mà bạn quyết tâm sẽ thực hiện cho người ấy.'),
  ('dare-39', 'dare', 'deep', 4, 'Chia sẻ một ước mơ thầm kín nhất của bạn và đề nghị người ấy cùng bạn chinh phục nó.'),
  ('dare-40', 'dare', 'deep', 4, 'Cùng người ấy lập một danh sách 3 điều hai đứa sẽ cùng thực hiện trước khi hết năm nay.'),
  ('dare-41', 'dare', 'emotion', 3, 'Lấy tay xoa ấm bàn tay người ấy và đặt lên má mình.'),
  ('dare-42', 'dare', 'deep', 4, 'Trao một nụ hôn nồng nàn kéo dài ít nhất 10 giây.')
on conflict (external_key) do update set text = excluded.text;

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

-- ---------- Learn: Chủ đề 2 - Cảm xúc (emotions) ----------
insert into public.vocabulary_words
  (external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level) values
  ('emotions-grateful',   'grateful',   '/ˈɡreɪtfl/',   'adjective', 'Biết ơn, cảm kích',        'I feel so grateful to have you by my side.',               'Tôi cảm thấy rất biết ơn khi có bạn bên cạnh.',                 'emotions', 'A2'),
  ('emotions-cherish',    'cherish',    '/ˈtʃerɪʃ/',    'verb',      'Trân quý, nâng niu',       'I cherish every moment we spend together.',                 'Tôi trân quý từng khoảnh khắc chúng ta bên nhau.',              'emotions', 'B1'),
  ('emotions-comfort',    'comfort',    '/ˈkʌmfət/',    'noun',      'Sự an ủi, niềm an tâm',    'Your gentle hug brought me great comfort.',                 'Cái ôm dịu dàng của bạn mang lại cho tôi niềm an ủi to lớn.',   'emotions', 'B1'),
  ('emotions-anxious',    'anxious',    '/ˈæŋkʃəs/',    'adjective', 'Lo lắng, bồn chồn',        'He felt anxious before their first date.',                  'Anh ấy cảm thấy bồn chồn trước buổi hẹn đầu tiên.',             'emotions', 'B1'),
  ('emotions-passionate', 'passionate', '/ˈpæʃənət/',   'adjective', 'Đam mê, nồng nhiệt',       'They shared a passionate love story.',                      'Họ đã sẻ chia một câu chuyện tình yêu nồng nhiệt.',             'emotions', 'B2'),
  ('emotions-relieved',   'relieved',   '/rɪˈliːvd/',   'adjective', 'Nhẹ nhõm, an lòng',        'I was relieved to hear your sweet voice.',                  'Tôi thấy thật nhẹ nhõm khi được nghe giọng nói ngọt ngào của bạn.', 'emotions', 'A2'),
  ('emotions-affection',  'affection',  '/əˈfekʃn/',    'noun',      'Tình cảm tha thiết, trìu mến','She showed her affection with a warm smile.',            'Cô ấy thể hiện sự trìu mến bằng một nụ cười ấm áp.',            'emotions', 'B1'),
  ('emotions-cheerful',   'cheerful',   '/ˈtʃɪəfl/',    'adjective', 'Vui tươi, rạng rỡ',        'Your cheerful laughter always brightens my day.',           'Tiếng cười vui tươi của bạn luôn làm ngày của tôi sáng bừng.',  'emotions', 'A2'),
  ('emotions-sympathy',   'sympathy',   '/ˈsɪmpəθi/',   'noun',      'Sự đồng cảm, trắc ẩn',     'He listened to her worries with deep sympathy.',            'Anh ấy lắng nghe những muộn phiền của cô với sự đồng cảm sâu sắc.', 'emotions', 'B1'),
  ('emotions-touched',    'touched',    '/tʌtʃt/',      'adjective', 'Xúc động, cảm động',       'She was deeply touched by his thoughtful surprise.',        'Cô ấy vô cùng cảm động trước bất ngờ chu đáo của anh.',         'emotions', 'B1')
on conflict (external_key) do nothing;

insert into public.vocabulary_collocations (word_id, phrase, position)
select w.id, c.phrase, c.pos
  from (values
    ('emotions-grateful',   'feel grateful', 1),        ('emotions-grateful',   'deeply grateful', 2),
    ('emotions-cherish',    'cherish the moment', 1),   ('emotions-cherish',    'cherish a memory', 2),
    ('emotions-comfort',    'bring comfort', 1),        ('emotions-comfort',    'find comfort', 2),
    ('emotions-anxious',    'feel anxious', 1),         ('emotions-anxious',    'anxious about something', 2),
    ('emotions-passionate', 'passionate love', 1),      ('emotions-passionate', 'passionate about life', 2),
    ('emotions-relieved',   'feel relieved', 1),        ('emotions-relieved',   'greatly relieved', 2),
    ('emotions-affection',  'show affection', 1),       ('emotions-affection',  'deep affection', 2),
    ('emotions-cheerful',   'cheerful smile', 1),       ('emotions-cheerful',   'cheerful mood', 2),
    ('emotions-sympathy',   'feel sympathy', 1),        ('emotions-sympathy',   'express sympathy', 2),
    ('emotions-touched',    'deeply touched', 1),       ('emotions-touched',    'touched by kindness', 2)
  ) as c(key, phrase, pos)
  join public.vocabulary_words w on w.external_key = c.key
on conflict (word_id, phrase) do nothing;


-- ---------- Learn: Chủ đề 3 - Hẹn hò (dating) ----------
insert into public.vocabulary_words
  (external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level) values
  ('dating-attracted',   'attracted',   '/əˈtræktɪd/',   'adjective', 'Bị cuốn hút, say mê',      'I was attracted to your kind eyes from the start.',         'Tôi đã bị cuốn hút bởi ánh mắt hiền từ của bạn ngay từ đầu.',   'dating', 'A2'),
  ('dating-confess',     'confess',     '/kənˈfes/',     'verb',      'Thổ lộ, bày tỏ tình cảm',   'It took courage to confess my true feelings to you.',       'Tôi đã phải lấy hết can đảm để thổ lộ tình cảm thật lòng với bạn.', 'dating', 'B1'),
  ('dating-memorable',   'memorable',   '/ˈmemərəbl/',   'adjective', 'Đáng nhớ, khó quên',       'Our first anniversary was a truly memorable evening.',      'Kỷ niệm một năm ngày yêu của chúng mình là một buổi tối khó quên.', 'dating', 'B1'),
  ('dating-appointment', 'appointment', '/əˈpɔɪntmənt/', 'noun',      'Cuộc hẹn, buổi hẹn',       'We made an appointment for a romantic rooftop dinner.',     'Chúng mình đã lên lịch hẹn ăn tối lãng mạn trên tầng thượng.',  'dating', 'A2'),
  ('dating-romantic',    'romantic',    '/rəʊˈmæntɪk/',  'adjective', 'Lãng mạn, nên thơ',        'Walking under the autumn leaves was so romantic.',          'Đi dạo dưới hàng cây mùa thu thật là lãng mạn.',                'dating', 'A2'),
  ('dating-promise',     'promise',     '/ˈprɒmɪs/',     'noun',      'Lời hứa, lời hẹn ước',     'A promise to stay together through thick and thin.',        'Một lời hứa sẽ luôn bên nhau dù thuận lợi hay khó khăn.',       'dating', 'A2'),
  ('dating-intimate',    'intimate',    '/ˈɪntɪmət/',    'adjective', 'Thân mật, gần gũi',        'They enjoyed an intimate candlelit dinner.',                'Họ tận hưởng một bữa tối thân mật dưới ánh nến.',               'dating', 'B2'),
  ('dating-compliment',  'compliment',  '/ˈkɒmplɪmənt/', 'noun',      'Lời khen ngợi',            'He paid her a sincere compliment on her pretty dress.',     'Anh ấy dành cho cô một lời khen chân thành về chiếc váy xinh.', 'dating', 'B1'),
  ('dating-admire',      'admire',      '/ədˈmaɪər/',    'verb',      'Ngưỡng mộ, trân trọng',    'I always admire your patience and gentle heart.',           'Tôi luôn ngưỡng mộ sự kiên nhẫn và trái tim dịu dàng của bạn.', 'dating', 'B1'),
  ('dating-commitment',  'commitment',  '/kəˈmɪtmənt/',  'noun',      'Sự cam kết, gắn bó',       'True love requires trust and long-term commitment.',        'Tình yêu đích thực cần sự tin tưởng và cam kết gắn bó lâu dài.','dating', 'B2')
on conflict (external_key) do nothing;

insert into public.vocabulary_collocations (word_id, phrase, position)
select w.id, c.phrase, c.pos
  from (values
    ('dating-attracted',   'attracted to someone', 1),   ('dating-attracted',   'deeply attracted', 2),
    ('dating-confess',     'confess love', 1),           ('dating-confess',     'confess feelings', 2),
    ('dating-memorable',   'memorable experience', 1),   ('dating-memorable',   'memorable trip', 2),
    ('dating-appointment', 'make an appointment', 1),    ('dating-appointment', 'keep an appointment', 2),
    ('dating-romantic',    'romantic dinner', 1),        ('dating-romantic',    'romantic gesture', 2),
    ('dating-promise',     'keep a promise', 1),         ('dating-promise',     'make a promise', 2),
    ('dating-intimate',    'intimate moment', 1),        ('dating-intimate',    'intimate atmosphere', 2),
    ('dating-compliment',  'pay a compliment', 1),       ('dating-compliment',  'receive a compliment', 2),
    ('dating-admire',      'admire someone', 1),         ('dating-admire',      'admire the view', 2),
    ('dating-commitment',  'make a commitment', 1),      ('dating-commitment',  'long-term commitment', 2)
  ) as c(key, phrase, pos)
  join public.vocabulary_words w on w.external_key = c.key
on conflict (word_id, phrase) do nothing;
-- ---------- Learn: Chủ đề 4 - Ăn uống (food_dining) ----------
insert into public.vocabulary_words
  (external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level) values
  ('food-delicious',  'delicious',  '/dɪˈlɪʃəs/',    'adjective', 'Thơm ngon, đậm đà',         'This homemade pasta tastes absolutely delicious.',         'Món mì ý tự làm này có hương vị thực sự thơm ngon.',            'food_dining', 'A1'),
  ('food-flavor',     'flavor',     '/ˈfleɪvər/',    'noun',      'Hương vị, mùi vị',          'The ice cream has a rich chocolate flavor.',               'Cây kem có hương vị sô-cô-la đậm đà.',                          'food_dining', 'A2'),
  ('food-recipe',     'recipe',     '/ˈresəpi/',     'noun',      'Công thức nấu ăn',          'Let us try cooking a new recipe together this weekend.',   'Cuối tuần này chúng mình hãy cùng thử nấu một công thức mới nhé.', 'food_dining', 'A2'),
  ('food-ingredient', 'ingredient', '/ɪnˈɡriːdiənt/','noun',      'Nguyên liệu món ăn',        'Fresh ingredients make the soup taste wonderful.',         'Các nguyên liệu tươi ngon làm cho món súp có vị tuyệt vời.',    'food_dining', 'B1'),
  ('food-beverage',   'beverage',   '/ˈbevərɪdʒ/',   'noun',      'Đồ uống, thức uống',        'Would you like a hot beverage on this chilly evening?',    'Bạn có muốn dùng một món đồ uống ấm vào buổi tối se lạnh này không?', 'food_dining', 'B1'),
  ('food-cuisine',    'cuisine',    '/kwɪˈziːn/',    'noun',      'Ẩm thực, phong cách ẩm thực','Vietnamese cuisine is famous for fresh flavors.',          'Ẩm thực Việt Nam nổi tiếng với hương vị thanh tươi đặc trưng.', 'food_dining', 'B1'),
  ('food-appetite',   'appetite',   '/ˈæpɪtaɪt/',    'noun',      'Sự ngon miệng, khẩu vị',    'Walking around the night market gave us a big appetite.',  'Đi dạo quanh chợ đêm khiến chúng mình ăn rất ngon miệng.',      'food_dining', 'B1'),
  ('food-spicy',      'spicy',      '/ˈspaɪsi/',     'adjective', 'Cay nồng, đậm gia vị',      'Do you prefer sweet or spicy street food?',                'Bạn thích ăn món ăn đường phố ngọt hay cay hơn?',               'food_dining', 'A2'),
  ('food-dessert',    'dessert',    '/dɪˈzɜːt/',     'noun',      'Món tráng miệng',           'We ordered a slice of cheesecake for dessert.',            'Chúng mình đã gọi một phần bánh phô mai làm món tráng miệng.',  'food_dining', 'A2'),
  ('food-atmosphere', 'atmosphere', '/ˈætməsfɪər/',  'noun',      'Bầu không khí, không gian', 'This little cafe has such a cozy atmosphere.',             'Quán cà phê nhỏ này có một bầu không khí thật ấm cúng.',        'food_dining', 'B1')
on conflict (external_key) do nothing;

insert into public.vocabulary_collocations (word_id, phrase, position)
select w.id, c.phrase, c.pos
  from (values
    ('food-delicious',  'delicious food', 1),       ('food-delicious',  'look delicious', 2),
    ('food-flavor',     'rich flavor', 1),          ('food-flavor',     'subtle flavor', 2),
    ('food-recipe',     'secret recipe', 1),        ('food-recipe',     'follow a recipe', 2),
    ('food-ingredient', 'fresh ingredients', 1),    ('food-ingredient', 'key ingredient', 2),
    ('food-beverage',   'hot beverage', 1),         ('food-beverage',   'cold beverage', 2),
    ('food-cuisine',    'traditional cuisine', 1),  ('food-cuisine',    'local cuisine', 2),
    ('food-appetite',   'good appetite', 1),        ('food-appetite',   'spoil your appetite', 2),
    ('food-spicy',      'spicy food', 1),           ('food-spicy',      'spicy dish', 2),
    ('food-dessert',    'order dessert', 1),        ('food-dessert',    'sweet dessert', 2),
    ('food-atmosphere', 'cozy atmosphere', 1),      ('food-atmosphere', 'romantic atmosphere', 2)
  ) as c(key, phrase, pos)
  join public.vocabulary_words w on w.external_key = c.key
on conflict (word_id, phrase) do nothing;
-- ---------- Learn: Chủ đề 5 - Du lịch (travel) ----------
insert into public.vocabulary_words
  (external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level) values
  ('travel-destination', 'destination', '/ˌdestɪˈneɪʃn/', 'noun',      'Điểm đến, đích đến',        'Da Lat is our favorite travel destination.',               'Đà Lạt là điểm đến du lịch yêu thích của hai đứa mình.',        'travel', 'A2'),
  ('travel-scenery',     'scenery',     '/ˈsiːnəri/',     'noun',      'Phong cảnh, cảnh sắc',      'The mountain scenery at sunrise was breathtaking.',        'Phong cảnh núi non lúc bình minh đẹp đến ngỡ ngàng.',           'travel', 'B1'),
  ('travel-journey',     'journey',     '/ˈdʒɜːni/',      'noun',      'Hành trình, chuyến đi',     'Life is a beautiful journey when I travel with you.',       'Cuộc sống là một hành trình tươi đẹp khi tôi được đi cùng bạn.','travel', 'A2'),
  ('travel-explore',     'explore',     '/ɪkˈsplɔːr/',    'verb',      'Khám phá, thám hiểm',       'We love to explore quiet alleys and hidden cafes.',        'Chúng mình thích khám phá những con hẻm yên tĩnh và quán cafe ẩn mình.', 'travel', 'A2'),
  ('travel-luggage',     'luggage',     '/ˈlʌɡɪdʒ/',      'noun',      'Hành lý, va li',            'Let me help carry your heavy luggage.',                    'Để tôi giúp bạn xách chỗ hành lý nặng này nhé.',                'travel', 'A2'),
  ('travel-souvenir',    'souvenir',    '/ˌsuːvəˈnɪər/',  'noun',      'Quà lưu niệm, kỷ vật',      'We bought a handmade souvenir to remember our beach trip.','Chúng mình đã mua quà lưu niệm thủ công để nhớ chuyến đi biển.','travel', 'A2'),
  ('travel-itinerary',   'itinerary',   '/aɪˈtɪnərəri/',  'noun',      'Lịch trình chuyến đi',      'She carefully planned a three-day travel itinerary.',       'Cô ấy đã lên kế hoạch tỉ mỉ cho lịch trình chuyến đi 3 ngày.',  'travel', 'B1'),
  ('travel-adventure',   'adventure',   '/ədˈventʃər/',   'noun',      'Cuộc phiêu lưu',            'Every trip with you feels like an exciting adventure.',     'Mỗi chuyến đi cùng bạn đều giống như một cuộc phiêu lưu kỳ thú.','travel', 'A2'),
  ('travel-breathtaking','breathtaking','/ˈbreθteɪkɪŋ/',  'adjective', 'Đẹp ngoạn mục, choáng ngợp','The view of the ocean from the cliff was breathtaking.',   'Cảnh biển nhìn từ vách đá đẹp ngoạn mục đến nghẹt thở.',       'travel', 'B2'),
  ('travel-wander',      'wander',      '/ˈwɒndər/',      'verb',      'Tản bộ, đi dạo thong dong', 'We spent the afternoon wandering through the old town.',    'Chúng mình đã dành buổi chiều tản bộ qua từng góc phố cổ.',     'travel', 'B1')
on conflict (external_key) do nothing;

insert into public.vocabulary_collocations (word_id, phrase, position)
select w.id, c.phrase, c.pos
  from (values
    ('travel-destination', 'popular destination', 1),   ('travel-destination', 'final destination', 2),
    ('travel-scenery',     'beautiful scenery', 1),     ('travel-scenery',     'mountain scenery', 2),
    ('travel-journey',     'long journey', 1),          ('travel-journey',     'safe journey', 2),
    ('travel-explore',     'explore the city', 1),      ('travel-explore',     'explore nature', 2),
    ('travel-luggage',     'pack luggage', 1),          ('travel-luggage',     'carry luggage', 2),
    ('travel-souvenir',    'buy a souvenir', 1),        ('travel-souvenir',    'souvenir shop', 2),
    ('travel-itinerary',   'travel itinerary', 1),      ('travel-itinerary',   'plan an itinerary', 2),
    ('travel-adventure',   'exciting adventure', 1),    ('travel-adventure',   'embark on an adventure', 2),
    ('travel-breathtaking','breathtaking view', 1),     ('travel-breathtaking','breathtaking sunset', 2),
    ('travel-wander',      'wander around', 1),         ('travel-wander',      'wander through the streets', 2)
  ) as c(key, phrase, pos)
  join public.vocabulary_words w on w.external_key = c.key
on conflict (word_id, phrase) do nothing;

-- ---------- Learn: Chủ đề 6 - Công việc & Học tập (work_study) ----------
insert into public.vocabulary_words
  (external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level) values
  ('work-achieve',      'achieve',      '/əˈtʃiːv/',      'verb',      'Đạt được, gặt hái',         'Together we can achieve all our personal goals.',           'Cùng nhau chúng ta có thể đạt được mọi mục tiêu cá nhân.',      'work_study', 'A2'),
  ('work-concentrate',  'concentrate',  '/ˈkɒnsntreɪt/',  'verb',      'Tập trung cao độ',          'I find it easier to concentrate when we study side by side.','Tôi thấy dễ tập trung hơn khi hai đứa cùng ngồi học cạnh nhau.','work_study', 'A2'),
  ('work-schedule',     'schedule',     '/ˈʃedjuːl/',     'noun',      'Lịch trình, thời gian biểu','We should balance our work schedule to spend time together.','Chúng mình nên cân đối lịch làm việc để dành thời gian cho nhau.','work_study', 'A2'),
  ('work-encourage',    'encourage',    '/ɪnˈkʌrɪdʒ/',    'verb',      'Động viên, khích lệ',       'You always encourage me whenever I face challenges at work.','Bạn luôn động viên tôi mỗi khi tôi gặp khó khăn trong công việc.','work_study', 'B1'),
  ('work-progress',     'progress',     '/ˈprəʊɡres/',    'noun',      'Sự tiến bộ, tiến triển',    'We are making great progress in learning English every day.','Chúng mình đang đạt được sự tiến bộ tuyệt vời khi học tiếng Anh.', 'work_study', 'A2'),
  ('work-deadline',     'deadline',     '/ˈdedlaɪn/',     'noun',      'Hạn chót, thời hạn nộp',    'After finishing a tight deadline, we celebrated together.', 'Sau khi vượt qua hạn chót gấp gáp, chúng mình đã ăn mừng cùng nhau.','work_study', 'B1'),
  ('work-effort',       'effort',       '/ˈefət/',        'noun',      'Nỗ lực, sự cố gắng',        'Success comes from daily continuous effort.',               'Thành công đến từ nỗ lực không ngừng mỗi ngày.',                 'work_study', 'A2'),
  ('work-priority',     'priority',     '/praɪˈɒrəti/',   'noun',      'Sự ưu tiên hàng đầu',       'Family and our relationship will always be my top priority.','Gia đình và tình cảm của hai ta sẽ luôn là ưu tiên hàng đầu của tôi.','work_study', 'B1'),
  ('work-inspire',      'inspire',      '/ɪnˈspaɪər/',    'verb',      'Truyền cảm hứng',           'Your hardworking attitude inspires me to do my best.',      'Tinh thần chăm chỉ của bạn truyền cảm hứng để tôi nỗ lực hết mình.','work_study', 'B1'),
  ('work-productivity', 'productivity', '/ˌprɒdʌkˈtɪvəti/','noun',     'Năng suất, hiệu quả làm việc','Studying in a quiet space greatly improves our productivity.','Học trong không gian yên tĩnh giúp cải thiện đáng kể năng suất.',  'work_study', 'B2')
on conflict (external_key) do nothing;

insert into public.vocabulary_collocations (word_id, phrase, position)
select w.id, c.phrase, c.pos
  from (values
    ('work-achieve',      'achieve a goal', 1),         ('work-achieve',      'achieve success', 2),
    ('work-concentrate',  'concentrate on studying', 1),('work-concentrate',  'help concentrate', 2),
    ('work-schedule',     'busy schedule', 1),          ('work-schedule',     'tight schedule', 2),
    ('work-encourage',    'encourage each other', 1),   ('work-encourage',    'strongly encourage', 2),
    ('work-progress',     'make progress', 1),          ('work-progress',     'steady progress', 2),
    ('work-deadline',     'meet a deadline', 1),        ('work-deadline',     'tight deadline', 2),
    ('work-effort',       'make an effort', 1),         ('work-effort',       'put effort into', 2),
    ('work-priority',     'top priority', 1),           ('work-priority',     'give priority to', 2),
    ('work-inspire',      'inspire someone', 1),        ('work-inspire',      'deeply inspire', 2),
    ('work-productivity', 'boost productivity', 1),     ('work-productivity', 'increase productivity', 2)
  ) as c(key, phrase, pos)
  join public.vocabulary_words w on w.external_key = c.key
on conflict (word_id, phrase) do nothing;


