import { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { blogCategories, blogPosts } from "@/lib/blog-content";
import { growthPages, nakshatras } from "@/lib/growth-pages";
import { manualReports } from "@/lib/manual-catalogue";
import { seoLandingPages } from "@/lib/seo-pages";
import { zodiacSigns } from "@/lib/zodiac";

const staticRoutes = [
  "",
  "/hi",
  "/hi/aaj-ka-rashifal",
  "/hi/kundli-milan",
  "/hi/free-kundli",
  "/about",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/terms-and-conditions",
  "/disclaimer",
  "/refund-policy",
  "/delivery-policy",
  "/astrology",
  "/calculators",
  "/free-calculators",
  "/free-calculators/dasha-calculator",
  "/free-calculators/nakshatra-calculator",
  "/free-calculators/moon-sign-calculator",
  "/free-calculators/lagna-calculator",
  "/free-calculators/manglik-calculator",
  "/free-calculators/yoga-calculator",
  "/free-calculators/vehicle-number-calculator",
  "/free-calculators/mobile-number-calculator",
  "/free-calculators/name-number-calculator",
  "/free-calculators/lo-shu-grid-calculator",
  "/free-calculators/destiny-number-calculator",
  "/free-calculators/personality-number-calculator",
  "/free-calculators/guna-milan-calculator",
  "/free-calculators/nadi-dosha-calculator",
  "/free-calculators/bhakoot-calculator",
  "/free-calculators/marriage-suitability-calculator",
  "/free-kundli",
  "/kundli-matching",
  "/horoscope",
  "/daily-horoscope",
  "/weekly-horoscope",
  "/monthly-horoscope",
  "/weekly-love-horoscope",
  "/yearly-horoscope",
  "/chinese-horoscope-2026",
  "/numerology-monthly-horoscope",
  "/panchang",
  "/transits",
  "/love-compatibility",
  "/career-astrology",
  "/marriage-astrology",
  "/nakshatra",
  "/festival-calendar",
  "/shubh-muhurat",
  "/talk-to-kundli",
  "/kundli",
  "/astrologers",
  "/consultation",
  "/reports",
  "/zodiac",
  "/matchmaking",
  "/tarot",
  "/numerology",
  "/pricing",
  "/blog",
];

type SitemapFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
type SitemapEntry = { route: string; priority: number; frequency: SitemapFrequency };

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: SitemapEntry[] = [
    ...staticRoutes.map((route): SitemapEntry => ({
      route,
      priority: route === "" ? 1 : legalRoute(route) ? 0.5 : 0.8,
      frequency: route === "" ? "daily" : legalRoute(route) ? "yearly" : "weekly",
    })),
    ...featuredAstrologerRoutes().map((route): SitemapEntry => ({ route, priority: 0.74, frequency: "weekly" })),
    ...zodiacSigns.map((sign): SitemapEntry => ({ route: `/horoscope/${sign.slug}`, priority: 0.82, frequency: "daily" })),
    ...Object.values(growthPages).map((page): SitemapEntry => ({ route: page.path, priority: 0.88, frequency: "weekly" })),
    ...nakshatras.map((slug): SitemapEntry => ({ route: `/nakshatra/${slug}`, priority: 0.76, frequency: "monthly" })),
    ...manualReports.map((report): SitemapEntry => ({ route: `/reports/${report.slug}`, priority: 0.78, frequency: "weekly" })),
    ...seoLandingPages.map((page): SitemapEntry => ({ route: `/astrology/${page.slug}`, priority: 0.86, frequency: "weekly" })),
    ...blogCategories.map((category): SitemapEntry => ({ route: `/blog/category/${category.slug}`, priority: 0.76, frequency: "weekly" })),
    ...blogPosts.map((post): SitemapEntry => ({ route: `/blog/${post.slug}`, priority: 0.72, frequency: "monthly" })),
  ];

  return routes.map(({ route, priority, frequency }) => ({
    url: `${env.NEXT_PUBLIC_APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: frequency,
    priority,
  }));
}

function featuredAstrologerRoutes() {
  return [];
}

function legalRoute(route: string) {
  return [
    "/privacy-policy",
    "/terms-and-conditions",
    "/disclaimer",
    "/refund-policy",
    "/delivery-policy",
  ].includes(route);
}
