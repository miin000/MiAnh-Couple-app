import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(

  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[44px] w-full rounded-2xl border border-[#E9DFDA] bg-white px-4 py-2 text-sm text-[#201A1D] placeholder:text-[#A89DA3] shadow-xs transition-colors focus-visible:outline-none focus-visible:border-[#FA5271] focus-visible:ring-2 focus-visible:ring-[#FA5271]/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
