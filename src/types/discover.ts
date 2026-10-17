export type DiscoverKind = "food" | "drink" | "place" | "activity";

export interface RandomItem {
  id: string;
  external_key: string | null;
  kind: DiscoverKind;
  title: string;
  description: string | null;
  tip: string | null;
  price_level: number | null;
  image_url?: string | null;
  map_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceLevelConfig {
  level: number; // 1, 2, 3, 4
  label: string;
  badge: string;
  rangeText: string;
  minCost: number | null;
  maxCost: number | null;
  description: string;
}


export interface DatePlanItem {
  id: string;
  plan_id: string;
  couple_id: string;
  random_item_id: string | null;
  title: string;
  estimated_cost: number;
  actual_cost: number | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DatePlan {
  id: string;
  couple_id: string;
  title: string;
  planned_for: string | null;
  planned_budget: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: DatePlanItem[];
  total_estimated?: number;
  total_actual?: number;
}
