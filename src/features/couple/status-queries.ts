import { createClient } from "@/lib/supabase/server";
import type { CoupleStatus, StatusPreset } from "./status-types";

export async function getCoupleStatuses(): Promise<CoupleStatus[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_couple_statuses");
  if (error) {
    console.error("Get couple statuses error:", error.message);
    return [];
  }
  return (data ?? []) as CoupleStatus[];
}

export async function getStatusPresets(): Promise<StatusPreset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("status_presets").select("id, emoji, label").order("sort_order");
  if (error) {
    console.error("Get status presets error:", error.message);
    return [];
  }
  return (data ?? []) as StatusPreset[];
}
