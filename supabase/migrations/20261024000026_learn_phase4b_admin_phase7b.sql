-- Phase 4B/7B: server-owned learning progress and atomic vocabulary imports.

alter table public.vocabulary_words
  add column if not exists entry_type text not null default 'word',
  add column if not exists tags text[] not null default '{}',
  add column if not exists note text,
  add column if not exists natural_key text;

update public.vocabulary_words
set natural_key = lower(regexp_replace(btrim(word), '\s+', ' ', 'g')) || ':' || entry_type
where natural_key is null;

alter table public.vocabulary_words
  alter column natural_key set not null;

create unique index if not exists vocabulary_words_natural_key_unique
  on public.vocabulary_words (natural_key);

comment on column public.vocabulary_words.phrase is 'Deprecated: use word and entry_type.';
comment on column public.vocabulary_words.sentence_en is 'Deprecated: use example_en.';
comment on column public.vocabulary_words.sentence_vi is 'Deprecated: use example_vi.';

create or replace function public.normalize_level(p_value text)
returns text language sql immutable
as $$
  select case upper(btrim(coalesce(p_value, '')))
    when 'A1' then 'A1' when 'A2' then 'A2' when 'B1' then 'B1'
    when 'B2' then 'B2' when 'C1' then 'C1' when 'C2' then 'C2'
    else null end
$$;

create or replace function public.normalize_entry_type(p_value text)
returns text language sql immutable
as $$
  select case lower(btrim(coalesce(p_value, '')))
    when 'word' then 'word' when 'phrase' then 'phrase'
    when 'collocation' then 'collocation' when 'idiom' then 'idiom'
    else null end
$$;

create or replace function public.normalize_pos(p_value text)
returns text language sql immutable
as $$
  select case lower(btrim(coalesce(p_value, '')))
    when 'noun' then 'noun' when 'verb' then 'verb'
    when 'adjective' then 'adjective' when 'adverb' then 'adverb'
    when 'preposition' then 'preposition' when 'conjunction' then 'conjunction'
    when 'pronoun' then 'pronoun' when 'interjection' then 'interjection'
    when 'phrase' then 'phrase' else 'other' end
$$;

create or replace function public.set_vocabulary_natural_key()
returns trigger language plpgsql set search_path = public
as $$
begin
  new.word := btrim(new.word);
  new.entry_type := coalesce(public.normalize_entry_type(new.entry_type), 'word');
  new.natural_key := lower(regexp_replace(new.word, '\s+', ' ', 'g')) || ':' || new.entry_type;
  return new;
end;
$$;

drop trigger if exists vocabulary_words_natural_key on public.vocabulary_words;
create trigger vocabulary_words_natural_key
before insert or update of word, entry_type on public.vocabulary_words
for each row execute function public.set_vocabulary_natural_key();

do $$
begin
  if exists (select 1 from public.user_word_progress where status = 'new') then
    update public.user_word_progress set status = 'learning' where status = 'new';
  end if;
end $$;

alter table public.user_word_progress drop constraint if exists user_word_progress_status_check;
alter table public.user_word_progress
  add constraint user_word_progress_status_check
  check (status in ('learning', 'review', 'mastered'));

create table if not exists public.lesson_completions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.daily_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lesson_completions enable row level security;
drop policy if exists lesson_completions_own_select on public.lesson_completions;
create policy lesson_completions_own_select on public.lesson_completions
for select to authenticated using (user_id = auth.uid());
revoke all on public.lesson_completions from authenticated;

alter table public.vocabulary_quiz_attempts drop constraint if exists vocabulary_quiz_attempts_kind_check;
alter table public.vocabulary_quiz_attempts
  add constraint vocabulary_quiz_attempts_kind_check
  check (kind in ('lesson', 'review', 'cumulative'));

create table if not exists public.vocab_import_batches (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  row_count integer not null default 0 check (row_count >= 0),
  status text not null default 'staging' check (status in ('staging', 'validated', 'committed', 'failed')),
  error_count integer not null default 0 check (error_count >= 0),
  created_at timestamptz not null default now(),
  committed_at timestamptz
);

