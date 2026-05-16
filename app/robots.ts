import { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/astrology",
        "/horoscope",
        "/horoscope/all-signs/today",
        "/hi",
        "/hi/aaj-ka-rashifal",
        "/hi/kundli-milan",
        "/hi/free-kundli",
        "/kundli",
        "/numerology",
        "/tarot",
        "/panchang",
        "/zodiac",
        "/blog"
      ],
      disallow: ["/admin", "/dashboard", "/api", "/auth"]
    },
    host: env.NEXT_PUBLIC_APP_URL,
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`
  };
}
