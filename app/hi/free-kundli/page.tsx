import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";
import { canonicalSeoOrigin } from "@/lib/seo-origin";

export const metadata: Metadata = seo({
  title: "फ्री कुंडली – जन्म कुंडली ऑनलाइन हिंदी | Naksharix",
  description: "जन्म तारीख, समय और स्थान की जानकारी से ऑनलाइन फ्री कुंडली बनाएं। ग्रह स्थिति, लग्न, दशा और पंचांग से जुड़े पारंपरिक ज्योतिषीय संकेत समझें।",
  path: "/hi/free-kundli",
  keywords: ["फ्री कुंडली", "जन्म कुंडली", "Free Kundli", "Janam Kundli"]
});

export default function FreeKundliHindiPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "फ्री कुंडली",
    url: `${canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)}/hi/free-kundli`,
    applicationCategory: "LifestyleApplication",
    inLanguage: "hi-IN"
  };
  const topics = ["जन्म विवरण", "ग्रह स्थिति", "लग्न", "दशा और पंचांग"];
  return (
    <main className="star-field">
      <Section>
        <JsonLd id="free-kundli-hi-schema" data={schema} />
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">फ्री कुंडली</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">ऑनलाइन फ्री जन्म कुंडली</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          नाम, जन्म तारीख, जन्म समय और जन्म स्थान की जानकारी देकर कुंडली संबंधी विवरण देखें।
          गणना और व्याख्या उपलब्ध डेटा तथा आपके दिए गए विवरणों पर निर्भर करती है।
        </p>
        <Card className="glass mt-8">
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-[#D4AF37]/20 p-3">
                <FileText className="h-4 w-4 text-[#FFD700]" />{item}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><Link href="/kundli">कुंडली बनाएं</Link></Button>
          <Button variant="outline" asChild><Link href="/hi/learn/kundli-explained">कुंडली समझने की मार्गदर्शिका</Link></Button>
        </div>
        <SeoInternalLinks title="कुंडली और ज्योतिष के अन्य उपयोगी पेज" />
      </Section>
    </main>
  );
}
