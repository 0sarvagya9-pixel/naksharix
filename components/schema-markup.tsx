import Script from "next/script";
import { env } from "@/lib/env";

export function SchemaMarkup() {
  const siteUrl = env.NEXT_PUBLIC_APP_URL;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Naksharix",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    slogan: "Unlock Your Cosmic Destiny",
    sameAs: [siteUrl],
    brand: { "@type": "Brand", name: "Naksharix" },
    offers: { "@type": "AggregateOffer", category: "Astrology SaaS", availability: "https://schema.org/InStock" },
    knowsAbout: ["Astrology", "Horoscope", "Kundli", "Numerology", "Tarot Reading", "Panchang", "Aaj Ka Rashifal", "Kundli Milan"],
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: `${siteUrl}/contact` }
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Naksharix",
    url: siteUrl,
    description: "Premium astrology, horoscope, kundli, numerology, tarot reading, and panchang platform.",
    inLanguage: ["en-IN", "hi-IN"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const navigation = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: ["Today Horoscope", "Free Kundli", "Kundli Milan", "Aaj Ka Rashifal", "Blog", "AI Astrology Chat"],
    url: [`${siteUrl}/horoscope/all-signs/today`, `${siteUrl}/kundli`, `${siteUrl}/hi/kundli-milan`, `${siteUrl}/hi/aaj-ka-rashifal`, `${siteUrl}/blog`, `${siteUrl}/chatbot`]
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Naksharix",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web, iOS, Android",
    url: siteUrl,
    description: "Premium astrology SaaS for Horoscope, Kundli, Numerology, Tarot Reading, Panchang, and AI astrology guidance.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }
  };

  return (
    <Script id="naksharix-schema" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify([schema, website, navigation, softwareApplication])}
    </Script>
  );
}
