import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "naksh-input flex h-10 file:border-0 file:bg-transparent file:text-sm",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
