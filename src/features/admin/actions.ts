"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  adminRandomItemSchema,
  adminVocabularyWordSchema,
  adminQuestionSchema,
  adminUpdateUserSchema,
  adminPriceLevelConfigsListSchema,
} from "./validations";
import { PriceLevelConfig } from "@/types/discover";
import { DEFAULT_PRICE_LEVEL_CONFIGS } from "@/features/randomizer/components/discover-helpers";


export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Kiểm tra quyền Admin trước khi thực hiện Server Action.
 */
async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    throw new Error("FORBIDDEN");
  }

  return user.id;
}

// =====================================================================
// DISCOVER: RANDOM ITEMS
// =====================================================================

export async function saveRandomItemAdminAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const rawId = formData.get("id") as string | null;
    const rawData = {
      id: rawId ? rawId : undefined,
      kind: formData.get("kind"),
      title: formData.get("title"),
      description: formData.get("description") || null,
      tip: formData.get("tip") || null,
      price_level: formData.get("price_level") ? Number(formData.get("price_level")) : null,
      price_per_person: formData.get("price_per_person") ? Number(formData.get("price_per_person")) : null,
      image_url: formData.get("image_url") || null,
      map_url: formData.get("map_url") || null,
      is_active: formData.get("is_active") === "true",
    };

    const parsed = adminRandomItemSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      };
    }

    const { id, ...dataToSave } = parsed.data;
    const adminClient = createAdminClient();

    if (id) {
      const { error } = await adminClient
        .from("random_items")
        .update({
          ...dataToSave,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Update random item error:", error);
        if (error.code === "PGRST204" && error.message.includes("image_url")) {
          return {
            success: false,
            message: "Cơ sở dữ liệu Supabase chưa có cột 'image_url' và 'map_url'. Bạn vui lòng chạy SQL từ migration 20261014000010_random_items_image_and_map.sql trên Supabase Dashboard.",
          };
        }
        return {
          success: false,
          message: `Không thể cập nhật gợi ý: ${error.message || "Lỗi cập nhật"}`,
        };
      }
    } else {
      const { error } = await adminClient.from("random_items").insert(dataToSave);
      if (error) {
        console.error("Insert random item error:", error);
        if (error.code === "PGRST204" && error.message.includes("image_url")) {
          return {
            success: false,
            message: "Cơ sở dữ liệu Supabase chưa có cột 'image_url' và 'map_url'. Bạn vui lòng chạy SQL từ migration 20261014000010_random_items_image_and_map.sql trên Supabase Dashboard.",
          };
        }
        return {
          success: false,
          message: `Không thể thêm gợi ý mới: ${error.message || "Lỗi lưu dữ liệu"}`,
        };
      }
    }

    revalidatePath("/admin");
    revalidatePath("/discover");
    revalidatePath("/home");
    return {
      success: true,
      message: id ? "Đã cập nhật gợi ý thành công!" : "Đã thêm gợi ý mới thành công!",
    };
  } catch (err) {
    console.error("saveRandomItemAdminAction error:", err);
    return { success: false, message: "Đã xảy ra lỗi quyền truy cập hoặc hệ thống." };
  }
}

export async function deleteRandomItemAdminAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("random_items").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      console.error("Delete random item error:", error);
      return { success: false, message: "Không thể xóa gợi ý này." };
    }

    revalidatePath("/admin");
    revalidatePath("/discover");
    revalidatePath("/home");
    return { success: true, message: "Đã tạm ẩn gợi ý. Dữ liệu lịch sử vẫn được giữ lại." };
  } catch (err) {
    console.error("deleteRandomItemAdminAction error:", err);
    return { success: false, message: "Lỗi quyền truy cập hoặc xử lý xóa." };
  }
}

export async function toggleRandomItemStatusAdminAction(
  id: string,
  currentStatus: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("random_items")
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Toggle random item status error:", error);
      return { success: false, message: "Không thể đổi trạng thái." };
    }

    revalidatePath("/admin");
    revalidatePath("/discover");
    return {
      success: true,
      message: !currentStatus ? "Đã kích hoạt gợi ý!" : "Đã tạm ẩn gợi ý!",
    };
  } catch (err) {
    console.error("toggleRandomItemStatusAdminAction error:", err);
    return { success: false, message: "Lỗi hệ thống." };
  }
}

