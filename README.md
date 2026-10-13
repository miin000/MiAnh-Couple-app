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

### 3. Khởi chạy Supabase & Nạp dữ liệu (Local hoặc Cloud)

#### Cách 1: Dùng Supabase Cloud
1. Vào [Supabase Dashboard](https://supabase.com/dashboard), mở SQL Editor.
2. Chạy nội dung file `supabase/migrations/20260301000000_init_schema.sql`.
3. Chạy nội dung file `supabase/seed.sql` để nạp dữ liệu mẫu (câu hỏi, từ vựng, món ăn...).

#### Cách 2: Dùng Supabase CLI (Local Development)
```bash
# Khởi động supabase local
npx supabase start

# Chạy migration
npx supabase db reset
```

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

