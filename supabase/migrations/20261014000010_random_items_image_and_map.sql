-- =====================================================================
-- PHASE 2 EXTENSION — RANDOM ITEMS IMAGE AND GOOGLE MAPS URL
-- Thêm cột image_url và map_url vào bảng random_items
-- Cấu hình bucket storage 'discover' cho hình ảnh gợi ý
-- =====================================================================

alter table public.random_items
  add column if not exists image_url text,
  add column if not exists map_url text;

-- Tạo bucket lưu trữ công khai cho ảnh Discover nếu chưa có
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('discover', 'discover', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 10485760;

-- Policy đọc ảnh công khai cho mọi người
create policy discover_objects_select on storage.objects
  for select to public
  using (bucket_id = 'discover');

-- Policy chỉ Quản trị viên mới được upload / chỉnh sửa / xóa ảnh trong bucket discover
create policy discover_objects_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'discover' and public.is_admin());

create policy discover_objects_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'discover' and public.is_admin())
  with check (bucket_id = 'discover' and public.is_admin());

create policy discover_objects_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'discover' and public.is_admin());

-- Làm mới schema cache của PostgREST
notify pgrst, 'reload schema';

