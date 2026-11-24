import { ImageResponse } from "next/og";
import { createElement as h } from "react";

/** First-party public social preview. No remote requests, user data, or sales claims. */
export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    h("div", { style: { width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "#70283d", color: "#fff8ee", padding: 78, border: "12px solid #dcc1a8" } },
      h("div", { style: { fontSize: 27, letterSpacing: 5, color: "#f2d4a4" } }, "VEDIC HERITAGE"),
      h("div", { style: { fontSize: 88, fontWeight: 700, marginTop: 20 } }, "NAKSHARIX"),
      h("div", { style: { fontSize: 38, marginTop: 30, maxWidth: 1000 } }, "Vedic astrology tools and digital reports"),
      h("div", { style: { fontSize: 27, marginTop: 28, color: "#f2d4a4" } }, "Kundli · Panchang · Horoscope · Numerology"),
      h("div", { style: { fontSize: 26, marginTop: 48 } }, "www.naksharix.com")
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
  );
}
