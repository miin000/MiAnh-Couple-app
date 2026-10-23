-- PHASE 6B extension: ngân sách, thông báo, trạng thái và dữ liệu từ vựng mở rộng.

alter table public.random_items
  add column if not exists price_per_person bigint
    check (price_per_person is null or price_per_person >= 0);

alter table public.date_plan_items
  add column if not exists estimated_cost_per_person bigint
    check (estimated_cost_per_person is null or estimated_cost_per_person >= 0),
  add column if not exists participants_count smallint not null default 2
    check (participants_count between 1 and 2);

update public.date_plan_items
set estimated_cost_per_person = case
  when estimated_cost_per_person is null then round(estimated_cost / greatest(participants_count, 1))
  else estimated_cost_per_person
end
where estimated_cost_per_person is null;

create table public.budget_plans (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  period_type text not null check (period_type in ('week', 'month', 'year')),
  period_start date not null,
  budget_amount bigint not null check (budget_amount >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, period_type, period_start),
  unique (id, couple_id)
);
create index budget_plans_by_couple on public.budget_plans (couple_id, period_start desc);
create trigger budget_plans_set_updated_at before update on public.budget_plans
for each row execute function public.set_updated_at();

create table public.budget_transactions (
  id uuid primary key default gen_random_uuid(),
  budget_plan_id uuid not null references public.budget_plans(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  spent_on date not null default current_date,
  category text not null check (char_length(btrim(category)) between 1 and 50),
  amount bigint not null check (amount > 0),
  note text,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  foreign key (budget_plan_id, couple_id)
    references public.budget_plans(id, couple_id) on delete cascade
);
create index budget_transactions_by_plan on public.budget_transactions (budget_plan_id, spent_on desc);

create table public.partner_statuses (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  status text not null check (status in ('đang nhớ', 'vui', 'bận', 'muốn nói chuyện')),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  couple_id uuid references public.couples(id) on delete cascade,
  kind text not null check (kind in ('system', 'learning', 'partner_status')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 500),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_created on public.notifications (recipient_id, created_at desc);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.budget_plans enable row level security;
alter table public.budget_transactions enable row level security;
alter table public.partner_statuses enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;

create policy budget_plans_member_all on public.budget_plans for all to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id) and created_by = auth.uid());
create policy budget_transactions_member_all on public.budget_transactions for all to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id) and created_by = auth.uid());
create policy partner_statuses_member_select on public.partner_statuses for select to authenticated
using (public.is_couple_member(couple_id) and (user_id = auth.uid() or expires_at > now()));
create policy partner_statuses_own_write on public.partner_statuses for all to authenticated
using (user_id = auth.uid() and public.is_couple_member(couple_id))
with check (user_id = auth.uid() and public.is_couple_member(couple_id) and expires_at > now());
create policy notifications_own_all on public.notifications for all to authenticated
using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy push_subscriptions_own_all on public.push_subscriptions for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.create_partner_status(p_status text, p_hours int)
returns void language plpgsql security definer set search_path = public as $function$
declare v_couple uuid := public.current_couple_id();
begin
  if v_couple is null or p_status not in ('đang nhớ', 'vui', 'bận', 'muốn nói chuyện')
     or p_hours < 1 or p_hours > 8 then
    raise exception 'INVALID_STATUS';
  end if;
  insert into public.partner_statuses(user_id, couple_id, status, expires_at)
  values (auth.uid(), v_couple, p_status, now() + make_interval(hours => p_hours))
  on conflict (user_id) do update set
    couple_id = excluded.couple_id, status = excluded.status,
    expires_at = excluded.expires_at, updated_at = now();
end;
$function$;
grant execute on function public.create_partner_status(text, int) to authenticated;

create or replace function public.get_budget_summary(p_plan_id uuid)
returns table (spent bigint, remaining bigint)
language sql stable security definer set search_path = public as $function$
  select coalesce(sum(t.amount), 0)::bigint,
         (p.budget_amount - coalesce(sum(t.amount), 0))::bigint
  from public.budget_plans p
  left join public.budget_transactions t on t.budget_plan_id = p.id
  where p.id = p_plan_id and public.is_couple_member(p.couple_id)
  group by p.budget_amount;
$function$;
grant execute on function public.get_budget_summary(uuid) to authenticated;

create or replace function public.record_budget_transaction(
  p_spent_on date,
  p_category text,
  p_amount bigint,
  p_note text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $function$
declare
  v_uid uuid := auth.uid();
  v_couple uuid := public.current_couple_id();
  v_plan uuid;
  v_id uuid;
begin
  if v_uid is null or v_couple is null or p_amount <= 0
     or char_length(btrim(coalesce(p_category, ''))) = 0 then
    raise exception 'INVALID_BUDGET_TRANSACTION';
  end if;

  select id into v_plan
  from public.budget_plans
  where couple_id = v_couple
    and (
      (period_type = 'week' and period_start = date_trunc('week', p_spent_on)::date)
      or (period_type = 'month' and period_start = date_trunc('month', p_spent_on)::date)
      or (period_type = 'year' and period_start = make_date(extract(year from p_spent_on)::int, 1, 1))
    )
  order by case period_type when 'week' then 1 when 'month' then 2 else 3 end
  limit 1;

  if v_plan is null then raise exception 'BUDGET_PLAN_NOT_FOUND'; end if;

  insert into public.budget_transactions
    (budget_plan_id, couple_id, spent_on, category, amount, note, created_by)
  values
    (v_plan, v_couple, p_spent_on, btrim(p_category), p_amount, nullif(btrim(p_note), ''), v_uid)
  returning id into v_id;
  return v_id;
end;
$function$;
grant execute on function public.record_budget_transaction(date, text, bigint, text) to authenticated;

create or replace function public.confirm_budget_transaction(p_transaction_id uuid)
returns void language plpgsql security definer set search_path = public
as $function$
begin
  update public.budget_transactions
  set status = 'confirmed', confirmed_at = now(), confirmed_by = auth.uid()
  where id = p_transaction_id
    and public.is_couple_member(couple_id)
    and status = 'pending';
  if not found then raise exception 'BUDGET_TRANSACTION_NOT_FOUND'; end if;
end;
$function$;
grant execute on function public.confirm_budget_transaction(uuid) to authenticated;

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  target_amount bigint not null check (target_amount > 0),
  saved_amount bigint not null default 0 check (saved_amount >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index savings_goals_by_couple on public.savings_goals (couple_id, created_at desc);
alter table public.savings_goals enable row level security;
create policy savings_goals_member_all on public.savings_goals for all to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id) and created_by = auth.uid());

create or replace function public.add_savings_amount(p_goal_id uuid, p_amount bigint)
returns void language plpgsql security definer set search_path = public
as $function$
begin
  if p_amount <= 0 then raise exception 'INVALID_SAVINGS_AMOUNT'; end if;
  update public.savings_goals
  set saved_amount = saved_amount + p_amount, updated_at = now()
  where id = p_goal_id and public.is_couple_member(couple_id);
  if not found then raise exception 'SAVINGS_GOAL_NOT_FOUND'; end if;
end;
$function$;
grant execute on function public.add_savings_amount(uuid, bigint) to authenticated;

alter table public.vocabulary_words
  add column if not exists phrase text,
  add column if not exists sentence_en text,
  add column if not exists sentence_vi text;
