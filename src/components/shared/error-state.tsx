import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "Có lỗi",
  description = "Thử lại nhé",
  retryLabel = "Thử lại",
  onRetry,
  className,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#F6D0D6] text-center shadow-xs",
          className
        )}
      >
        <div className="w-9 h-9 rounded-full bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center mb-2">
          <AlertCircle className="w-5 h-5 text-[#FA5271]" />
        </div>
        <p className="text-sm font-bold text-[#201A1D]">{title}</p>
        <p className="text-xs text-[#8E8287] mt-0.5">{description}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 rounded-3xl bg-white border border-[#F6D0D6] text-center shadow-sm",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[#FFEBF0] text-[#FA5271] flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-[#FA5271]" />
      </div>
      <h3 className="text-lg font-bold text-[#201A1D] mb-1">{title}</h3>
      <p className="text-sm text-[#8E8287] max-w-xs mb-5">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" size="default">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
