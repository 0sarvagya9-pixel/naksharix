"use client";

import React from "react";
import { CosmicOrbitScene } from "./cosmic-orbit-scene";

export function AppBackgroundScene() {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{
        background: "radial-gradient(circle at 50% 40%, #17132e 0%, #0d0918 50%, #040206 100%)",
      }}
    >
      {/* Concentric subtle background orbits for luxury visual depth */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[320px] h-[320px] rounded-full border border-white/5" />
        <div className="absolute w-[640px] h-[640px] rounded-full border border-white/5" />
        <div className="absolute w-[960px] h-[960px] rounded-full border border-white/5" />
        <div className="absolute w-[1280px] h-[1280px] rounded-full border border-white/5 animate-[spin_360s_linear_infinite]" />
      </div>

      {/* Layer 1: Ambient Space Glows - Sunrise bronze horizon, golden haze & smoky violet */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[70%] h-[65%] rounded-full opacity-45 blur-[130px]"
        style={{
          background: "radial-gradient(circle, rgba(216, 154, 43, 0.22) 0%, rgba(185, 120, 16, 0.10) 50%, transparent 100%)"
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full opacity-45 blur-[140px]"
        style={{
          background: "radial-gradient(circle, rgba(110, 130, 200, 0.20) 0%, rgba(216, 154, 43, 0.08) 50%, transparent 100%)"
        }}
      />
      {/* Warm bottom horizon glow */}
      <div
        className="absolute bottom-[-15%] left-[10%] w-[80%] h-[45%] rounded-full opacity-40 blur-[120px]"
        style={{
          background: "radial-gradient(ellipse at bottom, rgba(185, 120, 16, 0.22) 0%, rgba(216, 154, 43, 0.08) 60%, transparent 100%)"
        }}
      />
      {/* Top left sun glow */}
      <div
        className="absolute top-[10%] left-[15%] w-[40%] h-[40%] rounded-full opacity-25 blur-[110px]"
        style={{
          background: "radial-gradient(circle, rgba(255, 230, 180, 0.20) 0%, transparent 70%)"
        }}
      />

      {/* Layer 2: 3D Celestial Orbit Scene */}
      <CosmicOrbitScene />

      {/* Layer 3: Faint overlay vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,4,8,0.55)_100%)]" />
    </div>
  );
}