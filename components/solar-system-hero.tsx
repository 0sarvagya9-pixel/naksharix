"use client";

import { motion } from "framer-motion";

const planets = [
  { name: "Mercury", size: 8, orbit: 34, duration: 10, color: "bg-amber-100", depth: "opacity-90" },
  { name: "Venus", size: 11, orbit: 46, duration: 15, color: "bg-[#d7a95b]", depth: "opacity-95" },
  { name: "Earth", size: 10, orbit: 59, duration: 20, color: "bg-[#9cc7ff]", depth: "opacity-95" },
  { name: "Mars", size: 9, orbit: 72, duration: 27, color: "bg-[#d96f4f]", depth: "opacity-90" },
  { name: "Jupiter", size: 16, orbit: 87, duration: 38, color: "bg-[#e6c28b]", depth: "opacity-80" }
];

export function SolarSystemHero() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem] overflow-visible rounded-full [perspective:900px]">
      <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(151,94,255,0.16),transparent_58%)] blur-sm" />
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ rotateX: [58, 62, 58], rotateZ: 360 }}
        transition={{ rotateZ: { duration: 80, repeat: Infinity, ease: "linear" }, rotateX: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {planets.map((planet) => (
          <div
            key={planet.name}
            className={`absolute left-1/2 top-1/2 rounded-full border border-[#F5C542]/20 ${planet.depth}`}
            style={{
              width: `${planet.orbit * 2}%`,
              height: `${planet.orbit * 2}%`,
              transform: "translate(-50%, -50%)"
            }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: planet.duration, repeat: Infinity, ease: "linear" }}
            >
              <span
                className={`absolute left-1/2 top-0 block rounded-full ${planet.color} shadow-[0_0_24px_rgba(245,190,88,0.45)]`}
                style={{ width: planet.size, height: planet.size, transform: "translate(-50%, -50%)" }}
              />
            </motion.div>
          </div>
        ))}
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff7d6_0%,#f5be58_38%,#c77726_72%,rgba(245,190,88,0.08)_100%)] shadow-[0_0_42px_rgba(245,190,88,0.72),0_0_120px_rgba(126,72,255,0.28)] sm:h-36 sm:w-36"
        animate={{ scale: [1, 1.06, 1], boxShadow: ["0 0 42px rgba(245,190,88,0.72)", "0 0 76px rgba(245,190,88,0.92)", "0 0 42px rgba(245,190,88,0.72)"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-10 rounded-full border border-purple-300/10" />
      <div className="absolute inset-20 rounded-full border border-[#F5C542]/15" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_34%,rgba(8,3,20,0.18)_70%)]" />
    </div>
  );
}
