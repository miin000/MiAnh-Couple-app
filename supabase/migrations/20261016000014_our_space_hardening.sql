-- PHASE 6 hardening: leap-year anniversaries and storage path ownership.

create or replace function public.next_anniversary(
  p_event date,
  p_repeat boolean,
  p_today date
)
returns date
language plpgsql
immutable
as $$
declare
  v_year int;
  v_next date;
begin
  if not p_repeat or p_event >= p_today then
    return p_event;
  end if;

  v_year := extract(year from p_today)::int;
  begin
    v_next := make_date(v_year, extract(month from p_event)::int, extract(day from p_event)::int);
  exception when datetime_field_overflow then
    -- 29/02 is celebrated on 28/02 in non-leap years.
    v_next := make_date(v_year, 2, 28);
  end;

  if v_next < p_today then
    v_year := v_year + 1;
    begin
      v_next := make_date(v_year, extract(month from p_event)::int, extract(day from p_event)::int);
    exception when datetime_field_overflow then
      v_next := make_date(v_year, 2, 28);
    end;
  end if;
  return v_next;
end;
$$;

create or replace function public.storage_memory_id(p_name text)
returns uuid
language sql
immutable
as $$
  select case
    when (storage.foldername(p_name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then ((storage.foldername(p_name))[2])::uuid
  end
$$;

revoke all on function public.storage_memory_id(text) from public;
grant execute on function public.storage_memory_id(text) to authenticated;

drop policy if exists memories_objects_select on storage.objects;
drop policy if exists memories_objects_insert on storage.objects;
drop policy if exists memories_objects_update on storage.objects;
drop policy if exists memories_objects_delete on storage.objects;

create policy memories_objects_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'memories'
    and public.is_couple_member(public.storage_couple_id(name))
    and exists (
      select 1 from public.memories m
      where m.id = public.storage_memory_id(name)
        and m.couple_id = public.storage_couple_id(name)
    )
  );

create policy memories_objects_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'memories'
    and public.is_couple_member(public.storage_couple_id(name))
    and exists (
      select 1 from public.memories m
      where m.id = public.storage_memory_id(name)
        and m.couple_id = public.storage_couple_id(name)
    )
  );

create policy memories_objects_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'memories'
    and public.is_couple_member(public.storage_couple_id(name))
    and exists (
      select 1 from public.memories m
      where m.id = public.storage_memory_id(name)
        and m.couple_id = public.storage_couple_id(name)
    )
  )
  with check (
    bucket_id = 'memories'
    and public.is_couple_member(public.storage_couple_id(name))
    and exists (
      select 1 from public.memories m
      where m.id = public.storage_memory_id(name)
        and m.couple_id = public.storage_couple_id(name)
    )
  );

create policy memories_objects_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'memories'
    and public.is_couple_member(public.storage_couple_id(name))
    and exists (
      select 1 from public.memories m
      where m.id = public.storage_memory_id(name)
        and m.couple_id = public.storage_couple_id(name)
    )
  );
