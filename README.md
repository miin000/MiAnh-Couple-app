# Mi & Anh — Không gian cho hai đứa 💑

Web app dành riêng cho hai người yêu nhau. Luồng cốt lõi: Chọn một điều ngẫu nhiên → Cùng trải nghiệm → Chơi/học cùng nhau → Lưu kỷ niệm.

Ba giá trị cốt lõi: **Random**, **Together**, **Memories**. Giao diện mobile-first tối ưu cho khung nhìn điện thoại (~375px), hoàn toàn bằng tiếng Việt.

---

## 🛠️ Công nghệ sử dụng

- **Frontend:** Next.js (App Router, Strict TypeScript)
- **Styling:** Tailwind CSS, shadcn/ui design tokens
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Deployment:** Vercel

## 📱 PWA và Phase 8 — PWA, hardening, deploy

MiAnh có thể cài lên màn hình chính trên Android và iOS. Manifest dùng tên
`MiAnh`, chế độ `standalone`, màu hồng của ứng dụng và icon 192/512 cùng
biến thể maskable. Trong `/settings`, Android sẽ hiện nút cài đặt khi trình
duyệt hỗ trợ; trên iOS mở bằng Safari, nhấn **Chia sẻ → Thêm vào Màn hình
chính → Thêm**.

Service worker chỉ lưu các asset public cần cho shell (`/_next/static`,
manifest, icon và favicon). Nó không lưu HTML của màn hình đăng nhập/cặp đôi,
API response, dữ liệu Supabase hoặc signed URL. Khi mất mạng trong lúc mở
trang mới, app hiển thị màn hình **Không có kết nối**. Vì vậy cần có mạng để
tải dữ liệu riêng sau khi đăng xuất/đăng nhập tài khoản khác; không có dữ liệu
cũ của tài khoản được giữ trong cache PWA.

### Deploy Supabase + Vercel

1. Tạo một Supabase project production và lấy URL, publishable/anon key.
2. Chạy toàn bộ migration theo thứ tự trong `supabase/migrations/`, sau đó
   chạy `supabase/seed.sql`. Với Supabase CLI:
   `npx supabase link --project-ref <project-ref>` rồi
   `npx supabase db push`; seed có thể chạy bằng SQL Editor hoặc
   `npx supabase db reset` khi làm việc với project local.
3. Trong Vercel, thêm `NEXT_PUBLIC_SUPABASE_URL` và
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` cho Production. Chỉ thêm
   `SUPABASE_SERVICE_ROLE_KEY` dưới dạng biến môi trường server-side nếu
   dashboard quản trị cần; tuyệt đối không đặt biến này trong
   `NEXT_PUBLIC_*`, source code hoặc client component.
4. Đặt Site URL và Redirect URLs của Supabase Auth về domain HTTPS Vercel
   production (đồng thời thêm `http://localhost:3000` cho local).
5. Deploy Vercel và kiểm tra `/api/health`, cài PWA trên điện thoại, sau đó
   thử lại các luồng ghép đôi, RLS và ảnh private. Vercel cung cấp HTTPS
   mặc định; không tắt HTTPS redirect.

### Cấp quyền quản trị

Sau khi tài khoản đăng ký và trigger đã tạo `profiles`, chạy câu lệnh sau
trong SQL Editor của đúng production project:

```sql
update public.profiles
set is_admin = true
where id = 'UUID_CUA_TAI_KHOAN';
```

### Phase 4B — Học từ vựng, review và quiz

Migration `20261024000026_learn_phase4b_admin_phase7b.sql` là nguồn sự thật
cho tiến độ học. Client chỉ gọi RPC; không tự tính box, trạng thái, số lần
đúng/sai hoặc ngày ôn tiếp theo. Leitner dùng khoảng cách theo box cũ:
`1, 2, 4, 7, 14, 30` ngày; trả lời sai luôn về box 1 và ôn sau 1 ngày.
Progress của hai người độc lập. `lesson_completions` lưu việc hoàn thành bài
riêng từng người; partner chỉ nhận trạng thái hoàn thành và số liệu tổng hợp,
không nhận tiến độ từng từ. Review queue chỉ lấy từ active, sắp xếp quá hạn
lâu nhất trước và tối đa 20 từ. Cumulative test chỉ có sau khi đã hoàn thành
bài trong 7 ngày; không có streak, điểm tổng, huy hiệu, AI hoặc chấm phát âm.

