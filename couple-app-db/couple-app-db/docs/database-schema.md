# Database Schema — Couple App (Supabase / PostgreSQL)

Schema **đã dựng sẵn thành SQL** và đã chạy thử trên PostgreSQL 16 (24 bảng, RLS bật 100%, 77 kiểm tra PASS).
Agent **không tự thiết kế lại bảng**: chỉ dùng, hoặc thêm migration mới khi phase yêu cầu.

## 1. Cấu trúc file

```
supabase/
├── migrations/
│   ├── 20261014000001_foundation.sql   Phase 0   tiện ích, quyền mặc định
│   ├── 20261014000002_couple.sql       Phase 1   profiles, couples, couple_members, invitations + RPC ghép đôi
│   ├── 20261014000003_discover.sql     Phase 2   random_items, date_plans, date_plan_items
│   ├── 20261014000004_play.sql         Phase 3   games, questions, game_sessions, game_answers
│   ├── 20261014000005_learn.sql        Phase 4-5 từ vựng, bài học, tiến độ, quiz, thử thách đôi
│   └── 20261014000006_our_space.sql    Phase 6   memories, photos, anniversaries, bucket list, Storage
├── seed.sql                            nội dung mẫu (idempotent)
└── tests/
    ├── 00_supabase_stub.sql            CHỈ để test trên Postgres thường — KHÔNG chạy trên Supabase
    └── rls_smoke_test.sql              77 kiểm tra RLS/RPC, chạy trong transaction rồi ROLLBACK
```
Phase 7 (Admin) và Phase 8 (PWA) **không cần migration mới**: policy admin đã nằm trong các migration trên.

## 2. Cách chạy

**Supabase CLI (khuyến nghị):**
```bash
supabase start
supabase db reset            # chạy migrations/ rồi seed.sql
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/rls_smoke_test.sql
supabase gen types typescript --local > src/types/database.ts
```
Mong đợi cuối cùng: dòng `===== TẤT CẢ KIỂM TRA ĐÃ ĐẠT =====`.

**Postgres thường (để kiểm tra nhanh):** chạy `00_supabase_stub.sql` → từng migration theo thứ tự → `seed.sql` → test.

## 3. Quy ước (agent phải theo)

| Chủ đề | Quy ước |
|---|---|
| Khóa chính | `uuid default gen_random_uuid()` |
| Enum | `text` + `CHECK` (không dùng enum type) |
| Tiền | `bigint`, đơn vị **VND (đồng)** |
| "Ngày" nghiệp vụ | `date`, tính theo `couples.timezone` (mặc định `Asia/Ho_Chi_Minh`) — **không** dùng `current_date` ở client |
| Thời điểm | `timestamptz` |
| Seed/nội dung | luôn có `external_key` + `on conflict (external_key) do nothing` |
| Bảng con của cặp | có cột `couple_id` khử chuẩn hóa + FK ghép `(parent_id, couple_id)` để không thể lệch cặp |
| Sửa schema | **thêm** migration mới (`YYYYMMDDHHMMSS_ten.sql`), **không sửa** migration đã chạy |

## 4. Bảng theo nhóm

### Phase 1 — Tài khoản & cặp đôi
| Bảng | Cột chính | Ghi chú |
|---|---|---|
| `profiles` | id (=auth.users.id), display_name, avatar_url, is_admin | Tự tạo bằng trigger khi đăng ký (lấy `display_name` từ `raw_user_meta_data`). Client chỉ sửa được `display_name`, `avatar_url`. Đọc được: chính mình + người cùng cặp |
| `couples` | id, start_date, timezone, created_by | Client chỉ sửa `start_date`, `timezone` |
| `couple_members` | (couple_id, user_id), joined_at, left_at | `left_at is null` = đang hoạt động. Mỗi user tối đa 1 cặp active; mỗi cặp tối đa 2 active (trigger + khóa dòng) |
| `invitations` | id, couple_id, code (10 ký tự A-Z/2-9), expires_at, max_uses, used_count, revoked_at | Chỉ tạo/thu hồi/dùng qua RPC |

### Phase 2 — Discover
| Bảng | Cột chính |
|---|---|
| `random_items` | external_key, kind (`food/drink/place/activity`), title, description, tip, price_level (1-4), is_active |
| `date_plans` | couple_id, title, planned_for, planned_budget, created_by |
| `date_plan_items` | plan_id, couple_id, random_item_id?, title, estimated_cost, actual_cost?, position |

