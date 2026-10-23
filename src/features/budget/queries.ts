import { createClient } from "@/lib/supabase/server";
import { BudgetPlan, BudgetPeriod, BudgetTransaction, SavingsGoal } from "./types";

export async function getBudgetPlans(period?: BudgetPeriod): Promise<BudgetPlan[]> {
  const supabase = await createClient();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) return [];
  const { data: { user } } = await supabase.auth.getUser();
  const yearStart = `${new Date().getFullYear()}-01-01`;
  if (user) {
    const { error: yearError } = await supabase.from("budget_plans").upsert({
      couple_id: coupleId,
      name: `Tổng khoản chi năm ${new Date().getFullYear()}`,
      period_type: "year",
      period_start: yearStart,
      budget_amount: 0,
      created_by: user.id,
    }, { onConflict: "couple_id,period_type,period_start", ignoreDuplicates: true });
    if (yearError) console.error("Ensure yearly expense summary error:", yearError.message || yearError.code);
  }

  let query = supabase.from("budget_plans").select("*").eq("couple_id", coupleId)
    .order("period_start", { ascending: false });
  if (period) query = query.eq("period_type", period);
  const { data: plans, error } = await query;
  if (error || !plans) {
    if (error?.code !== "PGRST205") console.error("Error fetching budget plans:", error?.message || error?.code || error);
    return [];
  }

  const ids = plans.map((plan) => plan.id);
  const { data: transactions, error: transactionError } = ids.length
    ? await supabase.from("budget_transactions").select("*").in("budget_plan_id", ids).order("spent_on", { ascending: false })
    : { data: [], error: null };
  if (transactionError && transactionError.code !== "PGRST205") console.error("Error fetching budget transactions:", transactionError.message || transactionError.code);

  const byPlan = new Map<string, BudgetTransaction[]>();
  const allTransactions: BudgetTransaction[] = [];
  for (const transaction of transactions ?? []) {
    const normalized = { ...transaction, amount: Number(transaction.amount) } as BudgetTransaction;
    const current = byPlan.get(transaction.budget_plan_id) ?? [];
    current.push(normalized);
    allTransactions.push(normalized);
    byPlan.set(transaction.budget_plan_id, current);
  }
  return plans.map((plan) => {
    const items = byPlan.get(plan.id) ?? [];
    const planStart = new Date(`${plan.period_start}T00:00:00`);
    const spent = plan.period_type === "year"
      ? allTransactions
        .filter((item) => item.status === "confirmed" && item.spent_on.startsWith(String(planStart.getFullYear())))
        .reduce((total, item) => total + item.amount, 0)
      : items.filter((item) => item.status === "confirmed").reduce((total, item) => total + item.amount, 0);
    const previousMonth = new Date(planStart);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
    const year = planStart.getFullYear();
    const monthlyBreakdown = Array.from({ length: 12 }, (_, month) => {
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      return {
        month: key,
        spent: allTransactions
          .filter((item) => item.status === "confirmed" && item.spent_on.startsWith(key))
          .reduce((total, item) => total + item.amount, 0),
      };
    });
    const previousMonthSpent = plan.period_type === "month"
      ? allTransactions
        .filter((item) => item.status === "confirmed" && item.spent_on.startsWith(previousMonthKey))
        .reduce((total, item) => total + item.amount, 0)
      : 0;
    return {
      ...plan,
      budget_amount: Number(plan.budget_amount),
      warning_amount: plan.warning_amount === null ? null : Number(plan.warning_amount),
      spent,
      remaining: Number(plan.budget_amount) - spent,
      previous_month_spent: previousMonthSpent,
      monthly_breakdown: monthlyBreakdown,
      transactions: items,
    };
  });
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const supabase = await createClient();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) return [];
  const { data, error } = await supabase.from("savings_goals").select("id,name,target_amount,saved_amount")
    .eq("couple_id", coupleId).order("created_at", { ascending: false });
  if (error) {
    if (error.code !== "PGRST205") console.error("Error fetching savings goals:", error);
    return [];
  }
  return (data ?? []).map((goal) => ({ ...goal, target_amount: Number(goal.target_amount), saved_amount: Number(goal.saved_amount) }));
}
