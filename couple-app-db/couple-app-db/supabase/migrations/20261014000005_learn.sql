-- =====================================================================
-- PHASE 4–5 — LEARN TOGETHER
-- Bộ 10 từ của ngày DÙNG CHUNG; tiến độ ghi nhớ (user_word_progress) RIÊNG từng người.
-- Mã lỗi: NOT_IN_COUPLE, NO_LESSON_AVAILABLE, INVALID_ARGUMENT, WORD_NOT_FOUND
-- Thuật toán ôn tập (Leitner) nằm trong apply_word_review — client KHÔNG tự tính.
--   hộp 1..5 ~ 1/2/4/7/14 ngày; đúng: hộp+1 (tối đa 5); sai: về hộp 1
--   status: hộp 1-2 = learning, 3-4 = review, 5 = mastered
-- =====================================================================

create table public.vocabulary_words (
  id             uuid primary key default gen_random_uuid(),  -- ID ổn định, KHÔNG đổi sau khi đã có tiến độ
  external_key   text unique,                                 -- khóa seed, ví dụ 'communication-improve'
  word           text not null check (char_length(word) between 1 and 80),
  ipa            text,
  part_of_speech text not null default 'other'
                 check (part_of_speech in ('noun','verb','adjective','adverb','preposition',
                                           'conjunction','pronoun','interjection','phrase','other')),
  meaning_vi     text not null,
  example_en     text,
  example_vi     text,
  topic          text not null default 'general',
  level          text check (level in ('A1','A2','B1','B2','C1','C2')),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index vocabulary_words_topic on public.vocabulary_words (topic, level) where is_active;
create trigger vocabulary_words_set_updated_at
  before update on public.vocabulary_words
  for each row execute function public.set_updated_at();

create table public.vocabulary_collocations (
  id       uuid primary key default gen_random_uuid(),
  word_id  uuid not null references public.vocabulary_words(id) on delete cascade,
  phrase   text not null check (char_length(phrase) between 1 and 120),
  position smallint not null default 0,
  unique (word_id, phrase)
);

create table public.daily_lessons (
  id           uuid primary key default gen_random_uuid(),
  lesson_date  date not null unique,                         -- ngày theo múi giờ cặp (mặc định Asia/Ho_Chi_Minh)
  topic        text not null,
  level        text check (level in ('A1','A2','B1','B2','C1','C2')),
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.lesson_words (
  lesson_id uuid not null references public.daily_lessons(id) on delete cascade,
  word_id   uuid not null references public.vocabulary_words(id),
  position  smallint not null check (position between 1 and 10),
  primary key (lesson_id, word_id),
  unique (lesson_id, position)
);

create table public.user_word_progress (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  word_id         uuid not null references public.vocabulary_words(id),
  status          text not null default 'new' check (status in ('new','learning','review','mastered')),
  box             smallint not null default 1 check (box between 1 and 5),
  next_review_at  timestamptz,
  correct_count   int not null default 0 check (correct_count >= 0),
  wrong_count     int not null default 0 check (wrong_count >= 0),
  first_seen_at   timestamptz not null default now(),
  last_reviewed_at timestamptz,
  updated_at      timestamptz not null default now(),
  primary key (user_id, word_id)
);
create index user_word_progress_due on public.user_word_progress (user_id, next_review_at);

create table public.vocabulary_quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  lesson_id  uuid references public.daily_lessons(id) on delete set null,
  kind       text not null check (kind in ('lesson', 'review')),
  total      smallint not null check (total >= 0),
  correct    smallint not null check (correct >= 0),
  created_at timestamptz not null default now(),
  check (correct <= total)
);
create index vocabulary_quiz_attempts_by_user on public.vocabulary_quiz_attempts (user_id, created_at desc);

create table public.vocabulary_quiz_answers (
  id            uuid primary key default gen_random_uuid(),
  attempt_id    uuid not null references public.vocabulary_quiz_attempts(id) on delete cascade,
  word_id       uuid not null references public.vocabulary_words(id),
  question_type text not null check (question_type in ('choose_meaning', 'choose_word', 'fill_blank')),
  is_correct    boolean not null
);
create index vocabulary_quiz_answers_by_attempt on public.vocabulary_quiz_answers (attempt_id);

create table public.couple_learning_challenges (
  id             uuid primary key default gen_random_uuid(),
  couple_id      uuid not null references public.couples(id) on delete cascade,
  lesson_id      uuid references public.daily_lessons(id) on delete set null,
  challenge_date date not null,
  challenge_type text not null check (challenge_type in ('use_words', 'guess_word', 'situation_dialog')),
  prompt         text not null,
  created_at     timestamptz not null default now(),
  unique (couple_id, challenge_date),
  unique (id, couple_id)
);

create table public.learning_challenge_submissions (
  id           uuid primary key default gen_random_uuid(),
  challenge_id uuid not null,
  couple_id    uuid not null,
  user_id      uuid not null references public.profiles(id),
  content      text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at   timestamptz not null default now(),
  foreign key (challenge_id, couple_id) references public.couple_learning_challenges (id, couple_id) on delete cascade,
  unique (challenge_id, user_id)
);

-- Mình đã nộp bài thử thách này chưa? (dùng trong RLS)
create or replace function public.has_submitted(p_challenge_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.learning_challenge_submissions
     where challenge_id = p_challenge_id and user_id = auth.uid()
  )
$$;

-- ---------- logic ôn tập: nội bộ (không cấp cho client) ----------
create or replace function public.apply_word_review(p_user uuid, p_word uuid, p_correct boolean)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_intervals int[] := array[1, 2, 4, 7, 14];
  v_old   smallint;
  v_box   smallint;
  v_status text;
begin
  if not exists (select 1 from public.vocabulary_words where id = p_word) then
    raise exception 'WORD_NOT_FOUND' using errcode = 'P0001';
  end if;

  select box into v_old from public.user_word_progress where user_id = p_user and word_id = p_word;
  v_box := case when p_correct then least(coalesce(v_old, 1) + 1, 5) else 1 end;
  v_status := case when v_box >= 5 then 'mastered' when v_box >= 3 then 'review' else 'learning' end;

  insert into public.user_word_progress
    (user_id, word_id, status, box, next_review_at, correct_count, wrong_count, last_reviewed_at)
  values
    (p_user, p_word, v_status, v_box, now() + make_interval(days => v_intervals[v_box]),
     case when p_correct then 1 else 0 end, case when p_correct then 0 else 1 end, now())
  on conflict (user_id, word_id) do update set
    status           = excluded.status,
    box              = excluded.box,
    next_review_at   = excluded.next_review_at,
    correct_count    = public.user_word_progress.correct_count + excluded.correct_count,
    wrong_count      = public.user_word_progress.wrong_count + excluded.wrong_count,
    last_reviewed_at = now(),
    updated_at       = now();
end;
$$;
revoke all on function public.apply_word_review(uuid, uuid, boolean) from public;

-- RPC: ghi kết quả một từ (dùng cho thẻ lật "Đã nhớ"/"Chưa chắc" và ôn tập)
create or replace function public.record_word_review(p_word_id uuid, p_is_correct boolean)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;
  perform public.apply_word_review(auth.uid(), p_word_id, p_is_correct);
end;
$$;

-- RPC: nộp cả bài quiz một lần (atomic). p_answers = [{"word_id":"…","question_type":"choose_meaning","is_correct":true}, …]
create or replace function public.submit_quiz(p_lesson_id uuid, p_kind text, p_answers jsonb)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_attempt uuid;
  v_item    jsonb;
  v_total   int;
  v_correct int := 0;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;
  if p_kind not in ('lesson', 'review') or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) = 0 then
    raise exception 'INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  v_total := jsonb_array_length(p_answers);

  select count(*) into v_correct
    from jsonb_array_elements(p_answers) e where (e ->> 'is_correct')::boolean;

  insert into public.vocabulary_quiz_attempts (user_id, lesson_id, kind, total, correct)
  values (v_uid, p_lesson_id, p_kind, v_total, v_correct)
  returning id into v_attempt;

  for v_item in select * from jsonb_array_elements(p_answers) loop
    insert into public.vocabulary_quiz_answers (attempt_id, word_id, question_type, is_correct)
    values (v_attempt, (v_item ->> 'word_id')::uuid, v_item ->> 'question_type', (v_item ->> 'is_correct')::boolean);
    perform public.apply_word_review(v_uid, (v_item ->> 'word_id')::uuid, (v_item ->> 'is_correct')::boolean);
  end loop;
  return v_attempt;