### Phase 3 — Play
| Bảng | Cột chính | Ghi chú |
|---|---|---|
| `games` | slug (`daily_question`, `truth_or_dare`), name, type | Có sẵn 2 dòng |
| `questions` | external_key, kind (`daily/truth/dare`), category (`fun/discover/emotion/deep`), intimacy_level 1-4, text, is_active | |
| `game_sessions` | couple_id, game_id, question_id, session_date, is_daily, status (`open/completed`) | Mỗi cặp mỗi ngày đúng 1 phiên daily (unique index) |
| `game_answers` | session_id, couple_id, user_id, answer_text, skipped | Unique (session_id, user_id). **Bất biến** (không sửa/xóa) |

### Phase 4–5 — Learn
| Bảng | Cột chính | Ghi chú |
|---|---|---|
| `vocabulary_words` | external_key, word, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level (A1–C2), is_active | **id không đổi** sau khi có tiến độ |
| `vocabulary_collocations` | word_id, phrase, position | unique (word_id, phrase) |
| `daily_lessons` | lesson_date (unique), topic, level, is_published | |
| `lesson_words` | (lesson_id, word_id), position 1–10 | Đủ 10 từ do admin/seed đảm bảo (DB chỉ giới hạn position ≤ 10) |
| `user_word_progress` | (user_id, word_id), status (`new/learning/review/mastered`), box 1–5, next_review_at, correct_count, wrong_count | **Chỉ chủ sở hữu đọc; ghi qua RPC** |
| `vocabulary_quiz_attempts` / `_answers` | attempt: kind (`lesson/review`), total, correct; answer: word_id, question_type (`choose_meaning/choose_word/fill_blank`), is_correct | Ghi qua `submit_quiz` |
| `couple_learning_challenges` | couple_id, lesson_id, challenge_date, challenge_type, prompt | unique (couple_id, challenge_date) |
| `learning_challenge_submissions` | challenge_id, couple_id, user_id, content | unique (challenge_id, user_id), bất biến |

### Phase 6 — Our Space
| Bảng | Cột chính | Ghi chú |
|---|---|---|
| `memories` | couple_id, created_by, title, note, happened_at | Timeline = sắp theo `happened_at desc` |
| `memory_photos` | memory_id, couple_id, storage_path | `storage_path` **bắt buộc** bắt đầu bằng `{couple_id}/` (CHECK) |
| `anniversaries` | couple_id, title, event_date, repeat_yearly | Đọc đếm ngược từ view `anniversary_countdowns` |
| `bucket_list_items` | couple_id, title, is_done, done_at | CHECK: `is_done` ⇔ `done_at` có giá trị. Khi đánh dấu xong phải set **cả hai** |

**Storage:** bucket `memories` (private, 10 MB, jpeg/png/webp). Đường dẫn: `{couple_id}/{memory_id}/{tên_file}`. Hiển thị bằng `createSignedUrl`.
**Số ngày bên nhau** = (hôm nay theo `couples.timezone`) − `couples.start_date`, tính ở app.

## 5. RPC — client chỉ ghi qua các hàm này ở những chỗ ghi chú

| Hàm | Tham số | Trả về | Dùng ở |
|---|---|---|---|
| `create_couple(p_start_date date default null)` | | uuid cặp | Ghép đôi: "Tạo không gian chung" |
| `create_invitation(p_hours int default 48)` | 1–168 | dòng invitations (có `code`) | Hiển thị mã mời |
| `revoke_invitation(p_invitation_id uuid)` | | void | Thu hồi mã |
| `join_couple_by_code(p_code text)` | không phân biệt hoa/thường | uuid cặp | Nhập mã |
| `get_or_create_daily_session()` | | dòng game_sessions (kèm `question_id`) | Daily Question, thẻ Home |
| `get_todays_lesson()` | | dòng daily_lessons | Learn: bài hôm nay (chưa xếp lịch thì lấy bài mới nhất đã tới hạn) |
| `record_word_review(p_word_id uuid, p_is_correct bool)` | | void | Thẻ lật "Đã nhớ"(true)/"Chưa chắc"(false), ôn tập từng từ |
| `submit_quiz(p_lesson_id uuid, p_kind text, p_answers jsonb)` | answers: `[{"word_id","question_type","is_correct"}]` | uuid attempt | Nộp cả bài quiz (atomic, đồng thời cập nhật tiến độ) |
| `partner_progress_summary(p_lesson_id uuid)` | | bảng (user_id, learned_count, mastered_count, total_words) cho **cả hai người** | `ProgressPair` — không lộ chi tiết từng từ |
| `get_or_create_daily_challenge()` | | dòng couple_learning_challenges | Thử thách đôi |

Hàm hỗ trợ RLS (client có thể gọi, thường không cần): `current_couple_id()`, `is_couple_member(uuid)`, `is_admin()`, `has_answered(uuid)`, `has_submitted(uuid)`.

