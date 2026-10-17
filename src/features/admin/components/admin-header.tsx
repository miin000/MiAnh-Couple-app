"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft, LogOut } from "lucide-react";

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F2EAE5]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-[#201A1D]">
                Quản trị Mi & Anh
              </h1>
              <span className="bg-[#FFEBF0] text-[#FA5271] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Admin
              </span>
            </div>
            {userEmail && (
              <p className="text-[11px] text-[#786D73] truncate max-w-[200px] sm:max-w-none">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/home">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-1.5 h-8 border-[#F2EAE5] text-[#52464D] hover:text-[#FA5271]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Về App đôi</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="rounded-xl text-xs gap-1.5 h-8 text-[#786D73] hover:text-[#D84557] hover:bg-[#FFEBF0]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
