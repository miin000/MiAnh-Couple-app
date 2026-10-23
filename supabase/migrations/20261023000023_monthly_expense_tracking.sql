-- Khoản chi được quản lý theo tháng; tuần chỉ còn là dữ liệu tương thích cũ.

alter table public.budget_plans
  add column if not exists warning_amount bigint
    check (warning_amount is null or warning_amount >= 0);

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
    and period_type = 'month'
    and period_start = date_trunc('month', p_spent_on)::date
  order by created_at desc
  limit 1;

  if v_plan is null then raise exception 'BUDGET_PLAN_NOT_FOUND'; end if;

  insert into public.budget_transactions
    (budget_plan_id, couple_id, spent_on, category, amount, note, created_by)
  values
    (v_plan, v_couple, p_spent_on, btrim(p_category), p_amount, p_note, v_uid)
  returning id into v_id;

  return v_id;
end;
$function$;

grant execute on function public.record_budget_transaction(date, text, bigint, text) to authenticated;

create or replace function public.confirm_date_plan_item(
  p_item_id uuid,
  p_actual_cost bigint default null
)
returns uuid
language plpgsql security definer set search_path = public
as $function$
declare
  v_uid uuid := auth.uid();
  v_couple uuid;
  v_plan_date date;
  v_title text;
  v_estimated bigint;
  v_actual bigint;
  v_budget_plan uuid;
  v_transaction uuid;
begin
  select dp.couple_id, dp.planned_for, dpi.title, dpi.estimated_cost,
         dpi.actual_cost, dpi.budget_transaction_id
    into v_couple, v_plan_date, v_title, v_estimated, v_actual, v_transaction
  from public.date_plan_items dpi
  join public.date_plans dp on dp.id = dpi.plan_id
  where dpi.id = p_item_id;

  if v_uid is null or v_couple is null or not public.is_couple_member(v_couple) then
    raise exception 'DATE_PLAN_ITEM_NOT_FOUND';
  end if;

  v_actual := coalesce(p_actual_cost, v_actual, v_estimated);
  if v_actual < 0 then raise exception 'INVALID_ACTUAL_COST'; end if;

  if v_transaction is null then
    select bp.id into v_budget_plan
    from public.budget_plans bp
    where bp.couple_id = v_couple
      and bp.period_type = 'month'
      and bp.period_start = date_trunc('month', coalesce(v_plan_date, current_date))::date
    order by bp.created_at desc
    limit 1;

    if v_budget_plan is null then
      raise exception 'BUDGET_PLAN_NOT_FOUND';
    end if;

    insert into public.budget_transactions
      (budget_plan_id, couple_id, spent_on, category, amount, note, created_by, status, confirmed_at, confirmed_by)
    values
      (v_budget_plan, v_couple, coalesce(v_plan_date, current_date), v_title, v_actual,
       'Từ kế hoạch hẹn hò', v_uid, 'confirmed', now(), v_uid)
    returning id into v_transaction;

    update public.date_plan_items
    set actual_cost = v_actual, budget_transaction_id = v_transaction
    where id = p_item_id;
  else
    update public.date_plan_items
    set actual_cost = v_actual
    where id = p_item_id;

    update public.budget_transactions
    set amount = v_actual
    where id = v_transaction;
  end if;

  return v_transaction;
end;
$function$;

grant execute on function public.confirm_date_plan_item(uuid, bigint) to authenticated;
