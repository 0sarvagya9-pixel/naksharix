import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn("min-h-24 w-full rounded-md border border-amber-200/20 bg-[#12051f]/78 px-3 py-2 text-sm text-[#FFF7E8] outline-none placeholder:text-[#BFAFD9]/75 focus:border-[#FFD36A]/70 focus:ring-2 focus:ring-[#A855F7]/35", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
