"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BudgetPeriod } from "./types";

export async function createBudgetPlanAction(input: {
  name: string; periodType: BudgetPeriod; periodStart: string; budgetAmount: number; warningAmount?: number | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!user || !coupleId) return { success: false, message: "Vui lòng ghép đôi trước." };
  if (!input.name.trim() || input.budgetAmount < 0) return { success: false, message: "Thông tin kế hoạch chưa hợp lệ." };
  const start = new Date(`${input.periodStart}T00:00:00`);
  if (input.periodType === "month") start.setDate(1);
  if (input.periodType === "year") { start.setMonth(0); start.setDate(1); }
  const periodStart = start.toISOString().slice(0, 10);
  const { error } = await supabase.from("budget_plans").insert({
    couple_id: coupleId, name: input.name.trim(), period_type: input.periodType,
    period_start: periodStart, budget_amount: Math.round(input.budgetAmount),
    warning_amount: input.warningAmount ? Math.round(input.warningAmount) : null,
    created_by: user.id,
  });
  if (error) {
    console.error("Create budget plan error:", error);
    return { success: false, message: error.code === "23505" ? "Kỳ này đã có kế hoạch." : "Không thể tạo kế hoạch." };
  }

  revalidatePath("/discover");
  return { success: true };
}

export async function setMonthlyLimitAction(amount: number, warningAmount?: number | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!user || !coupleId || amount < 0) return { success: false, message: "Nhập hạn mức hợp lệ." };
  const periodStart = new Date();
  periodStart.setDate(1);
  const date = periodStart.toISOString().slice(0, 10);
  const { error } = await supabase.from("budget_plans").upsert({
    couple_id: coupleId, name: `Khoản chi tháng ${String(periodStart.getMonth() + 1).padStart(2, "0")}/${periodStart.getFullYear()}`,
    period_type: "month", period_start: date, budget_amount: Math.round(amount),
    warning_amount: warningAmount ? Math.round(warningAmount) : null, created_by: user.id,
  }, { onConflict: "couple_id,period_type,period_start" });
  if (error) {
    console.error("Set monthly limit error:", error.message || error.code);
    return { success: false, message: "Không thể lưu hạn mức tháng." };
  }
  revalidatePath("/discover");
  return { success: true };
}

export async function addBudgetTransactionAction(input: {
  planId: string; spentOn: string; category: string; amount: number; note?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!user || !coupleId) return { success: false, message: "Vui lòng đăng nhập và ghép đôi." };
  if (!input.category.trim() || input.amount <= 0) return { success: false, message: "Nhập khoản chi hợp lệ." };
  const { error } = await supabase.rpc("record_budget_transaction", {
    p_spent_on: input.spentOn, p_category: input.category.trim(),
    p_amount: Math.round(input.amount), p_note: input.note?.trim() || null,
  });
  if (error) {
    console.error("Add budget transaction error:", error.message || error.code || error);
    return { success: false, message: error.code === "PGRST202" || error.message?.includes("BUDGET_PLAN_NOT_FOUND")
      ? "Chưa có kế hoạch đúng tuần/tháng/năm của ngày chi này." : "Không thể lưu khoản chi." };
  }

  revalidatePath("/discover");
  return { success: true };
}

export async function confirmBudgetTransactionAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_budget_transaction", { p_transaction_id: id });
  if (error) {
    console.error("Confirm budget transaction error:", error.message || error.code);
    return { success: false, message: "Không thể xác nhận khoản chi." };
  }
  revalidatePath("/discover");
  return { success: true };
}

export async function createSavingsGoalAction(name: string, targetAmount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!user || !coupleId || !name.trim() || targetAmount <= 0) return { success: false, message: "Thông tin mục tiêu chưa hợp lệ." };
  const { error } = await supabase.from("savings_goals").insert({
    couple_id: coupleId, name: name.trim(), target_amount: Math.round(targetAmount), created_by: user.id,
  });
  if (error) {
    console.error("Create savings goal error:", error.message || error.code);
    return { success: false, message: "Không thể tạo mục tiêu tiết kiệm." };
  }
  revalidatePath("/discover");
  return { success: true };
}

export async function addSavingsAmountAction(goalId: string, amount: number) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_savings_amount", { p_goal_id: goalId, p_amount: Math.round(amount) });
  if (error) {
    console.error("Add savings amount error:", error.message || error.code);
    return { success: false, message: "Không thể thêm tiền tiết kiệm." };
  }
  revalidatePath("/discover");
  return { success: true };
}

export async function deleteBudgetTransactionAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("budget_transactions").delete().eq("id", id);
  if (error) {
    console.error("Delete budget transaction error:", error);
    return { success: false, message: "Không thể xóa khoản chi." };
  }
  revalidatePath("/discover");
  return { success: true };
}
