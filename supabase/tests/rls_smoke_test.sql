-- =====================================================================
-- SMOKE TEST RLS + RPC (chạy trên DB local sau khi áp dụng migration + seed)
-- Chạy:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_smoke_test.sql
-- Toàn bộ chạy trong 1 transaction và ROLLBACK ở cuối: không để lại dữ liệu.
-- Mỗi dòng "PASS" là một kiểm tra đạt; gặp "FAIL" script dừng ngay.
-- Cần quyền tạo user trong auth.users (Supabase local / Postgres test: được).
-- =====================================================================
\set ON_ERROR_STOP on
\pset tuples_only on
begin;

create schema t;
grant usage on schema t to anon, authenticated;

create function t.login(p_uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  execute 'reset role';
  execute 'set local role authenticated';
end $$;

create function t.login_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'reset role';
  execute 'set local role anon';
end $$;

create function t.su() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
end $$;

create function t.expect_error(p_sql text, p_expected text, p_label text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if p_expected is not null and position(p_expected in sqlerrm) = 0 then
      raise exception 'FAIL [%]: mong đợi lỗi chứa "%" nhưng nhận "%"', p_label, p_expected, sqlerrm;
    end if;
    raise notice 'PASS [%] -> bị chặn: %', p_label, left(sqlerrm, 70);
    return;
  end;
  raise exception 'FAIL [%]: lẽ ra phải bị chặn nhưng đã thành công', p_label;
end $$;

create function t.expect_eq(p_sql text, p_expected text, p_label text) returns void language plpgsql as $$
declare v text;
begin
  execute p_sql into v;
  if v is distinct from p_expected then
    raise exception 'FAIL [%]: mong đợi "%" nhưng nhận "%"', p_label, p_expected, v;
  end if;
  raise notice 'PASS [%] = %', p_label, v;
end $$;

create function t.setvar(p_key text, p_sql text) returns void language plpgsql as $$
declare v text;
begin
  execute p_sql into v;
  perform set_config('test.' || p_key, v, true);
end $$;

-- ---------- chuẩn bị 3 người dùng ----------
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@test.dev', '{"display_name":"An"}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'b@test.dev', '{"display_name":"Binh"}'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@test.dev', '{"display_name":"Chi"}');

select t.expect_eq($q$select display_name from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$, 'An', '0.1 profile tự tạo khi đăng ký');

-- =====================================================================
-- PHASE 1 — GHÉP ĐÔI & RLS
-- =====================================================================
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.setvar('couple', $q$select public.create_couple(date '2025-01-01')::text$q$);
select t.setvar('code',   $q$select code from public.create_invitation(48)$q$);
select t.setvar('inv',    $q$select id::text from public.invitations where code = current_setting('test.code')$q$);
select t.expect_eq($q$select length(current_setting('test.code'))::text$q$, '10', '1.1 A tạo cặp + mã mời 10 ký tự');

select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select (public.join_couple_by_code(lower(current_setting('test.code'))))::text = current_setting('test.couple')$q$, 'true', '1.2 B nhập mã (không phân biệt hoa/thường) vào đúng cặp');
select t.expect_eq($q$select count(*)::text from public.couple_members where couple_id = current_setting('test.couple')::uuid$q$, '2', '1.2b cặp có 2 thành viên');

select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_error($q$select public.join_couple_by_code(current_setting('test.code'))$q$, 'INVITE_USED_UP', '1.3 C dùng mã đã hết lượt');
select t.expect_error($q$select public.join_couple_by_code('ZZZZZZZZZZ')$q$, 'INVITE_NOT_FOUND', '1.4 mã không tồn tại');

select t.su();
update public.invitations set max_uses = 5 where id = current_setting('test.inv')::uuid;
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_error($q$select public.join_couple_by_code(current_setting('test.code'))$q$, 'COUPLE_FULL', '1.5 người thứ 3 vào cặp đã đủ 2 người');
select t.su();
select t.expect_eq($q$select used_count::text from public.invitations where id = current_setting('test.inv')::uuid$q$, '1', '1.5b lượt dùng KHÔNG bị tăng khi COUPLE_FULL');

select t.su();
update public.invitations set expires_at = now() - interval '1 minute' where id = current_setting('test.inv')::uuid;
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_error($q$select public.join_couple_by_code(current_setting('test.code'))$q$, 'INVITE_EXPIRED', '1.6 mã hết hạn');

select t.su();
update public.invitations set expires_at = now() + interval '1 day' where id = current_setting('test.inv')::uuid;
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select public.revoke_invitation(current_setting('test.inv')::uuid);
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_error($q$select public.join_couple_by_code(current_setting('test.code'))$q$, 'INVITE_REVOKED', '1.7 mã đã thu hồi');

-- C tạo cặp riêng, rồi thử đọc dữ liệu cặp A-B
select t.setvar('couple_c', $q$select public.create_couple()::text$q$);
select t.expect_eq($q$select count(*)::text from public.couples$q$, '1', '1.8 C chỉ thấy cặp của mình');
select t.expect_eq($q$select count(*)::text from public.couple_members where couple_id = current_setting('test.couple')::uuid$q$, '0', '1.9 C không đọc được thành viên cặp A-B');
select t.expect_eq($q$select count(*)::text from public.invitations where couple_id = current_setting('test.couple')::uuid$q$, '0', '1.10 C không đọc được mã mời cặp A-B');
select t.expect_eq($q$select count(*)::text from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$, '0', '1.11 C không đọc được profile của A');
select t.expect_error($q$insert into public.couple_members (couple_id, user_id) values (current_setting('test.couple')::uuid, 'cccccccc-0000-0000-0000-000000000003')$q$, null, '1.12 C tự chèn mình vào cặp A-B bằng INSERT trực tiếp');
select t.expect_error($q$select public.create_couple()$q$, 'ALREADY_IN_COUPLE', '1.13 C không tạo thêm cặp thứ 2');

select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_error($q$update public.profiles set is_admin = true where id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$, 'permission denied', '1.14 A không tự cấp quyền admin');
select t.expect_error($q$select public.create_invitation(0)$q$, 'INVALID_ARGUMENT', '1.15 thời hạn mã không hợp lệ');
update public.couples set start_date = date '2024-06-01' where id = current_setting('test.couple')::uuid;
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select start_date::text from public.couples where id = current_setting('test.couple')::uuid$q$, '2024-06-01', '1.16 B thấy ngày bắt đầu do A sửa');
select t.expect_eq($q$select display_name from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$, 'An', '1.17 B đọc được profile người ấy');

