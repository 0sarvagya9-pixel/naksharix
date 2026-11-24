import { env } from "@/lib/env";
import { canonicalSeoOrigin } from "@/lib/seo-origin";
import { JsonLd } from "@/components/seo/json-ld";
import { brandName, brandDescription } from "@/lib/seo-brand";

/** Server-rendered, linked public entities. No fabricated ratings, reviews,
 * affiliations, social profiles, native apps or inventory promises. */
export function SchemaMarkup() {
  const siteUrl = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL);
  const home = siteUrl + "/";
  const organizationId = home + "#organization";
  const websiteId = home + "#website";
  const applicationId = home + "#webapplication";
  const organization = {
    "@type": "Organization",
    "@id": organizationId,
    name: brandName,
    url: home,
    description: brandDescription,
    logo: { "@type": "ImageObject", url: siteUrl + "/images/naksharix-final-logo-symbol.png" },
    brand: { "@type": "Brand", name: brandName },
    knowsAbout: ["Vedic astrology", "Horoscope", "Kundli", "Numerology", "Tarot", "Panchang", "Kundli matching"],
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: siteUrl + "/contact" }
  };
  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    name: brandName,
    url: home,
    description: brandDescription,
    publisher: { "@id": organizationId },
    inLanguage: ["en", "hi"]
  };
  const webApp = {
    "@type": "WebApplication",
    "@id": applicationId,
    name: brandName,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    url: home,
    description: brandDescription,
    publisher: { "@id": organizationId },
    isPartOf: { "@id": websiteId }
  };
  return <JsonLd id="naksharix-schema" data={{ "@context": "https://schema.org", "@graph": [organization, website, webApp] }} />;
}
