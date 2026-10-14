-- =====================================================================
-- PHASE 3 — PLAY: games, questions, game_sessions, game_answers
-- Mã lỗi: NOT_IN_COUPLE, NO_QUESTION_AVAILABLE
-- QUY TẮC LỘ ĐÁP ÁN: người kia chỉ đọc được đáp án của mình khi chính mình
-- đã có bản ghi trong game_answers của phiên đó (trả lời HOẶC bỏ qua).
-- Đáp án không sửa/xóa được (bất biến).
-- =====================================================================

create table public.games (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  name      text not null,
  type      text not null check (type in ('daily_question', 'truth_dare')),
  is_active boolean not null default true
);
insert into public.games (slug, name, type) values
  ('daily_question', 'Câu hỏi mỗi ngày', 'daily_question'),
  ('truth_or_dare',  'Thật hay Thách', 'truth_dare');

create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  external_key   text unique,
  kind           text not null check (kind in ('daily', 'truth', 'dare')),
  category       text not null check (category in ('fun', 'discover', 'emotion', 'deep')),
  intimacy_level smallint not null default 1 check (intimacy_level between 1 and 4),
  text           text not null check (char_length(text) between 1 and 500),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);
create index questions_pick on public.questions (kind, category) where is_active;

create table public.game_sessions (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references public.couples(id) on delete cascade,
  game_id      uuid not null references public.games(id),
  question_id  uuid not null references public.questions(id),
  session_date date not null,                               -- theo couples.timezone
  is_daily     boolean not null default false,
  status       text not null default 'open' check (status in ('open', 'completed')),
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  completed_at timestamptz,
  unique (id, couple_id)
);
-- Mỗi cặp mỗi ngày đúng 1 phiên Daily Question
create unique index game_sessions_one_daily_per_day
  on public.game_sessions (couple_id, session_date) where is_daily;
create index game_sessions_by_couple on public.game_sessions (couple_id, session_date desc);

create table public.game_answers (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null,
  couple_id   uuid not null,
  user_id     uuid not null references public.profiles(id),
  answer_text text,
  skipped     boolean not null default false,
  created_at  timestamptz not null default now(),
  foreign key (session_id, couple_id) references public.game_sessions (id, couple_id) on delete cascade,
  unique (session_id, user_id),
  check (
    (skipped and answer_text is null)
    or (not skipped and answer_text is not null and char_length(btrim(answer_text)) between 1 and 1000)
  )
);

-- Khi cả hai đã có đáp án -> phiên hoàn thành
create or replace function public.complete_session_when_both_answered()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if (select count(*) from public.game_answers where session_id = new.session_id) >= 2 then
    update public.game_sessions
       set status = 'completed', completed_at = now()
     where id = new.session_id and status <> 'completed';
  end if;
  return null;
end;
$$;
revoke all on function public.complete_session_when_both_answered() from public;
create trigger game_answers_complete_session
  after insert on public.game_answers
  for each row execute function public.complete_session_when_both_answered();

-- Mình đã có đáp án (trả lời hoặc bỏ qua) cho phiên này chưa? (dùng trong RLS, tránh đệ quy policy)
create or replace function public.has_answered(p_session_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.game_answers
     where session_id = p_session_id and user_id = auth.uid()
  )
$$;

-- RPC: lấy (hoặc tạo) câu hỏi của ngày hôm nay cho cặp hiện tại
create or replace function public.get_or_create_daily_session()
returns public.game_sessions
language plpgsql security definer
set search_path = public
as $$
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

  if not found then   -- người kia vừa tạo cùng lúc
    select * into v_row from public.game_sessions
     where couple_id = v_couple and is_daily and session_date = v_date;
  end if;
  return v_row;
end;
$$;

-- ---------- RLS ----------
alter table public.games         enable row level security;
alter table public.questions     enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_answers  enable row level security;

create policy games_select on public.games for select to authenticated using (true);
create policy games_admin_all on public.games
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Câu hỏi đọc được cả khi đã tắt (để xem lại phiên cũ); nội dung không nhạy cảm
create policy questions_select on public.questions for select to authenticated using (true);
create policy questions_admin_all on public.questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy game_sessions_select on public.game_sessions
  for select to authenticated using (public.is_couple_member(couple_id));
-- Phiên daily chỉ tạo qua RPC; phiên Truth/Dare client được tạo trực tiếp
create policy game_sessions_insert_non_daily on public.game_sessions
  for insert to authenticated
  with check (public.is_couple_member(couple_id) and not is_daily and created_by = auth.uid());

create policy game_answers_select on public.game_answers
  for select to authenticated
  using (
    user_id = auth.uid()
    or (public.is_couple_member(couple_id) and public.has_answered(session_id))
  );
create policy game_answers_insert on public.game_answers
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_couple_member(couple_id));
-- Không có UPDATE/DELETE: đáp án bất biến.

revoke insert, update, delete on public.game_sessions from authenticated;
grant  insert (couple_id, game_id, question_id, session_date, is_daily, created_by)
  on public.game_sessions to authenticated;
revoke update, delete on public.game_answers from authenticated;

revoke all on function public.has_answered(uuid) from public;
revoke all on function public.get_or_create_daily_session() from public;
grant execute on function public.has_answered(uuid) to authenticated;
grant execute on function public.get_or_create_daily_session() to authenticated;
