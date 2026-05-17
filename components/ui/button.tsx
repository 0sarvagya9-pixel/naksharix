import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-purple-300/20 bg-gradient-to-r from-[#9B5CFF] via-[#A855F7] to-[#B56CFF] text-white shadow-[0_10px_30px_rgba(155,92,255,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_42px_rgba(155,92,255,0.38)]",
        secondary: "border border-amber-200/35 bg-gradient-to-r from-[#F5C542] to-[#FFD36A] text-[#12051f] shadow-[0_10px_28px_rgba(245,197,66,0.18)] hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(245,197,66,0.26)]",
        outline: "border border-amber-200/25 bg-[#160926]/70 text-amber-50 shadow-[inset_0_1px_0_rgba(255,211,106,0.08)] hover:border-amber-200/55 hover:bg-[#201037] hover:text-[#FFD36A]",
        ghost: "text-[#FFF7E8] hover:bg-amber-200/10 hover:text-[#FFD36A]",
        destructive: "border border-red-300/20 bg-[#FF4D4F] text-white shadow-[0_10px_30px_rgba(255,77,79,0.22)] hover:bg-[#ff6365]"
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
