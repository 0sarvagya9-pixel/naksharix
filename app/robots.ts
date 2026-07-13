import { MetadataRoute } from "next";
import { isAiAstrologerReady } from "@/lib/ai/feature-status";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const aiReady = isAiAstrologerReady();

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/contact",
        "/faq",
        "/privacy-policy",
        "/terms-and-conditions",
        "/refund-policy",
        "/delivery-policy",
        "/disclaimer",
        "/astrology",
        "/horoscope",
        "/daily-horoscope",
        "/weekly-horoscope",
        "/monthly-horoscope",
        "/weekly-love-horoscope",
        "/yearly-horoscope",
        "/chinese-horoscope-2026",
        "/numerology-monthly-horoscope",
        "/hi",
        "/hi/aaj-ka-rashifal",
        "/hi/kundli-milan",
        "/hi/free-kundli",
        "/kundli",
        "/numerology",
        "/tarot",
        "/panchang",
        "/transits",
        "/zodiac",
        "/astrologers",
        "/consultation",
        "/reports",
        "/shop",
        "/blog",
        ...(aiReady ? ["/ai-astrologer"] : [])
      ],
      disallow: [
        "/admin",
        "/dashboard",
        "/api",
        "/auth",
        "/login",
        "/signup",
        "/profile",
        "/saved-reports",
        "/my-readings",
        "/payment",
        "/report-request",
        "/astrologer",
        ...(aiReady ? [] : ["/ai-astrologer"]),
        "/talk-to-kundli",
        "/chatbot"
      ]
    },
    host: env.NEXT_PUBLIC_APP_URL,
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`
  };
}
