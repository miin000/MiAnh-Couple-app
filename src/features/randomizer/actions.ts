"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createDatePlanSchema,
  updateDatePlanSchema,
  createDatePlanItemSchema,
  updateDatePlanItemSchema,
} from "@/lib/validations/discover";

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function createDatePlanAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const { data: coupleId } = await supabase.rpc("current_couple_id");
    if (!coupleId) {
      return {
        success: false,
        message: "Bạn chưa ghép đôi nên chưa thể tạo kế hoạch.",
      };
    }

    const rawData = {
      title: formData.get("title"),
      planned_for: formData.get("planned_for") || undefined,
      planned_budget: formData.get("planned_budget") || 0,
    };

    const parsed = createDatePlanSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      };
    }

    const { data, error } = await supabase
      .from("date_plans")
      .insert({
        couple_id: coupleId,
        title: parsed.data.title,
        planned_for: parsed.data.planned_for || null,
        planned_budget: parsed.data.planned_budget,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Create date plan error:", error);
      return { success: false, message: "Không thể tạo kế hoạch lúc này." };
    }

    revalidatePath("/discover");
    revalidatePath("/home");
    return { success: true, message: "Đã tạo kế hoạch thành công!", data: { id: data.id } };
  } catch (err) {
    console.error("Unexpected error in createDatePlanAction:", err);
    return { success: false, message: "Đã có lỗi xảy ra." };
  }
}

export async function updateDatePlanAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const rawData = {
      id: formData.get("id"),
      title: formData.get("title"),
      planned_for: formData.get("planned_for") || null,
      planned_budget: formData.get("planned_budget") || 0,
    };

    const parsed = updateDatePlanSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      };
    }

    const { error } = await supabase
      .from("date_plans")
      .update({
        title: parsed.data.title,
        planned_for: parsed.data.planned_for || null,
        planned_budget: parsed.data.planned_budget,
      })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("Update date plan error:", error);
      return { success: false, message: "Không thể cập nhật kế hoạch." };
    }

    revalidatePath("/discover");
    return { success: true, message: "Đã cập nhật kế hoạch!" };
  } catch (err) {
    console.error("Unexpected error in updateDatePlanAction:", err);
    return { success: false, message: "Đã có lỗi xảy ra." };
  }
}

export async function deleteDatePlanAction(
  planId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("date_plans").delete().eq("id", planId);

    if (error) {
      console.error("Delete date plan error:", error);
      return { success: false, message: "Không thể xóa kế hoạch." };
    }

    revalidatePath("/discover");
    return { success: true, message: "Đã xóa kế hoạch." };
  } catch (err) {
    console.error("Unexpected error in deleteDatePlanAction:", err);
    return { success: false, message: "Đã có lỗi xảy ra." };
  }

}

export async function archiveDatePlanAction(planId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("date_plans").update({ archived_at: new Date().toISOString() }).eq("id", planId);
  if (error) {
    console.error("Archive date plan error:", error.message || error.code);
    return { success: false, message: "Không thể lưu trữ kế hoạch." };
  }
  revalidatePath("/discover");
  return { success: true, message: "Đã lưu trữ kế hoạch." };
}

export async function restoreDatePlanAction(planId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("date_plans").update({ archived_at: null }).eq("id", planId);
  if (error) {
    console.error("Restore date plan error:", error.message || error.code);
    return { success: false, message: "Không thể khôi phục kế hoạch." };
  }
  revalidatePath("/discover");
  return { success: true, message: "Đã khôi phục kế hoạch." };
}

export async function addDatePlanItemAction(
  planId: string,
  title: string,
  estimatedCost: number = 0,
  randomItemId?: string | null,
  participantsCount: number = 2
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const { data: coupleId } = await supabase.rpc("current_couple_id");
    if (!coupleId) {
      return { success: false, message: "Không tìm thấy thông tin cặp đôi." };
    }

    const parsed = createDatePlanItemSchema.safeParse({
      plan_id: planId,
      title,
      estimated_cost: estimatedCost,
      random_item_id: randomItemId || null,
      participants_count: participantsCount,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      };
    }

    const { data, error } = await supabase
      .from("date_plan_items")
      .insert({
        plan_id: parsed.data.plan_id,
        couple_id: coupleId,
        title: parsed.data.title,
        random_item_id: parsed.data.random_item_id || null,
        estimated_cost: parsed.data.estimated_cost * parsed.data.participants_count,
        estimated_cost_per_person: parsed.data.estimated_cost,
        participants_count: parsed.data.participants_count,
        actual_cost: null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Add date plan item error:", error);
      return { success: false, message: "Không thể thêm mục vào kế hoạch." };
    }

    revalidatePath("/discover");
    return { success: true, message: "Đã thêm vào kế hoạch!", data: { id: data.id } };
  } catch (err) {
    console.error("Unexpected error in addDatePlanItemAction:", err);
    return { success: false, message: "Đã có lỗi xảy ra." };
  }
}

