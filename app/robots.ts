import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/astrology",
        "/daily-horoscope",
        "/weekly-horoscope",
        "/monthly-horoscope",
        "/weekly-love-horoscope",
        "/yearly-horoscope-2026",
        "/chinese-horoscope-2026",
        "/numerology-monthly-horoscope",
        "/hi",
        "/hi/aaj-ka-rashifal",
        "/hi/kundli-milan",
        "/hi/free-kundli",
        "/kundli",
        "/numerology",
        "/tarot",
        "/zodiac",
        "/blog"
      ],
      disallow: ["/admin", "/dashboard", "/api", "/auth", "/panchang", "/ai-astrologer", "/shop", "/consultation"]
    },
    host: env.NEXT_PUBLIC_APP_URL,
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`
  };
}
