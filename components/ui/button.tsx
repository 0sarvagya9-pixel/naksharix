import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e6941a]/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#1e1e1f] text-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#2f2f31] hover:-translate-y-0.5",
        secondary:
          "border border-[rgba(20,20,20,0.08)] bg-[rgba(20,20,20,0.03)] text-[#1e1e1f] hover:bg-[rgba(20,20,20,0.06)] hover:-translate-y-0.5",
        outline:
          "border border-[rgba(20,20,20,0.08)] bg-transparent text-[#1e1e1f] hover:bg-[rgba(20,20,20,0.03)] hover:-translate-y-0.5",
        ghost:
          "text-[#1e1e1f] hover:bg-[rgba(20,20,20,0.03)]",
        destructive:
          "border border-red-300/20 bg-[#FF4D4F] text-white shadow-[0_4px_16px_rgba(255,77,79,0.22)] hover:bg-[#ff6365]",
      },
      size: {
        sm:   "h-8  px-3 text-xs rounded-lg",
        md:   "h-10 px-4 rounded-lg",
        lg:   "h-12 px-5 text-base rounded-lg",
        icon: "h-10 w-10 px-0 rounded-lg",
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
