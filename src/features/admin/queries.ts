import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminStats, AdminUser, VocabularyWord, QuestionItem, AdminDailyLesson } from "./types";
import { RandomItem } from "@/types/discover";
import { getPriceLevelConfigs } from "@/features/randomizer/queries";


/**
 * Kiểm tra xem người dùng hiện tại có quyền admin không.
 */
export async function checkIsAdmin(): Promise<{ isAdmin: boolean; userId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { isAdmin: !!isAdmin, userId: user.id };
}

/**
 * Lấy dữ liệu tổng quan cho trang Admin.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const adminClient = createAdminClient();

  const [itemsRes, usersRes, wordsRes, questionsRes, priceConfigs] = await Promise.all([
    adminClient.from("random_items").select("kind, price_level"),
    adminClient.from("profiles").select("id, is_admin"),
    adminClient.from("vocabulary_words").select("id"),
    adminClient.from("questions").select("kind"),
    getPriceLevelConfigs(),
  ]);

  const items = itemsRes.data || [];
  const users = usersRes.data || [];
  const words = wordsRes.data || [];
  const questions = questionsRes.data || [];

  const priceStats = {
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
  };

  let foodCount = 0;
  let drinkCount = 0;
  let placeCount = 0;
  let activityCount = 0;

  for (const it of items) {
    if (it.kind === "food") foodCount++;
    else if (it.kind === "drink") drinkCount++;
    else if (it.kind === "place") placeCount++;
    else if (it.kind === "activity") activityCount++;

    if (it.price_level === 1) priceStats.level1++;
    else if (it.price_level === 2) priceStats.level2++;
    else if (it.price_level === 3) priceStats.level3++;
    else if (it.price_level === 4) priceStats.level4++;
  }

  let dailyCount = 0;
  let truthCount = 0;
  let dareCount = 0;
  for (const q of questions) {
    if (q.kind === "daily") dailyCount++;
    else if (q.kind === "truth") truthCount++;
    else if (q.kind === "dare") dareCount++;
  }

  const adminCount = users.filter((u) => u.is_admin).length;

  return {
    totalItems: items.length,
    foodCount,
    drinkCount,
    placeCount,
    activityCount,
    totalUsers: users.length,
    adminCount,
    totalWords: words.length,
    totalQuestions: questions.length,
    dailyCount,
    truthCount,
    dareCount,
    priceStats,
    priceConfigs,
  };
}

/**
 * Lấy danh sách toàn bộ items trong Discover cho Admin (kể cả inactive).
 */
export async function getAdminRandomItems(): Promise<RandomItem[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("random_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminRandomItems error:", error);
    return [];
  }

  return (data || []) as RandomItem[];
}

/**
 * Lấy danh sách toàn bộ người dùng kèm thông tin Auth và Profile.
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const adminClient = createAdminClient();

  const [{ data: authData }, { data: profiles, error: profErr }] = await Promise.all([
    adminClient.auth.admin.listUsers(),
    adminClient.from("profiles").select("*"),
  ]);

  if (profErr) {
    console.error("getAdminUsers profiles error:", profErr);
    return [];
  }

  const profMap = new Map((profiles || []).map((p) => [p.id, p]));

  return (authData?.users || []).map((u) => {
    const prof = profMap.get(u.id);
    return {
      id: u.id,
      email: u.email || "",
      display_name: prof?.display_name || u.user_metadata?.display_name || "",
      avatar_url: prof?.avatar_url || null,
      is_admin: prof?.is_admin || false,
      created_at: u.created_at,
    };
  });
}

/**
 * Lấy danh sách toàn bộ từ vựng cho Admin kèm collocations.
 */
export async function getAdminVocabularyWords(): Promise<VocabularyWord[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("vocabulary_words")
    .select(`
      *,
      vocabulary_collocations (phrase)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminVocabularyWords error:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((w: any) => ({
    ...w,
    collocations: (w.vocabulary_collocations || []).map((c: { phrase: string }) => c.phrase),
  })) as VocabularyWord[];
}

/**
 * Lấy danh sách toàn bộ câu hỏi (Daily, Truth, Dare) cho Admin.
 */
export async function getAdminQuestions(): Promise<QuestionItem[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAdminQuestions error:", error);
    return [];
  }

  return (data || []) as QuestionItem[];
}

export async function getAdminDailyLessons(): Promise<AdminDailyLesson[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("daily_lessons")
    .select("id, lesson_date, topic, level, is_published, lesson_words(count)")
    .order("lesson_date", { ascending: false })
    .limit(100);
  if (error) {
    console.error("getAdminDailyLessons error:", error);
    return [];
  }
  return (data ?? []).map((lesson) => {
    const row = lesson as typeof lesson & { lesson_words?: Array<{ count: number }> };
    return {
      id: row.id,
      lesson_date: row.lesson_date,
      topic: row.topic,
      level: row.level,
      is_published: row.is_published,
      word_count: Number(row.lesson_words?.[0]?.count ?? 0),
    };
  });
}
