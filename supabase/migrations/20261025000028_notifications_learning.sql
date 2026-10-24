-- Phase 9: thông báo trạng thái và nhắc học hàng ngày.

create or replace function public.save_my_status(
  p_emoji text, p_note_text text, p_hours integer, p_notify_partner boolean
) returns void language plpgsql security definer set search_path = public
as $function$
declare
  v_couple uuid := public.current_couple_id();
  v_partner uuid;
  v_partner_notifications boolean := true;
begin
  if v_couple is null or p_hours not in (1, 4, 12, 24)
     or char_length(btrim(coalesce(p_note_text, ''))) > 80
     or char_length(btrim(coalesce(p_emoji, ''))) > 8 then
    raise exception 'INVALID_STATUS';
  end if;

  insert into public.partner_statuses(user_id, couple_id, status, emoji, note_text, expires_at)
  values (auth.uid(), v_couple, coalesce(nullif(btrim(p_note_text), ''), 'Đang ở đây'),
    coalesce(nullif(p_emoji, ''), '💬'), nullif(btrim(p_note_text), ''),
    now() + make_interval(hours => p_hours))
  on conflict (user_id) do update set couple_id = excluded.couple_id,
    status = excluded.status, emoji = excluded.emoji, note_text = excluded.note_text,
    expires_at = excluded.expires_at, updated_at = now();

  select user_id into v_partner
  from public.couple_members
  where couple_id = v_couple and left_at is null and user_id <> auth.uid()
  limit 1;

  if p_notify_partner and v_partner is not null then
    select coalesce(partner_status, true) into v_partner_notifications
    from public.notification_settings where user_id = v_partner;
    if v_partner_notifications and not exists (
      select 1 from public.notifications
      where recipient_id = v_partner and kind = 'partner_status'
        and created_at > now() - interval '5 minutes'
    ) then
      insert into public.notifications(recipient_id, couple_id, kind, title, body, data)
      values (v_partner, v_couple, 'partner_status', 'Người ấy cập nhật note',
        'Người ấy vừa chia sẻ một trạng thái mới.', jsonb_build_object('url', '/home'));
    end if;
  end if;
end;
$function$;
grant execute on function public.save_my_status(text, text, integer, boolean) to authenticated;

create or replace function public.dispatch_daily_learning_notifications()
returns integer language plpgsql security definer set search_path = public
as $function$
declare
  v_today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  v_lesson_id uuid;
  v_count integer := 0;
  r record;
  v_due integer;
begin
  select id into v_lesson_id from public.daily_lessons
  where lesson_date = v_today and is_published limit 1;

  for r in
    select p.id as user_id, coalesce(ns.daily_learning, true) as enabled
    from public.profiles p
    left join public.notification_settings ns on ns.user_id = p.id
    where coalesce(ns.daily_learning, true)
  loop
    if v_lesson_id is not null and not exists (
      select 1 from public.lesson_completions
      where user_id = r.user_id and lesson_id = v_lesson_id
    ) and not exists (
      select 1 from public.notifications
      where recipient_id = r.user_id and kind = 'learning'
        and data->>'dedupe_key' = 'daily-lesson:' || v_today::text
    ) then
      insert into public.notifications(recipient_id, kind, title, body, data)
      values (r.user_id, 'learning', 'Bài hôm nay đang chờ bạn',
        'Bài hôm nay gồm 10 từ đang chờ bạn.', jsonb_build_object(
          'url', '/learn', 'dedupe_key', 'daily-lesson:' || v_today::text));
      v_count := v_count + 1;
    else
      select count(*)::integer into v_due from public.user_word_progress
      where user_id = r.user_id and next_review_at <= now();
      if v_due > 0 and not exists (
        select 1 from public.notifications
        where recipient_id = r.user_id and kind = 'learning'
          and data->>'dedupe_key' = 'daily-review:' || v_today::text
      ) then
        insert into public.notifications(recipient_id, kind, title, body, data)
        values (r.user_id, 'learning', 'Từ cần ôn hôm nay',
          v_due::text || ' từ cần ôn hôm nay.', jsonb_build_object(
            'url', '/learn', 'dedupe_key', 'daily-review:' || v_today::text));
        v_count := v_count + 1;
      end if;
    end if;
  end loop;
  return v_count;
end;
$function$;
grant execute on function public.dispatch_daily_learning_notifications() to service_role;

do $block$
begin
  if to_regnamespace('cron') is not null then
    perform cron.schedule(
      'mianh-dispatch-daily-learning-notifications',
      '*/15 * * * *',
      $$select public.dispatch_daily_learning_notifications();$$
    );
  end if;
exception when unique_violation then
  null;
end;
$block$;

do $block$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'partner_statuses'
  ) then
    alter publication supabase_realtime add table public.partner_statuses;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication is not available yet';
end;
$block$;
