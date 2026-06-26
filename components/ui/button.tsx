import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-[#B8862E]/45 bg-[#B8862E] text-white shadow-[0_10px_30px_rgba(184,134,46,0.24),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 hover:bg-[#9f7324] hover:shadow-[0_14px_38px_rgba(184,134,46,0.28)]",
        secondary: "border border-[#D8AF66]/55 bg-gradient-to-r from-[#FFF9F0] via-[#F7EAD3] to-[#D8AF66] text-[#1F2933] shadow-[0_10px_28px_rgba(216,175,102,0.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(216,175,102,0.28)]",
        outline: "border border-[#E7D8BE] bg-white/80 text-[#B8862E] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-[#B8862E]/70 hover:bg-[#FFF9F0] hover:text-[#1F2933]",
        ghost: "text-[#1F2933] hover:bg-[#F7EAD3]/55 hover:text-[#B8862E]",
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
