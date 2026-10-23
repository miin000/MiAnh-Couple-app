export type BudgetPeriod = "month" | "year";
export type StoredBudgetPeriod = BudgetPeriod | "week";

export interface BudgetTransaction {
  id: string;
  budget_plan_id: string;
  spent_on: string;
  category: string;
  amount: number;
  note: string | null;
  created_by: string;
  status: "pending" | "confirmed";
  confirmed_at: string | null;
}

export interface BudgetPlan {
  id: string;
  name: string;
  period_type: BudgetPeriod;
  period_start: string;
  budget_amount: number;
  warning_amount: number | null;
  spent: number;
  remaining: number;
  previous_month_spent: number;
  monthly_breakdown: Array<{ month: string; spent: number }>;
  transactions: BudgetTransaction[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
}
