import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-amber-200/20 bg-[#12051f]/78 px-3 py-2 text-sm text-[#FFF7E8] outline-none transition file:border-0 file:bg-transparent file:text-sm placeholder:text-[#BFAFD9]/75 focus:border-[#FFD36A]/70 focus:ring-2 focus:ring-[#A855F7]/35 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
