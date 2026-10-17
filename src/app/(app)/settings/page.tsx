import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/features/couple/components/settings-view";
import { getCurrentCouple } from "@/features/couple/queries";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch couple info
  const coupleInfo = await getCurrentCouple();

  if (!coupleInfo || !coupleInfo.couple_id) {
    redirect("/pair");
  }

  // Fetch current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, is_admin")
    .eq("id", user.id)
    .single();

  const currentDisplayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Minh";

  return (
    <SettingsView
      initialDisplayName={currentDisplayName}
      initialStartDate={coupleInfo.start_date || new Date().toISOString().split("T")[0]}
      memberCount={coupleInfo.member_count || 1}
      members={coupleInfo.members || []}
      activeInviteCode={coupleInfo.active_invite?.code}
      isAdmin={profile?.is_admin === true}
    />
  );
}

