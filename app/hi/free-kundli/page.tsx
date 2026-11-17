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
        <section aria-labelledby="kundli-kaise-banaye" className="mt-12 max-w-4xl">
          <h2 id="kundli-kaise-banaye" className="font-cinzel text-2xl font-bold">ऑनलाइन फ्री कुंडली कैसे बनाएं?</h2>
          <ol className="mt-5 list-decimal space-y-3 pl-6 leading-7 naksh-muted-text">
            <li>ऊपर दिए गए “कुंडली बनाएं” बटन से फ्री कुंडली जनरेटर खोलें।</li>
            <li>अपनी सही जन्म-तारीख, दर्ज जन्म-समय और जन्मस्थान भरें। जानकारी की जाँच करके ही आगे बढ़ें।</li>
            <li>तैयार कुंडली में लग्न, राशि, ग्रहों की स्थिति और भाव देखें। शब्दों का अर्थ समझने के लिए <Link href="/hi/learn/kundli-explained" className="font-semibold underline underline-offset-4">हिंदी कुंडली मार्गदर्शिका</Link> पढ़ें।</li>
          </ol>
          <p className="mt-4 leading-7 naksh-muted-text">अगर जन्म का सही समय उपलब्ध नहीं है, तो लग्न और भावों पर निर्भर निष्कर्ष अनिश्चित हो सकते हैं। पारंपरिक ज्योतिषीय व्याख्या भविष्य की निश्चित जानकारी नहीं है।</p>
        </section>
        <section aria-labelledby="kundli-sawal" className="mt-12 max-w-4xl">
          <h2 id="kundli-sawal" className="font-cinzel text-2xl font-bold">जन्म कुंडली से जुड़े सामान्य सवाल</h2>
          <div className="mt-5 grid gap-4">
            {[
              { question: "क्या जन्म समय के बिना कुंडली बनाई जा सकती है?", answer: "जन्म-तारीख से कुछ सामान्य जानकारी देखी जा सकती है, लेकिन सही जन्म-समय के बिना लग्न और भावों की सटीक गणना पर भरोसा नहीं करना चाहिए।" },
              { question: "जन्मस्थान कुंडली के लिए जरूरी क्यों है?", answer: "जन्मस्थान और स्थानीय समय के आधार पर ग्रहों के संदर्भ तथा लग्न की गणना की जाती है। गलत स्थान या समय-क्षेत्र से चार्ट के कुछ हिस्से बदल सकते हैं।" },
              { question: "दो वेबसाइटों पर मेरी कुंडली अलग क्यों है?", answer: "अयनांश, समय-क्षेत्र, भाव-पद्धति या गणना की दूसरी सेटिंग अलग होने से परिणाम बदल सकते हैं। पहले दोनों जगह दर्ज जन्म-विवरण और पद्धति की तुलना करें।" }
            ].map((item) => (
              <div key={item.question} className="rounded-lg border border-[#D4AF37]/20 p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 leading-7 naksh-muted-text">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
        <SeoInternalLinks title="कुंडली और ज्योतिष के अन्य उपयोगी पेज" />
      </Section>
    </main>
  );
}
