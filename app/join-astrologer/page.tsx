import type { Metadata } from "next";
import Link from "next/link";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Apply as an Astrologer | Naksharix",
  description: "Practicing astrologers can apply to join the Naksharix practitioner network. Professional profiles and credentials are reviewed before approval.",
  path: "/join-astrologer"
});

export default function JoinAstrologerPage() {
  return (
    <section className="bg-[#fffaf4] px-5 py-12 text-[#492d33] sm:py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#e6d2b2] bg-white p-6 shadow-sm sm:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#8a5a36]">NAKSHARIX · Practitioner network</p>
        <h1 className="mt-4 font-cinzel text-3xl font-bold sm:text-4xl">Apply as an Astrologer</h1>
        <p className="mt-3 text-base leading-7">Practicing astrologers in Vedic astrology, Kundli analysis, numerology and related traditions are welcome to apply. अपना प्रोफेशनल प्रोफ़ाइल बनाएं और समीक्षा के लिए भेजें।</p>
        <h2 className="mt-8 text-lg font-bold">How to apply</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-6 text-sm leading-7">
          <li>Create an account and select the astrologer or professional account type.</li>
          <li>Complete account verification and sign in to the professional dashboard.</li>
          <li>Complete your professional profile, experience, languages and relevant credential information.</li>
          <li>Await an administrator review. Approval, public visibility and bookings are subject to review and actual availability.</li>
        </ol>
        <p className="mt-6 rounded-xl bg-[#fff3e5] p-4 text-sm leading-6">Applications do not guarantee approval, income or bookings. Do not publish personal identity documents or private credentials on public pages.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup?role=professional" className="inline-flex min-h-12 items-center rounded-xl bg-[#793746] px-6 py-3 font-semibold text-white">Create professional account</Link>
          <Link href="/auth/astrologer-login" className="inline-flex min-h-12 items-center rounded-xl border border-[#b88f71] px-6 py-3 font-semibold text-[#793746]">Professional sign in</Link>
        </div>
      </div>
    </section>
  );
}