### Phase 7B — Nhập và quản lý nội dung từ vựng

Admin có thể nhập CSV hoặc XLSX theo các cột `external_key`, `word`,
`entry_type`, `meaning_vi`, `part_of_speech`, `level`, `topic`, `ipa`,
`example_en`, `example_vi`, `tags`, `note`, `collocations`. Luồng nhập tạo
batch staging, chia chunk tối đa 2.000 dòng, kiểm tra toàn bộ rồi mới commit
atomic. Có lỗi ở bất kỳ dòng nào thì không ghi vào `vocabulary_words`.
Upsert ưu tiên `external_key`, sau đó dùng `natural_key` là
`normalized(word):entry_type`; collocation dùng unique `(word_id, phrase)` nên
không bị nhân đôi. CSV UTF-8 được hỗ trợ; CSV từ Excel lưu bằng mã Windows
tiếng Việt cũng được giải mã. File có dấu tiếng Việt đã bị thay bằng `?` sẽ
bị từ chối để tránh lưu nghĩa bị hỏng. Các RPC import và tự động xếp bài chỉ
được gọi bởi admin. Migration `20261025000029_fix_vocabulary_import_ipa.sql`
giữ lại trường IPA khi nhập hoặc cập nhật từ file.

### Phase 6B — Bản đồ và chia sẻ vị trí

Migration `20261018000016_location_sharing.sql` và
`20261019000018_location_sharing_permanent.sql` tạo bảng private và các RPC
`start_location_sharing`, `stop_location_sharing`, `update_my_location`,
`get_partner_location`, `get_my_sharing_status`. Chia sẻ luôn mặc định tắt và
bắt buộc chọn thời hạn từ 1 đến 8 giờ; hết hạn thì người kia không còn thấy.
Không có theo dõi nền được bảo đảm hoặc lịch sử vị trí. Bộ theo dõi ở layout
chung cập nhật khi người dùng đã bật chia sẻ và ứng dụng đang chạy; trình duyệt
có thể tạm dừng trang khi ứng dụng bị đưa xuống nền hoặc đóng, nên cần mở lại
ứng dụng để tiếp tục lấy vị trí. Chỉ chạy migration sau các
migration nền tảng hiện có. Tab Bản đồ dùng Leaflet + OpenStreetMap, không cần
API key; tile công cộng không bị service worker cache. Header
`Permissions-Policy` cho phép geolocation trên chính website. Lần đầu vào app,
người dùng được hỏi có muốn chia sẻ vị trí hay không; sau đó có thể bật/tắt lại
trong Cài đặt. Vị trí chỉ được gửi khi người dùng đã đồng ý và đang chia sẻ.
Mỗi lần trình duyệt báo có vị trí mới, app gửi nếu đã di chuyển khoảng 25 m
hoặc đã qua ít nhất 15 giây từ lần gửi trước. Vị trí nền không được bảo đảm
trên PWA.

Production có thể giữ job `purge_expired_locations()` mỗi 5 phút bằng pg_cron
để dọn các bản ghi đã hết hạn:

```sql
select cron.schedule(
  'mianh-purge-expired-locations',
  '*/5 * * * *',
  $$select public.purge_expired_locations();$$
);
```

Nếu project chưa bật pg_cron, bật extension trong Supabase Dashboard trước.
Không gọi hàm purge từ client; chỉ cron/server-side được phép chạy hàm này.

Đăng xuất/đăng nhập lại để tải role mới. Không cấp quyền bằng cách đưa
service-role key vào trình duyệt.

---

## 🚀 Hướng dẫn chạy Local

### Phase 9 — Thông báo và note

Migration `20261024000027_phase9_status_push.sql` thêm note có hạn dùng,
RPC `get_couple_statuses`, hộp thư, cài đặt thông báo và đăng ký Web Push.
Tạo khóa VAPID bằng `npx web-push generate-vapid-keys`, đặt
`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` và một
`DISPATCH_NOTIFICATIONS_SECRET` chỉ ở Supabase Edge Function. Worker
`supabase/functions/dispatch-notifications` yêu cầu header bí mật này; không
đưa service-role key vào client. pg_cron có thể gọi worker theo lịch của
project sau khi cấu hình secret.