export async function updateDatePlanItemAction(
  itemId: string,
  actualCost: number | null,
  estimatedCost?: number,
  title?: string,
  participantsCount?: number
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const parsed = updateDatePlanItemSchema.safeParse({
      id: itemId,
      actual_cost: actualCost,
      estimated_cost: estimatedCost,
      title,
      participants_count: participantsCount,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      };
    }

    if (parsed.data.actual_cost !== null && parsed.data.actual_cost !== undefined) {
      const { error: confirmationError } = await supabase.rpc("confirm_date_plan_item", {
        p_item_id: itemId,
        p_actual_cost: parsed.data.actual_cost,
      });
      if (confirmationError) {
        console.error("Confirm date plan item error:", confirmationError.message || confirmationError.code);
        return {
          success: false,
          message: confirmationError.message?.includes("BUDGET_PLAN_NOT_FOUND")
            ? "Không thể tạo khoản chi cho tháng của kế hoạch."
            : "Không thể cập nhật tiền thực tế.",
        };
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.actual_cost !== undefined) {
      delete updatePayload.actual_cost;
    }
    if (parsed.data.estimated_cost !== undefined) {
      updatePayload.estimated_cost = parsed.data.estimated_cost;
    }
    if (parsed.data.participants_count !== undefined) {
      updatePayload.participants_count = parsed.data.participants_count;
      if (estimatedCost !== undefined) {
        updatePayload.estimated_cost_per_person = estimatedCost;
        updatePayload.estimated_cost = estimatedCost * parsed.data.participants_count;
      }
    }
    if (parsed.data.title !== undefined) {
      updatePayload.title = parsed.data.title;
    }

    if (Object.keys(updatePayload).length === 0) {
      revalidatePath("/discover");
      return { success: true, message: "Đã cập nhật chi phí!" };
    }

    const { error } = await supabase
      .from("date_plan_items")
      .update(updatePayload)
      .eq("id", itemId);

    if (error) {
      console.error("Update date plan item error:", error);
      return { success: false, message: "Không thể cập nhật chi phí." };
    }

    revalidatePath("/discover");
    return { success: true, message: "Đã cập nhật chi phí!" };
  } catch (err) {
    console.error("Unexpected error in updateDatePlanItemAction:", err);
    return { success: false, message: "Đã có lỗi xảy ra." };
  }
}

export async function confirmAllDatePlanItemsAction(
  planId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: items, error: readError } = await supabase
      .from("date_plan_items")
      .select("id, actual_cost, estimated_cost")
      .eq("plan_id", planId);
    if (readError) {
      console.error("Read date plan items for confirmation error:", readError);
      return { success: false, message: "Không thể xác nhận toàn bộ khoản chi." };
    }
    let confirmedCount = 0;
    for (const item of (items ?? []).filter((value) => value.actual_cost === null)) {
      const { error } = await supabase.rpc("confirm_date_plan_item", {
        p_item_id: item.id,
        p_actual_cost: item.estimated_cost,
      });
      if (error) {
        console.error("Confirm date plan item error:", error.message || error.code);
        return {
          success: false,
          message: error.message?.includes("BUDGET_PLAN_NOT_FOUND")
            ? "Không thể tạo khoản chi cho tháng của kế hoạch."
            : "Không thể xác nhận toàn bộ khoản chi.",
        };
      }
      confirmedCount += 1;
    }
    revalidatePath("/discover");
    return { success: true, message: `Đã xác nhận ${confirmedCount} khoản chi.` };
  } catch (err) {
    console.error("Unexpected error in confirmAllDatePlanItemsAction:", err);
    return { success: false, message: "Đã có lỗi xảy ra khi xác nhận." };
  }
}

export async function deleteDatePlanItemAction(
  itemId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("date_plan_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Delete date plan item error:", error);
      return { success: false, message: "Không thể xóa mục." };
    }

    revalidatePath("/discover");
    return { success: true, message: "Đã xóa mục khỏi kế hoạch." };
  } catch (err) {
    console.error("Unexpected error in deleteDatePlanItemAction:", err);
    return { success: false, message: "Đã có lỗi xảy ra." };
  }
}
