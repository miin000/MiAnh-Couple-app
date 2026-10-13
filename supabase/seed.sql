-- ==============================================================================
-- Seed Data: Sample questions, vocabulary, and random items for mianh
-- ==============================================================================

-- 1. Sample Games
INSERT INTO public.games (slug, name, type)
VALUES
    ('daily-question', 'Câu hỏi mỗi ngày', 'question'),
    ('truth-or-dare', 'Nói thật hay thử thách', 'truth_or_dare')
ON CONFLICT (slug) DO NOTHING;

-- 2. Sample Random Items (Food, Drink, Place, Activity)
INSERT INTO public.random_items (kind, title, description, tip, price_level, is_active)
VALUES
    ('food', 'Lẩu Thái hải sản', 'Nồi lẩu cay nồng ấm bụng, thích hợp cho buổi tối se lạnh.', 'Gọi thêm tôm và nấm kim châm nhé!', 2, true),
    ('food', 'Bún chả Hà Nội', 'Thịt nướng thơm lừng ăn kèm nem rán giòn rụm.', 'Nên ăn ở quán có chả que tre.', 1, true),
    ('food', 'Cơm tấm sườn bì chả', 'Món ăn quen thuộc nhưng luôn ấm áp khi đi cùng nhau.', 'Thêm trứng ốp la lòng đào.', 1, true),
    ('drink', 'Trà đào cam sả', 'Vị ngọt thanh, thơm mùi sả tươi mát.', 'Uống ít đá để cảm nhận trọn vị.', 1, true),
    ('drink', 'Cà phê muối', 'Béo ngậy của kem mặn hòa quyện cà phê đậm đà.', 'Khuấy đều trước khi uống.', 1, true),
    ('place', 'Hồ Tây hoàng hôn', 'Cùng nhau ngắm mặt trời lặn bên ly trà đá vỉa hè.', 'Đi vào khoảng 17h30 chiều.', 1, true),
    ('place', 'Nhà sách / Quán cà phê sách', 'Một buổi chiều yên tĩnh đọc sách cạnh nhau.', 'Chọn góc gần cửa sổ nhiều ánh sáng.', 1, true),
    ('activity', 'Chụp ảnh photobooth', 'Lưu lại 4 khung hình ngốc xếch nhưng đáng yêu.', 'Tự mang thêm phụ kiện cute.', 1, true),
    ('activity', 'Cùng nấu một bữa ăn', 'Một người phụ nhặt rau, một người nấu chính.', 'Bật playlist tình ca nhẹ nhàng.', 1, true)
ON CONFLICT DO NOTHING;

-- 3. Sample Questions
INSERT INTO public.questions (kind, category, intimacy_level, text, is_active)
VALUES
    ('daily', 'emotion', 2, 'Điều nhỏ bé nào gần đây khiến bạn nghĩ đến người ấy?', true),
    ('daily', 'fun', 1, 'Khoảnh khắc nào của người ấy khiến bạn bất giác mỉm cười?', true),
    ('daily', 'deep', 3, 'Điều gì bạn muốn cùng người ấy thực hiện trong 5 năm tới?', true),
    ('daily', 'discover', 2, 'Một bài hát mà bạn luôn muốn chia sẻ cho người ấy nghe là gì?', true),
    ('truth', 'fun', 1, 'Ấn tượng đầu tiên lúc mới gặp đối phương là gì?', true),
    ('truth', 'emotion', 3, 'Điều gì ở đối phương khiến bạn cảm thấy an tâm nhất?', true),
    ('dare', 'fun', 1, 'Ôm đối phương thật chặt trong vòng 30 giây.', true),
    ('dare', 'emotion', 2, 'Nói 3 lời khen chân thành nhất dành cho đối phương ngay lúc này.', true)
ON CONFLICT DO NOTHING;

-- 4. Sample Vocabulary Words
INSERT INTO public.vocabulary_words (word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level, is_active)
VALUES
    ('Improve', '/ɪmˈpruːv/', 'verb', 'Cải thiện, làm cho tốt hơn', 'We always try to improve our relationship.', 'Tụi mình luôn cố gắng vun đắp tình cảm tốt đẹp hơn.', 'Love & Life', 'A2', true),
    ('Cherish', '/ˈtʃer.ɪʃ/', 'verb', 'Trân trọng, yêu thương sâu sắc', 'I cherish every moment we spend together.', 'Mình trân trọng từng khoảnh khắc tụi mình bên nhau.', 'Love & Life', 'B1', true),
    ('Comfort', '/ˈkʌm.fət/', 'noun', 'Sự an ủi, cảm giác bình yên', 'Your hug brings me so much comfort.', 'Cái ôm của bạn mang lại cho mình rất nhiều bình yên.', 'Emotions', 'A2', true),
    ('Memorable', '/ˈmem.ər.ə.bəl/', 'adjective', 'Đáng nhớ, khó quên', 'That trip was truly memorable.', 'Chuyến đi đó thực sự rất đáng nhớ.', 'Memories', 'B1', true),
    ('Promise', '/ˈprɒm.ɪs/', 'noun', 'Lời hứa, lời thề nguyện', 'A promise kept is love spoken.', 'Giữ lời hứa chính là cách bày tỏ tình yêu.', 'Love & Life', 'A2', true)
ON CONFLICT DO NOTHING;
