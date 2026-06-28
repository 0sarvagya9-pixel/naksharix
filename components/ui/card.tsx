import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.72)] backdrop-blur-[24px] text-[#1b1c22] transition-all duration-300",
        "shadow-[0_8px_32px_rgba(20,12,8,0.04),inset_0_1px_0_rgba(255,255,255,0.85)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-cinzel text-lg font-bold leading-none tracking-normal text-[#1b1c22]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}