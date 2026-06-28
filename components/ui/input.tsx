import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        // Pure-glass input style
        "naksh-input flex h-10 w-full rounded-lg border border-[rgba(20,20,20,0.08)] bg-[rgba(255,255,255,0.75)] px-3 py-2 text-sm text-[#1e1e1f] placeholder:text-[#66666b] transition-all",
        "focus:outline-none focus:border-[#e6941a] focus:ring-2 focus:ring-[rgba(230,148,26,0.12)]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
