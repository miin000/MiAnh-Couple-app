import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none min-h-[44px]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#FA5271] text-white hover:bg-[#e44362] shadow-[0_4px_14px_rgba(250,82,113,0.3)]",
        secondary:
          "bg-white text-[#2B2327] border border-[#EBE3DE] hover:bg-[#FAF6F2] shadow-sm",
        ghost:
          "text-[#786D73] hover:text-[#201A1D] hover:bg-black/5",
        outline:
          "border border-[#FA5271] text-[#FA5271] bg-transparent hover:bg-[#FFF0F3]",
        soft:
          "bg-[#FFEBF0] text-[#FA5271] hover:bg-[#FFDDE5]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs min-h-[36px]",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