Production: route `/api/push/config` đọc `VAPID_PUBLIC_KEY` ở runtime và trả
public key cho trình duyệt. Có thể dùng `NEXT_PUBLIC_VAPID_PUBLIC_KEY` để tương
thích ngược, nhưng tên `VAPID_PUBLIC_KEY` được khuyến nghị. Public key trong
Vercel phải trùng với `VAPID_PUBLIC_KEY` ở Supabase Edge Function. Sau khi đổi
biến hoặc code, redeploy Production. Chỉ public key được trả về trình duyệt;
không đưa khóa private hoặc service-role vào `NEXT_PUBLIC_*`.

Service worker không cache dữ liệu Supabase, note, hộp thư, khoản chi hoặc vị
trí. Trên iPhone, nút bật chỉ hoạt động sau khi PWA được thêm vào màn hình
chính. Cần kiểm thử push trên Android Chrome PWA và iPhone thật (iOS 16.4+);
chưa có thiết bị thật trong môi trường phát triển này nên chưa ghi nhận kết
quả thiết bị.

Màn quản trị từ vựng có nút **Tải file mẫu** tại
`/templates/mau-nhap-tu-vung.xlsx`. File gồm sheet `vocabulary` với các cột
đúng chuẩn import và sheet `huong_dan`; nội dung mẫu dùng Unicode tiếng Việt,
xóa hai dòng demo trước khi nhập. File nhập tối đa 10 MB và 10.000 dòng.
Migration `20261025000028_notifications_learning.sql` tạo nhắc học hàng ngày
qua pg_cron, chống lặp theo ngày và không gửi nhắc bài đã hoàn thành. Note
chỉ tạo thông báo cho người ấy khi người ấy bật loại thông báo tương ứng và
giới hạn một thông báo trong 5 phút.

Migration `20261026000030_schedule_web_push_dispatch.sql` lên lịch gọi Edge
Function gửi push mỗi phút. Để bật gửi push thật, deploy
`supabase/functions/dispatch-notifications`, bật các extension `pg_cron`,
`pg_net`, `vault`, rồi lưu hai secret trong Supabase Vault:

- `supabase_url`: URL đầy đủ `https://<project-ref>.supabase.co/functions/v1/dispatch-notifications`
- `dispatch_notifications_secret`: cùng giá trị với secret Edge Function `DISPATCH_NOTIFICATIONS_SECRET`

Đặt `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` và
`DISPATCH_NOTIFICATIONS_SECRET` trong secrets của Edge Function. Chạy migration
sau khi bật extensions; lịch sẽ gọi worker mỗi phút để gửi cả note và thông báo
học tập đang chờ. Khóa riêng VAPID và service-role chỉ nằm ở Supabase, không đưa
vào biến `NEXT_PUBLIC_*`.

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
   - `20261016000014_our_space_hardening.sql` (Phase 6: xử lý ngày 29/2 và khóa Storage theo đúng memory của cặp)
   - `20261018000016_location_sharing.sql` (Phase 6B: bản đồ và chia sẻ vị trí)
   - `20261019000019_profile_avatars_10mb.sql` (Tăng giới hạn ảnh đại diện lên 10 MB)
   - `20261014000008_admin_management.sql` (Quản trị hệ thống, RLS role admin)
   - `20261014000009_price_level_standards.sql` (Tùy biến quy chuẩn 4 mức chi tiêu)
   - `20261014000010_random_items_image_and_map.sql` (Hình ảnh gợi ý hẹn hò, storage bucket discover, vị trí Google Maps)
   - `20261014000011_play_questions_seed_and_trigger.sql` (Phase 3: nạp ≥72 câu hỏi Daily, ≥42 câu Truth, ≥42 câu Dare và trigger hoàn thành phiên)
   - `20261014000012_learn_content_seed_and_daily_lesson.sql` (Phase 4: nạp 60 từ vựng 6 chủ đề, cơ chế chọn bài học hôm nay & fallback, thống kê tiến độ đôi)
   - `20261015000013_learn_phase5_enhancements.sql` (Phase 5: RPC nộp thử thách đôi mutual-reveal, RPC thống kê học tập đôi và Leitner sync)
   - `20261024000026_learn_phase4b_admin_phase7b.sql` (Phase 4B/7B: progress RPC, Leitner, lesson completion, staging import CSV/XLSX và lịch bài)
   - `20261025000029_fix_vocabulary_import_ipa.sql` (Giữ IPA khi nhập hoặc cập nhật từ vựng qua batch import)
