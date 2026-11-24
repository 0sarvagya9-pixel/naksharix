import type { Metadata } from "next";
import { LegalPolicyPage } from "@/components/legal-policy-page";
import { seo } from "@/lib/seo";
import { brandDescription } from "@/lib/seo-brand";
import { JsonLd } from "@/components/seo/json-ld";
import { canonicalSeoOrigin } from "@/lib/seo-origin";
import { env } from "@/lib/env";

export const metadata: Metadata = seo({
  title: "What is Naksharix? Vedic Astrology Platform",
  description: "Naksharix is an online Vedic astrology platform for free Kundli, Panchang, horoscope, numerology and optional personalized digital reports.",
  path: "/about",
  keywords: ["About Naksharix", "Vedic Astrology Platform", "Digital Kundli Reports", "Astrology Consultations"],
});

export default function AboutPage() {
  const home = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL) + "/";
  return <><JsonLd id="naksharix-about-schema" data={{ "@context": "https://schema.org", "@type": "AboutPage", "@id": home + "about#webpage", url: home + "about", name: "What is Naksharix?", description: brandDescription, inLanguage: "en", about: { "@id": home + "#organization" }, isPartOf: { "@id": home + "#website" } }} /><LegalPolicyPage page="about" /></>;
}
