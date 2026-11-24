import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { BrandAnswers } from "@/components/seo/brand-answers";
import { JsonLd } from "@/components/seo/json-ld";
import { hindiBrandDescription } from "@/lib/seo-brand";
import { canonicalSeoOrigin } from "@/lib/seo-origin";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix क्या है? वैदिक ज्योतिष, जन्म कुंडली और डिजिटल रिपोर्ट",
  description: hindiBrandDescription,
  path: "/hi/about",
  keywords: ["Naksharix क्या है", "Naksharix kya hai", "वैदिक ज्योतिष", "जन्म कुंडली"]
});
export default function HindiAboutPage() {
  const home = canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL) + "/";
  return (
    <div lang="hi" className="min-h-screen bg-[#fff8ee] text-[#35242b]">
      <JsonLd id="naksharix-about-schema" data={{ "@context": "https://schema.org", "@type": "AboutPage", "@id": home + "hi/about#webpage", url: home + "hi/about", name: "Naksharix क्या है?", description: hindiBrandDescription, inLanguage: "hi", about: { "@id": home + "#organization" }, isPartOf: { "@id": home + "#website" } }} />
      <Section first>
        <div className="rounded-3xl border border-[#e4cbaa] bg-[#fffdf8] p-6 md:p-10">
          <p className="text-sm font-semibold text-[#835a28]">NAKSHARIX · हमारे बारे में</p>
          <h1 className="mt-4 font-cinzel text-3xl font-bold text-[#70283d] sm:text-5xl">Naksharix क्या है?</h1>
          <p className="mt-5 max-w-3xl text-base leading-8">{hindiBrandDescription}</p>
          <h2 className="mt-8 text-xl font-semibold">हम क्या उपलब्ध कराते हैं?</h2>
          <p className="mt-3 leading-8">परंपरागत ज्योतिष की गणनाएँ और उन्हें समझने के लिए सरल जानकारी, व्यक्तिगत रिपोर्ट, उपलब्ध परामर्श विकल्प और खाते में सहेजी गई रिपोर्ट। किसी सेवा की उपलब्धता और शुल्क उसकी संबंधित वेबसाइट पर देख सकते हैं।</p>
          <h2 className="mt-7 text-xl font-semibold">गोपनीयता और जिम्मेदार उपयोग</h2>
          <p className="mt-3 leading-8">केवल उस सेवा के लिए आवश्यक जन्म विवरण दें जिसका उपयोग करना चाहते हैं। भुगतान का उपयोग करने से पहले शुल्क और डिलीवरी की शर्तें पढ़ें। हम निश्चित भविष्यवाणी या किसी परिणाम की गारंटी नहीं देते हैं।</p>
          <Link href="/hi/free-kundli" className="mt-6 inline-flex rounded-xl bg-[#76263b] px-5 py-3 text-sm font-bold text-white">निःशुल्क जन्म कुंडली बनाएँ</Link>
        </div>
        <BrandAnswers locale="hi" />
      </Section>
    </div>
  );
}