export async function uploadDiscoverImageAdminAction(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: "Không tìm thấy file ảnh." };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, message: "Kích thước ảnh tối đa là 10MB." };
    }

    const adminClient = createAdminClient();

    // Đảm bảo bucket discover tồn tại (tạo tự động nếu chưa có)
    try {
      await adminClient.storage.createBucket("discover", {
        public: true,
        fileSizeLimit: 10485760,
      });
    } catch {
      // Bucket có thể đã tồn tại
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `items/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await adminClient.storage
      .from("discover")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Upload discover image error:", uploadErr);
      const isBucketNotFound = uploadErr.message?.toLowerCase().includes("not found") || (uploadErr as { error?: string }).error?.toLowerCase().includes("not found");
      return {
        success: false,
        message: isBucketNotFound
          ? "Chưa tìm thấy bucket 'discover'. Bạn hãy tạo bucket 'discover' (Public) trên Supabase Dashboard hoặc chạy migration 20261014000010_random_items_image_and_map.sql."
          : `Không thể lưu ảnh: ${uploadErr.message || "Lỗi lưu trữ"}`,
      };
    }

    const { data: publicUrlData } = adminClient.storage
      .from("discover")
      .getPublicUrl(fileName);

    return {
      success: true,
      message: "Tải ảnh lên thành công!",
      data: { url: publicUrlData.publicUrl },
    };
  } catch (err) {
    console.error("uploadDiscoverImageAdminAction error:", err);
    return { success: false, message: "Lỗi tải ảnh lên." };
  }
}


// =====================================================================
// VOCABULARY WORDS
// =====================================================================

export async function saveVocabularyWordAdminAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const rawId = formData.get("id") as string | null;
    const rawData = {
      id: rawId ? rawId : undefined,
      word: formData.get("word"),
      ipa: formData.get("ipa") || null,
      part_of_speech: formData.get("part_of_speech"),
      meaning_vi: formData.get("meaning_vi"),
      example_en: formData.get("example_en") || null,
      example_vi: formData.get("example_vi") || null,
      topic: formData.get("topic") || "general",
      level: formData.get("level") || null,
      collocations: formData.get("collocations") || null,
      phrase: formData.get("phrase") || null,
      sentence_en: formData.get("sentence_en") || null,
      sentence_vi: formData.get("sentence_vi") || null,
      is_active: formData.get("is_active") === "true",
    };

    const parsed = adminVocabularyWordSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu từ vựng không hợp lệ.",
      };
    }

    const { id, collocations, ...dataToSave } = parsed.data;
    const adminClient = createAdminClient();
    let wordId = id;

    if (id) {
      const { error } = await adminClient
        .from("vocabulary_words")
        .update({
          ...dataToSave,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Update vocab word error:", error);
        return { success: false, message: "Không thể cập nhật từ vựng." };
      }
    } else {
      const { data, error } = await adminClient
        .from("vocabulary_words")
        .insert(dataToSave)
        .select("id")
        .single();
      if (error) {
        console.error("Insert vocab word error:", error);
        return { success: false, message: "Không thể thêm từ vựng mới." };
      }
      wordId = data.id;
    }

    // Save collocations if provided
    if (wordId && collocations !== undefined && collocations !== null) {
      const phrases = collocations
        .split(/[,\n]/)
        .map((p) => p.trim())
        .filter(Boolean);

      await adminClient.from("vocabulary_collocations").delete().eq("word_id", wordId);
      if (phrases.length > 0) {
        await adminClient.from("vocabulary_collocations").insert(
          phrases.map((phrase) => ({
            word_id: wordId,
            phrase,
          }))
        );
      }
    }

    revalidatePath("/admin");
    revalidatePath("/learn");
    return {
      success: true,
      message: id ? "Đã cập nhật từ vựng thành công!" : "Đã thêm từ vựng mới thành công!",
    };
  } catch (err) {
    console.error("saveVocabularyWordAdminAction error:", err);
    return { success: false, message: "Lỗi quyền truy cập hoặc xử lý." };
  }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { values.push(value.trim()); value = ""; }
    else value += char;
  }
  values.push(value.trim());
  return values;
}

export async function importVocabularyFileAdminAction(formData: FormData): Promise<ActionResult<{ count: number }>> {
  try {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { success: false, message: "Vui lòng chọn file CSV." };
    const rows = (await file.text()).replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    if (rows.length < 2) return { success: false, message: "File cần có dòng tiêu đề và ít nhất một từ." };
    const headers = parseCsvLine(rows[0]).map((header) => header.toLowerCase());
    const required = ["word", "meaning_vi", "part_of_speech", "level", "topic"];
    const missing = required.find((header) => !headers.includes(header));
    if (missing) return { success: false, message: `Thiếu cột bắt buộc: ${missing}` };
    const values = rows.slice(1).map((row) => {
      const cells = parseCsvLine(row);
      const get = (key: string) => cells[headers.indexOf(key)]?.trim() || null;
      return {
        word: get("word"), meaning_vi: get("meaning_vi"), part_of_speech: get("part_of_speech") || "other",
        level: get("level"), topic: get("topic") || "general", ipa: get("ipa"),
        phrase: get("phrase"), sentence_en: get("sentence_en"), sentence_vi: get("sentence_vi"),
        example_en: get("example_en"), example_vi: get("example_vi"), is_active: true,
      };
    }).filter((row) => row.word && row.meaning_vi);
    const parsed = values.map((row) => adminVocabularyWordSchema.safeParse(row));
    const invalid = parsed.find((item) => !item.success);
    if (invalid && !invalid.success) return { success: false, message: invalid.error.issues[0]?.message || "Có dòng không hợp lệ." };
    const adminClient = createAdminClient();
    const { error } = await adminClient.from("vocabulary_words").insert(values);
    if (error) {
      console.error("Import vocabulary error:", error);
      return { success: false, message: "Không thể nhập file từ vựng." };
    }
    revalidatePath("/admin");
    revalidatePath("/learn");
    return { success: true, message: `Đã nhập ${values.length} từ vựng.`, data: { count: values.length } };
  } catch (err) {
    console.error("importVocabularyFileAdminAction error:", err);
    return { success: false, message: "Lỗi xử lý file từ vựng." };
  }
}

export async function deleteVocabularyWordAdminAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("vocabulary_words").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      console.error("Delete vocab word error:", error);
      return { success: false, message: "Không thể xóa từ vựng." };
    }

    revalidatePath("/admin");
    revalidatePath("/learn");
    return { success: true, message: "Đã tạm ẩn từ vựng. Tiến độ cũ vẫn được giữ lại." };
  } catch (err) {
    console.error("deleteVocabularyWordAdminAction error:", err);
    return { success: false, message: "Lỗi quyền truy cập hoặc xử lý." };
  }
}

export async function toggleVocabularyWordStatusAdminAction(
  id: string,
  currentStatus: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("vocabulary_words")
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Toggle vocab status error:", error);
      return { success: false, message: "Không thể đổi trạng thái." };
    }

    revalidatePath("/admin");
    revalidatePath("/learn");
    return {
      success: true,
      message: !currentStatus ? "Đã kích hoạt từ vựng!" : "Đã ẩn từ vựng!",
    };
  } catch (err) {
    console.error("toggleVocabularyWordStatusAdminAction error:", err);
    return { success: false, message: "Lỗi hệ thống." };
  }
}

// =====================================================================
// QUESTIONS & PLAY MANAGEMENT (Daily Question, Truth or Dare)
// =====================================================================

export async function saveQuestionAdminAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const rawId = formData.get("id") as string | null;
    const rawData = {
      id: rawId ? rawId : undefined,
      kind: formData.get("kind"),
      category: formData.get("category"),
      intimacy_level: formData.get("intimacy_level"),
      text: formData.get("text"),
      is_active: formData.get("is_active") === "true",
    };

    const parsed = adminQuestionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu câu hỏi không hợp lệ.",
      };
    }

    const { id, ...dataToSave } = parsed.data;
    const adminClient = createAdminClient();
    let savedId = id || "";

    if (id) {
      const { error } = await adminClient
        .from("questions")
        .update(dataToSave)
        .eq("id", id);

      if (error) {
        console.error("Update question error:", error);
        return { success: false, message: "Không thể cập nhật câu hỏi." };
      }
    } else {
      const { data, error } = await adminClient
        .from("questions")
        .insert(dataToSave)
        .select("id")
        .single();

      if (error) {
        console.error("Insert question error:", error);
        return { success: false, message: "Không thể thêm câu hỏi mới." };
      }
      savedId = data.id;
    }

    revalidatePath("/admin");
    revalidatePath("/play");
    revalidatePath("/home");
    return {
      success: true,
      message: id ? "Đã cập nhật câu hỏi thành công!" : "Đã thêm câu hỏi mới thành công!",
      data: { id: savedId },
    };
  } catch (err) {
    console.error("saveQuestionAdminAction error:", err);
    return { success: false, message: "Lỗi quyền truy cập hoặc xử lý." };
  }
}

export async function deleteQuestionAdminAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("questions").update({ is_active: false }).eq("id", id);
    if (error) {
      console.error("Delete question error:", error);
      return {
        success: false,
        message: "Không thể xóa câu hỏi này (có thể đã có phiên chơi hoặc câu trả lời liên kết). Hãy tạm ẩn thay vì xóa.",
      };
    }

    revalidatePath("/admin");
    revalidatePath("/play");
    revalidatePath("/home");
    return { success: true, message: "Đã tạm ẩn câu hỏi. Lịch sử phiên chơi vẫn được giữ lại." };
  } catch (err) {
    console.error("deleteQuestionAdminAction error:", err);
    return { success: false, message: "Lỗi quyền truy cập hoặc xử lý." };
  }
}

export async function toggleQuestionStatusAdminAction(
  id: string,
  currentStatus: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("questions")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Toggle question status error:", error);
      return { success: false, message: "Không thể đổi trạng thái câu hỏi." };
    }

    revalidatePath("/admin");
    revalidatePath("/play");
    return {
      success: true,
      message: !currentStatus ? "Đã kích hoạt câu hỏi!" : "Đã tạm ẩn câu hỏi!",
    };
  } catch (err) {
    console.error("toggleQuestionStatusAdminAction error:", err);
    return { success: false, message: "Lỗi hệ thống." };
  }
}


export async function saveDailyLessonAdminAction(input: {
  date: string;
  topic: string;
  level: string;
  wordIds: string[];
}): Promise<ActionResult<{ id: string; lesson_date: string; topic: string; level: string | null; is_published: boolean; word_count: number }>> {
  try {
    await requireAdmin();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || input.wordIds.length !== 10 || new Set(input.wordIds).size !== 10) {
      return { success: false, message: "Ngày không hợp lệ hoặc bài học chưa có đúng 10 từ." };
    }
    const supabase = await createClient();
    const { data: id, error } = await supabase.rpc("admin_save_daily_lesson", {
      p_lesson_date: input.date,
      p_topic: input.topic,
      p_level: input.level,
      p_is_published: true,
      p_word_ids: input.wordIds,
    });
    if (error || !id) {
      console.error("saveDailyLessonAdminAction error:", error);
      return { success: false, message: "Không thể lưu bài học. Hãy kiểm tra đúng 10 từ." };
    }
    revalidatePath("/admin");
    revalidatePath("/learn");
    return {
      success: true,
      message: "Đã lưu bài học 10 từ.",
      data: { id, lesson_date: input.date, topic: input.topic, level: input.level || null, is_published: true, word_count: 10 },
    };
  } catch (error) {
    console.error("saveDailyLessonAdminAction unexpected error:", error);
    return { success: false, message: "Không có quyền hoặc không thể lưu bài học." };
  }
}

export async function toggleDailyLessonStatusAdminAction(id: string, currentStatus: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const { error } = await adminClient.from("daily_lessons").update({ is_published: !currentStatus }).eq("id", id);
    if (error) {
      console.error("toggleDailyLessonStatusAdminAction error:", error);
      return { success: false, message: "Không thể đổi trạng thái bài học." };
    }
    revalidatePath("/admin");
    revalidatePath("/learn");
    return { success: true, message: !currentStatus ? "Đã xuất bản bài học." : "Đã ẩn bài học." };
  } catch (error) {
    console.error("toggleDailyLessonStatusAdminAction unexpected error:", error);
    return { success: false, message: "Không có quyền hoặc đã xảy ra lỗi." };
  }
}

// =====================================================================
// USERS MANAGEMENT
// =====================================================================

export async function updateUserDisplayNameAdminAction(
  userId: string,
  displayName: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = adminUpdateUserSchema.safeParse({ userId, displayName });
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Tên hiển thị không hợp lệ.",
      };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({
        display_name: parsed.data.displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Update profile name error:", error);
      return { success: false, message: "Không thể đổi tên hiển thị." };
    }

    revalidatePath("/admin");
    return { success: true, message: "Đã cập nhật tên người dùng thành công!" };
  } catch (err) {
    console.error("updateUserDisplayNameAdminAction error:", err);
    return { success: false, message: "Lỗi hệ thống hoặc quyền truy cập." };
  }
}

export async function toggleUserAdminRoleAdminAction(
  targetUserId: string,
  newIsAdmin: boolean
): Promise<ActionResult> {
  try {
    const currentUserId = await requireAdmin();

    // Không cho phép tự tước quyền admin của chính mình
    if (currentUserId === targetUserId && !newIsAdmin) {
      return {
        success: false,
        message: "Bạn không thể tự thu hồi quyền quản trị viên của chính mình.",
      };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({
        is_admin: newIsAdmin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (error) {
      console.error("Toggle admin role error:", error);
      return { success: false, message: "Không thể thay đổi quyền quản trị." };
    }

    revalidatePath("/admin");
    return {
      success: true,
      message: newIsAdmin
        ? "Đã cấp quyền Quản trị viên cho tài khoản này!"
        : "Đã thu hồi quyền Quản trị viên của tài khoản này!",
    };
  } catch (err) {
    console.error("toggleUserAdminRoleAdminAction error:", err);
    return { success: false, message: "Lỗi hệ thống hoặc quyền truy cập." };
  }
}


// =====================================================================
// PRICE LEVEL STANDARDS CONFIGURATION
// =====================================================================

export async function savePriceLevelConfigsAdminAction(
  configs: PriceLevelConfig[]
): Promise<ActionResult<PriceLevelConfig[]>> {
  try {
    await requireAdmin();

    const parsed = adminPriceLevelConfigsListSchema.safeParse(configs);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu cấu hình mức chi tiêu không hợp lệ.",
      };
    }

    const normalizedData: PriceLevelConfig[] = parsed.data.map((item) => ({
      level: item.level,
      label: item.label,
      badge: item.badge,
      rangeText: item.rangeText,
      minCost: item.minCost ?? null,
      maxCost: item.maxCost ?? null,
      description: item.description,
    }));

    const adminClient = createAdminClient();

    // 1. Lưu vào bảng price_level_configs nếu có
    const upsertRows = normalizedData.map((item) => ({
      level: item.level,
      label: item.label,
      badge: item.badge,
      range_text: item.rangeText,
      min_cost: item.minCost,
      max_cost: item.maxCost,
      description: item.description,
      updated_at: new Date().toISOString(),
    }));

    const { error: dbError } = await adminClient
      .from("price_level_configs")
      .upsert(upsertRows, { onConflict: "level" });

    // 2. Luôn đồng bộ vào system_configs bucket file price_levels.json
    try {
      const jsonContent = JSON.stringify(normalizedData, null, 2);
      await adminClient.storage.from("system_configs").upload("price_levels.json", jsonContent, {
        upsert: true,
        contentType: "application/json",
      });
    } catch (storageErr) {
      console.warn("Could not sync to system_configs bucket:", storageErr);
    }

    if (dbError && dbError.code !== "PGRST205") {
      console.error("Save price_level_configs db error:", dbError);
    }

    revalidatePath("/admin");
    revalidatePath("/discover");
    revalidatePath("/home");

    return {
      success: true,
      message: "Đã cập nhật Quy chuẩn 4 mức chi tiêu hẹn hò thành công!",
      data: normalizedData,
    };
  } catch (err) {
    console.error("savePriceLevelConfigsAdminAction error:", err);
    return { success: false, message: "Lỗi lưu cấu hình mức chi tiêu." };
  }
}

export async function resetPriceLevelConfigsAdminAction(): Promise<ActionResult<PriceLevelConfig[]>> {
  return savePriceLevelConfigsAdminAction(DEFAULT_PRICE_LEVEL_CONFIGS);
}