### Lịch ôn tập (nằm trong DB, client KHÔNG tự tính)
Hộp 1→5 ứng với 1/2/4/7/14 ngày. Đúng: hộp+1 (tối đa 5). Sai: về hộp 1. `status`: hộp 1–2 `learning`, 3–4 `review`, 5 `mastered`.
Danh sách ôn hôm nay:
```ts
supabase.from('user_word_progress')
  .select('*, vocabulary_words(*)')
  .lte('next_review_at', new Date().toISOString())
  .order('next_review_at')
```

## 6. Mã lỗi nghiệp vụ → thông báo UI (tiếng Việt)

Lỗi từ RPC có `error.message` đúng bằng mã (`errcode P0001`). Map ở client:

| Mã | Thông báo |
|---|---|
| `NOT_AUTHENTICATED` | Bạn cần đăng nhập lại. |
| `NOT_IN_COUPLE` | Bạn chưa có không gian chung. |
| `ALREADY_IN_COUPLE` | Bạn đã ở trong một không gian chung rồi. |
| `INVITE_NOT_FOUND` | Mã mời không đúng. |
| `INVITE_EXPIRED` | Mã mời đã hết hạn. |
| `INVITE_REVOKED` | Mã mời đã bị thu hồi. |
| `INVITE_USED_UP` | Mã mời đã được sử dụng. |
| `COUPLE_FULL` | Không gian này đã đủ hai người. |
| `INVALID_ARGUMENT` | Dữ liệu không hợp lệ. |
| `NO_QUESTION_AVAILABLE` | Chưa có câu hỏi nào, hãy thử lại sau. |
| `NO_LESSON_AVAILABLE` | Chưa có bài học nào. |
| `WORD_NOT_FOUND` | Không tìm thấy từ này. |

Lỗi khác (RLS, ràng buộc) → thông báo chung "Có lỗi xảy ra, vui lòng thử lại" và log chi tiết ở server.

## 7. Điều agent KHÔNG được làm

1. Không dùng `SUPABASE_SERVICE_ROLE_KEY` để "lách" RLS khi một truy vấn bị chặn — sửa policy/RPC bằng migration mới, hoặc báo cáo.
2. Không `insert/update` trực tiếp vào: `couples`, `couple_members`, `invitations`, `user_word_progress`, `vocabulary_quiz_*`, `couple_learning_challenges`, `game_sessions` loại daily. Dùng RPC.
3. Không sửa/xóa `game_answers`, `learning_challenge_submissions`.
4. Không tự tính "hôm nay" bằng giờ trình duyệt để chọn câu hỏi/bài học — luôn gọi RPC.
5. Không đổi `id`/`external_key` của từ vựng đã có.
6. Không ẩn đáp án của người kia bằng UI: việc ẩn đã được DB đảm bảo; UI chỉ hiển thị trạng thái "đang chờ".
7. Không upload ảnh ngoài đường dẫn `{couple_id}/{memory_id}/…`.
8. Không sửa migration đã tồn tại.

## 8. Quy tắc lộ đáp án (để UI đúng)

- Người kia chỉ đọc được đáp án của mình **sau khi chính mình có bản ghi** (trả lời hoặc `skipped = true`).
- "Đang chờ người ấy" = mình đã có bản ghi nhưng truy vấn chỉ trả về 1 dòng.
- "Cả hai đã xong" = truy vấn trả về 2 dòng (hoặc `game_sessions.status = 'completed'`).
- Cùng quy tắc cho thử thách đôi (`learning_challenge_submissions`).

## 9. Giới hạn đã biết / chưa làm

- **Chưa có**: rời cặp / giải tán cặp, xóa tài khoản, đổi múi giờ có kiểm tra hợp lệ (cột `timezone` hiện không bị ràng buộc — đừng cho người dùng nhập tự do, dùng danh sách chọn).
- Bỏ qua câu hỏi tính là "đã trả lời" để mở đáp án của người kia (giả định, đổi được).
- Admin được cấp bằng SQL: `update public.profiles set is_admin = true where id = '<user-id>';` — không có giao diện cấp quyền.
- Số lượng đúng 10 từ/bài **không** bị ép bằng ràng buộc DB; trang Admin phải kiểm tra trước khi xuất bản.
- **Mức độ kiểm chứng**: toàn bộ migration + test đã chạy trên PostgreSQL 16 thường với lớp giả lập `auth`/`storage`. Chưa chạy trên Supabase thật — hãy chạy `supabase db reset` và `rls_smoke_test.sql` ở máy bạn trước khi giao Phase 1.
