-- Xác nhận kế hoạch hẹn hò tự ghi vào khoản chi của tháng.
-- Người dùng không cần tạo kế hoạch ngân sách tháng trước.

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
  v_month_start date;
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
  v_month_start := date_trunc('month', coalesce(v_plan_date, current_date))::date;

  if v_transaction is null then
    select bp.id into v_budget_plan
    from public.budget_plans bp
    where bp.couple_id = v_couple
      and bp.period_type = 'month'
      and bp.period_start = v_month_start
    order by bp.created_at desc
    limit 1;

    if v_budget_plan is null then
      insert into public.budget_plans
        (couple_id, name, period_type, period_start, budget_amount, created_by)
      values
        (v_couple,
         'Khoản chi tháng ' || to_char(v_month_start, 'MM/YYYY'),
         'month', v_month_start, 0, v_uid)
      on conflict (couple_id, period_type, period_start) do nothing
      returning id into v_budget_plan;

      if v_budget_plan is null then
        select bp.id into v_budget_plan
        from public.budget_plans bp
        where bp.couple_id = v_couple
          and bp.period_type = 'month'
          and bp.period_start = v_month_start
        order by bp.created_at desc
        limit 1;
      end if;
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
