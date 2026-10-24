"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordWordReviewAction(
  wordId: string,
  isCorrect: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để lưu tiến độ" };
    }

    const { error } = await supabase.rpc("record_word_review", {
      p_word_id: wordId,
      p_is_correct: isCorrect,
    });

    if (error) {
      console.error("Error recording word review:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/learn");
    revalidatePath("/home");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in recordWordReviewAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra",
    };
  }
}

export async function completeLessonAction(
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Vui lòng đăng nhập để hoàn thành bài học" };
    const { error } = await supabase.rpc("complete_lesson", { p_lesson_id: lessonId });
    if (error) {
      console.error("Error completing lesson:", error);
      return { success: false, error: error.message };
    }
    revalidatePath("/learn");
    revalidatePath("/home");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in completeLessonAction:", err);
    return { success: false, error: err instanceof Error ? err.message : "Không thể hoàn thành bài học" };
  }
}

export async function submitQuizAction(payload: {
  lessonId: string | null;
  kind: "lesson" | "review" | "cumulative";
  answers: Array<{
    word_id: string;
    question_type: "choose_meaning" | "choose_word" | "fill_blank";
    is_correct: boolean;
  }>;
}): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để nộp bài quiz" };
    }

    if (!payload.answers || payload.answers.length === 0) {
      return { success: false, error: "Danh sách câu trả lời không hợp lệ" };
    }

    const { data: attemptId, error } = await supabase.rpc("submit_quiz", {
      p_lesson_id: payload.lessonId,
      p_kind: payload.kind,
      p_answers: payload.answers,
    });

    if (error) {
      console.error("Error submitting quiz:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/learn");
    revalidatePath("/home");
    return { success: true, attemptId: attemptId as string };
  } catch (err: unknown) {
    console.error("Unexpected error in submitQuizAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra khi nộp bài quiz",
    };
  }
}

export async function submitChallengeAction(
  challengeId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Vui lòng đăng nhập để nộp thử thách" };
    }

    const trimmed = content.trim();
    if (!trimmed || trimmed.length === 0) {
      return { success: false, error: "Nội dung câu trả lời không được để trống" };
    }

    if (trimmed.length > 2000) {
      return { success: false, error: "Nội dung không được vượt quá 2000 ký tự" };
    }

    const { error: rpcErr } = await supabase.rpc("submit_challenge", {
      p_challenge_id: challengeId,
      p_content: trimmed,
    });

    if (rpcErr) {
      console.error("Error submitting challenge:", rpcErr);
      return { success: false, error: rpcErr.message };
    }

    revalidatePath("/learn");
    revalidatePath("/home");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error in submitChallengeAction:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra khi nộp bài",
    };
  }
}
