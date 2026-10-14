-- =====================================================================
-- PHASE 1 — TÀI KHOẢN, CẶP ĐÔI, MÃ MỜI, RLS
-- Mã lỗi nghiệp vụ (RAISE EXCEPTION, errcode P0001; message = mã):
--   NOT_AUTHENTICATED, NOT_IN_COUPLE, ALREADY_IN_COUPLE,
--   INVITE_NOT_FOUND, INVITE_EXPIRED, INVITE_REVOKED, INVITE_USED_UP,
--   COUPLE_FULL, INVALID_ARGUMENT
-- =====================================================================

-- ---------- profiles ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 50),
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Tự tạo profile khi có user mới trong auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
                  split_part(coalesce(new.email, ''), '@', 1), ''), 50)
  );
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- couples ----------
create table public.couples (
  id         uuid primary key default gen_random_uuid(),
  start_date date,                                         -- ngày bắt đầu mối quan hệ
  timezone   text not null default 'Asia/Ho_Chi_Minh',     -- múi giờ tính "ngày"
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger couples_set_updated_at
  before update on public.couples
  for each row execute function public.set_updated_at();

-- ---------- couple_members ----------
create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at   timestamptz,                                   -- null = đang hoạt động
  primary key (couple_id, user_id),
  check (left_at is null or left_at >= joined_at)
);
-- Mỗi user chỉ ở tối đa 1 cặp đang hoạt động
create unique index couple_members_one_active_couple_per_user
  on public.couple_members (user_id) where left_at is null;
create index couple_members_active_by_couple
  on public.couple_members (couple_id) where left_at is null;

-- Mỗi cặp tối đa 2 thành viên hoạt động (khóa dòng couples để chống race)
create or replace function public.enforce_max_two_members()
returns trigger
language plpgsql
as $$
declare
  v_active int;
begin
  if new.left_at is null then
    perform 1 from public.couples where id = new.couple_id for update;
    select count(*) into v_active
      from public.couple_members
     where couple_id = new.couple_id
       and left_at is null
       and user_id <> new.user_id;
    if v_active >= 2 then
      raise exception 'COUPLE_FULL' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
create trigger couple_members_max_two
  before insert or update of left_at on public.couple_members
  for each row execute function public.enforce_max_two_members();