3. Chạy file `supabase/seed.sql` để nạp nội dung mẫu (các câu hỏi, từ vựng, gợi ý hẹn hò).
> **Lưu ý:** Các file trong thư mục `supabase/tests/` (`00_supabase_stub.sql`, `rls_smoke_test.sql`) chỉ dùng để test môi trường CI/Postgres độc lập, không chạy lên Supabase Cloud.

### Phase 6 — Không gian của hai đứa

- Timeline và album dùng signed URL có thời hạn 1 giờ; bucket `memories` là private.
- Ảnh chỉ nhận JPEG/PNG/WebP, tối đa 10 MB mỗi ảnh. Đường dẫn có dạng
  `{couple_id}/{memory_id}/{filename}` và Storage policy kiểm tra cả cặp lẫn memory.
- Ngày kỷ niệm lặp hằng năm được tính theo múi giờ của cặp; ngày 29/02 ở năm
  không nhuận được tính là 28/02.
- Bản nháp tiêu đề, ghi chú và ngày của form kỷ niệm được lưu cục bộ trong trình
  duyệt; dữ liệu riêng tư không được đưa vào service worker cache.

### Phase 7 — Quản trị nội dung

Trang `/admin` chỉ render cho tài khoản có `profiles.is_admin = true`; tài khoản
khác nhận 404. Nội dung gồm từ vựng/collocations, bài học 10 từ theo ngày, câu
hỏi Daily/Truth/Dare và gợi ý Discover. Các thao tác ghi đều kiểm tra admin ở
Server Action/RPC và được bảo vệ bởi RLS `public.is_admin()`.

Không có giao diện tự cấp quyền admin. Sau khi đăng nhập bằng tài khoản cần cấp
quyền, quản trị viên hệ thống chạy SQL trong Supabase Dashboard:

```sql
update public.profiles
set is_admin = true
where id = 'UUID_CUA_TAI_KHOAN';
```

Các nút xóa nội dung thực hiện tắt/ẩn (`is_active = false`, hoặc
`daily_lessons.is_published = false`) thay vì xóa cứng để không làm mất lịch sử
tiến độ và phiên đã sử dụng.

#### Cách 2: Dùng Supabase CLI
```bash
# Khởi động supabase local (yêu cầu Docker)
npx supabase start

# Chạy toàn bộ migrations và seed
npx supabase db reset
```

### Mở rộng ngân sách, thông báo và học từ vựng

Migration `20261023000020_budget_notifications_vocabulary.sql` bổ sung:

- kế hoạch ngân sách theo **tuần/tháng/năm** và từng dòng tiền đã chi; số tiền
  trong Discover nhập theo **mỗi người**, khi thêm vào kế hoạch hẹn hò có thể
  chọn tính cho 1 hoặc 2 người. Kế hoạch sẽ hiển thị rõ tổng theo lựa chọn đó.
  Kế hoạch được chuẩn hóa về ngày
  đầu kỳ; khoản chi tự tìm kế hoạch đúng tuần/tháng/năm theo ngày chi, bắt đầu
  ở trạng thái chờ xác nhận và chỉ được tính vào tổng sau khi xác nhận;
- tab **Tiết kiệm** với mục tiêu, số tiền đích và thao tác thêm tiền;
- trạng thái gửi đối phương (`đang nhớ`, `vui`, `bận`, `muốn nói chuyện`) có
  thời hạn bắt buộc từ 1–8 giờ, không lưu lịch sử;
- bảng thông báo hệ thống/học tập và subscription Web Push. Service worker
  không cache dữ liệu riêng tư; để gửi push production cần cấu hình VAPID ở
  worker/cron phía server, không đưa secret vào `NEXT_PUBLIC_*`;
- import từ vựng CSV với các cột bắt buộc
  `word,meaning_vi,part_of_speech,level,topic` và cột tùy chọn
  `ipa,phrase,sentence_en,sentence_vi,example_en,example_vi`.

Migration `20261023000021_date_plan_budget_link.sql`,
`20261023000022_fix_date_plan_budget_matching.sql` và
`20261023000023_monthly_expense_tracking.sql` liên kết việc xác nhận
mục chi trong kế hoạch hẹn hò với nguồn tiền: khoản đã xác nhận được ghi vào
khoản chi của kế hoạch tháng tương ứng theo ngày hẹn, không ghi trùng khi sửa
lại số tiền. Giao diện không còn tạo kế hoạch tuần; dữ liệu tuần cũ vẫn được
giữ để tương thích. Kế hoạch năm có phần mở rộng để xem tổng theo từng tháng.
Kế hoạch tháng có thể đặt ngưỡng cảnh báo nhẹ riêng.

