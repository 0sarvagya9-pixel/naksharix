import Script from "next/script";
import { env } from "@/lib/env";
import { canonicalSeoOrigin } from "@/lib/seo-origin";

/** Grounded public structured data only: no invented stock, prices, native app,
 * searchable site endpoint, unverified AI capabilities or supplier offers.
 */
export function SchemaMarkup() {
  const siteUrl = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Naksharix",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    brand: { "@type": "Brand", name: "Naksharix" },
    knowsAbout: ["Vedic astrology", "Horoscope", "Kundli", "Numerology", "Tarot", "Panchang", "Kundli matching"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${siteUrl}/contact`
    }
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Naksharix",
    url: siteUrl,
    description: "Vedic astrology tools, personalized reports, horoscope, Panchang and traditional Puja topics.",
    inLanguage: ["en-IN", "hi-IN"]
  };
  const navigation = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: ["Free Kundli", "Horoscope", "Panchang", "Consultations", "Reports", "Puja Directory", "Spiritual Catalogue"],
    url: [
      `${siteUrl}/kundli`, `${siteUrl}/daily-horoscope`, `${siteUrl}/panchang`,
      `${siteUrl}/consultation`, `${siteUrl}/reports`, `${siteUrl}/pujas`, `${siteUrl}/shop`
    ]
  };
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Naksharix",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    url: siteUrl,
    description: "Browser-based astrology and cultural-information tools with optional consultation and report workflows."
  };
  return (
    <Script id="naksharix-schema" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify([organization, website, navigation, webApp])}
    </Script>
  );
}
