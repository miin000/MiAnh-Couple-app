-- =====================================================================
-- PHASE 4 — LEARN TOGETHER: 60 TỪ VỰNG, 6 CHỦ ĐỀ, CHỌN BÀI HỌC VÀ TIẾN ĐỘ CÁ NHÂN
-- =====================================================================

-- 1. Hàm get_todays_lesson cải tiến: tự động fallback gán bài tiếp theo chưa dùng nếu chưa có bài hôm nay
create or replace function public.get_or_create_todays_lesson()
returns public.daily_lessons
language plpgsql security definer
set search_path = public
as $
declare
  v_couple uuid := public.current_couple_id();
  v_tz     text;
  v_today  date;
  v_row    public.daily_lessons;
  v_topics text[] := array['communication', 'emotions', 'dating', 'food_dining', 'travel', 'work_study'];
  v_topic  text;
  v_idx    int;
begin
  if v_couple is null then raise exception 'NOT_IN_COUPLE' using errcode = 'P0001'; end if;
  select coalesce(nullif(timezone, ''), 'Asia/Ho_Chi_Minh') into v_tz from public.couples where id = v_couple;
  v_today := (now() at time zone coalesce(v_tz, 'Asia/Ho_Chi_Minh'))::date;

  -- 1. Thử tìm bài học đã được gán cho chính xác ngày hôm nay
  select * into v_row from public.daily_lessons
   where is_published and lesson_date = v_today;
  if found then
    return v_row;
  end if;

  -- 2. Nếu chưa có bài học cho hôm nay, chọn chủ đề tiếp theo theo vòng lặp (round-robin)
  select count(*) into v_idx from public.daily_lessons;
  v_topic := v_topics[(v_idx % array_length(v_topics, 1)) + 1];

  insert into public.daily_lessons (lesson_date, topic, level, is_published)
  values (v_today, v_topic, 'A2', true)
  on conflict (lesson_date) do update set is_published = true
  returning * into v_row;

  -- Gắn đúng 10 từ của chủ đề đó vào lesson_words
  insert into public.lesson_words (lesson_id, word_id, position)
  select v_row.id, w.id, (row_number() over (order by w.external_key))::smallint
    from public.vocabulary_words w
   where w.topic = v_topic and w.is_active
   limit 10
  on conflict (lesson_id, word_id) do nothing;

  return v_row;
end;
$;

-- Đồng bộ hàm get_todays_lesson() gọi sang get_or_create_todays_lesson()
create or replace function public.get_todays_lesson()
returns public.daily_lessons
language plpgsql security definer
set search_path = public
as $
begin
  return public.get_or_create_todays_lesson();
end;
$;

-- 2. Cải tiến partner_progress_summary: đảm bảo luôn trả về dòng của cả hai người kể cả khi chưa ai học từ nào
create or replace function public.partner_progress_summary(p_lesson_id uuid)
returns table (user_id uuid, learned_count int, mastered_count int, total_words int)
language sql stable security definer
set search_path = public
as $
  select m.user_id,
         count(distinct upw.word_id)::int as learned_count,
         count(distinct case when upw.status = 'mastered' then upw.word_id end)::int as mastered_count,
         (select count(*) from public.lesson_words where lesson_id = p_lesson_id)::int as total_words
    from public.couple_members m
    join public.couple_members me
      on me.couple_id = m.couple_id and me.user_id = auth.uid() and me.left_at is null
    left join public.lesson_words lw on lw.lesson_id = p_lesson_id
    left join public.user_word_progress upw
      on upw.user_id = m.user_id and upw.word_id = lw.word_id
   where m.left_at is null
   group by m.user_id
$;

-- =====================================================================
-- 3. NẠP 60 TỪ VỰNG TIẾNG ANH (6 CHỦ ĐỀ × 10 TỪ)
-- =====================================================================

