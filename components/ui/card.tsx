import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(20,20,20,0.06)] bg-[rgba(255,255,255,0.72)] backdrop-blur-[24px] text-[#1e1e1f] transition-all duration-300",
        "shadow-[0_8px_32px_rgba(0,0,0,0.04),0_1.5px_2px_rgba(0,0,0,0.01),inset_0_1px_0_rgba(255,255,255,0.9)]",
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
        "font-cinzel text-lg font-semibold leading-none tracking-normal text-[#1e1e1f]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
