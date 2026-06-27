import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        // Light saffron glass input style
        "naksh-input flex h-10 w-full rounded-xl border border-[rgba(212,160,55,0.45)] bg-[rgba(255,252,245,0.90)] px-3 py-2 text-sm text-[#2F2418] placeholder:text-[#7A6145] transition-all",
        "focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[rgba(217,119,6,0.12)]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
