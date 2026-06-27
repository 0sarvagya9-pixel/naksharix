import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8EA] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#C2410C] via-[#D97706] to-[#F59E0B] text-white shadow-[0_4px_20px_rgba(217,119,6,0.30)] hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(217,119,6,0.45)]",
        secondary:
          "border border-[#D97706]/60 bg-gradient-to-r from-[#FFF8EA] to-[#FFF3DC] text-[#D97706] shadow-[0_4px_16px_rgba(212,160,55,0.18)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(212,160,55,0.26)]",
        outline:
          "border-[1.5px] border-[#D97706] bg-[rgba(255,252,245,0.80)] text-[#D97706] backdrop-blur-sm hover:bg-[rgba(245,158,11,0.08)] hover:border-[#C2410C] hover:text-[#C2410C]",
        ghost:
          "text-[#D97706] hover:bg-[rgba(245,158,11,0.10)] hover:text-[#C2410C]",
        destructive:
          "border border-red-300/20 bg-[#FF4D4F] text-white shadow-[0_4px_16px_rgba(255,77,79,0.22)] hover:bg-[#ff6365]",
      },
      size: {
        sm:   "h-8  px-3 text-xs rounded-full",
        md:   "h-10 px-5 rounded-full",
        lg:   "h-12 px-6 text-base rounded-full",
        icon: "h-10 w-10 px-0 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
