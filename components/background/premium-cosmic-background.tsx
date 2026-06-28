"use client";

import React from "react";
import Image from "next/image";

export function PremiumCosmicBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
      {/* Fixed full-screen background image */}
      <Image
        src="/naksharix/backgrounds/premium-cosmic-bg-v1.webp"
        alt="Vedic Cosmic Background"
        fill
        priority
        className="object-cover object-top"
      />

      {/* Subtle dark/warm overlay */}
      <div 
        className="absolute inset-0" 
        style={{
          background: "linear-gradient(180deg, rgba(20, 15, 30, 0.15) 0%, rgba(12, 10, 20, 0.35) 50%, rgba(6, 4, 8, 0.65) 100%)",
        }}
      />

      {/* Optional blur/noise/haze overlay */}
      <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-[1px] mix-blend-overlay" />
    </div>
  );
}