Migration `20261023000024_auto_monthly_expense_bucket.sql` bổ sung cơ chế
tự tạo ngăn khoản chi tháng khi xác nhận một mục trong kế hoạch hẹn hò. Vì vậy
người dùng không cần tạo kế hoạch tháng trước; chỉ cần xác nhận khoản chi,
ứng dụng sẽ tự thêm khoản đó vào đúng tháng theo ngày hẹn.

Migration `20261023000025_archive_date_plans.sql` thêm lưu trữ kế hoạch hẹn hò.
Kế hoạch đã lưu trữ không còn nằm trong danh sách chính nhưng vẫn xem và khôi
phục được tại **Kho lưu trữ**. Hạn mức tháng được nhập trực tiếp ở thẻ **Khoản
chi**, còn thẻ **Năm** tự tạo và hiển thị tổng của 12 tháng.

Sau khi chạy migration, vào `/admin` > **Từ vựng** > **Nhập CSV**. Bài 10 từ
trong ngày vẫn dùng chung cho cặp; tiến độ và lịch ôn Leitner (`1/2/4/7/14
ngày`) được lưu riêng từng người.

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
   - **Bộ lọc mức giá mong muốn chi trả**: Hỗ trợ lọc theo 5 mức trước khi quay:
     - *Tất cả mức giá* (mọi ngân sách)
     - *Tiết kiệm* (Dưới 100.000₫)
     - *Vừa phải* (100.000₫ - 300.000₫)
     - *Tương đối* (300.000₫ - 600.000₫)
     - *Sang xịn* (Trên 600.000₫)
     - Hiển thị trực quan số lượng gợi ý tương ứng với từng mức giá, cập nhật danh sách quay vòng slot machine tức thì theo mức giá được chọn.

3. **Quản lý kế hoạch & ngân sách hẹn hò (`date_plans` & `date_plan_items`):**
   - Tạo kế hoạch hẹn hò mới kèm ngày dự kiến và ngân sách (₫).
   - Thêm các mục chi phí (từ gợi ý quay ngẫu nhiên hoặc tự nhập tay).
   - Cập nhật chi phí thực tế cho từng mục, hệ thống tự động tính tổng chi tiêu thực tế và mức chênh lệch thừa / thiếu so với ngân sách dự kiến.
   - Bảo mật RLS: Chỉ 2 người trong cùng một cặp mới có quyền xem, tạo và chỉnh sửa kế hoạch chung; cặp khác không thể truy cập.
4. **Trang chủ Home:**
   - Hiển thị ngày bên nhau chính xác từ `start_date`.
   - Thẻ gợi ý hẹn hò ngẫu nhiên hôm nay (bấm vào để chuyển ngay sang Khám phá).


## 🎮 Trò Chơi & Kết Nối Đôi Lứa (Phase 3 — Play)

1. **Câu hỏi mỗi ngày (Daily Question):**
   - Mỗi cặp đôi mỗi ngày có đúng **1 câu hỏi duy nhất** (theo múi giờ `Asia/Ho_Chi_Minh` của cặp), đảm bảo không trùng lặp và không lệch ngày giữa hai người.
   - **Bảo mật đáp án tuyệt đối bằng RLS:** Mỗi người trả lời câu hỏi độc lập. Khi người A đã trả lời nhưng người B chưa trả lời, người B hoàn toàn **không thể** đọc đáp án của A (kể cả khi truy vấn trực tiếp bằng JWT token của B vào bảng `game_answers`).
   - Màn hình người đã trả lời hiển thị trạng thái *"Đang chờ người ấy trả lời"*.
   - Chỉ khi cả hai người cùng gửi câu trả lời (hoặc chọn bỏ qua), đáp án của cả hai mới chính thức mở khóa và hiển thị song song.
   - **Bỏ qua câu hỏi (`skipped = true`):** Người dùng có thể nhấn *"Bỏ qua câu hỏi này"*; hệ thống tính là đã hoàn thành lượt và sẽ mở khóa đáp án của người kia sau khi cả hai đã tương tác.
   - Đáp án lưu trữ bất biến (`game_answers`), tải lại trang không làm mất câu trả lời đã gửi.
