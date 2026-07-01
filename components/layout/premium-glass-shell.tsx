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
        background: "linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.08))",
        backdropFilter: "blur(8px) saturate(135%)",
        WebkitBackdropFilter: "blur(8px) saturate(135%)",
        border: "1px solid rgba(255,255,255,0.42)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 32px 100px rgba(20,12,8,0.30), 0 0 70px rgba(216,154,43,0.16)"
      }}
    >
      {children}
    </div>
  );
}