-- ---------- invitations ----------
create table public.invitations (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  code       text not null unique check (code ~ '^[A-Z2-9]{10}$'),
  created_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  max_uses   int not null default 1 check (max_uses >= 1),
  used_count int not null default 0 check (used_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (used_count <= max_uses)
);
create index invitations_by_couple on public.invitations (couple_id);

-- ---------- hàm hỗ trợ RLS (dùng ở mọi migration sau) ----------
create or replace function public.current_couple_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select couple_id from public.couple_members
   where user_id = auth.uid() and left_at is null
   limit 1
$$;

create or replace function public.is_couple_member(p_couple_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.couple_members
     where couple_id = p_couple_id
       and user_id = auth.uid()
       and left_at is null
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- true nếu p_user_id là chính mình hoặc người cùng cặp đang hoạt động
create or replace function public.is_self_or_partner(p_user_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select p_user_id = auth.uid()
      or exists (
        select 1
          from public.couple_members me
          join public.couple_members other on other.couple_id = me.couple_id
         where me.user_id = auth.uid() and me.left_at is null
           and other.user_id = p_user_id and other.left_at is null
      )
$$;

-- ---------- RPC: tạo cặp ----------
create or replace function public.create_couple(p_start_date date default null)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;
  if public.current_couple_id() is not null then
    raise exception 'ALREADY_IN_COUPLE' using errcode = 'P0001';
  end if;
  insert into public.couples (start_date, created_by) values (p_start_date, v_uid)
    returning id into v_id;
  insert into public.couple_members (couple_id, user_id) values (v_id, v_uid);
  return v_id;
end;
$$;

-- ---------- RPC: tạo mã mời ----------
create or replace function public.generate_invite_code()
returns text
language plpgsql volatile
set search_path = public, extensions
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   -- 32 ký tự, bỏ I O 0 1
  v_bytes bytea := gen_random_bytes(10);
  v_code  text := '';
  i int;
begin
  for i in 0..9 loop
    v_code := v_code || substr(v_chars, (get_byte(v_bytes, i) % 32) + 1, 1);
  end loop;
  return v_code;
end;
$$;

create or replace function public.create_invitation(p_hours int default 48)
returns public.invitations
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_uid    uuid := auth.uid();
  v_couple uuid := public.current_couple_id();
  v_row    public.invitations;
  v_try    int := 0;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;
  if v_couple is null then raise exception 'NOT_IN_COUPLE' using errcode = 'P0001'; end if;
  if p_hours is null or p_hours < 1 or p_hours > 168 then
    raise exception 'INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  loop
    begin
      insert into public.invitations (couple_id, code, created_by, expires_at)
      values (v_couple, public.generate_invite_code(), v_uid, now() + make_interval(hours => p_hours))
      returning * into v_row;
      return v_row;
    exception when unique_violation then
      v_try := v_try + 1;
      if v_try >= 5 then raise; end if;
    end;
  end loop;
end;
$$;

-- ---------- RPC: thu hồi mã mời ----------
create or replace function public.revoke_invitation(p_invitation_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  update public.invitations
     set revoked_at = coalesce(revoked_at, now())
   where id = p_invitation_id
     and public.is_couple_member(couple_id);
  if not found then raise exception 'INVITE_NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

-- ---------- RPC: nhập mã để ghép đôi ----------
create or replace function public.join_couple_by_code(p_code text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.invitations;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;
  if public.current_couple_id() is not null then
    raise exception 'ALREADY_IN_COUPLE' using errcode = 'P0001';
  end if;

  select * into v_inv from public.invitations
   where code = upper(btrim(coalesce(p_code, '')))
   for update;
  if not found then raise exception 'INVITE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_inv.revoked_at is not null then raise exception 'INVITE_REVOKED' using errcode = 'P0001'; end if;
  if v_inv.expires_at <= now() then raise exception 'INVITE_EXPIRED' using errcode = 'P0001'; end if;
  if v_inv.used_count >= v_inv.max_uses then raise exception 'INVITE_USED_UP' using errcode = 'P0001'; end if;

  insert into public.couple_members (couple_id, user_id) values (v_inv.couple_id, v_uid);  -- trigger ném COUPLE_FULL
  update public.invitations set used_count = used_count + 1 where id = v_inv.id;
  return v_inv.couple_id;
end;
$$;

-- ---------- RLS ----------
alter table public.profiles       enable row level security;
alter table public.couples        enable row level security;
alter table public.couple_members enable row level security;
alter table public.invitations    enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated using (public.is_self_or_partner(id));
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy couples_select on public.couples
  for select to authenticated using (public.is_couple_member(id));
create policy couples_update on public.couples
  for update to authenticated
  using (public.is_couple_member(id)) with check (public.is_couple_member(id));

create policy couple_members_select on public.couple_members
  for select to authenticated using (public.is_couple_member(couple_id));

create policy invitations_select on public.invitations
  for select to authenticated using (public.is_couple_member(couple_id));

-- Không có policy INSERT/DELETE cho couples, couple_members, invitations:
-- mọi thay đổi đi qua RPC ở trên.

-- Giới hạn cột được sửa trực tiếp (chặn tự cấp is_admin, đổi created_by...)
revoke insert, update, delete on public.profiles from authenticated;
grant  update (display_name, avatar_url) on public.profiles to authenticated;
revoke insert, update, delete on public.couples from authenticated;
grant  update (start_date, timezone) on public.couples to authenticated;
revoke insert, update, delete on public.couple_members from authenticated;
revoke insert, update, delete on public.invitations from authenticated;

-- ---------- quyền thực thi hàm ----------
revoke all on function public.current_couple_id()    from public;
revoke all on function public.is_couple_member(uuid) from public;
revoke all on function public.is_admin()             from public;
revoke all on function public.is_self_or_partner(uuid) from public;
revoke all on function public.create_couple(date)    from public;
revoke all on function public.generate_invite_code() from public;
revoke all on function public.create_invitation(int) from public;
revoke all on function public.revoke_invitation(uuid) from public;
revoke all on function public.join_couple_by_code(text) from public;

grant execute on function public.current_couple_id()    to authenticated;
grant execute on function public.is_couple_member(uuid) to authenticated;
grant execute on function public.is_admin()             to authenticated;
grant execute on function public.is_self_or_partner(uuid) to authenticated;
grant execute on function public.create_couple(date)    to authenticated;
grant execute on function public.create_invitation(int) to authenticated;
grant execute on function public.revoke_invitation(uuid) to authenticated;
grant execute on function public.join_couple_by_code(text) to authenticated;
