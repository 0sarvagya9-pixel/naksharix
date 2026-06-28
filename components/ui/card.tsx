import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl text-[#17181d] transition-all duration-300",
        className
      )}
      style={{
        background: "rgba(255,255,255,0.64)",
        backdropFilter: "blur(24px) saturate(145%)",
        WebkitBackdropFilter: "blur(24px) saturate(145%)",
        border: "1px solid rgba(255,255,255,0.58)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78), 0 18px 55px rgba(20,12,8,0.16)"
      }}
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
        "font-cinzel text-lg font-bold leading-none tracking-normal text-[#17181d]",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}