import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoupleAvatarsProps {
  initials?: [string, string];
  size?: "sm" | "md" | "lg";
  className?: string;
  showHeart?: boolean;
}

export function CoupleAvatars({
  initials = ["M", "A"],
  size = "md",
  className,
  showHeart = true,
}: CoupleAvatarsProps) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs font-bold",
    md: "w-9 h-9 text-sm font-bold",
    lg: "w-11 h-11 text-base font-bold",
  };

  const heartSizes = {
    sm: "w-3 h-3 p-0.5",
    md: "w-4 h-4 p-0.5",
    lg: "w-5 h-5 p-1",
  };

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-[#FFDDD7] text-[#D84557] ring-2 ring-[#FAF6F2] select-none",
          sizeClasses[size]
        )}
      >
        {initials[0]}
      </div>
      <div
        className={cn(
          "-ml-2.5 flex items-center justify-center rounded-full bg-[#E7E2FA] text-[#6E56B8] ring-2 ring-[#FAF6F2] select-none",
          sizeClasses[size]
        )}
      >
        {initials[1]}
      </div>
      {showHeart && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-1 flex items-center justify-center rounded-full bg-[#FA5271] text-white ring-2 ring-[#FAF6F2] shadow-xs",
            heartSizes[size]
          )}
        >
          <Heart className="w-full h-full fill-white" />
        </span>
      )}
    </div>
  );
}
