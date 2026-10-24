-- Phase 9: trạng thái/note, hộp thư và Web Push.

alter table public.partner_statuses
  drop constraint if exists partner_statuses_status_check,
  add column if not exists note_text text,
  add column if not exists emoji text not null default '💬',
  add constraint partner_statuses_status_check
    check (char_length(btrim(status)) between 1 and 80),
  add constraint partner_statuses_note_text_check
    check (note_text is null or char_length(note_text) <= 80);

create table if not exists public.status_presets (
  id uuid primary key default gen_random_uuid(),
  emoji text not null,
  label text not null check (char_length(btrim(label)) between 1 and 40),
  sort_order smallint not null default 0,
  is_active boolean not null default true
);

insert into public.status_presets (emoji, label, sort_order)
values
  ('😊', 'Đang vui', 1), ('🥰', 'Đang nhớ', 2), ('😴', 'Đang buồn ngủ', 3),
  ('💪', 'Đang cố gắng', 4), ('🤗', 'Muốn ôm', 5), ('💬', 'Muốn nói chuyện', 6);

alter table public.status_presets enable row level security;
create policy status_presets_authenticated_read on public.status_presets
  for select to authenticated using (is_active);

alter table public.notifications
  add column if not exists push_sent_at timestamptz,
  drop constraint if exists notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check check (
    kind in ('system', 'learning', 'partner_status', 'daily_question', 'partner_activity')
  );

alter table public.push_subscriptions
  add column if not exists auth_key text,
  add column if not exists user_agent text;
update public.push_subscriptions set auth_key = auth where auth_key is null;
alter table public.push_subscriptions alter column auth_key set not null;

create table if not exists public.notification_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_learning boolean not null default true,
  daily_question boolean not null default true,
  partner_status boolean not null default true,
  partner_activity boolean not null default true,
  reminder_time time not null default '09:00',
  quiet_start time not null default '22:30',
  quiet_end time not null default '07:00',
  updated_at timestamptz not null default now()
);
alter table public.notification_settings enable row level security;
create policy notification_settings_own_all on public.notification_settings
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.get_couple_statuses()
returns table (
  user_id uuid, display_name text, avatar_url text, is_me boolean,
  emoji text, note_text text, updated_at timestamptz, seconds_left integer
)
language sql stable security definer set search_path = public
as $function$
  select p.id, p.display_name, p.avatar_url, p.id = auth.uid(),
    coalesce(s.emoji, '💬'), s.note_text, s.updated_at,
    greatest(0, extract(epoch from (s.expires_at - now()))::integer)
  from public.couple_members cm
  join public.profiles p on p.id = cm.user_id
  left join public.partner_statuses s on s.user_id = p.id
    and (s.user_id = auth.uid() or s.expires_at > now())
  where cm.couple_id = public.current_couple_id() and cm.left_at is null
  order by (p.id = auth.uid()) desc, cm.joined_at;
$function$;
grant execute on function public.get_couple_statuses() to authenticated;

create or replace function public.save_my_status(
  p_emoji text, p_note_text text, p_hours integer, p_notify_partner boolean
) returns void language plpgsql security definer set search_path = public
as $function$
declare v_couple uuid := public.current_couple_id(); v_partner uuid;
begin
  if v_couple is null or p_hours not in (1, 4, 12, 24)
     or char_length(btrim(coalesce(p_note_text, ''))) > 80
     or char_length(btrim(coalesce(p_emoji, ''))) > 8 then raise exception 'INVALID_STATUS'; end if;
  insert into public.partner_statuses(user_id, couple_id, status, emoji, note_text, expires_at)
  values (auth.uid(), v_couple, coalesce(nullif(btrim(p_note_text), ''), 'Đang ở đây'),
    coalesce(nullif(p_emoji, ''), '💬'), nullif(btrim(p_note_text), ''),
    now() + make_interval(hours => p_hours))
  on conflict (user_id) do update set couple_id = excluded.couple_id, status = excluded.status,
    emoji = excluded.emoji, note_text = excluded.note_text, expires_at = excluded.expires_at,
    updated_at = now();
  if p_notify_partner then
    select user_id into v_partner from public.couple_members
    where couple_id = v_couple and left_at is null and user_id <> auth.uid() limit 1;
    if v_partner is not null then
      insert into public.notifications(recipient_id, couple_id, kind, title, body, data)
      values (v_partner, v_couple, 'partner_status', 'Người ấy cập nhật note',
        'Người ấy vừa chia sẻ một trạng thái mới.', jsonb_build_object('url', '/home'));
    end if;
  end if;
end;
$function$;
grant execute on function public.save_my_status(text, text, integer, boolean) to authenticated;

create or replace function public.clear_my_status()
returns void language sql security definer set search_path = public
as $function$ delete from public.partner_statuses where user_id = auth.uid(); $function$;
grant execute on function public.clear_my_status() to authenticated;

create or replace function public.register_push_subscription(
  p_endpoint text, p_p256dh text, p_auth_key text, p_user_agent text
) returns void language plpgsql security definer set search_path = public
as $function$
begin
  if auth.uid() is null or p_endpoint is null or p_p256dh is null or p_auth_key is null
    or char_length(p_endpoint) > 2048 then raise exception 'INVALID_PUSH_SUBSCRIPTION'; end if;
  insert into public.push_subscriptions(user_id, endpoint, p256dh, auth, auth_key, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth_key, p_auth_key, left(p_user_agent, 500))
  on conflict (user_id, endpoint) do update set p256dh = excluded.p256dh,
    auth = excluded.auth, auth_key = excluded.auth_key, user_agent = excluded.user_agent;
end;
$function$;
grant execute on function public.register_push_subscription(text, text, text, text) to authenticated;

create or replace function public.unregister_push_subscription(p_endpoint text)
returns void language sql security definer set search_path = public
as $function$ delete from public.push_subscriptions where user_id = auth.uid() and endpoint = p_endpoint; $function$;
grant execute on function public.unregister_push_subscription(text) to authenticated;

create or replace function public.get_notification_settings()
returns setof public.notification_settings language plpgsql security definer set search_path = public
as $function$
begin
  insert into public.notification_settings(user_id) values (auth.uid()) on conflict do nothing;
  return query select * from public.notification_settings where user_id = auth.uid();
end;
$function$;
grant execute on function public.get_notification_settings() to authenticated;

create or replace function public.unread_notification_count()
returns integer language sql stable security definer set search_path = public
as $function$ select count(*)::integer from public.notifications where recipient_id = auth.uid() and read_at is null; $function$;
grant execute on function public.unread_notification_count() to authenticated;

create or replace function public.mark_notifications_read()
returns void language sql security definer set search_path = public
as $function$ update public.notifications set read_at = now() where recipient_id = auth.uid() and read_at is null; $function$;
grant execute on function public.mark_notifications_read() to authenticated;