select t.login_anon();
select t.expect_error($q$select * from public.profiles$q$, 'permission denied', '1.18 anon không đọc được profiles');
select t.expect_error($q$select * from public.random_items$q$, 'permission denied', '1.19 anon không đọc được nội dung');

-- =====================================================================
-- PHASE 2 — DISCOVER
-- =====================================================================
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_eq($q$select count(*)::text from public.random_items$q$, '8', '2.1 đọc được random_items (seed)');
select t.expect_error($q$insert into public.random_items (kind, title) values ('food', 'x')$q$, null, '2.2 user thường không ghi được random_items');
select t.setvar('plan', $q$insert into public.date_plans (couple_id, title, planned_budget, created_by)
  values (current_setting('test.couple')::uuid, 'Cuối tuần ở nhà', 500000, 'aaaaaaaa-0000-0000-0000-000000000001') returning id::text$q$);
insert into public.date_plan_items (plan_id, couple_id, title, estimated_cost)
  values (current_setting('test.plan')::uuid, current_setting('test.couple')::uuid, 'Phở bò', 100000);
select t.expect_error($q$insert into public.date_plans (couple_id, title, created_by)
  values (current_setting('test.couple')::uuid, 'Giả mạo', 'bbbbbbbb-0000-0000-0000-000000000002')$q$, null, '2.3 không tạo kế hoạch mạo danh người khác');
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select count(*)::text from public.date_plan_items$q$, '1', '2.4 B thấy mục kế hoạch của A');
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_eq($q$select count(*)::text from public.date_plans$q$, '0', '2.5 C không thấy kế hoạch của cặp khác');
select t.su();
select t.expect_error($q$insert into public.date_plan_items (plan_id, couple_id, title)
  values (current_setting('test.plan')::uuid, current_setting('test.couple_c')::uuid, 'sai cặp')$q$, 'foreign key', '2.6 mục con không thể lệch couple_id với kế hoạch');

-- =====================================================================
-- PHASE 3 — PLAY
-- =====================================================================
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.setvar('sess', $q$select id::text from public.get_or_create_daily_session()$q$);
select t.expect_eq($q$select (id::text = current_setting('test.sess'))::text from public.get_or_create_daily_session()$q$, 'true', '3.1 gọi lại cùng ngày trả đúng phiên cũ');
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select (id::text = current_setting('test.sess'))::text from public.get_or_create_daily_session()$q$, 'true', '3.2 hai người cùng một câu hỏi của ngày');
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_eq($q$select (id::text <> current_setting('test.sess'))::text from public.get_or_create_daily_session()$q$, 'true', '3.3 cặp khác có phiên riêng');

