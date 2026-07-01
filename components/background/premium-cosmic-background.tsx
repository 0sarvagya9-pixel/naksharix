"use client";

import React from "react";
import Image from "next/image";

export function PremiumCosmicBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
      {/* Fixed full-screen background image */}
      <Image
        src="/images/premium-cosmic-bg-v2.webp"
        alt="Vedic Cosmic Background"
        fill
        priority
        className="object-cover object-top"
      />

      {/* Subtle warm/indigo overlay - optimized for sunset cosmic glow and visibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(242, 197, 107, 0.04) 0%, rgba(20, 12, 8, 0.18) 60%, rgba(15, 10, 8, 0.45) 100%)",
        }}
      />

      {/* Optional subtle vignette/noise overlay */}
      <div className="absolute inset-0 bg-black/[0.02]" />
    </div>
  );
}
