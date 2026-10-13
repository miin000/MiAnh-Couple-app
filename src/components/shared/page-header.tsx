import * as React from "react";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  category?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showDefaultMenu?: boolean;
  className?: string;
}

export function PageHeader({
  category,
  title,
  subtitle,
  backHref,
  onBack,
  rightAction,
  showDefaultMenu = false,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("pt-2 pb-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {(backHref || onBack) && (
            <div className="pt-0.5">
              {backHref ? (
                <Link
                  href={backHref}
                  className="w-10 h-10 rounded-full bg-white border border-[#EFE5E0] shadow-2xs flex items-center justify-center text-[#4B3E45] hover:text-[#FA5271] active:scale-95 transition-all"
                  aria-label="Quay lại"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-white border border-[#EFE5E0] shadow-2xs flex items-center justify-center text-[#4B3E45] hover:text-[#FA5271] active:scale-95 transition-all"
                  aria-label="Quay lại"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {category && (
              <p className="text-[11px] font-bold tracking-wider text-[#9E9096] uppercase mb-0.5">
                {category}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#201A1D] tracking-tight leading-snug line-clamp-2">
              {title}
            </h1>
          </div>
        </div>

        {/* Right action area */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {rightAction}
          {showDefaultMenu && !rightAction && (
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

      {subtitle && (
        <p className="text-xs sm:text-sm text-[#7D7076] mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      )}
    </header>
  );
}
