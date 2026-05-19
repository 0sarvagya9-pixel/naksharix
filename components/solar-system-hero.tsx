"use client";

import { motion } from "framer-motion";

const numerologyMarks = [
  { value: "1", className: "left-[16%] top-[18%]", delay: 0 },
  { value: "3", className: "right-[18%] top-[22%]", delay: 0.7 },
  { value: "7", className: "bottom-[20%] left-[20%]", delay: 1.1 },
  { value: "9", className: "bottom-[18%] right-[19%]", delay: 0.35 }
];

const constellationPoints = [
  "left-[18%] top-[42%]",
  "left-[29%] top-[33%]",
  "left-[42%] top-[40%]",
  "right-[31%] top-[35%]",
  "right-[20%] top-[46%]",
  "right-[34%] bottom-[30%]",
  "left-[36%] bottom-[28%]"
];

export function SolarSystemHero() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem] overflow-visible rounded-full [perspective:900px]" aria-label="Golden celestial numerology visual">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.18),transparent_28%),radial-gradient(circle_at_52%_52%,rgba(1,163,97,0.18),transparent_46%),radial-gradient(circle_at_center,rgba(2,17,44,0.04),rgba(2,17,44,0.88)_74%)]" />
      <div className="absolute inset-3 rounded-full border border-[#D4AF37]/18 shadow-[inset_0_0_55px_rgba(255,215,0,0.08)]" />
      <div className="absolute inset-10 rounded-full border border-[#01A361]/20" />

      <motion.div
        className="absolute inset-[9%] rounded-full border border-[#D4AF37]/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[17%] rounded-full border border-dashed border-[#FFD700]/35"
        animate={{ rotate: -360 }}
        transition={{ duration: 115, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#D4AF37]/35"
        animate={{ rotate: [45, 405] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#01A361]/25"
        animate={{ rotate: [45, -315] }}
        transition={{ duration: 96, repeat: Infinity, ease: "linear" }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100" role="presentation">
        <path d="M18 42 L29 33 L42 40 L69 35 L80 46 L66 70 L36 72 Z" fill="none" stroke="#D4AF37" strokeWidth="0.35" strokeDasharray="1.6 2.2" />
        <path d="M50 16 L62 50 L50 84 L38 50 Z" fill="none" stroke="#01A361" strokeWidth="0.28" opacity="0.75" />
        <path d="M20 50 H80 M50 20 V80" stroke="#D4AF37" strokeWidth="0.22" opacity="0.45" />
      </svg>

      {constellationPoints.map((className, index) => (
        <motion.span
          key={className}
          className={`absolute h-1.5 w-1.5 rounded-full bg-[#F0F0F0] shadow-[0_0_12px_rgba(255,255,255,0.8)] ${className}`}
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.28, 0.85] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.28, ease: "easeInOut" }}
        />
      ))}

      {numerologyMarks.map((mark) => (
        <motion.span
          key={mark.value}
          className={`absolute font-decorative text-4xl font-black text-[#FFD700] drop-shadow-[0_0_18px_rgba(255,215,0,0.55)] sm:text-5xl ${mark.className}`}
          animate={{ y: [-8, 8, -8], opacity: [0.58, 1, 0.58] }}
          transition={{ duration: 5.4, repeat: Infinity, delay: mark.delay, ease: "easeInOut" }}
        >
          {mark.value}
        </motion.span>
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_28%,#fff8c7_0%,#FFD700_28%,#D4AF37_48%,#8b6a19_68%,rgba(1,163,97,0.18)_100%)] shadow-[0_0_55px_rgba(255,215,0,0.62),0_0_120px_rgba(1,163,97,0.24)] sm:h-44 sm:w-44"
        animate={{ scale: [1, 1.045, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute inset-[18%] rounded-full border border-[#02112C]/25" />
        <span className="absolute left-[20%] top-[22%] h-8 w-14 rounded-full bg-white/30 blur-md" />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,transparent_34%,rgba(2,17,44,0.12)_62%,#02112C_92%)]" />
    </div>
  );
}
