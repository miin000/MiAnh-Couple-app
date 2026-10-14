import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({


  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has an active couple
  const { data: coupleId } = await supabase.rpc("current_couple_id");

  if (!coupleId) {
    redirect("/pair");
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] flex justify-center text-[#201A1D]">
      {/* Mobile container - optimized for 375px+ */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#FAF6F2] shadow-sm border-x border-[#F0E5E0]">
        <main className="flex-1 px-4 pt-3 pb-24 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