select t.login('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.game_answers (session_id, couple_id, user_id, answer_text)
  values (current_setting('test.sess')::uuid, current_setting('test.couple')::uuid, 'aaaaaaaa-0000-0000-0000-000000000001', 'Đáp án của A');
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select count(*)::text from public.game_answers where session_id = current_setting('test.sess')::uuid$q$, '0', '3.4 B CHƯA trả lời => KHÔNG thấy đáp án của A');
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_eq($q$select count(*)::text from public.game_answers where session_id = current_setting('test.sess')::uuid$q$, '0', '3.5 người ngoài không thấy đáp án');
select t.expect_error($q$insert into public.game_answers (session_id, couple_id, user_id, answer_text)
  values (current_setting('test.sess')::uuid, current_setting('test.couple')::uuid, 'cccccccc-0000-0000-0000-000000000003', 'chen ngang')$q$, null, '3.6 người ngoài không trả lời hộ vào phiên của cặp khác');
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_eq($q$select status from public.game_sessions where id = current_setting('test.sess')::uuid$q$, 'open', '3.7 phiên còn mở khi mới một người trả lời');
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
insert into public.game_answers (session_id, couple_id, user_id, skipped)
  values (current_setting('test.sess')::uuid, current_setting('test.couple')::uuid, 'bbbbbbbb-0000-0000-0000-000000000002', true);
select t.expect_eq($q$select count(*)::text from public.game_answers where session_id = current_setting('test.sess')::uuid$q$, '2', '3.8 B bỏ qua => hai bên cùng xem được');
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_eq($q$select count(*)::text from public.game_answers where session_id = current_setting('test.sess')::uuid$q$, '2', '3.9 A cũng thấy đủ 2');
select t.expect_eq($q$select status from public.game_sessions where id = current_setting('test.sess')::uuid$q$, 'completed', '3.10 phiên tự chuyển completed');
select t.expect_error($q$insert into public.game_answers (session_id, couple_id, user_id, answer_text)
  values (current_setting('test.sess')::uuid, current_setting('test.couple')::uuid, 'aaaaaaaa-0000-0000-0000-000000000001', 'lần 2')$q$, 'duplicate', '3.11 không trả lời 2 lần');
select t.expect_error($q$update public.game_answers set answer_text = 'sửa' where user_id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$, 'permission denied', '3.12 đáp án bất biến');
select t.expect_error($q$insert into public.game_sessions (couple_id, game_id, question_id, session_date, is_daily, created_by)
  select current_setting('test.couple')::uuid, g.id, q.id, current_date + 5, true, 'aaaaaaaa-0000-0000-0000-000000000001'
    from public.games g, public.questions q where g.slug = 'daily_question' and q.kind = 'daily' limit 1$q$, null, '3.13 phiên daily không tạo trực tiếp');

-- =====================================================================
-- PHASE 4–5 — LEARN
-- =====================================================================
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.setvar('lesson', $q$select id::text from public.get_todays_lesson()$q$);
select t.expect_eq($q$select count(*)::text from public.lesson_words where lesson_id = current_setting('test.lesson')::uuid$q$, '10', '4.1 bài hôm nay có đúng 10 từ');
select t.setvar('w1', $q$select id::text from public.vocabulary_words where external_key = 'communication-improve'$q$);
select t.setvar('w2', $q$select id::text from public.vocabulary_words where external_key = 'communication-share'$q$);
select t.setvar('w3', $q$select id::text from public.vocabulary_words where external_key = 'communication-agree'$q$);

select public.record_word_review(current_setting('test.w1')::uuid, true);
select t.expect_eq($q$select box || '/' || status from public.user_word_progress where word_id = current_setting('test.w1')::uuid$q$, '2/learning', '4.2 đúng lần 1 => hộp 2, learning');
select public.record_word_review(current_setting('test.w1')::uuid, true);
select t.expect_eq($q$select box || '/' || status from public.user_word_progress where word_id = current_setting('test.w1')::uuid$q$, '3/review', '4.3 đúng lần 2 => hộp 3, review');
select t.expect_eq($q$select round(extract(epoch from (next_review_at - now())) / 86400)::text from public.user_word_progress where word_id = current_setting('test.w1')::uuid$q$, '4', '4.4 hộp 3 => ôn lại sau 4 ngày');
select public.record_word_review(current_setting('test.w1')::uuid, false);
select t.expect_eq($q$select box || '/' || correct_count || '/' || wrong_count from public.user_word_progress where word_id = current_setting('test.w1')::uuid$q$, '1/2/1', '4.5 sai => về hộp 1, đếm đúng/sai');
select t.expect_error($q$insert into public.user_word_progress (user_id, word_id, status) values ('aaaaaaaa-0000-0000-0000-000000000001', current_setting('test.w2')::uuid, 'mastered')$q$, 'permission denied', '4.6 client không tự ghi tiến độ');
select t.expect_error($q$select public.record_word_review('00000000-0000-0000-0000-000000000000', true)$q$, 'WORD_NOT_FOUND', '4.7 từ không tồn tại');

