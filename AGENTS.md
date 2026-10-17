<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
A1. Sản phẩm

Web app cho hai người yêu nhau. Luồng cốt lõi: chọn một điều ngẫu nhiên → cùng trải nghiệm → chơi/học cùng nhau → lưu kỷ niệm . Ba giá trị: Random, Together, Memories. Web-first, mobile-first, cài lên màn hình chính bằng PWA. Không làm native app. Giao diện chỉ tiếng Việt .

A2. Công nghệ (bắt buộc dùng, không tự đổi)
Thành phần	Công nghệ
Frontend	Next.js (App Router), strict TypeScript
UI	Tailwind CSS, shadcn/ui
Form	React Hook Form + Zod
DB / Auth / Storage	Supabase (PostgreSQL, Auth, Storage, RLS)
PWA	manifest.webmanifest+ service worker
Hosting	Vercel

Không thêm backend riêng (NestJS...). Logic now includes Postgres function (RPC) hoặc Server Action/Route Handler .

A3. Phạm vi
MVP (làm): Discover (random món ăn/đồ uống/địa điểm, Do Something New, ngân sách hẹn hò), Play (Daily Question, Truth or Dare), Learn Together (10 từ/ngày, quiz cá nhân, ôn từ cũ, thử thách đôi, tiến độ riêng + chung), Our Space (ngày bên nhau, ngày kỷ niệm + đếm ngược, timeline, album ảnh, Bucket List), tài khoản + ghép đôi bằng mã mời, RLS, mobile-first, PWA cài được, quản lý nội dung cơ bản, cache cục bộ cho UI/bản nháp.
Later (KHÔNG làm): AI date generator, AI tạo bài học, chấm phát âm, bản đồ/địa điểm thật, game nâng cao (Predict My Answer, Who's More Likely, Would You Rather, Secret Mission, Draw Partner), điểm/streak/huy hiệu, couple map, lịch chung, mood status, chia sẻ vị trí, safe arrival, virtual pet, theme/sticker, offline đầy đủ, push notification, theo dõi chu kỳ.
Drop (KHÔNG làm): widget kiểu Locket, chat/gọi video, realtime như tính năng độc lập, đa ngôn ngữ, sở thích riêng từng thành viên, lịch sử/yêu thích/loại trừ kết quả random.

Quy tắc: nếu tính năng không nằm trong phase hiện tại, không làm, không dựng sẵn khung "cho sau này" .

A4. Điều hướng

6 tab (bottom nav trên mobile): Home, Discover, Play, Learn, Our Space, Settings . Trang /adminriêng, không nằm trong nav của cặp đôi.

A5. Cấu trúc thư mục (tạo dần theo phase, không tạo trước)
couple-app/
├── public/ (icons/, images/, manifest.webmanifest)
├── src/
│   ├── app/
│   │   ├── (public)/page.tsx
│   │   ├── (auth)/login, register
│   │   ├── (app)/home, discover, play, learn, our-space, settings
│   │   ├── admin/
│   │   ├── layout.tsx, globals.css
│   ├── components/ (ui/, layout/, shared/)
│   ├── features/ (auth, couple, randomizer, games, vocabulary, memories, bucket-list)
│   ├── lib/ (supabase/, validations/, utils/)
│   └── types/
├── supabase/ (migrations/, seed.sql)
├── tests/
├── .env.example
└── README.md

Nguyên tắc: mỗi features/<x>/chứa UI + logic của nghiệp vụ đó; code true cập Supabase tách riêng ( queries.ts, actions.ts) để dễ test.

A6. Mô hình dữ liệu (khởi điểm, agent hoàn thiện thành migration)

Tài khoản & cặp đôi

profiles(id = auth.users.id, display_name, avatar_url, is_admin default false)
couples(id, start_date, timezone default 'Asia/Ho_Chi_Minh', created_by)
couple_members(couple_id, user_id, joined_at, left_at null; unique user_id active )
invitations(id, couple_id, unique code, created_by, expires_at, max_uses default 1, used_count, revoked_at)

Discover

random_items(id, kind: food|drink|place|activity, title, description, tip, price_level nullable, is_active)
date_plans(id, couple_id, title, planned_for, planned_budget, created_by)
date_plan_items(id, plan_id, random_item_id nullable, title, estimated_cost, actual_cost nullable, position)

Play

games(id, slug, name, type)
questions(id, kind: daily|truth|dare, category: fun|discover|emotion|deep, intimacy_level 1–4, text, is_active)
game_sessions(id, couple_id, game_id, question_id, session_date, status)
game_answers(id, session_id, user_id, answer_text, skipped bool, created_at; unique(session_id, user_id) )

Learn

vocabulary_words(id ổn định, không đổi , word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level, is_active)
vocabulary_collocations(id, word_id, phrase)
daily_lessons(id, lesson_date unique, topic, level)
lesson_words(lesson_id, word_id, position)
user_word_progress(user_id, word_id, status: new|learning|review|mastered, box int, next_review_at, correct_count, wrong_count, last_reviewed_at; PK(user_id, word_id))
vocabulary_quiz_attempts(id, user_id, lesson_id nullable, kind, total, correct, created_at)
vocabulary_quiz_answers(attempt_id, word_id, is_correct)
couple_learning_challenges(id, couple_id, lesson_id, challenge_type, prompt, challenge_date)
learning_challenge_submissions(id, challenge_id, user_id, content, created_at; unique(challenge_id, user_id))

Our Space

memories(id, couple_id, created_by, title, note, happened_at, created_at)
memory_photos(id, memory_id, storage_path, created_at)
anniversaries(id, couple_id, title, date, repeat_yearly bool)
bucket_list_items(id, couple_id, title, is_done, done_at, created_by)
shared_budgets(nếu cần; ngân sách hẹn hò đã nằm ở date_plans)

Quy tắc quan trọng

Mỗi cặp có tối đa 2 thành viên active — ep ở database (trigger/constraint + hàm join có khóa dòng), không chỉ ở UI.
Bộ 10 từ của ngày dùng chung cho cặp, nhưng tiến độ ghi nhớ lưu riêng từng người ( user_word_progress). Không lưu một điểm chung.
Daily Question: đáp án của người kia chỉ đọc được khi chính mình đã trả lời (ép bằng RLS hoặc RPC).
"Ngày" của bài học/câu hỏi tính theo Asia/Ho_Chi_Minhđể hai người không lệch ngày.
A7. Bảo mật (áp dụng mọi phase)
Bật RLS cho mọi bảng có dữ liệu cá nhân/cặp đôi; mặc định deny, mở policy tối thiểu.
Chỉ thành viên active của cặp mới đọc/ghi dữ liệu chung của cặp đó.
You can use the database + server to create a frontend.
Không đưa SUPABASE_SERVICE_ROLE_KEYvào customer code hay biến NEXT_PUBLIC_*.
Mã mời: có hạn dùng, giới hạn lượt dùng, thu hồi được, sinh ngẫu nhiên đủ dài.
Storage ảnh: bucket private , path "{couple_id}/{memory_id}/{file}", policy theo couple_id, hiển thị bằng signed URL.
Validate input from Zod ở cả client to server.
Không cache dữ liệu riêng tư strong service worker.
A8. Quy ước code
Strict TypeScript, không dùng anynếu tránh được.
Server Components mặc định; Client Components khi cần tương tac.
Supabase client task: lib/supabase/client.ts(browser), server.ts(server, cookie-based, @supabase/ssr), middleware refresh session.
Mọi thay đổi DB qua file trong supabase/migrations/(đánh số theo thời gian), không sửa DB bằng tay.
Mỗi màn hình có đủ trạng thái: loading, empty, error .
Mobile-first: this is ~375px trước; vùng bấm tối thiểu 44px.
Mọi chuỗi UI bằng tiếng Việt, đặt thẳng trong code (chưa cần i18n).
Nội dung (từ vựng, câu hỏi, món ăn...) nạp qua supabase/seed.sql.
A9. Cách agent làm việc
Chỉ làm đúng phase được giao . Không làm trước phase sau, không refactor ngoài phạm vi.
Nếu thiếu thông tin hoặc phát hiện mâu thuẫn, chọn phương án đơn giản nhất, ghi lại trong mục "Giả định" của báo cáo , không dừng chờ trừ khi bị chặn hoàn toàn.
Next phase kết thúc bằng:
npm run buildvà npm run lintpass.
Cập nhật README.md(cách chạy, biến môi trường, cách chạy migration/seed).
Báo cáo cuối phase gồm: đã làm gì, file/migration chính, giả định, những gì chưa làm, cách tôi chạy thử.
Không tự bịa dữ liệu nhạy cảm; seed chỉ là nội dung mẫu.
A10. Định nghĩa "xong" it's the last phase

Build/lint pass · migration chạy sạch trên DB trống · RLS đã bật cho bảng mới · có seed (nếu phase dùng nội dung) · chạy được trên màn hình điện thoại · mọi mục trong "Tôi sẽ kiểm thử" của phase hoạt động.

Phạm vi

Chuyển "Chia sẻ vị trí" từ Later sang MVP (Phase 6B).
Thêm vào Drop: theo dõi vị trí nền, lịch sử di chuyển, Safe Arrival, thông báo khi người ấy đến nơi, chia sẻ vị trí không giới hạn thời gian.

Điều hướng (A4): 6 tab: Home, Discover, Play, Learn, Our Space, Map; Settings mở từ avatar ở header.

Quyền riêng tư (thêm vào A7)

Mặc định TẮT; mỗi người tự bật cho chính mình; việc bật là chủ động và có thể dừng bất cứ lúc nào.
Có thời hạn bắt buộc 1–8 giờ, không có "vô thời hạn". Hết hạn thì người kia không còn thấy.
Chỉ lưu vị trí mới nhất, không lưu lịch sử ở DB, localStorage hay log.
Người dùng luôn thấy rõ trạng thái "đang chia sẻ, còn X phút" và nút Dừng.
Chia sẻ độc lập hai chiều: A bật không bắt buộc B bật; A chỉ thấy B khi B tự bật.
Không cache vị trí trong service worker.