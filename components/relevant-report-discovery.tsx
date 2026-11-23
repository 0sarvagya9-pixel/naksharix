import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { OptionalReportNextStep } from "@/components/optional-report-next-step";

const choices = {
  tarot: ["love-report", "career-report"],
  numerology: ["numerology-lo-shu-report"],
  love: ["love-report"]
} as const;

/** Public, voluntary next steps only. No tarot answers, birth data or private reading content
 * are passed to a report or external service. Existing free tools remain unchanged. */
export async function RelevantReportDiscovery({ topic }: { topic: keyof typeof choices }) {
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  const hindi = locale === "hi";
  const title = hindi ? "अपनी रुचि के अनुसार अन्य रिपोर्ट देखें" : "Explore a more personal perspective";
  const intro = topic === "tarot"
    ? (hindi ? "नीचे वैदिक ज्योतिष की वैकल्पिक सशुल्क रिपोर्ट हैं। ये टैरो रीडिंग नहीं हैं और आपकी मुफ्त रीडिंग को सीमित नहीं करतीं।" : "These optional paid astrology reports use a different method from tarot. Your free card reading does not require a purchase.")
    : (hindi ? "सामान्य जानकारी और कैलकुलेटर मुफ्त उपलब्ध हैं। व्यक्तिगत रिपोर्ट लेना पूरी तरह वैकल्पिक है।" : "General guidance and calculators remain available without purchase. A personalized report is an optional next step.");
  return (
    <section aria-labelledby="relevant-report-discovery-heading" className="mx-auto mb-12 max-w-7xl px-4 sm:px-6">
      <h2 id="relevant-report-discovery-heading" className="font-cinzel text-2xl font-bold text-[#702d3d]">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-[#57454b]">{intro}</p>
      <div className={choices[topic].length === 2 ? "grid gap-3 md:grid-cols-2" : "max-w-3xl"}>
        {choices[topic].map(reportSlug => <OptionalReportNextStep key={reportSlug} reportSlug={reportSlug} locale={locale} />)}
      </div>
    </section>
  );
}
