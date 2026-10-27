"use client";

/** Quiet, original gradient canvas behind the ivory/burgundy public layout.
 * Decorative only; no generic stock galaxy photograph or unreadable overlay.
 */
export function PremiumCosmicBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 13% 18%, rgba(215,153,83,.20), transparent 39%), radial-gradient(ellipse at 90% 78%, rgba(143,53,66,.12), transparent 38%), linear-gradient(145deg,#fffaf2 0%,#fcefe2 58%,#f5e2d0 100%)"
      }}>
      <div className="absolute -left-28 top-20 h-[30rem] w-[30rem] rounded-full border border-[#c38954]/20" />
      <div className="absolute -right-32 bottom-14 h-[28rem] w-[28rem] rounded-full border border-[#9a4d58]/15" />
    </div>
  );
}