end;
$$;

-- RPC: bài học hôm nay (theo múi giờ cặp); nếu chưa xếp lịch thì lấy bài mới nhất đã tới hạn
create or replace function public.get_todays_lesson()
returns public.daily_lessons
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_couple uuid := public.current_couple_id();
  v_today  date;
  v_row    public.daily_lessons;
begin
  if v_couple is null then raise exception 'NOT_IN_COUPLE' using errcode = 'P0001'; end if;
  select (now() at time zone timezone)::date into v_today from public.couples where id = v_couple;

  select * into v_row from public.daily_lessons
   where is_published and lesson_date <= v_today
   order by lesson_date desc limit 1;
  if not found then raise exception 'NO_LESSON_AVAILABLE' using errcode = 'P0001'; end if;
  return v_row;
end;
$$;

-- RPC: tiến độ tổng của cả hai người trong một bài (KHÔNG lộ chi tiết từng từ của người kia)
create or replace function public.partner_progress_summary(p_lesson_id uuid)
returns table (user_id uuid, learned_count int, mastered_count int, total_words int)
language sql stable security definer
set search_path = public
as $$
  select m.user_id,
         count(upw.word_id)::int,
         (count(*) filter (where upw.status = 'mastered'))::int,
         (select count(*) from public.lesson_words where lesson_id = p_lesson_id)::int
    from public.couple_members m
    join public.couple_members me
      on me.couple_id = m.couple_id and me.user_id = auth.uid() and me.left_at is null
    join public.lesson_words lw on lw.lesson_id = p_lesson_id
    left join public.user_word_progress upw
      on upw.user_id = m.user_id and upw.word_id = lw.word_id
   where m.left_at is null
   group by m.user_id
