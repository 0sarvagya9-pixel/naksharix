import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-[#009b72]/45 bg-[#009b72] text-white shadow-[0_10px_30px_rgba(0,155,114,0.28),inset_0_1px_0_rgba(255,255,255,0.16)] hover:-translate-y-0.5 hover:bg-[#009b72] hover:shadow-[0_0_30px_rgba(0,245,160,0.26)]",
        secondary: "border border-[#dca956]/45 bg-gradient-to-r from-[#f3d382] via-[#dca956] to-[#dca956] text-[#020612] shadow-[0_10px_28px_rgba(220,169,86,0.18)] hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(220,169,86,0.26)]",
        outline: "border border-[#1e293b] bg-[#020612]/70 text-[#f3d382] shadow-[inset_0_1px_0_rgba(243,211,130,0.08)] hover:border-[#dca956]/70 hover:bg-[#0f1c3a] hover:text-white",
        ghost: "text-[#ffffff] hover:bg-[#dca956]/10 hover:text-[#f3d382]",
        destructive: "border border-red-300/20 bg-[#FF4D4F] text-[#ffffff] shadow-[0_10px_30px_rgba(255,77,79,0.22)] hover:bg-[#ff6365]"
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