-- Chủ đề 1: Giao tiếp hằng ngày (communication)
insert into public.vocabulary_words
  (external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level) values
  ('communication-improve',      'improve',      '/ɪmˈpruːv/',       'verb', 'Cải thiện, tiến bộ', 'I want to improve my speaking skills.',        'Tôi muốn cải thiện kỹ năng nói của mình.',                 'communication', 'A2'),
  ('communication-express',      'express',      '/ɪkˈspres/',       'verb', 'Bày tỏ, diễn đạt',   'It is hard for me to express my feelings in English.', 'Tôi thấy khó diễn đạt cảm xúc của mình bằng tiếng Anh.', 'communication', 'B1'),
  ('communication-explain',      'explain',      '/ɪkˈspleɪn/',      'verb', 'Giải thích',         'Can you explain what this word means?',        'Bạn có thể giải thích từ này nghĩa là gì không?',          'communication', 'A2'),
  ('communication-share',        'share',        '/ʃeər/',           'verb', 'Chia sẻ',            'I like to share my day with you.',             'Tôi thích chia sẻ một ngày của mình với bạn.',             'communication', 'A2'),
  ('communication-listen',       'listen',       '/ˈlɪsn/',          'verb', 'Lắng nghe',          'Please listen to me for a moment.',            'Làm ơn lắng nghe tôi một chút.',                           'communication', 'A1'),
  ('communication-understand',   'understand',   '/ˌʌndərˈstænd/',   'verb', 'Thấu hiểu, hiểu rõ', 'We understand each other very well.',          'Chúng tôi hiểu nhau rất rõ.',                              'communication', 'A2'),
  ('communication-mention',      'mention',      '/ˈmenʃn/',         'verb', 'Đề cập, nhắc đến',   'She forgot to mention the time.',              'Cô ấy quên đề cập đến thời gian.',                         'communication', 'B1'),
  ('communication-agree',        'agree',        '/əˈɡriː/',         'verb', 'Đồng ý, tán thành',  'I agree with your idea.',                      'Tôi đồng ý với ý kiến của bạn.',                           'communication', 'A2'),
  ('communication-conversation', 'conversation', '/ˌkɒnvərˈseɪʃn/', 'noun', 'Cuộc trò chuyện',    'We had a nice conversation at dinner.',       'Chúng tôi đã có một cuộc trò chuyện vui vẻ trong bữa tối.', 'communication', 'A2'),
  ('communication-message',      'message',      '/ˈmesɪdʒ/',        'noun', 'Tin nhắn, thông điệp','I will send you a message later.',            'Tôi sẽ gửi tin nhắn cho bạn sau.',                         'communication', 'A1')
on conflict (external_key) do update set
  word = excluded.word, ipa = excluded.ipa, part_of_speech = excluded.part_of_speech,
  meaning_vi = excluded.meaning_vi, example_en = excluded.example_en, example_vi = excluded.example_vi,
  topic = excluded.topic, level = excluded.level;

-- Collocations Chủ đề 1
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

-- Cấp quyền gọi hàm
grant execute on function public.get_or_create_todays_lesson() to authenticated;
grant execute on function public.get_todays_lesson() to authenticated;
grant execute on function public.partner_progress_summary(uuid) to authenticated;
-- Chủ đề 2: Cảm xúc (emotions)
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
on conflict (external_key) do update set
  word = excluded.word, ipa = excluded.ipa, part_of_speech = excluded.part_of_speech,
  meaning_vi = excluded.meaning_vi, example_en = excluded.example_en, example_vi = excluded.example_vi,
  topic = excluded.topic, level = excluded.level;

-- Collocations Chủ đề 2
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

grant execute on function public.record_word_review(uuid, boolean) to authenticated;

-- Chủ đề 3: Hẹn hò & Gắn kết (dating)
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
on conflict (external_key) do update set
  word = excluded.word, ipa = excluded.ipa, part_of_speech = excluded.part_of_speech,
  meaning_vi = excluded.meaning_vi, example_en = excluded.example_en, example_vi = excluded.example_vi,
  topic = excluded.topic, level = excluded.level;

-- Collocations Chủ đề 3
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
-- Chủ đề 4: Ăn uống & Thưởng thức (food_dining)
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
on conflict (external_key) do update set
  word = excluded.word, ipa = excluded.ipa, part_of_speech = excluded.part_of_speech,
  meaning_vi = excluded.meaning_vi, example_en = excluded.example_en, example_vi = excluded.example_vi,
  topic = excluded.topic, level = excluded.level;

-- Collocations Chủ đề 4
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
-- Chủ đề 5: Du lịch & Khám phá (travel)
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
on conflict (external_key) do update set
  word = excluded.word, ipa = excluded.ipa, part_of_speech = excluded.part_of_speech,
  meaning_vi = excluded.meaning_vi, example_en = excluded.example_en, example_vi = excluded.example_vi,
  topic = excluded.topic, level = excluded.level;

-- Collocations Chủ đề 5
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

-- Chủ đề 6: Học tập & Công việc (work_study)
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
on conflict (external_key) do update set
  word = excluded.word, ipa = excluded.ipa, part_of_speech = excluded.part_of_speech,
  meaning_vi = excluded.meaning_vi, example_en = excluded.example_en, example_vi = excluded.example_vi,
  topic = excluded.topic, level = excluded.level;

-- Collocations Chủ đề 6
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

-- =====================================================================
-- 4. BÀI HỌC HÔM NAY VÀ GẮN 10 TỪ VÀO LESSON_WORDS
-- =====================================================================
-- Tạo bài học hôm nay nếu chưa có
insert into public.daily_lessons (lesson_date, topic, level)
values ((now() at time zone 'Asia/Ho_Chi_Minh')::date, 'communication', 'A2')
on conflict (lesson_date) do nothing;

-- Gắn 10 từ vào bài học hôm nay
insert into public.lesson_words (lesson_id, word_id, position)
select l.id, w.id, (row_number() over (order by w.external_key))::smallint
  from public.daily_lessons l
  join public.vocabulary_words w on w.topic = l.topic and w.is_active
 where l.lesson_date = (now() at time zone 'Asia/Ho_Chi_Minh')::date
 limit 10
on conflict (lesson_id, word_id) do nothing;


