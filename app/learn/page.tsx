import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/section";
import { seo } from "@/lib/seo";
import { LearningProgress } from "@/components/learning-progress";
import { LearningSelfCheck } from "@/components/learning-self-check";
import { EditorialServiceBanner } from "@/components/home/editorial-service-banner";

export const metadata: Metadata = seo({
  title: "Learn the Basics of Vedic Astrology | Free Lessons",
  description: "Study beginner-level Kundli, Panchang, Nakshatra, Dasha and responsible astrological interpretation with free Naksharix learning guides.",
  path: "/learn"
});

const lessons = [
  {
    id: "birth-chart",
    number: "01",
    name: "How a Janam Kundli is organized",
    summary: "The birth chart places the traditional twelve houses and the positions of grahas into a structured map for interpretation.",
    ideas: [
      "Lagna or Ascendant anchors the first house and depends strongly on accurate birth time and location.",
      "The twelve houses traditionally represent themes such as identity, resources, relationships and work.",
      "Graha signs and house placements are inputs to interpretation, not guarantees about events."
    ],
    href: "/learn/kundli-explained",
    action: "Read the Kundli explanation"
  },
  {
    id: "panchang",
    number: "02",
    name: "Reading the Panchang",
    summary: "Panchang brings together five traditional elements to describe a date and location.",
    ideas: [
      "Tithi describes the angular relationship of the Moon and Sun.",
      "Nakshatra tracks the Moon within the traditional lunar mansion system.",
      "Yoga, Karana and Vara round out the five elements; published times depend on location and conventions."
    ],
    href: "/panchang",
    action: "Calculate today's Panchang"
  },
  {
    id: "nakshatras",
    number: "03",
    name: "Nakshatras, signs and the Moon",
    summary: "Nakshatra and rashi are different traditional ways of dividing the sky into interpretive regions.",
    ideas: [
      "The zodiac uses twelve signs, while the conventional Nakshatra system uses twenty-seven divisions.",
      "Your Moon sign depends on the Moon's position at the entered moment.",
      "Ayanamsa, timing accuracy and astronomical source can change a boundary calculation."
    ],
    href: "/free-calculators/nakshatra-calculator",
    action: "Explore the Nakshatra calculator"
  },
  {
    id: "dasha",
    number: "04",
    name: "Understanding Dasha timelines",
    summary: "Dasha frameworks organize periods for traditional chart-based reflection.",
    ideas: [
      "Vimshottari Dasha uses a cyclical traditional period scheme derived from the natal Moon's Nakshatra.",
      "The timing of transitions requires careful dates and consistent calculation settings.",
      "A period is not a deterministic prediction of a job, marriage, accident or medical outcome."
    ],
    href: "/free-calculators/dasha-calculator",
    action: "Explore the Dasha calculator"
  }
] as const;

export default function LearnPage() {
  return (
    <main className="star-field">
      <EditorialServiceBanner eyebrow="THE LEARNING LIBRARY"
        headline="Wisdom starts with curiosity"
        caption="Learn the foundations of Kundli, Panchang, Nakshatras and Dasha in four self-study lessons. No paid course or qualification is implied."
        image="https://upload.wikimedia.org/wikipedia/commons/0/05/Kundali_01a.png" imageAlt="Traditional CC0 Kundli diagram for the learning library"
        link="/free-calculators" linkLabel="Explore the free calculators" />
      <Section>
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Free Learning Library</p>
          <h1 className="mt-3 font-cinzel text-4xl font-black">Understand Vedic Astrology</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 naksh-muted-text">
            Four original, introductory lessons to help you understand the vocabulary,
            calculations and limitations behind common astrology tools. Work through
            the concepts and try the connected calculators.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {lessons.map((lesson) => (
              <article id={lesson.id} key={lesson.id}
                className="rounded-2xl border border-[#e4bf86] bg-[#fffaf3] p-6 shadow-sm">
                <span className="text-xs font-bold tracking-[0.2em] text-[#8d3742]">LESSON {lesson.number}</span>
                <h2 className="mt-2 font-cinzel text-2xl font-black text-[#422a31]">{lesson.name}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5f4b52]">{lesson.summary}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[#5f4b52] marker:text-[#9b3548]">
                  {lesson.ideas.map((idea) => <li key={idea}>{idea}</li>)}
                </ul>
                <Link href={lesson.href} className="mt-5 inline-block rounded-lg bg-[#f4c77c] px-4 py-3 text-sm font-bold text-[#41202b] hover:bg-[#ffdc9f]">
                  {lesson.action}
                </Link>
              </article>
            ))}
          </div>
          <section className="mt-10 rounded-2xl border border-[#e4bf86] bg-[#fffaf3] p-6" aria-labelledby="deeper-reading">
            <h2 id="deeper-reading" className="font-cinzel text-2xl font-black text-[#422a31]">Explore in-depth free guides</h2>
            <p className="mt-2 text-sm leading-7 text-[#5f4b52]">
              Start with a question, learn the traditional method, then try its calculator. No account or purchase is required to read these guides.
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { href: "/blog/lagna-vs-rashi", label: "Lagna vs Rashi: what is different?" },
                { href: "/blog/kundli-matching-score", label: "What does a Guna Milan score mean?" },
                { href: "/blog/panchang-five-elements", label: "The five elements of Panchang" },
                { href: "/blog/vimshottari-dasha-timeline", label: "How a Dasha timeline works" },
                { href: "/blog/lo-shu-grid-beginners", label: "Understanding the Lo Shu grid" },
                { href: "/blog/tarot-reflection", label: "Tarot questions for reflection" }
              ].map((guide) => (
                <li key={guide.href}>
                  <Link href={guide.href} className="block rounded-xl border border-[#d7ab73] p-4 text-sm font-semibold text-[#532d34] underline underline-offset-4 hover:bg-[#ffefd8]">{guide.label}</Link>
                </li>
              ))}
            </ul>
          </section>
          <LearningSelfCheck />
          <LearningProgress />
          <div className="mt-8 rounded-xl border border-[#D4AF37]/20 p-5 text-sm leading-7 naksh-muted-text">
            These are free self-study guides, not accredited training, a live course,
            an exam or a certificate. Traditional astrology should not substitute
            for medical, legal, financial or other professional advice. No expert
            mentor or class schedule is represented by this page.
          </div>
        </div>
      </Section>
    </main>
  );
}
