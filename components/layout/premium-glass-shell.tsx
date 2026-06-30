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
        background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))",
        backdropFilter: "blur(8px) saturate(135%)",
        WebkitBackdropFilter: "blur(8px) saturate(135%)",
        border: "1px solid rgba(255,255,255,0.45)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 30px 100px rgba(0,0,0,0.35), 0 0 90px rgba(216,154,43,0.15)"
      }}
    >
      {children}
    </div>
  );
}
