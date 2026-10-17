import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#F0E9FF] text-[#7C4DFF] border border-[#FFD3DC]",
        secondary:
          "bg-white text-[#52464D] border border-[#E9E0DB]",
        outline:
          "border border-[#E2D8D4] text-[#695E64]",
        subtle:
          "bg-[#F7EFE9] text-[#786D73]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
