# Mi & Anh — Không gian cho hai đứa 💑

Web app dành riêng cho hai người yêu nhau. Luồng cốt lõi: Chọn một điều ngẫu nhiên → Cùng trải nghiệm → Chơi/học cùng nhau → Lưu kỷ niệm.

Ba giá trị cốt lõi: **Random**, **Together**, **Memories**. Giao diện mobile-first tối ưu cho khung nhìn điện thoại (~375px), hoàn toàn bằng tiếng Việt.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** Next.js (App Router, Strict TypeScript)
- **Styling:** Tailwind CSS, shadcn/ui design tokens
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Deployment:** Vercel

---

## 🚀 Hướng dẫn chạy Local

### 1. Cài đặt phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
Sao chép `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```

Điền các thông tin từ Supabase project của bạn:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Chỉ dùng server, không lộ client
```

### 3. Khởi chạy Supabase & Nạp dữ liệu (Cloud hoặc Local)

#### Cách 1: Chạy trực tiếp trên Supabase Dashboard (Cloud)
1. Mở [Supabase Dashboard](https://supabase.com/dashboard) > Chọn dự án của bạn > **SQL Editor**.
2. Mở và chạy lần lượt từng file migration trong thư mục `supabase/migrations/`:
   - `20261014000001_foundation.sql` (Phase 0: tiện ích, phân quyền mặc định)
   - `20261014000002_couple.sql` (Phase 1: profiles, couples, couple_members, invitations, RPC ghép đôi, RLS)
   - `20261014000003_discover.sql` (Phase 2: random_items, date_plans, date_plan_items)
   - `20261014000004_play.sql` (Phase 3: games, questions, game_sessions, game_answers)
   - `20261014000005_learn.sql` (Phase 4-5: từ vựng, bài học hàng ngày, tiến độ, quiz)
   - `20261014000006_our_space.sql` (Phase 6: memories, photos, anniversaries, bucket list)
3. Chạy file `supabase/seed.sql` để nạp nội dung mẫu (các câu hỏi, từ vựng, gợi ý hẹn hò).
> **Lưu ý:** Các file trong thư mục `supabase/tests/` (`00_supabase_stub.sql`, `rls_smoke_test.sql`) chỉ dùng để test môi trường CI/Postgres độc lập, không chạy lên Supabase Cloud.

#### Cách 2: Dùng Supabase CLI
```bash
# Khởi động supabase local (yêu cầu Docker)
npx supabase start

