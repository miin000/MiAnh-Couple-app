import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  title = "Trống",
  description = "Chưa có dữ liệu",
  icon,
  actionLabel,
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#EFE5E0] text-center shadow-xs",
          className
        )}
      >
        <div className="w-9 h-9 rounded-full bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center mb-2">
          {icon ?? <Heart className="w-5 h-5 text-[#7C4DFF]" />}
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
      <div className="w-16 h-16 rounded-full bg-[#F0E9FF] text-[#7C4DFF] flex items-center justify-center mb-4">
        {icon ?? <Heart className="w-8 h-8 text-[#7C4DFF]" />}
      </div>
      <h3 className="text-lg font-bold text-[#201A1D] mb-1">{title}</h3>
      <p className="text-sm text-[#8E8287] max-w-xs mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