2. **Thật hay Thách (Truth or Dare):**
   - Chọn chế độ: **Thật (Nói thật 🤫)** hoặc **Thách (Hành động ⚡)**.
   - Lọc theo 4 cấp độ thân mật (`intimacy_level` 1–4): *Tất cả mức*, *Mức 1 (Nhẹ nhàng)*, *Mức 2 (Gần gũi)*, *Mức 3 (Cảm xúc)*, *Mức 4 (Sâu sắc / Táo bạo)*.
   - Nút **"Đổi câu khác"** (bốc câu hỏi ngẫu nhiên mới không lặp các câu vừa qua), **"Bỏ qua lượt"** và **"Đã hoàn thành"** (lưu phiên chơi `game_sessions` và câu trả lời vào CSDL).
3. **Thẻ "Câu hỏi hôm nay" tại Trang chủ (`/home`):**
   - Trạng thái trực quan:
     - *Chưa trả lời* (Huy hiệu hồng, dẫn thẳng tới form trả lời).
     - *Chờ đối phương* (Huy hiệu vàng kèm icon đồng hồ, cập nhật tên người ấy).
     - *Đã xem kết quả* (Huy hiệu xanh lá, mở xem trọn vẹn đáp án của hai bạn).
4. **Bộ câu hỏi đầy đủ (Seed):**
   - ≥ 72 câu hỏi Daily Question chia đều 4 nhóm (`fun`: Vui vẻ, `discover`: Tìm hiểu, `emotion`: Cảm xúc, `deep`: Sâu sắc).
   - ≥ 42 câu Thật (`truth`) đa dạng cấp độ 1-4.
   - ≥ 42 thử thách Thách (`dare`) đa dạng cấp độ 1-4.


## 📚 Học Cùng Nhau & Từ Vựng Mỗi Ngày (Phase 4 — Learn A)

1. **Kho từ vựng tiêu chuẩn (Seed 60 từ vựng cho 6 chủ đề):**
   - 6 chủ đề gần gũi với cặp đôi:
     1. *Giao tiếp hằng ngày* (`communication`, 10 từ)
     2. *Cảm xúc & Tâm trạng* (`emotions`, 10 từ)
     3. *Hẹn hò & Gắn kết* (`dating`, 10 từ)
     4. *Ăn uống & Thưởng thức* (`food_dining`, 10 từ)
     5. *Du lịch & Khám phá* (`travel`, 10 từ)
     6. *Công việc & Học tập* (`work_study`, 10 từ)
   - Mỗi từ có định danh ổn định (`external_key`), phiên âm quốc tế chuẩn (`ipa`), từ loại chuẩn hóa, nghĩa tiếng Việt rõ ràng, ≥ 2 cụm từ thông dụng (`vocabulary_collocations`), câu ví dụ tiếng Anh kèm bản dịch tiếng Việt thực tế.

2. **Cơ chế chọn bài học hôm nay & Tự động Fallback:**
   - Hàm RPC `get_or_create_todays_lesson()` truy vấn bài học theo `lesson_date = (now() at time zone timezone)::date` (mặc định múi giờ Việt Nam `Asia/Ho_Chi_Minh`).
   - **Cơ chế Fallback thông minh:** Nếu ngày hôm nay chưa có bài học được lên lịch sẵn, hệ thống tự động chọn chủ đề tiếp theo theo vòng tròn (round-robin) từ kho 6 chủ đề, tự động khởi tạo bản ghi trong `daily_lessons` cho ngày hôm nay và gắn đúng 10 từ của chủ đề đó vào `lesson_words`.
   - Cả hai bạn dù đăng nhập vào các thời điểm khác nhau trong ngày đều luôn nhận được **chính xác cùng một bài học 10 từ** của ngày hôm đó.

3. **Giao diện thẻ lật từ vựng thông minh (Interactive Flashcards):**
   - **Mặt trước:** Từ tiếng Anh khổ lớn, phiên âm IPA, nút phát âm bằng giọng đọc tự nhiên (Web Speech API tích hợp), nhãn từ mới và gợi ý chạm thẻ lật.
   - **Mặt sau:** Loại từ, nghĩa tiếng Việt trọng tâm, danh sách các cụm từ collocations nổi bật, câu ví dụ tiếng Anh kèm dịch nghĩa tiếng Việt.
   - Chuyển tiếp giữa 10 thẻ mượt mà với thanh điều hướng Từ trước / Từ sau và số đếm `X/10`.