# Chạy toàn bộ migrations và seed
npx supabase db reset
```

---

## 🔐 Luồng Xác thực & Ghép đôi (Phase 1)

1. **Đăng ký tài khoản:**
   - Người dùng đăng ký bằng email và mật khẩu tại `/register`.
   - Trigger PostgreSQL `on_auth_user_created` tự động tạo bản ghi trong bảng `profiles` với tên hiển thị đã nhập.
2. **Ghép đôi hai người (`/pair`):**
   - **Tài khoản A:** Tạo không gian mới kèm ngày bắt đầu mối quan hệ. Hàm RPC `create_couple` tạo cặp và hàm RPC `create_invitation` sinh mã mời 10 ký tự (hết hạn sau 48 giờ, dùng 1 lần).
   - **Tài khoản B:** Đăng nhập và nhập mã ghép đôi 10 ký tự từ A. Hàm RPC `join_couple_by_code` khóa dòng (`FOR UPDATE`), kiểm tra tính hợp lệ (hạn dùng, lượt dùng, thu hồi, số thành viên tối đa = 2) và thêm B vào cặp đôi.
   - Cả A và B lập tức được chuyển vào cùng không gian tại `/home`.
3. **Bảo mật Row Level Security (RLS):**
   - Người ngoài không thể đọc dữ liệu `couples`, `couple_members`, `invitations` của cặp khác.
   - Cố gắng nhập mã của cặp đã đủ 2 người sẽ bị chặn ngay tại database bởi trigger `enforce_max_two_members` (ném lỗi `COUPLE_FULL`).
4. **Cài đặt & Ngày kỷ niệm (`/settings`):**
   - Cho phép đổi tên hiển thị cá nhân và ngày bắt đầu yêu (lưu vào `couples.start_date`, tự động tính toán số ngày yêu hiển thị trên trang chủ theo múi giờ `Asia/Ho_Chi_Minh`).


## 🎲 Khám phá & Quản lý Ngân sách hẹn hò (Phase 2)

1. **Nội dung Khám phá phong phú (`random_items`):**
   - Đã nạp 100+ gợi ý hẹn hò tiếng Việt: 30 món ăn (`food`), 21 đồ uống (`drink`), 21 địa điểm (`place`), 32 hoạt động trải nghiệm mới (`activity`).
   - Mỗi gợi ý có đầy đủ tên món, mô tả chi tiết, mẹo nhỏ hữu ích cho cặp đôi và mức giá tham khảo.
2. **Quay ngẫu nhiên (Slot Machine animation):**
   - Giao diện chọn chủ đề (Đồ ăn, Đồ uống, Địa điểm, Trải nghiệm mới) → màn hình quay với hiệu ứng trượt danh sách mượt mà → màn hình kết quả bất ngờ.
   - Nút "Quay lại" hoặc "Chọn cái này" → mở hộp thoại lưu ngay vào kế hoạch hẹn hò của cặp đôi.
3. **Quản lý kế hoạch & ngân sách hẹn hò (`date_plans` & `date_plan_items`):**
   - Tạo kế hoạch hẹn hò mới kèm ngày dự kiến và ngân sách (₫).
   - Thêm các mục chi phí (từ gợi ý quay ngẫu nhiên hoặc tự nhập tay).
   - Cập nhật chi phí thực tế cho từng mục, hệ thống tự động tính tổng chi tiêu thực tế và mức chênh lệch thừa / thiếu so với ngân sách dự kiến.
   - Bảo mật RLS: Chỉ 2 người trong cùng một cặp mới có quyền xem, tạo và chỉnh sửa kế hoạch chung; cặp khác không thể truy cập.
4. **Trang chủ Home:**
   - Hiển thị ngày bên nhau chính xác từ `start_date`.
   - Thẻ gợi ý hẹn hò ngẫu nhiên hôm nay (bấm vào để chuyển ngay sang Khám phá).
   - Ô giữ chỗ "Câu hỏi hôm nay" và "Tiến độ học" gắn nhãn "Sắp có" cho các phase sau.


### 4. Chạy ứng dụng Next.js
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt hoặc bật Device Toolbar ở chế độ mobile (iPhone SE / iPhone 14, ~375px).

### 5. Kiểm tra kết nối Supabase từ Server
Truy cập endpoint kiểm tra trạng thái:
[http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 📱 Cấu trúc thư mục

```
mianh/
├── public/                # Static assets, icons
├── src/
│   ├── app/
│   │   ├── (public)/      # Trang landing / giới thiệu (/)
│   │   ├── (auth)/        # Đăng nhập & đăng ký (/login, /register)
│   │   ├── (app)/         # Giao diện chính của cặp đôi:
│   │   │   ├── home/      # Tab 1: Trang chủ (đếm ngày, câu hỏi, bài học)
│   │   │   ├── discover/  # Tab 2: Khám phá (ăn gì, đi đâu, trải nghiệm mới)
│   │   │   ├── play/      # Tab 3: Chơi (Daily Question, Truth or Dare)
│   │   │   ├── learn/     # Tab 4: Học cùng nhau (10 từ/ngày, quiz)
│   │   │   ├── our-space/ # Tab 5: Kỷ niệm (timeline, album, bucket list)
│   │   │   ├── settings/  # Tab 6: Cài đặt & xem bộ design tokens
│   │   │   └── layout.tsx # Khung mobile-first + Bottom Nav 6 tab
│   │   ├── api/
│   │   │   └── health/    # Server health check & test query Supabase
│   │   ├── globals.css    # Design tokens, màu sắc, font Nunito
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/            # Button, Input, Card, Badge...
│   │   ├── layout/        # BottomNav, AppHeader
│   │   └── shared/        # PageHeader, EmptyState, LoadingState, ErrorState, CoupleAvatars
│   ├── lib/
│   │   ├── supabase/      # client.ts, server.ts, middleware.ts
│   │   └── utils.ts
├── supabase/
│   ├── migrations/        # Migrations SQL có đánh số thời gian
│   └── seed.sql           # Dữ liệu hạt giống khởi tạo
└── README.md
```

---

## 🔒 Quy tắc bảo mật
- Row Level Security (RLS) được bật cho toàn bộ các bảng trong migration.
- `SUPABASE_SERVICE_ROLE_KEY` tuyệt đối không có tiền tố `NEXT_PUBLIC_` và không bao giờ xuất hiện trong client bundle.
- Mọi chuỗi giao diện hiển thị bằng tiếng Việt tự nhiên, thân thiện cho cặp đôi.

