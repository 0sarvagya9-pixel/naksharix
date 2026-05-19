"use client";

import { motion } from "framer-motion";

const floatingNumbers = [
  { value: "1", className: "left-[11%] top-[16%]", delay: 0 },
  { value: "3", className: "right-[13%] top-[18%]", delay: 0.55 },
  { value: "7", className: "bottom-[15%] left-[14%]", delay: 1.05 },
  { value: "9", className: "bottom-[13%] right-[14%]", delay: 0.32 }
];

export function SolarSystemHero() {
  return (
    <figure className="relative mx-auto w-full max-w-[42rem] overflow-visible" aria-label="Naksharix golden celestial numerology hero art">
      <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.22),transparent_36%),radial-gradient(circle_at_65%_54%,rgba(0,180,160,0.18),transparent_52%)] blur-2xl" />
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-[#D4AF37]/20 bg-[#02112C]/35 shadow-[0_40px_120px_rgba(0,5,16,0.52),0_0_70px_rgba(1,163,97,0.14)]"
        initial={false}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="/images/naksharix-cosmic-hero.svg"
          alt="Premium golden sun and crescent moon celestial numerology artwork for Naksharix"
          className="block aspect-square w-full object-contain"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,17,44,0.12)_0%,transparent_38%,rgba(2,17,44,0.12)_100%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-[#FFD700]/10" />
      </motion.div>

      {floatingNumbers.map((item) => (
        <motion.span
          key={item.value}
          className={`pointer-events-none absolute font-decorative text-4xl font-black text-[#D4AF37] drop-shadow-[0_0_18px_rgba(255,215,0,0.48)] sm:text-5xl ${item.className}`}
          animate={{ y: [-7, 9, -7], opacity: [0.48, 0.92, 0.48] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
        >
          {item.value}
        </motion.span>
      ))}
    </figure>
  );
}
