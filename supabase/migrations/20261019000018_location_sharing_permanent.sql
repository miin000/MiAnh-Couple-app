-- PHASE 6B — Chia sẻ vị trí vô thời hạn cho đến khi người dùng tự tắt.

alter table public.location_shares
  add column if not exists sharing_enabled boolean not null default false;

update public.location_shares
set sharing_enabled = sharing_until is not null and sharing_until > now()
where sharing_enabled = false and sharing_until is not null;

drop policy if exists location_shares_select on public.location_shares;

create policy location_shares_select on public.location_shares
  for select to authenticated
  using (
    public.is_couple_member(couple_id)
    and (
      user_id = auth.uid()
      or sharing_enabled
    )
  );

create or replace function public.start_location_sharing()
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_couple uuid := public.current_couple_id();
begin
  if v_couple is null then
    raise exception 'NOT_IN_COUPLE' using errcode = 'P0001';
  end if;

  insert into public.location_shares (
    couple_id, user_id, lat, lng, accuracy_m, sharing_until, sharing_enabled, updated_at
  )
  values (v_couple, auth.uid(), null, null, null, null, true, now())
  on conflict (couple_id, user_id) do update
    set sharing_until = null,
        sharing_enabled = true,
        updated_at = now();
  return true;
end;
$$;

create or replace function public.stop_location_sharing()
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  update public.location_shares
     set lat = null, lng = null, accuracy_m = null,
         sharing_until = null, sharing_enabled = false, updated_at = now()
   where couple_id = public.current_couple_id() and user_id = auth.uid();
end;
$$;

create or replace function public.update_my_location(
  p_lat double precision,
  p_lng double precision,
  p_accuracy double precision
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if p_lat is null or p_lng is null
     or p_lat not between -90 and 90
     or p_lng not between -180 and 180 then
    raise exception 'INVALID_ARGUMENT' using errcode = 'P0001';
  end if;

  update public.location_shares
     set lat = p_lat, lng = p_lng,
         accuracy_m = greatest(coalesce(p_accuracy, 0), 0),
         updated_at = now()
   where couple_id = public.current_couple_id()
     and user_id = auth.uid()
     and sharing_enabled;

  if not found then
    raise exception 'LOCATION_SHARING_INACTIVE' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.get_my_sharing_status()
returns table (is_sharing boolean, sharing_until timestamptz, seconds_remaining int)
language sql stable security definer
set search_path = public
as $$
  select ls.sharing_enabled, null::timestamptz, null::int
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
    and ls.sharing_enabled
    and ls.lat is not null and ls.lng is not null
  limit 1
$$;

create or replace function public.purge_expired_locations()
returns int
language plpgsql security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.location_shares
     set lat = null, lng = null, accuracy_m = null,
         sharing_until = null, sharing_enabled = false, updated_at = now()
   where sharing_until is not null
     and sharing_until <= now()
     and sharing_enabled;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.start_location_sharing() from public;
grant execute on function public.start_location_sharing() to authenticated;
