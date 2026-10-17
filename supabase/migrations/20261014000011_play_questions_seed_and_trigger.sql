-- =====================================================================
-- PHASE 3: PLAY — SEED QUESTIONS & TRIGGER REFINEMENT
-- Thêm >= 72 câu Daily Question (4 nhóm: fun, discover, emotion, deep, mức 1-4)
-- Thêm >= 42 câu Truth (mức 1-4)
-- Thêm >= 42 câu Dare (mức 1-4)
-- Cập nhật complete_session_when_both_answered
-- =====================================================================

-- Cập nhật trigger hoàn thành phiên chơi
create or replace function public.complete_session_when_both_answered()
returns trigger
language plpgsql security definer
set search_path = public
as $
declare
  v_is_daily boolean;
begin
  select is_daily into v_is_daily from public.game_sessions where id = new.session_id;
  if (coalesce(v_is_daily, false) and (select count(*) from public.game_answers where session_id = new.session_id) >= 2)
     or (not coalesce(v_is_daily, false) and (select count(*) from public.game_answers where session_id = new.session_id) >= 1) then
    update public.game_sessions
       set status = 'completed', completed_at = now()
     where id = new.session_id and status <> 'completed';
  end if;
  return null;
end;
$;

-- Cập nhật get_or_create_daily_session phòng vệ timezone rỗng
create or replace function public.get_or_create_daily_session()
returns public.game_sessions
language plpgsql security definer
set search_path = public
as $
declare
  v_couple uuid := public.current_couple_id();
  v_tz     text;
  v_date   date;
  v_game   uuid;
  v_q      uuid;
  v_row    public.game_sessions;
begin
  if v_couple is null then raise exception 'NOT_IN_COUPLE' using errcode = 'P0001'; end if;

  select timezone into v_tz from public.couples where id = v_couple;
  v_tz := coalesce(nullif(v_tz, ''), 'Asia/Ho_Chi_Minh');
  v_date := (now() at time zone v_tz)::date;

  select * into v_row from public.game_sessions
   where couple_id = v_couple and is_daily and session_date = v_date;
  if found then return v_row; end if;

  select id into v_game from public.games where slug = 'daily_question';

  -- Ưu tiên câu cặp này chưa từng gặp
  select q.id into v_q
    from public.questions q
   where q.kind = 'daily' and q.is_active
     and not exists (select 1 from public.game_sessions s
                      where s.couple_id = v_couple and s.question_id = q.id)
   order by random() limit 1;

  -- Hết câu mới: lấy câu dùng lâu nhất
  if v_q is null then
    select q.id into v_q
      from public.questions q
      left join lateral (
        select max(s.session_date) as last_used
          from public.game_sessions s
         where s.couple_id = v_couple and s.question_id = q.id
      ) u on true
     where q.kind = 'daily' and q.is_active
     order by u.last_used nulls first, random() limit 1;
  end if;

  if v_q is null then raise exception 'NO_QUESTION_AVAILABLE' using errcode = 'P0001'; end if;

  insert into public.game_sessions (couple_id, game_id, question_id, session_date, is_daily, created_by)
  values (v_couple, v_game, v_q, v_date, true, auth.uid())
  on conflict (couple_id, session_date) where is_daily do nothing
  returning * into v_row;

  if not found then
    select * into v_row from public.game_sessions

-- ---------- DAILY: VUI VẺ (FUN) - 18 câu ----------
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
  ('daily-fun-18', 'daily', 'fun', 1, 'Nếu một ngày hai đứa bị lạc trên đảo hoang, bạn nghĩ ai sẽ tìm ra lửa trước?')
on conflict (external_key) do update set text = excluded.text, category = excluded.category, intimacy_level = excluded.intimacy_level;

     where couple_id = v_couple and is_daily and session_date = v_date;
  end if;

-- ---------- DAILY: TÌM HIỂU (DISCOVER) - 18 câu ----------
insert into public.questions (external_key, kind, category, intimacy_level, text) values
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
on conflict (external_key) do update set text = excluded.text, category = excluded.category, intimacy_level = excluded.intimacy_level;

-- ---------- DAILY: CẢM XÚC (EMOTION) - 18 câu ----------
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
  ('daily-emotion-18', 'daily', 'emotion', 3, 'Nếu hôm nay chỉ được nói một câu nhắn nhủ tới người ấy, bạn sẽ nói điều gì?')
on conflict (external_key) do update set text = excluded.text, category = excluded.category, intimacy_level = excluded.intimacy_level;

  return v_row;
end;
$;

-- ---------- DAILY: SÂU SẮC (DEEP) - 18 câu ----------
insert into public.questions (external_key, kind, category, intimacy_level, text) values
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
on conflict (external_key) do update set text = excluded.text, category = excluded.category, intimacy_level = excluded.intimacy_level;



-- ---------- TRUTH: THẬT (42 câu, mức 1-4) ----------
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
on conflict (external_key) do update set text = excluded.text, category = excluded.category, intimacy_level = excluded.intimacy_level;

-- ---------- DARE: THÁCH (42 câu, mức 1-4) ----------
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
on conflict (external_key) do update set text = excluded.text, category = excluded.category, intimacy_level = excluded.intimacy_level;

notify pgrst, 'reload schema';