4. **Tiến độ cá nhân & Bảo mật thông tin đôi lứa:**
   - Hai nút đánh giá: **"Chưa chắc"** (giữ từ ở hộp ôn tập gần) và **"Đã nhớ"** (chuyển từ lên hộp cao hơn theo thuật toán Leitner).
   - Ghi nhận tiến độ cá nhân thông qua RPC bảo mật `record_word_review(word_id, is_correct)` vào bảng `user_word_progress`.
   - **Bảo mật tuyệt đối:** Bảng `user_word_progress` áp dụng RLS chỉ cho phép chính chủ sở hữu đọc/ghi (`auth.uid() = user_id`).
   - **Thống kê đối phương:** Sử dụng hàm RPC `partner_progress_summary(lesson_id)` để chỉ trả về số lượng tổng hợp (ví dụ: *"An đã học 5/10 từ hôm nay"*), tuyệt đối **không tiết lộ chi tiết** từ nào đối phương đã nhớ hay chưa nhớ.
   - Cả hai có thể học vào các thời điểm hoàn toàn khác nhau trong ngày (người A học buổi sáng, người B học buổi tối) mà không bị phụ thuộc nhau.

5. **Thẻ Tiến Độ Học trên Trang chủ (`/home`):**
   - Tự động hiển thị tiến độ học tập hôm nay của bạn (số từ đã học trên tổng số 10 từ) và tiến độ của người ấy, kèm nút chuyển nhanh *"Vào học ngay"*.


## 🧠 Luyện Tập, Quiz & Thử Thách Đôi (Phase 5 — Learn B)

1. **Hệ thống Quiz Trắc nghiệm Đa Dạng (Learn Quiz):**
   - Bộ câu hỏi tự sinh động từ 10 từ của bài học hôm nay hoặc danh sách từ cần ôn tập.
   - Hỗ trợ 3 dạng câu hỏi phong phú với phân bổ cân đối:
     - **Chọn nghĩa tiếng Việt** (`choose_meaning`): Đọc từ tiếng Anh + nghe phát âm IPA, chọn đúng nghĩa tiếng Việt.
     - **Chọn từ tiếng Anh** (`choose_word`): Đọc nghĩa tiếng Việt, chọn từ tiếng Anh tương ứng.
     - **Điền từ vào câu ví dụ** (`fill_blank` - Cloze test): Tự động trích xuất câu ví dụ và đục lỗ từ vựng mục tiêu `[ ______ ]`, hỗ trợ ngữ cảnh dịch nghĩa.
   - Tích hợp phát âm giọng đọc chuẩn bản xứ (Web Speech API).
   - Giải thích cặn kẽ sau mỗi câu trả lời đúng/sai kèm bản dịch câu song ngữ.
   - Kết thúc bài quiz hiển thị thẻ điểm tổng kết phần trăm, danh sách từ đúng/sai và tự động đồng bộ kết quả vào hệ thống Spaced Repetition.

2. **Ôn Tập Cách Quãng Spaced Repetition (Thuật toán Leitner 5 Hộp):**
   - Thống kê trực quan số lượng từ vựng phân bố theo 5 hộp nhớ:
     - **Hộp 1**: Ôn sau 1 ngày (từ mới bắt đầu hoặc vừa trả lời sai)
     - **Hộp 2**: Ôn sau 2 ngày
     - **Hộp 3**: Ôn sau 4 ngày
     - **Hộp 4**: Ôn sau 7 ngày
     - **Hộp 5**: Ôn sau 14 ngày (Đạt cấp độ **Mastered - Đã thành thạo**)
   - Hỗ trợ 2 chế độ ôn tập linh hoạt theo sở thích cá nhân:
     - **Chế độ Flashcard**: Lật thẻ xem nghĩa, collocations, ví dụ và tự đánh giá *Cần ôn thêm* / *Đã nhớ rõ*.
     - **Chế độ Quiz**: Làm bài trắc nghiệm trắc trở, tự động tăng/hạ hộp Leitner dựa trên độ chính xác.

3. **Thử Thách Đôi Mỗi Ngày (Couple Writing Challenge):**
   - Đề bài gợi mở mỗi ngày kết hợp các từ mới vừa học để hai bạn cùng viết cho nhau (ví dụ: chia sẻ cảm xúc, dự định cuối tuần, kỷ niệm đáng nhớ).
   - Cung cấp các thẻ bấm gợi ý từ mới nhanh (`+word`) để chèn trực tiếp vào khung soạn thảo (tối đa 2000 ký tự).
   - **Cơ chế Mutual-Reveal tuyệt mật (tương tự Daily Question)**:
     - Người A chỉ được đọc bài viết của người B **sau khi chính người A đã nộp bài của mình**.
     - RPC bảo mật `get_challenge_status` cho phép kiểm tra đối phương đã nộp bài hay chưa mà không để lộ nội dung bài viết trước khi mở khóa.
     - Khi cả hai cùng hoàn thành, nội dung bài viết của cả 2 được mở khóa đồng thời kèm huy hiệu "Đã mở khóa".

