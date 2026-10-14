import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PairView, CoupleInfo } from "@/features/couple/components/pair-view";
import { getCurrentCouple } from "@/features/couple/queries";

interface PairPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function PairPage({ searchParams }: PairPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current couple info if any
  const coupleInfo = await getCurrentCouple();

  // If already paired with 2 members, redirect to /home
  if (coupleInfo && coupleInfo.member_count >= 2) {
    redirect("/home");
  }

  // Fetch user profile display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const userDisplayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "bạn";

  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab = resolvedParams?.tab === "join" ? "join" : "create";

  return (
    <div className="min-h-screen bg-[#FAF6F2] flex justify-center p-4">
      <div className="w-full max-w-md flex flex-col justify-between py-4">
        <PairView
          initialCoupleInfo={coupleInfo as CoupleInfo | null}
          userDisplayName={userDisplayName}
          initialTab={initialTab}
        />
      </div>
    </div>
  );
}
