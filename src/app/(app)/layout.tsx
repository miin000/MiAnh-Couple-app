import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getCurrentCouple } from "@/features/couple/queries";
import { CoupleHeader } from "@/components/layout/couple-header";
import { LocationSharingPrompt } from "@/features/map/components/location-sharing-prompt";
import { PushNotificationRegister } from "@/components/push-notification-register";
import { LocationSharingTracker } from "@/features/map/components/location-sharing-tracker";

export default async function AppLayout({


  children,
}: {
  children: React.ReactNode;
}) {
  const couple = await getCurrentCouple();
  if (!couple) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    redirect(user ? "/pair" : "/login");
  }
  const members = couple.members;

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex justify-center text-[#201A1D]">
      {/* Mobile container - optimized for 375px+ */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#FAF8FF] shadow-sm border-x border-[#F0E5E0]">
        <CoupleHeader
          initials={[
            members[0]?.display_name?.[0]?.toUpperCase() || "M",
            members[1]?.display_name?.[0]?.toUpperCase() || "?",
          ]}
          avatarUrls={[members[0]?.avatar_url, members[1]?.avatar_url]}
        />
        <main className="flex-1 px-4 pt-16 pb-24 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
        <LocationSharingPrompt />
        <LocationSharingTracker />
        <PushNotificationRegister />
      </div>
    </div>
  );
}
