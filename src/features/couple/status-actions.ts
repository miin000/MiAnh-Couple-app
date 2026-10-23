"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePartnerStatusAction(status: string, hours: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Vui lòng đăng nhập." };
  const { error } = await supabase.rpc("create_partner_status", { p_status: status, p_hours: hours });
  if (error) {
    console.error("Update partner status error:", error);
    return { success: false, message: "Không thể cập nhật trạng thái." };
  }
  revalidatePath("/home");
  return { success: true };
}

export async function getPartnerStatuses() {
  const supabase = await createClient();
  const { data: coupleId } = await supabase.rpc("current_couple_id");
  if (!coupleId) return [];
  const { data, error } = await supabase.from("partner_statuses").select("user_id,status,expires_at").eq("couple_id", coupleId);
  if (error) {
    if (error.code !== "PGRST205") console.error("Get partner statuses error:", error.message || error.code);
    return [];
  }
  return data ?? [];
}
