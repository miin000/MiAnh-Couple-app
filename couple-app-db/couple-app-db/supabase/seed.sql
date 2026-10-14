-- =====================================================================
-- SEED MẪU — idempotent (chạy lại nhiều lần không trùng nhờ external_key)
-- Đây là BỘ MẪU ĐỦ ĐỂ CHẠY THỬ và là KHUÔN cho agent nhân rộng nội dung.
-- Quy tắc khi thêm nội dung:
--   * random_items / questions / vocabulary_words: LUÔN có external_key duy nhất
--     + "on conflict (external_key) do nothing"
--   * Một bài học = đúng 10 từ, position 1..10
--   * Không đổi id/external_key của từ đã có (tiến độ người dùng tham chiếu id)
-- =====================================================================

-- ---------- Discover ----------
insert into public.random_items (external_key, kind, title, description, tip, price_level) values
  ('food-pho-bo',      'food',  'Phở bò',                   'Tô phở nóng hổi, nước dùng đậm đà.',            'Gọi thêm quẩy chấm nước phở.',            1),
  ('food-bun-cha',     'food',  'Bún chả',                  'Chả nướng thơm ăn cùng bún và nước chấm chua ngọt.', 'Ăn kèm nem rán cho đủ vị.',            1),
  ('drink-tra-dao',    'drink', 'Trà đào cam sả',           'Mát, thơm, hợp ngồi tán gẫu lâu.',               'Chọn ít đá để uống được lâu.',            1),
  ('drink-ca-phe-muoi','drink', 'Cà phê muối',              'Vị mặn nhẹ cân bằng với cà phê đậm.',            'Thử chung một ly rồi so sánh khẩu vị.',   1),
  ('place-cafe-sach',  'place', 'Quán cà phê có sách',      'Không gian yên tĩnh để đọc và trò chuyện nhỏ.',   'Mỗi người chọn một cuốn đọc cho người kia.', 2),
  ('place-cong-vien',  'place', 'Công viên gần nhà',        'Đi dạo, ngồi ghế đá, ngắm hoàng hôn.',           'Mang theo đồ uống và nhạc nhẹ.',          1),
  ('act-nau-an',       'activity','Cùng nấu một món chưa từng nấu','Chọn công thức mới và nấu cùng nhau.',    'Phân vai: một người sơ chế, một người nấu.', 2),
  ('act-anh-film',     'activity','Chụp ảnh ở một con phố lạ','Đi bộ vào một con phố chưa từng đến và chụp lại.','Mỗi người chụp 5 tấm rồi chọn tấm đẹp nhất.', 1)
on conflict (external_key) do nothing;

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
