-- =====================================================================
-- PHASE 6 — OUR SPACE: memories, memory_photos, anniversaries, bucket_list_items
-- + Storage bucket 'memories' (private). Path ảnh BẮT BUỘC: "{couple_id}/{memory_id}/{tên_file}"
-- Số ngày bên nhau: (ngày hôm nay theo couples.timezone) - couples.start_date  [tính ở app]
-- =====================================================================

create table public.memories (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  created_by  uuid not null references public.profiles(id),
  title       text not null check (char_length(title) between 1 and 120),
  note        text check (char_length(note) <= 5000),
  happened_at date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, couple_id)
);
create index memories_timeline on public.memories (couple_id, happened_at desc, created_at desc);
create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

create table public.memory_photos (
  id           uuid primary key default gen_random_uuid(),
  memory_id    uuid not null,
  couple_id    uuid not null,
  storage_path text not null unique,
  created_at   timestamptz not null default now(),
  foreign key (memory_id, couple_id) references public.memories (id, couple_id) on delete cascade,
  check (storage_path like couple_id::text || '/%')          -- ảnh phải nằm trong thư mục của cặp
);
create index memory_photos_by_memory on public.memory_photos (memory_id);
create index memory_photos_album on public.memory_photos (couple_id, created_at desc);

create table public.anniversaries (
  id            uuid primary key default gen_random_uuid(),
  couple_id     uuid not null references public.couples(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 100),
  event_date    date not null,
  repeat_yearly boolean not null default false,
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now()
);
create index anniversaries_by_couple on public.anniversaries (couple_id);

create table public.bucket_list_items (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  is_done    boolean not null default false,
  done_at    timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (is_done = (done_at is not null))
);
create index bucket_list_items_by_couple on public.bucket_list_items (couple_id, is_done, created_at desc);

-- Ngày xảy ra kế tiếp (xử lý lặp hằng năm, 29/2 -> 28/2 năm không nhuận)
create or replace function public.next_anniversary(p_event date, p_repeat boolean, p_today date)
returns date
language plpgsql immutable
as $$
declare
  v_years int;
  v_next  date;
begin
  if not p_repeat then return p_event; end if;
  v_years := greatest(extract(year from p_today)::int - extract(year from p_event)::int, 0);
  v_next  := (p_event + make_interval(years => v_years))::date;
  if v_next < p_today then
    v_next := (p_event + make_interval(years => v_years + 1))::date;
  end if;
  return v_next;
end;
$$;

-- View đếm ngược (theo múi giờ cặp). security_invoker => RLS của bảng gốc vẫn áp dụng.
create view public.anniversary_countdowns
with (security_invoker = true) as
select a.id, a.couple_id, a.title, a.event_date, a.repeat_yearly,
       public.next_anniversary(a.event_date, a.repeat_yearly, (now() at time zone c.timezone)::date) as next_date,
       public.next_anniversary(a.event_date, a.repeat_yearly, (now() at time zone c.timezone)::date)
         - (now() at time zone c.timezone)::date as days_left
  from public.anniversaries a
  join public.couples c on c.id = a.couple_id;

-- ---------- RLS ----------
alter table public.memories          enable row level security;
alter table public.memory_photos     enable row level security;
alter table public.anniversaries     enable row level security;
alter table public.bucket_list_items enable row level security;

create policy memories_select on public.memories
  for select to authenticated using (public.is_couple_member(couple_id));
create policy memories_insert on public.memories
  for insert to authenticated
  with check (public.is_couple_member(couple_id) and created_by = auth.uid());
create policy memories_update on public.memories
  for update to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy memories_delete on public.memories
  for delete to authenticated using (public.is_couple_member(couple_id));

create policy memory_photos_all on public.memory_photos
  for all to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

create policy anniversaries_select on public.anniversaries
  for select to authenticated using (public.is_couple_member(couple_id));
create policy anniversaries_insert on public.anniversaries
  for insert to authenticated
  with check (public.is_couple_member(couple_id) and created_by = auth.uid());
create policy anniversaries_update on public.anniversaries
  for update to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy anniversaries_delete on public.anniversaries
  for delete to authenticated using (public.is_couple_member(couple_id));

create policy bucket_list_items_select on public.bucket_list_items
  for select to authenticated using (public.is_couple_member(couple_id));
create policy bucket_list_items_insert on public.bucket_list_items
  for insert to authenticated
  with check (public.is_couple_member(couple_id) and created_by = auth.uid());
create policy bucket_list_items_update on public.bucket_list_items
  for update to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy bucket_list_items_delete on public.bucket_list_items
  for delete to authenticated using (public.is_couple_member(couple_id));

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memories', 'memories', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Lấy couple_id từ thư mục đầu tiên của đường dẫn; sai định dạng -> null -> bị từ chối
create or replace function public.storage_couple_id(p_name text)
returns uuid
language sql immutable
as $$
  select case
    when (storage.foldername(p_name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then ((storage.foldername(p_name))[1])::uuid
  end
$$;
revoke all on function public.storage_couple_id(text) from public;
grant execute on function public.storage_couple_id(text) to authenticated;
revoke all on function public.next_anniversary(date, boolean, date) from public;
grant execute on function public.next_anniversary(date, boolean, date) to authenticated;

create policy memories_objects_select on storage.objects
  for select to authenticated
  using (bucket_id = 'memories' and public.is_couple_member(public.storage_couple_id(name)));
create policy memories_objects_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'memories' and public.is_couple_member(public.storage_couple_id(name)));
create policy memories_objects_update on storage.objects
  for update to authenticated
  using (bucket_id = 'memories' and public.is_couple_member(public.storage_couple_id(name)))
  with check (bucket_id = 'memories' and public.is_couple_member(public.storage_couple_id(name)));
create policy memories_objects_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'memories' and public.is_couple_member(public.storage_couple_id(name)));
