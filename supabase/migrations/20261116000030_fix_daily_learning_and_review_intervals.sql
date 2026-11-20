-- Ensure every generated or admin-created lesson has up to 10 active words.
-- Review intervals are intentionally spaced to reduce daily vocabulary overload.

create or replace function public.get_or_create_todays_lesson()
returns public.daily_lessons
language plpgsql security definer
set search_path = public
as $$
declare
  v_couple uuid := public.current_couple_id();
  v_tz text;
  v_today date;
  v_row public.daily_lessons;
  v_topics text[] := array['communication', 'emotions', 'dating', 'food_dining', 'travel', 'work_study'];
  v_topic text;
  v_lesson_count integer;
  v_word_count integer;
  v_missing integer;
begin
  if v_couple is null then
    raise exception 'NOT_IN_COUPLE' using errcode = 'P0001';
  end if;

  select coalesce(nullif(timezone, ''), 'Asia/Ho_Chi_Minh')
    into v_tz
    from public.couples
   where id = v_couple;

  v_today := (now() at time zone coalesce(v_tz, 'Asia/Ho_Chi_Minh'))::date;

  select *
    into v_row
    from public.daily_lessons
   where is_published and lesson_date = v_today
   limit 1
   for update;

  if not found then
    select count(*) into v_lesson_count from public.daily_lessons;
    v_topic := v_topics[(v_lesson_count % array_length(v_topics, 1)) + 1];

    insert into public.daily_lessons (lesson_date, topic, level, is_published)
    values (v_today, v_topic, 'A2', true)
    on conflict (lesson_date) do update set is_published = true
    returning * into v_row;
  end if;

  select count(*) into v_word_count
    from public.lesson_words
   where lesson_id = v_row.id;

  v_missing := greatest(0, 10 - v_word_count);

  if v_missing > 0 then
    insert into public.lesson_words (lesson_id, word_id, position)
    select v_row.id, w.id, (v_word_count + row_number() over (order by w.natural_key))::smallint
      from public.vocabulary_words w
     where w.topic = v_row.topic
       and w.is_active
       and not exists (
         select 1
           from public.lesson_words existing
          where existing.lesson_id = v_row.id
            and existing.word_id = w.id
       )
     order by w.natural_key
     limit v_missing
    on conflict (lesson_id, word_id) do nothing;
  end if;

  select count(*) into v_word_count
    from public.lesson_words
   where lesson_id = v_row.id;

  v_missing := greatest(0, 10 - v_word_count);

  if v_missing > 0 then
    insert into public.lesson_words (lesson_id, word_id, position)
    select v_row.id, w.id, (v_word_count + row_number() over (order by w.natural_key))::smallint
      from public.vocabulary_words w
     where w.is_active
       and not exists (
         select 1
           from public.lesson_words existing
          where existing.lesson_id = v_row.id
            and existing.word_id = w.id
       )
     order by w.natural_key
     limit v_missing
    on conflict (lesson_id, word_id) do nothing;
  end if;

  return v_row;
end;
$$;

create or replace function public.leitner_interval(p_box integer)
returns integer
language sql
immutable
as $$
  select case greatest(1, least(coalesce(p_box, 1), 5))
    when 1 then 1
    when 2 then 3
    when 3 then 5
    when 4 then 10
    when 5 then 20
  end
$$;
