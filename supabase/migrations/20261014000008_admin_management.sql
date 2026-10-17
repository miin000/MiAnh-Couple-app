-- =====================================================================
-- PHASE 2 EXTENSION — ADMIN MANAGEMENT POLICIES & FUNCTIONS
-- Cho phép quản trị viên xem/quản lý profiles, random_items, vocabulary
-- =====================================================================

-- Cho phép admin đọc mọi profile để quản lý người dùng
create policy profiles_admin_select on public.profiles
  for select to authenticated
  using (public.is_admin());

-- RPC cập nhật quyền admin cho người dùng (chỉ admin mới được gọi)
create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_is_admin boolean
)
returns boolean
language plpgsql security definer
set search_path = public
as $
begin
  if not public.is_admin() then
    raise exception 'PERMISSION_DENIED';
  end if;

  update public.profiles
     set is_admin = p_is_admin,
         updated_at = now()
   where id = p_user_id;

  return true;
end;
$;

grant execute on function public.admin_set_user_role(uuid, boolean) to authenticated;

-- RPC cập nhật tên hiển thị người dùng từ trang admin
create or replace function public.admin_update_profile(
  p_user_id uuid,
  p_display_name text
)
returns boolean
language plpgsql security definer
set search_path = public
as $
begin
  if not public.is_admin() then
    raise exception 'PERMISSION_DENIED';
  end if;

  update public.profiles
     set display_name = p_display_name,
         updated_at = now()
   where id = p_user_id;

  return true;
end;
$;

grant execute on function public.admin_update_profile(uuid, text) to authenticated;
