import type { Metadata } from "next";
import Link from "next/link";
import { MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoInternalLinks } from "@/components/seo/internal-links";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";
import { canonicalSeoOrigin } from "@/lib/seo-origin";

export const metadata: Metadata = seo({
  title: "आज का राशिफल – दैनिक राशिफल हिंदी | Naksharix",
  description: "आज का राशिफल हिंदी में पढ़ें। सभी राशियों के लिए प्रेम, करियर, धन और दिनचर्या पर सामान्य ज्योतिषीय मार्गदर्शन और उपयोगी सुझाव देखें।",
  path: "/hi/aaj-ka-rashifal",
  keywords: ["आज का राशिफल", "दैनिक राशिफल", "Hindi Horoscope", "Daily Horoscope Hindi"]
});

export default function AajKaRashifalPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "आज का राशिफल",
    url: `${canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL)}/hi/aaj-ka-rashifal`,
    inLanguage: "hi-IN"
  };
  const topics = ["प्रेम और रिश्ते", "करियर और काम", "धन और बजट", "स्वास्थ्य और दिनचर्या", "परिवार और संवाद", "दिन की योजना"];
  return (
    <main className="star-field">
      <Section>
        <JsonLd id="aaj-ka-rashifal-schema" data={schema} />
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">हिंदी राशिफल</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">आज का राशिफल</h1>
        <p className="mt-4 max-w-3xl naksh-muted-text">
          अपनी राशि के लिए आज का सामान्य राशिफल पढ़ें। प्रेम, काम, धन और दिनचर्या पर दिए गए विचारों को
          आत्मचिंतन और योजना के लिए इस्तेमाल करें, निश्चित भविष्यवाणी के रूप में नहीं।
        </p>
        <Card className="glass mt-8">
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-[#D4AF37]/20 p-3">
                <MoonStar className="h-4 w-4 text-[#FFD700]" />{item}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><Link href="/horoscope/all-signs/today">सभी राशियों का राशिफल</Link></Button>
          <Button variant="outline" asChild><Link href="/hi/free-kundli">फ्री कुंडली</Link></Button>
        </div>
        <SeoInternalLinks title="राशिफल और ज्योतिष से जुड़े उपयोगी पेज" />
      </Section>
    </main>
  );
}