4. **Bảng Thống Kê Học Tập Đôi Toàn Diện (Learn Stats):**
   - Thống kê chi tiết từ thành thạo (Hộp 5), số từ đến hạn cần ôn hôm nay, tỷ lệ trả lời đúng của lần quiz gần nhất.
   - So sánh tiến độ học vui vẻ cùng người ấy (Số từ đã làm quen, số từ thành thạo, điểm số quiz mới nhất) mà vẫn đảm bảo tính riêng tư cá nhân.
   - Tích hợp widget thông báo từ cần ôn và thành tích học tập trực tiếp lên Dashboard Trang chủ (`/home`).


### 4. Chạy ứng dụng Next.js
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt hoặc bật Device Toolbar ở chế độ mobile (iPhone SE / iPhone 14, ~375px).

### 5. Kiểm tra kết nối Supabase từ Server
Truy cập endpoint kiểm tra trạng thái:
[http://localhost:3000/api/health](http://localhost:3000/api/health)


### 5. Trang Quản Trị Hệ Thống (Admin Dashboard)
Đường dẫn: [http://localhost:3000/admin](http://localhost:3000/admin) (riêng biệt, không nằm trong bottom navigation của cặp đôi).

#### Cấp quyền quản trị viên:
- Không dùng tài khoản hoặc mật khẩu quản trị viên mặc định trong repository.
- Tạo tài khoản trong Supabase Authentication, sau đó cập nhật `profiles.is_admin = true` cho tài khoản đó bằng SQL Editor hoặc migration riêng trong môi trường production.
- Không đưa mật khẩu production vào README, seed hoặc source code.

#### Tính năng Bảng Quản trị:
- **Tổng quan**: Thống kê số lượng câu hỏi & trò chơi (Daily, Nói thật, Thử thách), từ vựng học tập, gợi ý hẹn hò, người dùng và bảng phân bố 4 mức chi tiêu.
- **Câu hỏi & Trò chơi (Play)**:
  - Quản lý toàn bộ ngân hàng câu hỏi: Câu hỏi mỗi ngày (Daily Question), Nói thật (Truth) và Thách thức (Dare).
  - Lọc theo loại (Chế độ chơi), theo chủ đề (Vui vẻ, Tìm hiểu, Cảm xúc, Sâu sắc) và theo 4 mức độ thân mật (Intimacy 1 - 4).
  - Thêm mới, chỉnh sửa nội dung câu hỏi, bật/tạm ẩn hiển thị trong game hoặc xóa với cảnh báo an toàn.
- **Kho từ vựng (Learn)**:
  - Quản lý từ vựng tiếng Anh (English, IPA, loại từ, cấp độ A1-C2, nghĩa tiếng Việt, cụm từ thường gặp collocations, ví dụ câu bilingual, chủ đề).
  - Thêm cụm từ đi kèm (collocations) cách nhau bởi dấu phẩy để hiển thị trực tiếp trên thẻ lật flashcard.
  - Lọc từ vựng theo cấp độ (A1-C2), tìm kiếm theo từ / nghĩa / chủ đề, bật/tắt hoạt động, chỉnh sửa và xóa.
- **Khám phá & Chi tiêu (Discover)**:
  - Thêm, sửa, xóa, bật/tắt hiển thị các món ăn, đồ uống, địa điểm, trải nghiệm.
  - **Tùy chỉnh Quy chuẩn 4 mức chi tiêu hẹn hò**: Admin có thể nhấn "Điều chỉnh quy chuẩn" để thay đổi tên nhãn (label), huy hiệu (badge), khoảng tiền hiển thị (rangeText), giới hạn chi phí (minCost/maxCost) và mô tả gợi ý tiêu biểu. Có nút "Khôi phục mặc định" một chạm. Cấu hình được đồng bộ tức thì trên cả Admin và trang Khám phá (/discover).
- **Quản lý người dùng**: Danh sách tất cả tài khoản, sửa tên hiển thị, cấp quyền hoặc thu hồi quyền Admin.


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
