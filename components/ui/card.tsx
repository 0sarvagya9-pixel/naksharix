import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Light saffron glassmorphism card
        "rounded-2xl border border-[rgba(212,160,55,0.35)] bg-[rgba(255,252,245,0.75)] backdrop-blur-[20px] text-[#2F2418]",
        "shadow-[0_8px_40px_rgba(180,120,20,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]",
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
        "font-cinzel text-lg font-semibold leading-none tracking-normal text-[#2F2418]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
