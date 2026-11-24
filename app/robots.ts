import { MetadataRoute } from "next";
import { isAiAstrologerReady } from "@/lib/ai/feature-status";
import { env } from "@/lib/env";
import { canonicalSeoOrigin } from "@/lib/seo-origin";

export default function robots(): MetadataRoute.Robots {
  const aiReady = isAiAstrologerReady();
  const seoOrigin = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL);

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
        "/yearly-horoscope-2027",
        "/hi/yearly-horoscope-2027",
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
        "/festival-calendar",
        "/kumbh-mela-2027",
        "/grahan-2027",
        "/transits",
        "/zodiac",
        "/astrologers",
        "/consultation",
        "/ask-astrologer",
        "/puja-enquiry",
        "/learn",
        "/reports",
        "/shop",
        "/blog",
        ...(aiReady ? ["/ai-astrologer"] : [])
      ],
      disallow: [
        "/admin",
        "/dashboard",
        "/digital-packages",
        "/expert-services",
        "/learn/paid-course",
        "/business-workspace",
        "/api",
        "/auth",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/profile",
        "/saved-reports",
        "/my-readings",
        "/orders",
        "/shop/orders",
        "/puja-bookings",
        "/payment",
        "/report-request",
        "/astrologer/",
        "/astrologer$",
        ...(aiReady ? [] : ["/ai-astrologer"]),
        "/talk-to-kundli",
        "/chatbot"
      ]
    },
    host: seoOrigin,
    sitemap: `${seoOrigin}/sitemap.xml`
  };
}
