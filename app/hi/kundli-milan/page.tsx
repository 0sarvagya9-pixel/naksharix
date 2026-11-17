import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";
import { canonicalSeoOrigin } from "@/lib/seo-origin";

export const metadata: Metadata = seo({
  title: "कुंडली मिलान – विवाह गुण मिलान हिंदी | Naksharix",
  description: "कुंडली मिलान हिंदी में समझें। गुण मिलान, मांगलिक स्थिति और पारंपरिक अनुकूलता के संकेत देखें। परिणामों को रिश्ते का अंतिम निर्णय न मानें।",
  path: "/hi/kundli-milan",
  keywords: ["कुंडली मिलान", "गुण मिलान", "Kundli Milan", "Marriage Matching"]
});

export default function KundliMilanHindiPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "कुंडली मिलान",
    url: `${canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)}/hi/kundli-milan`,
    inLanguage: "hi-IN",
    provider: { "@type": "Organization", name: "Naksharix" }
  };
  const topics = [
    { title: "गुण मिलान", description: "पारंपरिक अष्टकूट गुणों के आधार पर अनुकूलता की जानकारी।" },
    { title: "मांगलिक संदर्भ", description: "जन्म विवरण के आधार पर मांगलिक संकेतों को सावधानी से समझें।" },
    { title: "व्यावहारिक दृष्टिकोण", description: "आपसी संवाद, सम्मान और सहमति को निर्णय में प्राथमिकता दें।" }
  ];
  return (
    <main className="star-field">
      <Section>
        <JsonLd id="kundli-milan-hi-schema" data={schema} />
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">विवाह और ज्योतिष</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">कुंडली मिलान</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          जन्म विवरण के आधार पर गुण मिलान, मांगलिक स्थिति और पारंपरिक अनुकूलता के संकेत जानें।
          ज्योतिषीय परिणाम रिश्ते की सफलता या असफलता की गारंटी नहीं हैं।
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {topics.map((item) => (
            <Card key={item.title} className="glass">
              <CardContent className="space-y-3 pt-6">
                <HeartHandshake className="h-5 w-5 text-[#FFD700]" />
                <h2 className="font-cinzel text-lg font-bold">{item.title}</h2>
                <p className="text-sm naksh-muted-text">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><Link href="/matchmaking">कुंडली मिलान शुरू करें</Link></Button>
          <Button variant="outline" asChild><Link href="/consultation">ज्योतिषी से सलाह</Link></Button>
        </div>
        <section aria-labelledby="kundli-milan-questions" className="mt-12 max-w-4xl">
          <h2 id="kundli-milan-questions" className="font-cinzel text-2xl font-bold">कुंडली मिलान के बारे में आम सवाल</h2>
          <div className="mt-5 grid gap-4">
            {[
              { question: "कुंडली मिलान में कुल कितने गुण होते हैं?", answer: "पारंपरिक अष्टकूट मिलान में आठ श्रेणियों के अंक जोड़कर अधिकतम 36 गुण बनाए जाते हैं। पूरी जानकारी के लिए हर श्रेणी का अलग परिणाम भी देखें।" },
              { question: "क्या 36 में से एक खास अंक मिलने पर शादी सफल होगी?", answer: "नहीं। गुण मिलान का अंक रिश्ते की सफलता या असफलता साबित नहीं करता। आपसी सहमति, सम्मान, संवाद और व्यावहारिक अनुकूलता अधिक महत्वपूर्ण हैं।" },
              { question: "क्या मांगलिक दोष 36 गुणों का हिस्सा है?", answer: "मांगलिक की जाँच अष्टकूट के आठ गुणों से अलग पारंपरिक आकलन है। इसे विवाह या किसी व्यक्ति के बारे में वैज्ञानिक निष्कर्ष न मानें।" }
            ].map((item) => (
              <div key={item.question} className="rounded-lg border border-[#D4AF37]/20 p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 leading-7 naksh-muted-text">{item.answer}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 leading-7 naksh-muted-text">
            गुणों के पारंपरिक हिसाब को विस्तार से समझने के लिए <Link href="/blog/kundli-matching-score" className="font-semibold underline underline-offset-4">36 गुणों की मार्गदर्शिका</Link> देखें।
          </p>
        </section>
        <SeoInternalLinks title="कुंडली और विवाह से जुड़े पेज" />
      </Section>
    </main>
  );
}
