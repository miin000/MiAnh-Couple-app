alter table public.date_plans
  add column if not exists archived_at timestamptz;

create index if not exists date_plans_active_by_couple
  on public.date_plans (couple_id, archived_at, planned_for desc);
