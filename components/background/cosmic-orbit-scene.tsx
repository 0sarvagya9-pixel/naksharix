"use client";

import React from "react";

export function CosmicOrbitScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 md:opacity-70">
      {/* 3D Celestial Orbit System at Top Right */}
      <div 
        className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full border border-dashed border-[#e6941a]/15 flex items-center justify-center animate-[spin_120s_linear_infinite]"
        style={{
          transform: "rotateX(70deg) rotateY(-20deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Inner Orbit Ring */}
        <div className="absolute w-[70%] h-[70%] rounded-full border border-double border-[#e6941a]/10" />
        
        {/* Center Star / Glow */}
        <div className="absolute w-24 h-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(230,148,26,0.18)_0%,transparent_70%)] blur-2xl" />
        
        {/* Floating Planet 1 */}
        <div 
          className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-[#eddcb4] to-[#c5973c] shadow-[0_0_24px_rgba(216,154,43,0.35),inset_-4px_-4px_12px_rgba(0,0,0,0.5)]"
          style={{
            transform: "translate3d(280px, 120px, 0)",
          }}
        />
        
        {/* Floating Moon for Planet 1 */}
        <div 
          className="absolute w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            transform: "translate3d(315px, 105px, 20px)",
          }}
        />
      </div>

      {/* Another Orbit Ring at Bottom Left */}
      <div 
        className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full border border-dashed border-neutral-700/25 flex items-center justify-center animate-[spin_180s_linear_infinite_reverse]"
        style={{
          transform: "rotateX(65deg) rotateY(15deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute w-[60%] h-[60%] rounded-full border border-[#6e82c8]/10" />
        
        {/* Floating Planet 2 */}
        <div 
          className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-[#6e82c8] to-[#1e2230] shadow-[0_0_36px_rgba(110,130,200,0.25),inset_-6px_-6px_16px_rgba(0,0,0,0.6)]"
          style={{
            transform: "translate3d(-240px, 80px, 0)",
          }}
        />
      </div>

      {/* Star Dust Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1.2px,transparent_1.2px)] bg-[size:64px_64px] opacity-30" />
    </div>
  );
}