select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select count(*)::text from public.user_word_progress$q$, '0', '4.8 tiến độ độc lập: B không thấy tiến độ của A');
select t.expect_eq($q$select learned_count::text from public.partner_progress_summary(current_setting('test.lesson')::uuid) where user_id = 'aaaaaaaa-0000-0000-0000-000000000001'$q$, '1', '4.9 B xem được SỐ LIỆU TỔNG của A (1 từ)');
select t.expect_eq($q$select learned_count::text from public.partner_progress_summary(current_setting('test.lesson')::uuid) where user_id = 'bbbbbbbb-0000-0000-0000-000000000002'$q$, '0', '4.10 số liệu của B = 0');

select t.setvar('attempt', $q$select public.submit_quiz(current_setting('test.lesson')::uuid, 'lesson',
  jsonb_build_array(
    jsonb_build_object('word_id', current_setting('test.w1'), 'question_type', 'choose_meaning', 'is_correct', true),
    jsonb_build_object('word_id', current_setting('test.w2'), 'question_type', 'choose_word',    'is_correct', true),
    jsonb_build_object('word_id', current_setting('test.w3'), 'question_type', 'fill_blank',     'is_correct', false)))::text$q$);
select t.expect_eq($q$select total || '/' || correct from public.vocabulary_quiz_attempts where id = current_setting('test.attempt')::uuid$q$, '3/2', '4.11 nộp quiz: 2/3 đúng');
select t.expect_eq($q$select count(*)::text from public.user_word_progress$q$, '3', '4.12 quiz cập nhật tiến độ 3 từ của B');
select t.expect_error($q$select public.submit_quiz(null, 'lesson', '[]'::jsonb)$q$, 'INVALID_ARGUMENT', '4.13 quiz rỗng bị từ chối');

select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_eq($q$select count(*)::text from public.vocabulary_quiz_attempts$q$, '0', '4.14 A không thấy kết quả quiz của B');
select t.expect_eq($q$select count(*)::text from public.user_word_progress$q$, '1', '4.15 A vẫn chỉ có 1 từ của riêng mình');

select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_eq($q$select count(*)::text from public.partner_progress_summary(current_setting('test.lesson')::uuid) where user_id in ('aaaaaaaa-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000002')$q$, '0', '4.16 C không xem được số liệu của cặp khác');

-- Thử thách đôi
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.setvar('chal', $q$select id::text from public.get_or_create_daily_challenge()$q$);
insert into public.learning_challenge_submissions (challenge_id, couple_id, user_id, content)
  values (current_setting('test.chal')::uuid, current_setting('test.couple')::uuid, 'aaaaaaaa-0000-0000-0000-000000000001', 'Câu của A');
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select (id::text = current_setting('test.chal'))::text from public.get_or_create_daily_challenge()$q$, 'true', '4.17 hai người cùng một thử thách');
select t.expect_eq($q$select count(*)::text from public.learning_challenge_submissions$q$, '0', '4.18 B chưa nộp => KHÔNG thấy bài của A');
insert into public.learning_challenge_submissions (challenge_id, couple_id, user_id, content)
  values (current_setting('test.chal')::uuid, current_setting('test.couple')::uuid, 'bbbbbbbb-0000-0000-0000-000000000002', 'Câu của B');
select t.expect_eq($q$select count(*)::text from public.learning_challenge_submissions$q$, '2', '4.19 B nộp xong => thấy cả hai');

-- =====================================================================
-- PHASE 6 — OUR SPACE
-- =====================================================================
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.setvar('mem', $q$insert into public.memories (couple_id, created_by, title, note, happened_at)
  values (current_setting('test.couple')::uuid, 'aaaaaaaa-0000-0000-0000-000000000001', 'Lần đầu đi biển', 'Nắng đẹp', date '2025-03-01') returning id::text$q$);
insert into public.memory_photos (memory_id, couple_id, storage_path)
  values (current_setting('test.mem')::uuid, current_setting('test.couple')::uuid,
          current_setting('test.couple') || '/' || current_setting('test.mem') || '/a.jpg');
