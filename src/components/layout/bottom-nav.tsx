"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Play,
  BookOpen,
  CalendarHeart,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_TABS: NavTab[] = [
  { href: "/home", label: "Trang chủ", icon: Home },
  { href: "/discover", label: "Khám phá", icon: Compass },
  { href: "/play", label: "Chơi", icon: Play },
  { href: "/learn", label: "Học", icon: BookOpen },
  { href: "/our-space", label: "Kỷ niệm", icon: CalendarHeart },
  { href: "/map", label: "Bản đồ", icon: Map },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EFE5E0] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md w-full px-2">
        <div className="grid grid-cols-6 items-center h-16">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all select-none touch-manipulation group",
                  isActive
                    ? "text-[#7C4DFF]"
                    : "text-[#8E8287] hover:text-[#201A1D]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active pill background on icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-full transition-colors",
                    isActive ? "bg-[#F0E9FF]" : "group-hover:bg-[#FAF8FF]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive ? "scale-105 stroke-[2.3]" : "stroke-[1.8]"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-tight font-medium tracking-tight mt-0.5",
                    isActive ? "font-bold text-[#7C4DFF]" : "text-[#8E8287]"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
