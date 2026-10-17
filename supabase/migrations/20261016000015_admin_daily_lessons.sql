-- PHASE 7 — Atomic admin management for daily lessons.

create or replace function public.admin_save_daily_lesson(
  p_lesson_date date,
  p_topic text,
  p_level text,
  p_is_published boolean,
  p_word_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson_id uuid;
begin
  if not public.is_admin() then
    raise exception 'PERMISSION_DENIED' using errcode = 'P0001';
  end if;
  if p_lesson_date is null or p_topic is null or char_length(btrim(p_topic)) = 0
     or coalesce(array_length(p_word_ids, 1), 0) <> 10
     or (select count(distinct word_id) from unnest(p_word_ids) as word_id) <> 10 then
    raise exception 'INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from unnest(p_word_ids) as word_id
    left join public.vocabulary_words w on w.id = word_id
    where w.id is null
  ) then
    raise exception 'WORD_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.daily_lessons (lesson_date, topic, level, is_published)
  values (p_lesson_date, btrim(p_topic), nullif(p_level, ''), coalesce(p_is_published, true))
  on conflict (lesson_date) do update set
    topic = excluded.topic,
    level = excluded.level,
    is_published = excluded.is_published
  returning id into v_lesson_id;

  delete from public.lesson_words where lesson_id = v_lesson_id;
  insert into public.lesson_words (lesson_id, word_id, position)
  select v_lesson_id, word_id, ordinality::smallint
  from unnest(p_word_ids) with ordinality;
  return v_lesson_id;
end;
$$;

revoke all on function public.admin_save_daily_lesson(date, text, text, boolean, uuid[]) from public;
grant execute on function public.admin_save_daily_lesson(date, text, text, boolean, uuid[]) to authenticated;