select t.expect_error($q$insert into public.memory_photos (memory_id, couple_id, storage_path)
  values (current_setting('test.mem')::uuid, current_setting('test.couple')::uuid, current_setting('test.couple_c') || '/x/b.jpg')$q$, 'check', '6.1 đường dẫn ảnh phải thuộc thư mục của cặp');

insert into storage.objects (bucket_id, name, owner)
  values ('memories', current_setting('test.couple') || '/' || current_setting('test.mem') || '/a.jpg', 'aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_error($q$insert into storage.objects (bucket_id, name) values ('memories', 'rac/x.jpg')$q$, null, '6.2 thư mục không phải couple_id bị chặn');
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select count(*)::text from storage.objects where bucket_id = 'memories'$q$, '1', '6.3 B (cùng cặp) đọc được ảnh');
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_eq($q$select count(*)::text from storage.objects where bucket_id = 'memories'$q$, '0', '6.4 C (cặp khác) KHÔNG đọc được ảnh');
select t.expect_error($q$insert into storage.objects (bucket_id, name) values ('memories', current_setting('test.couple') || '/z/c.jpg')$q$, null, '6.5 C không upload vào thư mục cặp A-B');
select t.expect_eq($q$select count(*)::text from public.memories$q$, '0', '6.6 C không thấy kỷ niệm của A-B');
select t.expect_eq($q$select count(*)::text from public.memory_photos$q$, '0', '6.7 C không thấy ảnh trong album A-B');

select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_eq($q$select public.next_anniversary(date '2020-02-29', true, date '2026-10-14')::text$q$, '2027-02-28', '6.8 29/2 lặp hằng năm -> 28/2 năm sau');
select t.expect_eq($q$select public.next_anniversary(date '2020-10-14', true, date '2026-10-14')::text$q$, '2026-10-14', '6.9 trùng hôm nay => còn 0 ngày');
select t.expect_eq($q$select public.next_anniversary(date '2020-10-13', true, date '2026-10-14')::text$q$, '2027-10-13', '6.10 đã qua trong năm => sang năm sau');
select t.expect_eq($q$select public.next_anniversary(date '2030-05-01', true, date '2026-10-14')::text$q$, '2030-05-01', '6.11 ngày ở tương lai xa giữ nguyên');
insert into public.anniversaries (couple_id, title, event_date, repeat_yearly, created_by)
  values (current_setting('test.couple')::uuid, 'Kỷ niệm yêu', date '2025-03-01', true, 'aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_eq($q$select (days_left >= 0)::text from public.anniversary_countdowns$q$, 'true', '6.12 view đếm ngược không âm với ngày lặp');
select t.login('cccccccc-0000-0000-0000-000000000003');
select t.expect_eq($q$select count(*)::text from public.anniversary_countdowns$q$, '0', '6.13 view đếm ngược vẫn bị RLS chặn người ngoài');

select t.login('aaaaaaaa-0000-0000-0000-000000000001');
select t.expect_error($q$insert into public.bucket_list_items (couple_id, title, is_done, created_by)
  values (current_setting('test.couple')::uuid, 'Đi Đà Lạt', true, 'aaaaaaaa-0000-0000-0000-000000000001')$q$, 'check', '6.14 is_done=true bắt buộc có done_at');
insert into public.bucket_list_items (couple_id, title, created_by)
  values (current_setting('test.couple')::uuid, 'Đi Đà Lạt', 'aaaaaaaa-0000-0000-0000-000000000001');
update public.bucket_list_items set is_done = true, done_at = now() where title = 'Đi Đà Lạt';
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_eq($q$select is_done::text from public.bucket_list_items where title = 'Đi Đà Lạt'$q$, 'true', '6.15 B thấy mục bucket list đã hoàn thành');

-- =====================================================================
-- PHASE 7 — ADMIN
-- =====================================================================
select t.su();
update public.profiles set is_admin = true where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select t.login('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.random_items (kind, title) values ('food', 'Món do admin thêm');
select t.expect_eq($q$select count(*)::text from public.random_items where title = 'Món do admin thêm'$q$, '1', '7.1 admin ghi được nội dung');
select t.login('bbbbbbbb-0000-0000-0000-000000000002');
select t.expect_error($q$insert into public.vocabulary_words (word, meaning_vi) values ('x', 'y')$q$, null, '7.2 người thường không thêm được từ vựng');

select t.su();
rollback;
\echo ===== TẤT CẢ KIỂM TRA ĐÃ ĐẠT =====
