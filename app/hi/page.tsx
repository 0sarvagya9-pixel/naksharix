import type { Metadata } from "next";
import Link from "next/link";
import { MoonStar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { t } from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Naksharix Hindi - ज्योतिष, राशिफल और कुंडली",
  description: "Naksharix Hindi में राशिफल, कुंडली, अंक ज्योतिष, टैरो रीडिंग, पंचांग, AI चैटबॉट और प्रीमियम ज्योतिष रिपोर्ट देखें।",
  path: "/hi",
  keywords: ["Hindi Astrology", "Hindi Horoscope", "Kundli Hindi", "Tarot Hindi"]
});

const features = ["दैनिक राशिफल", "कुंडली विश्लेषण", "अंक ज्योतिष", "टैरो रीडिंग", "पंचांग", "AI ज्योतिष सहायक"];

export default function HindiHomePage() {
  return (
    <main className="star-field">
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Naksharix Hindi</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">{t("hi", "tagline")}</h1>
            <p className="mt-4 max-w-3xl naksh-muted-text">{t("hi", "heroCopy")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/signup">
                  <Sparkles className="h-4 w-4" />
                  {t("hi", "generateFreeKundli")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consultation">ज्योतिषी से सलाह लें</Link>
              </Button>
            </div>
          </div>
          <Card className="glass">
            <CardContent className="grid gap-3 pt-6">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-md border border-[#F5C542]/20 bg-[#201037]/70 p-3">
                  <MoonStar className="h-4 w-4 text-[#FFD36A]" />
                  {feature}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}
