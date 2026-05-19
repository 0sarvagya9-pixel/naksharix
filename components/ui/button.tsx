import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-[#01A361]/35 bg-[#01A361] text-white shadow-[0_10px_30px_rgba(2,75,48,0.42),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[#12b873] hover:shadow-[0_14px_42px_rgba(1,163,97,0.34)]",
        secondary: "border border-[#D4AF37]/45 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#02112C] shadow-[0_10px_28px_rgba(255,215,0,0.18)] hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(255,215,0,0.26)]",
        outline: "border border-[#D4AF37]/35 bg-[#02112C]/70 text-[#FFD700] shadow-[inset_0_1px_0_rgba(255,215,0,0.08)] hover:border-[#FFD700]/70 hover:bg-[#024B30]/45 hover:text-white",
        ghost: "text-[#F0F0F0] hover:bg-[#D4AF37]/10 hover:text-[#FFD700]",
        destructive: "border border-red-300/20 bg-[#FF4D4F] text-[#FFFFFF] shadow-[0_10px_30px_rgba(255,77,79,0.22)] hover:bg-[#ff6365]"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: { variant: "default", size: "md" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
