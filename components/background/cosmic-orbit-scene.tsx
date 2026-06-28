"use client";

import React from "react";

export function CosmicOrbitScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ambient background clouds / nebula haze - Warm golden & sunset saffron */}
      <div className="absolute bottom-[-10%] left-[20%] w-[65%] h-[50%] bg-[radial-gradient(ellipse_at_bottom,rgba(216,154,43,0.16)_0%,rgba(185,120,16,0.06)_60%,transparent_100%)] blur-3xl opacity-80" />
      <div className="absolute top-[15%] right-[5%] w-[55%] h-[55%] bg-[radial-gradient(circle,rgba(242,197,107,0.12)_0%,rgba(216,154,43,0.04)_50%,transparent_100%)] blur-3xl opacity-75" />
      <div className="absolute top-[30%] left-[5%] w-[45%] h-[45%] bg-[radial-gradient(circle,rgba(110,130,200,0.14)_0%,transparent_70%)] blur-3xl opacity-60" />

      {/* 3D Celestial Orbit System at Top Right (rotated for perspective) */}
      <div
        className="absolute top-[2%] right-[-15%] w-[700px] h-[700px] md:w-[1050px] md:h-[1050px] rounded-full border border-dashed border-[#f2c56b]/22 flex items-center justify-center animate-[spin_180s_linear_infinite]"
        style={{
          transform: "rotateX(70deg) rotateY(-20deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Concentric Orbit Paths */}
        <div className="absolute w-[82%] h-[82%] rounded-full border border-dotted border-[#f2c56b]/16" />
        <div className="absolute w-[62%] h-[62%] rounded-full border border-[#f2c56b]/14" />
        <div className="absolute w-[42%] h-[42%] rounded-full border border-dashed border-[#ebd8b1]/18" />

        {/* Outer orbital planet 1 */}
        <div
          className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-[#f2c56b] to-[#402a06] shadow-[0_0_15px_rgba(242,197,107,0.35),inset_-2px_-2px_6px_rgba(0,0,0,0.85)]"
          style={{
            transform: "translate3d(400px, 200px, 0)",
          }}
        />

        {/* Orbit path node lights */}
        <div className="absolute w-2 h-2 rounded-full bg-white/60 shadow-[0_0_8px_white]" style={{ transform: "translate3d(0, -350px, 0)" }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#f2c56b]/80 shadow-[0_0_6px_#f2c56b]" style={{ transform: "translate3d(280px, -280px, 0)" }} />
      </div>

      {/* Large Saturn-style Planet with Ring (focal point near top right / hero side) */}
      <div className="absolute top-[16%] right-[10%] md:right-[16%] w-24 h-24 md:w-36 md:h-36 flex items-center justify-center">
        {/* Glow Behind */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(242,197,107,0.28)_0%,transparent_70%)] blur-lg scale-135 pointer-events-none" />
        {/* Planet Sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ebd8b1] via-[#c98924] to-[#120d06] shadow-[inset_-10px_-10px_28px_rgba(0,0,0,0.9),0_0_20px_rgba(242,197,107,0.25)]" />
        {/* Planet Ring Shadow & Highlight Layer */}
        <div
          className="absolute w-[185%] h-[38%] rounded-full border border-[#f2c56b]/45"
          style={{
            transform: "rotateX(72deg) rotateY(-14deg)",
            boxShadow: "0 0 15px rgba(242,197,107,0.2), inset 0 0 15px rgba(242,197,107,0.2)"
          }}
        />
      </div>

      {/* Another Orbit System at Bottom Left */}
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] md:w-[800px] md:h-[800px] rounded-full border border-dashed border-[#f2c56b]/14 flex items-center justify-center animate-[spin_220s_linear_infinite_reverse]"
        style={{
          transform: "rotateX(66deg) rotateY(15deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute w-[72%] h-[72%] rounded-full border border-[#f2c56b]/12" />

        {/* Floating Planet 2 */}
        <div
          className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#6e82c8] to-[#080b12] shadow-[0_0_28px_rgba(110,130,200,0.35),inset_-4px_-4px_12px_rgba(0,0,0,0.75)]"
          style={{
            transform: "translate3d(-240px, 80px, 0)",
          }}
        />
      </div>

      {/* Tiny floating golden moon near left edge */}
      <div className="absolute top-[26%] left-[12%] w-5 h-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f2c56b] to-[#3a2807] shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.85),0_0_10px_rgba(242,197,107,0.3)]" />
      </div>

      {/* Star Dust Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1.2px,transparent_1.2px)] bg-[size:44px_44px] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] bg-[size:72px_72px] opacity-50" />
    </div>
  );
}