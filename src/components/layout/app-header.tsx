import * as React from "react";
import { CoupleAvatars } from "@/components/shared/couple-avatars";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  dateLabel?: string;
  coupleGreeting?: string;
  showAvatars?: boolean;
  initials?: [string, string];
  rightAction?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  dateLabel,
  coupleGreeting,
  showAvatars = true,
  initials = ["M", "A"],
  rightAction,
  className,
}: AppHeaderProps) {
  return (
    <header className={cn("pt-4 pb-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {dateLabel && (
            <p className="text-[11px] font-bold tracking-wider text-[#9E9096] uppercase mb-0.5">
              {dateLabel}
            </p>
          )}
          {coupleGreeting && (
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#201A1D] tracking-tight leading-tight line-clamp-2">
              {coupleGreeting}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showAvatars && <CoupleAvatars initials={initials} size="md" />}
          {rightAction ?? (
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white border border-[#EFE5E0] shadow-2xs flex items-center justify-center text-[#786D73] hover:text-[#201A1D] active:scale-95 transition-all"
              aria-label="Tùy chọn khác"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
