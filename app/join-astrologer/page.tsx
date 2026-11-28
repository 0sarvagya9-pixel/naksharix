import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import { seo } from "@/lib/seo";

const copy = {
  en: {
    category: "Practitioner network", title: "Apply as an Astrologer",
    intro: "Practicing astrologers in Vedic astrology, Kundli analysis, numerology and related traditions are welcome to apply.",
    how: "How to apply",
    steps: ["Create an account and select the astrologer or professional account type.", "Complete account verification and sign in to the professional dashboard.", "Complete your professional profile, experience, languages and relevant credential information.", "An administrator will review your application. Public listing and bookings depend on approval and availability."],
    terms: "Applications do not guarantee approval, income or bookings. Keep personal identity documents and private credentials off public pages.",
    signup: "Create professional account", login: "Professional sign in"
  },
  hi: {
    category: "ज्योतिषियों का नेटवर्क", title: "ज्योतिषी के रूप में आवेदन करें",
    intro: "वैदिक ज्योतिष, कुंडली विश्लेषण, अंक ज्योतिष और संबंधित परंपराओं का अभ्यास करने वाले ज्योतिषी आवेदन कर सकते हैं।",
    how: "आवेदन कैसे करें",
    steps: ["खाता बनाएँ और खाते के प्रकार में ज्योतिषी या पेशेवर चुनें।", "अपने खाते का सत्यापन पूरा करें और पेशेवर डैशबोर्ड में साइन इन करें।", "अपनी पेशेवर प्रोफ़ाइल में अनुभव, भाषाएँ और संबंधित योग्यताओं का विवरण भरें।", "प्रशासक आपके आवेदन की समीक्षा करेगा। सार्वजनिक सूची और बुकिंग के लिए स्वीकृति और उपलब्धता आवश्यक हैं।"],
    terms: "आवेदन करने से स्वीकृति, आय या बुकिंग की गारंटी नहीं मिलती। सार्वजनिक पृष्ठों पर व्यक्तिगत पहचान दस्तावेज़ या गोपनीय प्रमाण अपलोड न करें।",
    signup: "पेशेवर खाता बनाएँ", login: "पेशेवर खाते में साइन इन करें"
  },
  hinglish: {
    category: "Practitioners ka network", title: "Astrologer ke taur par apply karein",
    intro: "Agar aap Vedic astrology, Kundli analysis, numerology ya inse judi paramparaon ki practice karte hain, to aap apply kar sakte hain.",
    how: "Apply kaise karein",
    steps: ["Account banate waqt astrologer ya professional account type chunein.", "Account verification poora karein aur professional dashboard mein sign in karein.", "Apni professional profile mein experience, languages aur relevant qualifications ki details bharein.", "Administrator aapki application review karega. Public listing aur bookings approval aur availability par depend karti hain."],
    terms: "Apply karne se approval, income ya bookings ki guarantee nahi milti. Public pages par personal ID documents ya private credentials upload na karein.",
    signup: "Professional account banayein", login: "Professional account mein sign in karein"
  }
};

async function readCopy() {
  const locale = normalizeLocale((await cookies()).get("naksharix-language")?.value);
  return copy[locale];
}

export async function generateMetadata(): Promise<Metadata> {
  const text = await readCopy();
  return seo({ title: text.title + " | Naksharix", description: text.intro, path: "/join-astrologer" });
}

export default async function JoinAstrologerPage() {
  const text = await readCopy();
  return (
    <section className="bg-[#fffaf4] px-5 py-12 text-[#492d33] sm:py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#e6d2b2] bg-white p-6 shadow-sm sm:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#8a5a36]">NAKSHARIX · {text.category}</p>
        <h1 className="mt-4 font-cinzel text-3xl font-bold sm:text-4xl">{text.title}</h1>
        <p className="mt-3 text-base leading-7">{text.intro}</p>
        <h2 className="mt-8 text-lg font-bold">{text.how}</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-6 text-sm leading-7">
          {text.steps.map(step => <li key={step}>{step}</li>)}
        </ol>
        <p className="mt-6 rounded-xl bg-[#fff3e5] p-4 text-sm leading-6">{text.terms}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup?role=professional" className="inline-flex min-h-12 items-center rounded-xl bg-[#793746] px-6 py-3 font-semibold text-white">{text.signup}</Link>
          <Link href="/auth/astrologer-login" className="inline-flex min-h-12 items-center rounded-xl border border-[#b88f71] px-6 py-3 font-semibold text-[#793746]">{text.login}</Link>
        </div>
      </div>
    </section>
  );
}
