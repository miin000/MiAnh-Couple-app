import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export function LoadingState({
  title = "Đang tải",
  description = "Chờ một chút",
  className,
  compact = false,
}: LoadingStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#EFE5E0] text-center shadow-xs",
          className
        )}
      >
        <div className="w-9 h-9 rounded-full bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center mb-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#FA5271]" />
        </div>
        <p className="text-sm font-bold text-[#201A1D]">{title}</p>
        <p className="text-xs text-[#8E8287] mt-0.5">{description}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 rounded-3xl bg-white border border-[#EFE5E0] text-center shadow-sm",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#FA5271]" />
      </div>
      <h3 className="text-lg font-bold text-[#201A1D] mb-1">{title}</h3>
      <p className="text-sm text-[#8E8287] max-w-xs">{description}</p>
    </div>
  );
}