$$;

-- RPC: thử thách đôi của hôm nay (tạo nếu chưa có)
create or replace function public.get_or_create_daily_challenge()
returns public.couple_learning_challenges
language plpgsql security definer
set search_path = public
as $$
declare
  v_couple uuid := public.current_couple_id();
  v_today  date;
  v_lesson public.daily_lessons;
  v_row    public.couple_learning_challenges;
begin
  if v_couple is null then raise exception 'NOT_IN_COUPLE' using errcode = 'P0001'; end if;
  select (now() at time zone timezone)::date into v_today from public.couples where id = v_couple;

  select * into v_row from public.couple_learning_challenges
   where couple_id = v_couple and challenge_date = v_today;
  if found then return v_row; end if;

  select * into v_lesson from public.daily_lessons
   where is_published and lesson_date <= v_today order by lesson_date desc limit 1;

  insert into public.couple_learning_challenges (couple_id, lesson_id, challenge_date, challenge_type, prompt)
  values (v_couple, v_lesson.id, v_today, 'use_words',
          'Chọn 3 từ mới của bài hôm nay, mỗi từ đặt một câu, rồi giải thích câu của mình cho người ấy.')
  on conflict (couple_id, challenge_date) do nothing
  returning * into v_row;

  if not found then
    select * into v_row from public.couple_learning_challenges
     where couple_id = v_couple and challenge_date = v_today;
  end if;
  return v_row;
end;
$$;

-- ---------- RLS ----------
alter table public.vocabulary_words               enable row level security;
alter table public.vocabulary_collocations        enable row level security;
alter table public.daily_lessons                  enable row level security;
alter table public.lesson_words                   enable row level security;
alter table public.user_word_progress             enable row level security;
alter table public.vocabulary_quiz_attempts       enable row level security;
alter table public.vocabulary_quiz_answers        enable row level security;
alter table public.couple_learning_challenges     enable row level security;
alter table public.learning_challenge_submissions enable row level security;

-- Nội dung học: user đăng nhập đọc được (cả từ đã tắt, để xem lại tiến độ cũ); admin ghi
create policy vocabulary_words_select on public.vocabulary_words for select to authenticated using (true);
create policy vocabulary_words_admin on public.vocabulary_words
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy vocabulary_collocations_select on public.vocabulary_collocations for select to authenticated using (true);
create policy vocabulary_collocations_admin on public.vocabulary_collocations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy daily_lessons_select on public.daily_lessons
  for select to authenticated using (is_published or public.is_admin());
create policy daily_lessons_admin on public.daily_lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy lesson_words_select on public.lesson_words for select to authenticated using (true);
create policy lesson_words_admin on public.lesson_words
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Tiến độ & quiz: CHỈ chủ sở hữu đọc; ghi qua RPC
create policy user_word_progress_select on public.user_word_progress
  for select to authenticated using (user_id = auth.uid());
create policy vocabulary_quiz_attempts_select on public.vocabulary_quiz_attempts
  for select to authenticated using (user_id = auth.uid());
create policy vocabulary_quiz_answers_select on public.vocabulary_quiz_answers
  for select to authenticated
  using (exists (select 1 from public.vocabulary_quiz_attempts a
                  where a.id = attempt_id and a.user_id = auth.uid()));

-- Thử thách đôi
create policy couple_learning_challenges_select on public.couple_learning_challenges
  for select to authenticated using (public.is_couple_member(couple_id));
create policy learning_challenge_submissions_select on public.learning_challenge_submissions
  for select to authenticated
  using (
    user_id = auth.uid()
    or (public.is_couple_member(couple_id) and public.has_submitted(challenge_id))
  );
create policy learning_challenge_submissions_insert on public.learning_challenge_submissions
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_couple_member(couple_id));

revoke insert, update, delete on public.user_word_progress from authenticated;
revoke insert, update, delete on public.vocabulary_quiz_attempts from authenticated;
revoke insert, update, delete on public.vocabulary_quiz_answers from authenticated;
revoke insert, update, delete on public.couple_learning_challenges from authenticated;
revoke update, delete on public.learning_challenge_submissions from authenticated;

-- ---------- quyền thực thi ----------
revoke all on function public.has_submitted(uuid) from public;
revoke all on function public.record_word_review(uuid, boolean) from public;
revoke all on function public.submit_quiz(uuid, text, jsonb) from public;
revoke all on function public.get_todays_lesson() from public;
revoke all on function public.partner_progress_summary(uuid) from public;
revoke all on function public.get_or_create_daily_challenge() from public;
grant execute on function public.has_submitted(uuid) to authenticated;
grant execute on function public.record_word_review(uuid, boolean) to authenticated;
grant execute on function public.submit_quiz(uuid, text, jsonb) to authenticated;
grant execute on function public.get_todays_lesson() to authenticated;
grant execute on function public.partner_progress_summary(uuid) to authenticated;
grant execute on function public.get_or_create_daily_challenge() to authenticated;
