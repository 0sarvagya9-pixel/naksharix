import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const resources = {
  love: {
    en: {
      heading: "How to read a weekly love horoscope",
      intro: "A weekly love horoscope offers general relationship themes for a selected zodiac sign or rashi. Treat it as a reflection prompt for the week, not a personal birth-chart calculation or a forecast of another person's choices.",
      questions: [
        ["Can a weekly love horoscope tell me whether someone is compatible with me?", "No. A shared sign alone cannot establish compatibility. Traditional Kundli matching considers both birth charts; even that interpretation is not a substitute for consent, communication or real-world compatibility."],
        ["How can I use the guidance?", "Choose your rashi, read the communication and relationship themes, and reflect on one practical action you can take. Do not treat favorable dates or symbolic advice as guarantees."]
      ],
      links: [["/free-kundli", "Explore a free birth chart"], ["/kundli-matching", "Explore traditional Kundli matching"]]
    },
    hi: {
      heading: "साप्ताहिक प्रेम राशिफल कैसे पढ़ें?",
      intro: "साप्ताहिक प्रेम राशिफल चुनी हुई राशि के लिए संबंधों से जुड़े सामान्य चिंतन संकेत देता है। इसे व्यक्तिगत जन्मकुंडली की गणना या किसी दूसरे व्यक्ति के निर्णय की भविष्यवाणी न समझें।",
      questions: [
        ["क्या केवल राशि से प्रेम अनुकूलता तय हो सकती है?", "नहीं। पारंपरिक कुंडली मिलान में दोनों जन्मकुंडलियों पर विचार किया जाता है। यह भी सहमति, संवाद और वास्तविक जीवन की अनुकूलता का विकल्प नहीं है।"],
        ["इस मार्गदर्शन का उपयोग कैसे करें?", "अपनी राशि चुनें, संवाद और संबंधों के संकेत पढ़ें और एक व्यावहारिक कदम पर विचार करें। शुभ तिथि या सांकेतिक सलाह को गारंटी न समझें।"]
      ],
      links: [["/hi/free-kundli", "मुफ्त जन्मकुंडली देखें"], ["/hi/kundli-milan", "पारंपरिक कुंडली मिलान देखें"]]
    }
  },
  numerology: {
    en: {
      heading: "What is a numerology reading?",
      intro: "A numerology reading interprets numbers derived from a birth date or a written name within a traditional symbolic system. The arithmetic can be checked, but symbolic interpretations are not scientifically established predictions of health, wealth, personality or relationships.",
      questions: [
        ["How are the main birth-date numbers calculated?", "Moolank commonly reduces the day of birth; Life Path or Bhagyank reduces the digits of the full birth date. For example, a birth day of 24 gives 2 + 4 = 6 under the usual single-digit reduction."],
        ["Is a Name Number the same as a Lo Shu grid?", "No. The Name Number uses letter values, while the Lo Shu grid places birth-date digits into nine positions. Different spelling conventions and numerical mappings can change a result, so check the method before comparing readings."]
      ],
      links: [["/free-calculators/name-number-calculator", "Name Number calculator and worked example"], ["/free-calculators/lo-shu-grid-calculator", "Lo Shu grid calculator and method"]]
    },
    hi: {
      heading: "अंक ज्योतिष रीडिंग क्या है?",
      intro: "अंक ज्योतिष रीडिंग जन्मतिथि या लिखे गए नाम से प्राप्त अंकों की एक पारंपरिक सांकेतिक व्याख्या है। गणना की जाँच की जा सकती है, लेकिन इसकी व्याख्याएँ स्वास्थ्य, धन, व्यक्तित्व या संबंधों की वैज्ञानिक रूप से प्रमाणित भविष्यवाणियाँ नहीं हैं।",
      questions: [
        ["जन्मतिथि से मुख्य अंक कैसे निकाले जाते हैं?", "मूलांक में सामान्यतः जन्म के दिन के अंकों का योग किया जाता है, जबकि भाग्यांक में पूरी जन्मतिथि के अंकों का योग किया जाता है। उदाहरण के लिए, 24 तारीख का मूलांक 2 + 4 = 6 है।"],
        ["क्या नामांक और लो शू ग्रिड समान हैं?", "नहीं। नामांक में अक्षरों के अंक-मूल्य लिए जाते हैं, जबकि लो शू ग्रिड में जन्मतिथि के अंक नौ स्थानों में रखे जाते हैं। अलग वर्तनी और गणना पद्धति से परिणाम बदल सकते हैं।"]
      ],
      links: [["/free-calculators/name-number-calculator", "नामांक कैलकुलेटर और उदाहरण (अंग्रेज़ी)"], ["/free-calculators/lo-shu-grid-calculator", "लो शू ग्रिड और गणना पद्धति (अंग्रेज़ी)"]]
    }
  }
} as const;

export async function PublicReadingGuide({ topic }: { topic: keyof typeof resources }) {
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  const content = resources[topic][locale === "hi" ? "hi" : "en"];
  return (
    <section aria-labelledby={`reading-guide-${topic}`} className="mx-auto mb-12 max-w-6xl px-4 sm:px-6">
      <div className="rounded-3xl border border-[#e7cda3] bg-white/90 p-5 text-[#17181d] sm:p-8">
        <h2 id={`reading-guide-${topic}`} className="font-cinzel text-2xl font-bold text-[#702d3d]">{content.heading}</h2>
        <p className="mt-4 max-w-4xl leading-7 text-[#525866]">{content.intro}</p>
        {content.questions.map(([question, answer]) => (
          <div key={question} className="mt-5 border-t border-[#e7cda3]/70 pt-4">
            <h3 className="text-base font-semibold">{question}</h3>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-[#525866]">{answer}</p>
          </div>
        ))}
        <nav aria-label={locale === "hi" ? "संबंधित मुफ्त संसाधन" : "Related free resources"} className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          {content.links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg border border-[#dca956]/45 px-4 py-2 text-[#8c571a] underline">{label}</Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
