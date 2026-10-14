-- =====================================================================
-- PHASE 0 — FOUNDATION
-- Tiện ích dùng chung. Không chứa bảng nghiệp vụ.
-- QUY ƯỚC CHUNG CHO TOÀN BỘ MIGRATION:
--   * Khóa chính: uuid default gen_random_uuid()
--   * Thời gian: timestamptz; "ngày nghiệp vụ": date (tính theo couples.timezone)
--   * Tiền: bigint, đơn vị VND (đồng), không dùng số thực
--   * Enum: dùng text + CHECK (dễ mở rộng hơn enum type)
--   * Mọi bảng public đều bật RLS; không có policy = từ chối
--   * Hàm bảo mật nhạy cảm: SECURITY DEFINER + set search_path
-- =====================================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Người dùng chưa đăng nhập (anon) không được chạm vào bảng nào của public.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- Trigger tự cập nhật updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
