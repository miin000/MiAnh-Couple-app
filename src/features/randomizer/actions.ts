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

export async function addDatePlanItemAction(
  planId: string,
  title: string,
  estimatedCost: number = 0,
  randomItemId?: string | null
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
        estimated_cost: parsed.data.estimated_cost,
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
  title?: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const parsed = updateDatePlanItemSchema.safeParse({
      id: itemId,
      actual_cost: actualCost,
      estimated_cost: estimatedCost,
      title,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ.",
      };
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.actual_cost !== undefined) {
      updatePayload.actual_cost = parsed.data.actual_cost;
    }
    if (parsed.data.estimated_cost !== undefined) {
      updatePayload.estimated_cost = parsed.data.estimated_cost;
    }
    if (parsed.data.title !== undefined) {
      updatePayload.title = parsed.data.title;
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
