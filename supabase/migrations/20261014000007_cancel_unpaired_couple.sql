-- =====================================================================
-- PHASE 1.1 — HỦY CẶP CHƯA GHÉP ĐÔI & NÂNG CẤP JOIN_COUPLE_BY_CODE
-- Giúp người dùng khi lỡ bấm tạo mã mới vẫn có thể chuyển sang nhập mã
-- của người yêu mà không bị lỗi ALREADY_IN_COUPLE.
-- =====================================================================

-- RPC hủy cặp chỉ có 1 thành viên (chưa ghép đôi với ai)
create or replace function public.cancel_unpaired_couple()
returns void
language plpgsql security definer
set search_path = public
as $
declare
  v_uid uuid := auth.uid();
  v_couple_id uuid := public.current_couple_id();
  v_count int;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;
  if v_couple_id is null then return; end if;

  select count(*) into v_count
    from public.couple_members
   where couple_id = v_couple_id and left_at is null;

  if v_count > 1 then
    raise exception 'CANNOT_LEAVE_PAIRED_COUPLE' using errcode = 'P0001';
  end if;

  -- Xóa không gian chưa ghép đôi do mình tạo
  delete from public.couples where id = v_couple_id and created_by = v_uid;
end;
$;

revoke all on function public.cancel_unpaired_couple() from public;
grant execute on function public.cancel_unpaired_couple() to authenticated;

-- Cập nhật join_couple_by_code: Nếu đang ở trong cặp đơn độc 1 người thì tự động hủy để join cặp người yêu
create or replace function public.join_couple_by_code(p_code text)
returns uuid
language plpgsql security definer
set search_path = public
as $
declare
  v_uid uuid := auth.uid();
  v_current_couple uuid := public.current_couple_id();
  v_count int;
  v_inv public.invitations;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001'; end if;

  -- Kiểm tra không gian hiện tại
  if v_current_couple is not null then
    select count(*) into v_count
      from public.couple_members
     where couple_id = v_current_couple and left_at is null;

    if v_count > 1 then
      raise exception 'ALREADY_IN_COUPLE' using errcode = 'P0001';
    end if;

    -- Tự động hủy không gian đơn độc
    delete from public.couples where id = v_current_couple and created_by = v_uid;
  end if;

  select * into v_inv from public.invitations
   where code = upper(btrim(coalesce(p_code, '')))
   for update;
  if not found then raise exception 'INVITE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_inv.revoked_at is not null then raise exception 'INVITE_REVOKED' using errcode = 'P0001'; end if;
  if v_inv.expires_at <= now() then raise exception 'INVITE_EXPIRED' using errcode = 'P0001'; end if;
  if v_inv.used_count >= v_inv.max_uses then raise exception 'INVITE_USED_UP' using errcode = 'P0001'; end if;

  if v_inv.created_by = v_uid then
    raise exception 'CANNOT_JOIN_OWN_COUPLE' using errcode = 'P0001';
  end if;

  insert into public.couple_members (couple_id, user_id) values (v_inv.couple_id, v_uid);
  update public.invitations set used_count = used_count + 1 where id = v_inv.id;
  return v_inv.couple_id;
end;
$;
