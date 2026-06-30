"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function PremiumGlassShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative z-10 w-full max-w-[1420px] mx-auto my-6 md:my-10 rounded-[38px] overflow-hidden flex flex-col min-h-screen sm:min-h-[calc(100vh-80px)]",
        className
      )}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
        backdropFilter: "blur(6px) saturate(125%)",
        WebkitBackdropFilter: "blur(6px) saturate(125%)",
        border: "1px solid rgba(255,255,255,0.42)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.50), inset 0 -1px 0 rgba(255,255,255,0.12), 0 30px 100px rgba(0,0,0,0.32), 0 0 90px rgba(216,154,43,0.16)"
      }}
    >
      {children}
    </div>
  );
}
