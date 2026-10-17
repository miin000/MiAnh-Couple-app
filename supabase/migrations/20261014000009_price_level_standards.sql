-- =====================================================================
-- PHASE 2 EXTENSION — PRICE LEVEL STANDARDS CONFIGURATION
-- Bảng cấu hình quy chuẩn 4 mức chi tiêu hẹn hò (1 rẻ ... 4 đắt)
-- Cho phép quản trị viên điều chỉnh tên gọi, khoảng giá, mô tả
-- =====================================================================

create table if not exists public.price_level_configs (
  level        smallint primary key check (level between 1 and 4),
  label        text not null check (char_length(label) between 1 and 50),
  badge        text not null check (char_length(badge) between 1 and 50),
  range_text   text not null check (char_length(range_text) between 1 and 100),
  min_cost     bigint check (min_cost is null or min_cost >= 0),
  max_cost     bigint check (max_cost is null or max_cost >= 0),
  description  text not null check (char_length(description) between 1 and 500),
  updated_at   timestamptz not null default now()
);

-- Bật RLS
alter table public.price_level_configs enable row level security;

-- Mọi người dùng (kể cả chưa đăng nhập) đều đọc được quy chuẩn hiển thị
create policy price_level_configs_select on public.price_level_configs
  for select to public
  using (true);

-- Chỉ quản trị viên hệ thống mới được phép sửa/thay đổi quy chuẩn
create policy price_level_configs_update on public.price_level_configs
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy price_level_configs_insert on public.price_level_configs
  for insert to authenticated
  with check (public.is_admin());

create policy price_level_configs_delete on public.price_level_configs
  for delete to authenticated
  using (public.is_admin());

-- Dữ liệu mẫu khởi tạo mặc định 4 mức
insert into public.price_level_configs (level, label, badge, range_text, min_cost, max_cost, description)
values
  (1, 'Tiết kiệm', '₫ (Dưới 100k)', 'Dưới 100.000₫', 0, 100000, 'Ăn vặt, trà đá, bánh mì vỉa hè, dạo công viên tự do.'),
  (2, 'Vừa phải', '₫₫ (100k - 300k)', '100.000₫ - 300.000₫', 100000, 300000, 'Cơm tấm, phở ngon, cà phê máy lạnh, trà sữa đôi.'),
  (3, 'Tương đối', '₫₫₫ (300k - 600k)', '300.000₫ - 600.000₫', 300000, 600000, 'Lẩu nướng, BBQ, cafe rooftop, bảo tàng nghệ thuật.'),
  (4, 'Sang xịn', '₫₫₫₫ (Trên 600k)', 'Trên 600.000₫', 600000, null, 'Fine dining lãng mạn, resort, workshop nến/gốm cao cấp.')
on conflict (level) do update set
  label = excluded.label,
  badge = excluded.badge,
  range_text = excluded.range_text,
  min_cost = excluded.min_cost,
  max_cost = excluded.max_cost,
  description = excluded.description,
  updated_at = now();