create table if not exists public.vocab_import_rows (
  id bigint generated always as identity primary key,
  batch_id uuid not null references public.vocab_import_batches(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  payload jsonb not null,
  error_message text,
  unique (batch_id, row_number)
);
create index if not exists vocab_import_rows_batch on public.vocab_import_rows(batch_id, row_number);
alter table public.vocab_import_batches enable row level security;
alter table public.vocab_import_rows enable row level security;

create or replace function public.leitner_interval(p_box integer)
returns integer language sql immutable
as $$
  select case greatest(1, least(coalesce(p_box, 1), 5))
    when 1 then 1 when 2 then 2 when 3 then 4 when 4 then 7 when 5 then 30 end
$$;

create or replace function public.complete_lesson(p_lesson_id uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_word uuid;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if not exists (
    select 1 from public.daily_lessons l
    where l.id = p_lesson_id and l.is_published
      and exists (
        select 1 from public.lesson_words lw
        join public.vocabulary_words w on w.id = lw.word_id
        where lw.lesson_id = l.id and w.is_active
      )
  ) then raise exception 'INVALID_LESSON'; end if;

  insert into public.lesson_completions(user_id, lesson_id)
  values (v_uid, p_lesson_id) on conflict do nothing;

  for v_word in
    select lw.word_id from public.lesson_words lw
    join public.vocabulary_words w on w.id = lw.word_id
    where lw.lesson_id = p_lesson_id and w.is_active
  loop
    insert into public.user_word_progress(user_id, word_id, status, box, next_review_at)
    values (v_uid, v_word, 'learning', 1, now() + interval '1 day')
    on conflict (user_id, word_id) do nothing;
  end loop;
end;
$$;

create or replace function public.couple_lesson_status(p_lesson_id uuid)
returns table(user_id uuid, completed boolean, completed_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select m.user_id, c.user_id is not null, c.completed_at
  from public.couple_members m
  join public.couple_members me on me.couple_id = m.couple_id
    and me.user_id = auth.uid() and me.left_at is null
  left join public.lesson_completions c on c.user_id = m.user_id and c.lesson_id = p_lesson_id
  where m.left_at is null
$$;

create or replace function public.get_review_queue()
returns table(user_id uuid, word_id uuid, status text, box smallint, next_review_at timestamptz,
  correct_count integer, wrong_count integer, word jsonb)
language sql stable security definer set search_path = public
as $$
  select p.user_id, p.word_id, p.status, p.box, p.next_review_at, p.correct_count, p.wrong_count,
    to_jsonb(w)
  from public.user_word_progress p
  join public.vocabulary_words w on w.id = p.word_id
  where p.user_id = auth.uid() and w.is_active
    and p.next_review_at is not null and p.next_review_at <= now()
  order by p.next_review_at asc, p.word_id
  limit 20
$$;

create or replace function public.due_review_count()
returns integer language sql stable security definer set search_path = public
as $$
  select count(*)::integer from public.user_word_progress p
  join public.vocabulary_words w on w.id = p.word_id
  where p.user_id = auth.uid() and w.is_active
    and p.next_review_at is not null and p.next_review_at <= now()
$$;

create or replace function public.next_review_at_for_me(p_word_id uuid)
returns timestamptz language sql stable security definer set search_path = public
as $$
  select next_review_at from public.user_word_progress
  where user_id = auth.uid() and word_id = p_word_id
$$;

create or replace function public.get_cumulative_test_words()
returns setof uuid language sql stable security definer set search_path = public
as $$
  select distinct a.word_id
  from public.vocabulary_quiz_answers a
  join public.vocabulary_quiz_attempts q on q.id = a.attempt_id
  join public.vocabulary_words w on w.id = a.word_id
  where q.user_id = auth.uid() and q.created_at >= now() - interval '7 days' and w.is_active
  order by a.word_id
  limit 20
$$;

create or replace function public.apply_word_review(p_user uuid, p_word uuid, p_correct boolean)
returns void language plpgsql security definer set search_path = public
as $$
declare
  v_old smallint;
  v_new smallint;
  v_days integer;
begin
  if not exists (select 1 from public.vocabulary_words where id = p_word and is_active) then
    raise exception 'WORD_NOT_FOUND';
  end if;
  select box into v_old from public.user_word_progress where user_id = p_user and word_id = p_word;
  v_new := case when p_correct then least(coalesce(v_old, 0) + 1, 5) else 1 end;
  v_days := case when p_correct then public.leitner_interval(coalesce(v_old, 1)) else 1 end;
  insert into public.user_word_progress(user_id, word_id, status, box, next_review_at, correct_count, wrong_count, last_reviewed_at)
  values (p_user, p_word,
    case when v_new = 5 then 'mastered' when v_new >= 3 then 'review' else 'learning' end,
    v_new, now() + make_interval(days => v_days),
    case when p_correct then 1 else 0 end, case when p_correct then 0 else 1 end, now())
  on conflict (user_id, word_id) do update set
    status = excluded.status, box = excluded.box, next_review_at = excluded.next_review_at,
    correct_count = public.user_word_progress.correct_count + excluded.correct_count,
    wrong_count = public.user_word_progress.wrong_count + excluded.wrong_count,
    last_reviewed_at = now(), updated_at = now();
end;
$$;

create or replace function public.record_word_review(p_word_id uuid, p_is_correct boolean)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  perform public.apply_word_review(auth.uid(), p_word_id, p_is_correct);
end;
$$;

create or replace function public.submit_quiz(p_lesson_id uuid, p_kind text, p_answers jsonb)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_attempt uuid;
  v_item jsonb;
begin
  if v_uid is null or p_kind not in ('lesson', 'review', 'cumulative')
     or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) = 0
  then raise exception 'INVALID_ARGUMENT'; end if;
  insert into public.vocabulary_quiz_attempts(user_id, lesson_id, kind, total, correct)
  values (v_uid, p_lesson_id, p_kind, jsonb_array_length(p_answers),
    (select count(*) from jsonb_array_elements(p_answers) e where (e->>'is_correct')::boolean))
  returning id into v_attempt;
  for v_item in select * from jsonb_array_elements(p_answers) loop
    insert into public.vocabulary_quiz_answers(attempt_id, word_id, question_type, is_correct)
    values (v_attempt, (v_item->>'word_id')::uuid, v_item->>'question_type', (v_item->>'is_correct')::boolean);
    perform public.apply_word_review(v_uid, (v_item->>'word_id')::uuid, (v_item->>'is_correct')::boolean);
  end loop;
  return v_attempt;
end;
$$;

create or replace function public.partner_progress_summary(p_lesson_id uuid)
returns table(user_id uuid, learned_count integer, mastered_count integer, total_words integer)
language sql stable security definer set search_path = public
as $$
  select m.user_id,
    case when m.user_id = auth.uid() then count(up.word_id)::int
         when exists (select 1 from public.lesson_completions c where c.user_id = m.user_id and c.lesson_id = p_lesson_id)
           then (select count(*)::int from public.lesson_words lw2 join public.vocabulary_words w2 on w2.id = lw2.word_id
                 where lw2.lesson_id = p_lesson_id and w2.is_active)
         else 0 end,
    case when m.user_id = auth.uid() then count(*) filter (where up.status = 'mastered')::int else 0 end,
    (select count(*)::int from public.lesson_words lw join public.vocabulary_words w on w.id = lw.word_id
      where lw.lesson_id = p_lesson_id and w.is_active)
  from public.couple_members m
  join public.couple_members me on me.couple_id = m.couple_id and me.user_id = auth.uid() and me.left_at is null
  left join public.lesson_words lw on lw.lesson_id = p_lesson_id
  left join public.user_word_progress up on up.user_id = auth.uid() and up.word_id = lw.word_id
  where m.left_at is null
  group by m.user_id
$$;

create or replace function public.start_vocab_import(p_file_name text, p_row_count integer)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_row_count < 1 then raise exception 'INVALID_ARGUMENT'; end if;
  insert into public.vocab_import_batches(created_by, file_name, row_count)
  values (auth.uid(), btrim(p_file_name), p_row_count) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.stage_vocab_import_rows(p_batch_id uuid, p_rows jsonb)
returns integer language plpgsql security definer set search_path = public
as $$
declare v_row jsonb; v_count integer := 0;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if not exists (select 1 from public.vocab_import_batches where id = p_batch_id and created_by = auth.uid() and status = 'staging') then raise exception 'INVALID_BATCH'; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 2000 then raise exception 'CHUNK_TOO_LARGE'; end if;
  for v_row in select * from jsonb_array_elements(p_rows) loop
    v_count := v_count + 1;
    insert into public.vocab_import_rows(batch_id, row_number, payload)
    values (p_batch_id, coalesce((v_row->>'row_number')::int, v_count), v_row - 'row_number')
    on conflict (batch_id, row_number) do update set payload = excluded.payload, error_message = null;
  end loop;
  return v_count;
end;
$$;

create or replace function public.commit_vocabulary_import(p_batch_id uuid)
returns integer language plpgsql security definer set search_path = public
as $$
declare r record; v_count integer := 0; v_key text; v_id uuid; v_error integer := 0;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  perform 1 from public.vocab_import_batches where id = p_batch_id and created_by = auth.uid() and status in ('staging', 'validated') for update;
  if not found then raise exception 'INVALID_BATCH'; end if;
  for r in select * from public.vocab_import_rows where batch_id = p_batch_id order by row_number loop
    if nullif(btrim(r.payload->>'word'), '') is null
       or public.normalize_entry_type(r.payload->>'entry_type') is null
       or public.normalize_pos(r.payload->>'part_of_speech') is null
    then
      v_error := v_error + 1;
      update public.vocab_import_rows set error_message = 'Thiếu word, entry_type hoặc part_of_speech' where id = r.id;
    end if;
  end loop;
  if v_error > 0 then
    update public.vocab_import_batches set status = 'failed', error_count = v_error where id = p_batch_id;
    raise exception 'IMPORT_VALIDATION_FAILED';
  end if;
  for r in select * from public.vocab_import_rows where batch_id = p_batch_id order by row_number loop
    v_key := lower(regexp_replace(btrim(r.payload->>'word'), '\s+', ' ', 'g')) || ':' || public.normalize_entry_type(r.payload->>'entry_type');
    v_id := null;
    if nullif(btrim(r.payload->>'external_key'), '') is not null then
      select id into v_id from public.vocabulary_words where external_key = btrim(r.payload->>'external_key') for update;
    end if;
    if v_id is null then
      select id into v_id from public.vocabulary_words where natural_key = v_key for update;
    end if;
    if v_id is null then
      insert into public.vocabulary_words(external_key, word, entry_type, tags, note, part_of_speech, meaning_vi, example_en, example_vi, topic, level, is_active)
      values (nullif(btrim(r.payload->>'external_key'), ''), btrim(r.payload->>'word'),
        public.normalize_entry_type(r.payload->>'entry_type'), coalesce(array(select jsonb_array_elements_text(r.payload->'tags')), '{}'),
        r.payload->>'note', public.normalize_pos(r.payload->>'part_of_speech'), btrim(r.payload->>'meaning_vi'),
        r.payload->>'example_en', r.payload->>'example_vi', coalesce(nullif(r.payload->>'topic', ''), 'general'),
        public.normalize_level(r.payload->>'level'), coalesce((r.payload->>'is_active')::boolean, true)) returning id into v_id;
    else
      update public.vocabulary_words set word = btrim(r.payload->>'word'), entry_type = public.normalize_entry_type(r.payload->>'entry_type'),
        tags = coalesce(array(select jsonb_array_elements_text(r.payload->'tags')), '{}'), note = r.payload->>'note',
        part_of_speech = public.normalize_pos(r.payload->>'part_of_speech'), meaning_vi = btrim(r.payload->>'meaning_vi'),
        example_en = r.payload->>'example_en', example_vi = r.payload->>'example_vi',
        topic = coalesce(nullif(r.payload->>'topic', ''), 'general'), level = public.normalize_level(r.payload->>'level'),
        is_active = coalesce((r.payload->>'is_active')::boolean, true) where id = v_id;
    end if;
    if jsonb_typeof(r.payload->'collocations') = 'array' then
      insert into public.vocabulary_collocations(word_id, phrase, position)
      select v_id, btrim(value), row_number() over ()::smallint
      from jsonb_array_elements_text(r.payload->'collocations')
      where char_length(btrim(value)) between 1 and 120
      on conflict (word_id, phrase) do nothing;
    end if;
    v_count := v_count + 1;
  end loop;
  update public.vocab_import_batches set status = 'committed', committed_at = now() where id = p_batch_id;
  return v_count;
end;
$$;

create or replace function public.validate_vocab_import(p_batch_id uuid)
returns integer language plpgsql security definer set search_path = public
as $$
declare r record; v_error integer := 0;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  perform 1 from public.vocab_import_batches
    where id = p_batch_id and created_by = auth.uid() and status = 'staging' for update;
  if not found then raise exception 'INVALID_BATCH'; end if;
  for r in select * from public.vocab_import_rows where batch_id = p_batch_id order by row_number loop
    if nullif(btrim(r.payload->>'word'), '') is null
       or nullif(btrim(r.payload->>'meaning_vi'), '') is null
       or public.normalize_entry_type(r.payload->>'entry_type') is null
       or public.normalize_pos(r.payload->>'part_of_speech') is null
    then
      v_error := v_error + 1;
      update public.vocab_import_rows set error_message = 'Thiếu word, meaning_vi, entry_type hoặc part_of_speech' where id = r.id;
    end if;
  end loop;
  update public.vocab_import_batches
    set status = case when v_error = 0 then 'validated' else 'failed' end, error_count = v_error
    where id = p_batch_id;
  return v_error;
end;
$$;

create or replace function public.auto_schedule_lessons(p_from date, p_to date, p_topic text default 'general', p_level text default 'A2')
returns integer language plpgsql security definer set search_path = public
as $$
declare d date := p_from; v_count integer := 0; v_id uuid;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_to < p_from or p_to - p_from > 366 then raise exception 'INVALID_ARGUMENT'; end if;
  while d <= p_to loop
    if not exists (select 1 from public.daily_lessons where lesson_date = d) then
      insert into public.daily_lessons(lesson_date, topic, level, is_published) values (d, p_topic, public.normalize_level(p_level), true) returning id into v_id;
      insert into public.lesson_words(lesson_id, word_id, position)
      select v_id, w.id, row_number() over (order by w.natural_key)::smallint
      from public.vocabulary_words w where w.is_active and (p_topic = 'general' or w.topic = p_topic)
      order by w.natural_key limit 10;
      v_count := v_count + 1;
    end if;
    d := d + 1;
  end loop;
  return v_count;
end;
$$;

revoke all on function public.complete_lesson(uuid), public.couple_lesson_status(uuid), public.get_review_queue(), public.due_review_count(), public.next_review_at_for_me(uuid), public.get_cumulative_test_words(), public.record_word_review(uuid, boolean), public.submit_quiz(uuid, text, jsonb), public.partner_progress_summary(uuid), public.start_vocab_import(text, integer), public.stage_vocab_import_rows(uuid, jsonb), public.validate_vocab_import(uuid), public.commit_vocabulary_import(uuid), public.auto_schedule_lessons(date, date, text, text) from public, anon;
grant execute on function public.complete_lesson(uuid), public.couple_lesson_status(uuid), public.get_review_queue(), public.due_review_count(), public.next_review_at_for_me(uuid), public.get_cumulative_test_words(), public.record_word_review(uuid, boolean), public.submit_quiz(uuid, text, jsonb), public.partner_progress_summary(uuid) to authenticated;
grant execute on function public.start_vocab_import(text, integer), public.stage_vocab_import_rows(uuid, jsonb), public.validate_vocab_import(uuid), public.commit_vocabulary_import(uuid), public.auto_schedule_lessons(date, date, text, text) to authenticated;
