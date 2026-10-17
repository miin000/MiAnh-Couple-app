-- PHASE 6B — Chia sẻ vị trí có thời hạn, chỉ giữa hai thành viên cùng cặp.

create table if not exists public.location_shares (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lat double precision,
  lng double precision,
  accuracy_m double precision,
  sharing_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  check ((lat is null and lng is null) or (lat between -90 and 90 and lng between -180 and 180)),
  check (accuracy_m is null or accuracy_m >= 0)
);

create index if not exists location_shares_active_idx
  on public.location_shares (couple_id, sharing_until);

alter publication supabase_realtime add table public.location_shares;

alter table public.location_shares enable row level security;

create policy location_shares_select on public.location_shares
  for select to authenticated
  using (
    public.is_couple_member(couple_id)
    and (
      user_id = auth.uid()
      or (sharing_until is not null and sharing_until > now())
    )
  );

revoke all on public.location_shares from anon, authenticated;
grant select on public.location_shares to authenticated;

create or replace function public.start_location_sharing(p_hours int)
returns timestamptz
language plpgsql security definer
set search_path = public
as $$
declare
  v_couple uuid := public.current_couple_id();
  v_until timestamptz;
begin
  if v_couple is null then raise exception 'NOT_IN_COUPLE' using errcode = 'P0001'; end if;
  if p_hours not in (1, 4, 8) then raise exception 'INVALID_ARGUMENT' using errcode = 'P0001'; end if;
  v_until := now() + make_interval(hours => p_hours);
  insert into public.location_shares (couple_id, user_id, lat, lng, accuracy_m, sharing_until, updated_at)
  values (v_couple, auth.uid(), null, null, null, v_until, now())
  on conflict (couple_id, user_id) do update
    set lat = null, lng = null, accuracy_m = null, sharing_until = excluded.sharing_until, updated_at = now();
  return v_until;
end;
$$;

create or replace function public.stop_location_sharing()
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  update public.location_shares
     set lat = null, lng = null, accuracy_m = null, sharing_until = null, updated_at = now()
   where couple_id = public.current_couple_id() and user_id = auth.uid();
end;
$$;

create or replace function public.update_my_location(p_lat double precision, p_lng double precision, p_accuracy double precision)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'INVALID_ARGUMENT' using errcode = 'P0001';
  end if;
  update public.location_shares
     set lat = p_lat, lng = p_lng, accuracy_m = greatest(coalesce(p_accuracy, 0), 0), updated_at = now()
   where couple_id = public.current_couple_id()
     and user_id = auth.uid()
     and sharing_until is not null
     and sharing_until > now();
  if not found then raise exception 'LOCATION_SHARING_INACTIVE' using errcode = 'P0001'; end if;
end;
$$;

create or replace function public.get_my_sharing_status()
returns table (is_sharing boolean, sharing_until timestamptz, seconds_remaining int)
language sql stable security definer
set search_path = public
as $$
  select
    coalesce(ls.sharing_until > now(), false),
    ls.sharing_until,
    greatest(0, floor(extract(epoch from (ls.sharing_until - now())))::int)
  from public.location_shares ls
  where ls.couple_id = public.current_couple_id() and ls.user_id = auth.uid()
$$;

create or replace function public.get_partner_location()
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  lat double precision,
  lng double precision,
  accuracy_m double precision,
  updated_at timestamptz,
  seconds_since_update int
)
language sql stable security definer
set search_path = public
as $$
  select ls.user_id, p.display_name, p.avatar_url, ls.lat, ls.lng, ls.accuracy_m,
    ls.updated_at, greatest(0, floor(extract(epoch from (now() - ls.updated_at)))::int)
  from public.location_shares ls
  join public.profiles p on p.id = ls.user_id
  where ls.couple_id = public.current_couple_id()
    and ls.user_id <> auth.uid()
    and ls.sharing_until > now()
    and ls.lat is not null and ls.lng is not null
  limit 1
$$;

create or replace function public.purge_expired_locations()
returns int
language plpgsql security definer
set search_path = public
as $$
declare v_count int;
begin
  update public.location_shares
     set lat = null, lng = null, accuracy_m = null, sharing_until = null, updated_at = now()
   where sharing_until is not null and sharing_until <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.start_location_sharing(int) from public;
revoke all on function public.stop_location_sharing() from public;
revoke all on function public.update_my_location(double precision, double precision, double precision) from public;
revoke all on function public.get_my_sharing_status() from public;
revoke all on function public.get_partner_location() from public;
revoke all on function public.purge_expired_locations() from public;
grant execute on function public.start_location_sharing(int) to authenticated;
grant execute on function public.stop_location_sharing() to authenticated;
grant execute on function public.update_my_location(double precision, double precision, double precision) to authenticated;
grant execute on function public.get_my_sharing_status() to authenticated;
grant execute on function public.get_partner_location() to authenticated;
