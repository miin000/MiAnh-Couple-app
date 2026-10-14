-- =====================================================================
-- PHASE 2 — DISCOVER: random_items, date_plans, date_plan_items
-- Tiền: bigint VND. Nội dung random_items nạp bằng seed.sql (external_key).
-- =====================================================================

create table public.random_items (
  id           uuid primary key default gen_random_uuid(),
  external_key text unique,                                  -- khóa ổn định cho seed (idempotent)
  kind         text not null check (kind in ('food', 'drink', 'place', 'activity')),
  title        text not null check (char_length(title) between 1 and 120),
  description  text,
  tip          text,                                         -- gợi ý thực hiện
  price_level  smallint check (price_level between 1 and 4), -- 1 rẻ ... 4 đắt
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index random_items_kind_active on public.random_items (kind) where is_active;
create trigger random_items_set_updated_at
  before update on public.random_items
  for each row execute function public.set_updated_at();

create table public.date_plans (
  id             uuid primary key default gen_random_uuid(),
  couple_id      uuid not null references public.couples(id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 100),
  planned_for    date,
  planned_budget bigint check (planned_budget >= 0),         -- VND
  created_by     uuid not null references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (id, couple_id)                                     -- để bảng con tham chiếu cặp (id, couple_id)
);
create index date_plans_by_couple on public.date_plans (couple_id, planned_for desc);
create trigger date_plans_set_updated_at
  before update on public.date_plans
  for each row execute function public.set_updated_at();

create table public.date_plan_items (
  id             uuid primary key default gen_random_uuid(),
  plan_id        uuid not null,
  couple_id      uuid not null,                              -- khử chuẩn hóa để RLS đơn giản; FK dưới đây đảm bảo khớp plan
  random_item_id uuid references public.random_items(id) on delete set null,
  title          text not null check (char_length(title) between 1 and 120),
  estimated_cost bigint not null default 0 check (estimated_cost >= 0),
  actual_cost    bigint check (actual_cost >= 0),
  position       int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  foreign key (plan_id, couple_id) references public.date_plans (id, couple_id) on delete cascade
);
create index date_plan_items_by_plan on public.date_plan_items (plan_id, position);
create trigger date_plan_items_set_updated_at
  before update on public.date_plan_items
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.random_items    enable row level security;
alter table public.date_plans      enable row level security;
alter table public.date_plan_items enable row level security;

create policy random_items_select on public.random_items
  for select to authenticated using (is_active);
create policy random_items_admin_all on public.random_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy date_plans_select on public.date_plans
  for select to authenticated using (public.is_couple_member(couple_id));
create policy date_plans_insert on public.date_plans
  for insert to authenticated
  with check (public.is_couple_member(couple_id) and created_by = auth.uid());
create policy date_plans_update on public.date_plans
  for update to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy date_plans_delete on public.date_plans
  for delete to authenticated using (public.is_couple_member(couple_id));

create policy date_plan_items_all on public.date_plan_items
  for all to authenticated
  using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
