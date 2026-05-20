"use client";

const orbitRings = [
  "h-[34%] w-[54%] rotate-[10deg] border-[#dca956]/22",
  "h-[45%] w-[72%] rotate-[-15deg] border-[#00f5a0]/18",
  "h-[56%] w-[88%] rotate-[22deg] border-[#dca956]/16",
  "h-[70%] w-[104%] rotate-[-28deg] border-[#00f5a0]/14",
  "h-[82%] w-[116%] rotate-[6deg] border-[#dca956]/12"
];

const planets = [
  "left-[50%] top-[21%] h-3 w-3 bg-[#f3d382] shadow-[0_0_18px_rgba(243,211,130,0.72)]",
  "right-[20%] top-[32%] h-4 w-4 bg-[#00f5a0] shadow-[0_0_20px_rgba(0,245,160,0.55)]",
  "right-[12%] top-[55%] h-2.5 w-2.5 bg-[#00f5a0] shadow-[0_0_16px_rgba(0,245,160,0.55)]",
  "left-[20%] top-[62%] h-3.5 w-3.5 bg-[#dca956] shadow-[0_0_18px_rgba(220,169,86,0.58)]",
  "left-[30%] top-[28%] h-2.5 w-2.5 bg-white/90 shadow-[0_0_16px_rgba(255,255,255,0.42)]",
  "right-[31%] bottom-[17%] h-5 w-5 bg-[radial-gradient(circle_at_35%_25%,#f3d382,#dca956)] shadow-[0_0_22px_rgba(220,169,86,0.55)]",
  "left-[14%] bottom-[28%] h-2 w-2 bg-[#00f5a0] shadow-[0_0_14px_rgba(0,245,160,0.42)]",
  "right-[42%] top-[13%] h-2 w-2 bg-[#00f5a0]/85 shadow-[0_0_13px_rgba(0,245,160,0.45)]"
];

const starParticles = [
  "left-[10%] top-[17%] h-1 w-1 bg-white/70",
  "left-[23%] top-[48%] h-1.5 w-1.5 bg-[#f3d382]/55 blur-[0.5px]",
  "left-[42%] top-[18%] h-1 w-1 bg-[#00f5a0]/52",
  "right-[13%] top-[24%] h-1.5 w-1.5 bg-white/55 blur-[0.4px]",
  "right-[20%] bottom-[21%] h-1 w-1 bg-[#00f5a0]/55",
  "left-[38%] bottom-[14%] h-2 w-2 bg-[#f3d382]/34 blur-[1px]",
  "right-[36%] bottom-[36%] h-1 w-1 bg-white/65",
  "left-[7%] bottom-[42%] h-1.5 w-1.5 bg-[#00f5a0]/35 blur-[0.5px]"
];

const subtleDigits = [
  ["1", "left-[17%] top-[24%]"],
  ["3", "right-[18%] top-[18%]"],
  ["7", "right-[13%] bottom-[29%]"],
  ["9", "left-[25%] bottom-[20%]"]
] as const;

export function SolarSystemHero() {
  return (
    <figure
      className="relative mx-auto flex min-h-[25rem] w-full items-center justify-center overflow-visible sm:min-h-[34rem] lg:min-h-[38rem]"
      aria-label="Golden Om solar system visual with orbit rings, planets, stars, and spiritual technology glow"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(243,211,130,0.12),transparent_15rem),radial-gradient(circle_at_66%_56%,rgba(0,245,160,0.12),transparent_21rem),radial-gradient(circle_at_38%_60%,rgba(0,245,160,0.08),transparent_18rem)]" />

      <div className="relative mx-auto flex h-[min(550px,88vw)] w-[min(550px,88vw)] items-center justify-center">
        <div className="absolute z-0 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,_rgba(243,211,130,0.18)_0%,_rgba(220,169,86,0.08)_34%,_transparent_70%)] blur-2xl" />
        <div className="absolute h-[72%] w-[72%] rounded-full bg-[radial-gradient(circle,_rgba(0,245,160,0.11),_transparent_68%)] blur-3xl" />
        <div className="absolute -inset-[11%] rounded-full bg-[radial-gradient(circle,_rgba(0,245,160,0.07),_transparent_72%)] blur-2xl" />

        {orbitRings.map((className, index) => (
          <span
            key={className}
            className={`absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.5px] ${className} motion-reduce:animate-none`}
            style={{ animation: `solar-orbit-breathe ${9 + index * 1.7}s ease-in-out infinite`, animationDelay: `${index * 0.55}s` }}
          />
        ))}

        <span className="absolute left-[13%] top-[34%] z-10 h-px w-[28%] rotate-[19deg] bg-gradient-to-r from-transparent via-[#dca956]/22 to-transparent" />
        <span className="absolute right-[12%] top-[38%] z-10 h-px w-[26%] -rotate-[27deg] bg-gradient-to-r from-transparent via-[#00f5a0]/18 to-transparent" />
        <span className="absolute bottom-[25%] right-[18%] z-10 h-px w-[22%] rotate-[42deg] bg-gradient-to-r from-transparent via-[#dca956]/18 to-transparent" />

        {planets.map((className, index) => (
          <span
            key={className}
            className={`absolute z-20 rounded-full ${className} motion-reduce:animate-none`}
            style={{ animation: `solar-drift ${6.5 + index * 0.55}s ease-in-out infinite`, animationDelay: `${index * 0.22}s` }}
          />
        ))}

        <div className="absolute left-1/2 top-1/2 z-30 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.22),rgba(243,211,130,0.18)_32%,rgba(220,169,86,0.1)_54%,transparent_74%)] shadow-[0_0_42px_rgba(220,169,86,0.22),inset_0_0_36px_rgba(243,211,130,0.08)] sm:h-52 sm:w-52">
          <span className="absolute inset-3 rounded-full border border-[#dca956]/16" />
          <span className="absolute inset-8 rounded-full bg-[#f3d382]/10 blur-xl" />
          <span
            className="relative select-none bg-[linear-gradient(180deg,#f3d382_0%,#f3d382_28%,#dca956_62%,#dca956_100%)] bg-clip-text text-[6.8rem] font-black leading-none text-transparent antialiased sm:text-[8rem] motion-reduce:animate-none"
            style={{
              fontFamily: '"Noto Sans Devanagari", "Noto Serif Devanagari", "Mangal", system-ui, sans-serif',
              animation: "om-sun-pulse 4.8s ease-in-out infinite"
            }}
          >
            ॐ
          </span>
        </div>

        {subtleDigits.map(([digit, position]) => (
          <span
            key={`${digit}-${position}`}
            className={`absolute z-20 hidden bg-gradient-to-b from-[#f3d382] to-[#dca956] bg-clip-text font-cinzel text-3xl font-bold leading-none text-transparent opacity-55 drop-shadow-[0_0_10px_rgba(243,211,130,0.42)] sm:block ${position}`}
          >
            {digit}
          </span>
        ))}

        {starParticles.map((className, index) => (
          <span
            key={className}
            className={`absolute z-[8] rounded-full shadow-[0_0_18px_currentColor] ${className} motion-reduce:animate-none`}
            style={{
              animation: `cosmic-float ${7 + index * 0.8}s ease-in-out infinite`,
              animationDelay: `${index * 0.35}s`
            }}
          />
        ))}
      </div>
    </figure>
  );
}
