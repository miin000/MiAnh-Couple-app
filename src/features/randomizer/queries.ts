import { createClient } from "@/lib/supabase/server";
import { RandomItem, DatePlan, DatePlanItem, DiscoverKind } from "@/types/discover";

export async function getRandomItems(kind?: DiscoverKind): Promise<RandomItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("random_items")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error fetching random_items:", error);
    return [];
  }

  return data as RandomItem[];
}

export async function getRandomSuggestionForHome(): Promise<RandomItem | null> {
  const items = await getRandomItems();
  if (!items || items.length === 0) return null;

  // Chọn ngẫu nhiên một item
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

export async function getDatePlans(): Promise<DatePlan[]> {
  const supabase = await createClient();

  // Lấy couple_id hiện tại của user
  const { data: coupleId, error: rpcError } = await supabase.rpc("current_couple_id");
  if (rpcError || !coupleId) {
    return [];
  }

  const { data: plans, error: plansError } = await supabase
    .from("date_plans")
    .select("*")
    .eq("couple_id", coupleId)
    .order("planned_for", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (plansError || !plans) {
    console.error("Error fetching date_plans:", plansError);
    return [];
  }

  const planIds = plans.map((p) => p.id);
  let itemsByPlan: Record<string, DatePlanItem[]> = {};

  if (planIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("date_plan_items")
      .select("*")
      .in("plan_id", planIds)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (!itemsError && items) {
      itemsByPlan = items.reduce((acc, it) => {
        if (!acc[it.plan_id]) acc[it.plan_id] = [];
        acc[it.plan_id].push(it as DatePlanItem);
        return acc;
      }, {} as Record<string, DatePlanItem[]>);
    }
  }

  return plans.map((p) => {
    const planItems = itemsByPlan[p.id] || [];
    const total_estimated = planItems.reduce((sum, it) => sum + (Number(it.estimated_cost) || 0), 0);
    const total_actual = planItems.reduce((sum, it) => sum + (it.actual_cost !== null ? Number(it.actual_cost) : 0), 0);

    return {
      ...p,
      planned_budget: Number(p.planned_budget) || 0,
      items: planItems,
      total_estimated,
      total_actual,
    };
  });
}

export async function getDatePlanById(planId: string): Promise<DatePlan | null> {
  const supabase = await createClient();

  const { data: plan, error: planError } = await supabase
    .from("date_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (planError || !plan) {
    return null;
  }

  const { data: items } = await supabase
    .from("date_plan_items")
    .select("*")
    .eq("plan_id", planId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const planItems = (items || []) as DatePlanItem[];
  const total_estimated = planItems.reduce((sum, it) => sum + (Number(it.estimated_cost) || 0), 0);
  const total_actual = planItems.reduce((sum, it) => sum + (it.actual_cost !== null ? Number(it.actual_cost) : 0), 0);

  return {
    ...plan,
    planned_budget: Number(plan.planned_budget) || 0,
    items: planItems,
    total_estimated,
    total_actual,
  };
}
