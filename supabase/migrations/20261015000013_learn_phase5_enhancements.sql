-- =====================================================================
-- PHASE 5 — LEARN B: QUIZ, LEITNER REVIEW, COUPLE CHALLENGE & STATS
-- =====================================================================

-- 1. RPC: Nộp bài thử thách đôi an toàn (atomic & bất biến)
create or replace function public.submit_challenge(
  p_challenge_id uuid,
  p_content text
)
returns uuid
language plpgsql security definer
set search_path = public
as $
declare
  v_uid     uuid := auth.uid();
  v_couple  uuid;
  v_trimmed text := btrim(coalesce(p_content, ''));
  v_sub_id  uuid;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  if char_length(v_trimmed) < 1 or char_length(v_trimmed) > 2000 then
    raise exception 'INVALID_ARGUMENT' using errcode = 'P0001';
  end if;

  select couple_id into v_couple
    from public.couple_learning_challenges
   where id = p_challenge_id;

  if not found then
    raise exception 'CHALLENGE_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not public.is_couple_member(v_couple) then
    raise exception 'NOT_COUPLE_MEMBER' using errcode = 'P0001';
  end if;

  insert into public.learning_challenge_submissions (challenge_id, couple_id, user_id, content)
  values (p_challenge_id, v_couple, v_uid, v_trimmed)
  on conflict (challenge_id, user_id) do nothing
  returning id into v_sub_id;

  if v_sub_id is null then
    select id into v_sub_id
      from public.learning_challenge_submissions
     where challenge_id = p_challenge_id and user_id = v_uid;
  end if;

  return v_sub_id;
end;
$;

-- 2. RPC: Lấy trạng thái nộp bài của cả 2 thành viên mà KHÔNG làm lộ content
create or replace function public.get_challenge_status(p_challenge_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  has_submitted boolean,
  submitted_at timestamptz
)
language sql stable security definer
set search_path = public
as $
  select
    m.user_id,
    p.display_name,
    p.avatar_url,
    (s.id is not null) as has_submitted,
    s.created_at as submitted_at
  from public.couple_learning_challenges c
  join public.couple_members m
    on m.couple_id = c.couple_id and m.left_at is null
  join public.couple_members me
    on me.couple_id = c.couple_id and me.user_id = auth.uid() and me.left_at is null
  join public.profiles p
    on p.id = m.user_id
  left join public.learning_challenge_submissions s
    on s.challenge_id = c.id and s.user_id = m.user_id
  where c.id = p_challenge_id
-- 3. RPC: Lấy thống kê toàn diện học từ vựng cho cặp đôi
create or replace function public.get_couple_learning_stats()
returns jsonb
language plpgsql stable security definer
set search_path = public
as $
declare
  v_uid       uuid := auth.uid();
  v_couple    uuid := public.current_couple_id();
  v_partner   uuid;
  v_result    jsonb;

  v_my_learned      int := 0;
  v_my_mastered     int := 0;
  v_my_due          int := 0;
  v_my_b1           int := 0;
  v_my_b2           int := 0;
  v_my_b3           int := 0;
  v_my_b4           int := 0;
  v_my_b5           int := 0;
  v_my_quiz_latest  jsonb := null;

  v_p_name          text := null;
  v_p_avatar        text := null;
  v_p_learned       int := 0;
  v_p_mastered      int := 0;
  v_p_quiz_latest   jsonb := null;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  select
    count(*)::int,
    count(*) filter (where status = 'mastered')::int,
    count(*) filter (where next_review_at is not null and next_review_at <= now())::int,
    count(*) filter (where box = 1)::int,
    count(*) filter (where box = 2)::int,
    count(*) filter (where box = 3)::int,
    count(*) filter (where box = 4)::int,
    count(*) filter (where box = 5)::int
  into
    v_my_learned, v_my_mastered, v_my_due,
    v_my_b1, v_my_b2, v_my_b3, v_my_b4, v_my_b5
  from public.user_word_progress
  where user_id = v_uid;

  select jsonb_build_object(
    'total', total,
    'correct', correct,
    'kind', kind,
    'created_at', created_at
  ) into v_my_quiz_latest
  from public.vocabulary_quiz_attempts
  where user_id = v_uid
  order by created_at desc
  limit 1;

  if v_couple is not null then
    select m.user_id, p.display_name, p.avatar_url
      into v_partner, v_p_name, v_p_avatar
      from public.couple_members m
      join public.profiles p on p.id = m.user_id
     where m.couple_id = v_couple and m.user_id <> v_uid and m.left_at is null
     limit 1;

    if v_partner is not null then
      select
        count(*)::int,
        count(*) filter (where status = 'mastered')::int
      into
        v_p_learned, v_p_mastered
      from public.user_word_progress
      where user_id = v_partner;

      select jsonb_build_object(
        'total', total,
        'correct', correct,
        'kind', kind,
        'created_at', created_at
      ) into v_p_quiz_latest
      from public.vocabulary_quiz_attempts
      where user_id = v_partner
      order by created_at desc
      limit 1;
    end if;
  end if;

  v_result := jsonb_build_object(
    'my_stats', jsonb_build_object(
      'total_learned', v_my_learned,
      'mastered_count', v_my_mastered,
      'due_reviews_count', v_my_due,
      'boxes', jsonb_build_object(
        'box_1', v_my_b1,
        'box_2', v_my_b2,
        'box_3', v_my_b3,
        'box_4', v_my_b4,
        'box_5', v_my_b5
      ),
      'latest_quiz', v_my_quiz_latest
    ),
    'partner_stats', case when v_partner is not null then jsonb_build_object(
      'user_id', v_partner,
      'display_name', coalesce(v_p_name, 'Người ấy'),
      'avatar_url', v_p_avatar,
      'total_learned', v_p_learned,
      'mastered_count', v_p_mastered,
      'latest_quiz', v_p_quiz_latest
    ) else null end
  );

  return v_result;
end;
$;

grant execute on function public.submit_challenge(uuid, text) to authenticated;
grant execute on function public.get_challenge_status(uuid) to authenticated;
grant execute on function public.get_couple_learning_stats() to authenticated;

  order by (m.user_id = auth.uid()) desc;
$;
