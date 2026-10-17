"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Question, QuestionKind } from "@/types/play";
import { getRandomQuestion } from "./queries";

export type PlayActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function submitDailyAnswerAction(
  sessionId: string,
  answerText: string
): Promise<PlayActionResult> {
  const text = (answerText || "").trim();
  if (!text) {
    return { success: false, error: "Vui lòng nhập câu trả lời của bạn." };
  }
  if (text.length > 1000) {
    return { success: false, error: "Câu trả lời không được vượt quá 1000 ký tự." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện." };
  }

  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) {
    return { success: false, error: "Bạn chưa tham gia không gian cặp đôi." };
  }

  const { error } = await supabase.from("game_answers").insert({
    session_id: sessionId,
    couple_id: coupleId,
    user_id: user.id,
    answer_text: text,
    skipped: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Bạn đã gửi câu trả lời cho câu hỏi này rồi." };
    }
    return { success: false, error: error.message || "Không thể lưu câu trả lời." };
  }

  revalidatePath("/play");
  revalidatePath("/home");
  return { success: true };
}

export async function skipDailyQuestionAction(
  sessionId: string
): Promise<PlayActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện." };
  }

  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) {
    return { success: false, error: "Bạn chưa tham gia không gian cặp đôi." };
  }

  const { error } = await supabase.from("game_answers").insert({
    session_id: sessionId,
    couple_id: coupleId,
    user_id: user.id,
    answer_text: null,
    skipped: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Bạn đã hoàn thành câu hỏi này rồi." };
    }
    return { success: false, error: error.message || "Không thể bỏ qua câu hỏi." };
  }

  revalidatePath("/play");
  revalidatePath("/home");
  return { success: true };
}

export async function drawTruthOrDareQuestionAction(options: {
  kind: QuestionKind;
  intimacyLevel?: number;
  excludeIds?: string[];
}): Promise<PlayActionResult<Question>> {
  const question = await getRandomQuestion(options);
  if (!question) {
    return { success: false, error: "Không tìm thấy câu hỏi phù hợp." };
  }
  return { success: true, data: question };
}

export async function recordTruthOrDareSessionAction(options: {
  questionId: string;
  answerText?: string | null;
  skipped: boolean;
}): Promise<PlayActionResult<{ sessionId: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện." };
  }

  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) {
    return { success: false, error: "Bạn chưa tham gia không gian cặp đôi." };
  }

  // Get truth_or_dare game id
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id")
    .eq("slug", "truth_or_dare")
    .single();

  if (gameError || !game) {
    return { success: false, error: "Không tìm thấy cấu hình trò chơi Thật hay Thách." };
  }

  // Get couple timezone
  const { data: couple } = await supabase
    .from("couples")
    .select("timezone")
    .eq("id", coupleId)
    .single();

  const tz = couple?.timezone || "Asia/Ho_Chi_Minh";
  const nowInTz = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  // Insert session
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .insert({
      couple_id: coupleId,
      game_id: game.id,
      question_id: options.questionId,
      session_date: nowInTz,
      is_daily: false,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { success: false, error: sessionError?.message || "Không thể tạo lượt chơi." };
  }

  // Insert answer
  const trimmedText = options.answerText?.trim() || null;
  const isSkipped = options.skipped || !trimmedText;

  const { error: answerError } = await supabase.from("game_answers").insert({
    session_id: session.id,
    couple_id: coupleId,
    user_id: user.id,
    answer_text: isSkipped ? null : trimmedText,
    skipped: isSkipped,
  });

  if (answerError) {
    return { success: false, error: answerError.message || "Không thể ghi nhận câu trả lời." };
  }

  revalidatePath("/play");
  return { success: true, data: { sessionId: session.id } };
}
