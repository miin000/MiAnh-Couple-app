-- Sửa ghép kế hoạch ngân sách theo khoảng thời gian thay vì ngày bắt đầu tuyệt đối.

update public.budget_plans
set period_start = case period_type
  when 'week' then date_trunc('week', period_start)::date
  when 'month' then date_trunc('month', period_start)::date
  when 'year' then make_date(extract(year from period_start)::int, 1, 1)
end;

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
      and case bp.period_type
        when 'week' then coalesce(v_plan_date, current_date) >= bp.period_start
          and coalesce(v_plan_date, current_date) < bp.period_start + interval '7 days'
        when 'month' then coalesce(v_plan_date, current_date) >= bp.period_start
          and coalesce(v_plan_date, current_date) < (bp.period_start + interval '1 month')
        when 'year' then coalesce(v_plan_date, current_date) >= bp.period_start
          and coalesce(v_plan_date, current_date) < (bp.period_start + interval '1 year')
        else false
      end
    order by case bp.period_type when 'week' then 1 when 'month' then 2 else 3 end,
             bp.period_start desc
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
