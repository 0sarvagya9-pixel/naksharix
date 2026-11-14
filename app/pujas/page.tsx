import type { Metadata } from "next";
import Link from "next/link";
import { Flower2, Clock3, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "पूजा सेवाएँ जल्द आ रही हैं | NAKSHARIX",
  description: "NAKSHARIX पर पूजा सेवाएँ अभी उपलब्ध नहीं हैं। उपयुक्त पंडित उपलब्ध होने पर नई बुकिंग फिर शुरू की जाएगी।",
  robots: { index: false, follow: true }
};

export default function PujasPage() {
  return (
    <main className="relative isolate flex min-h-[75vh] items-center overflow-hidden bg-[#fffaf4] px-4 py-16 text-[#492d33] sm:px-6 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#f5d5a6]/35 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#f1ddd1]/60 blur-3xl" />
      <section aria-labelledby="puja-coming-soon-heading" className="relative mx-auto w-full max-w-3xl rounded-[2rem] border border-[#e6cbaa] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(97,58,42,0.08)] sm:p-14">
        <div aria-hidden="true" className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#e8c99b] bg-[#fff3db] text-[#9b6540] shadow-sm">
          <Flower2 size={40} strokeWidth={1.4}/>
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-[#9f664b]">NAKSHARIX · PUJA SERVICES</p>
        <h1 id="puja-coming-soon-heading" className="mt-4 font-cinzel text-4xl font-bold leading-tight text-[#632d3c] sm:text-5xl">
          पूजा सेवाएँ <span className="text-[#bd8950]">जल्द आ रही हैं</span>
        </h1>
        <p className="mt-3 text-base font-semibold tracking-wide text-[#97644b]">Coming Soon</p>
        <div aria-hidden="true" className="mx-auto mt-8 h-px w-24 bg-[#d9b17a]" />
        <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-[#71585c]">
          हम उपयुक्त पंडितों और पूजा व्यवस्था की उपलब्धता सुनिश्चित होने के बाद ही यह सेवा शुरू करेंगे।
          फिलहाल नई पूजा बुकिंग और ऑनलाइन भुगतान उपलब्ध नहीं हैं।
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#806971]">
          अभी किसी प्रकार की अग्रिम राशि देने की आवश्यकता नहीं है। नई सेवा शुरू होने पर जानकारी यहीं मिलेगी।
        </p>
        <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-xl border border-[#f0dfc7] bg-[#fff9ef] px-4 py-4 text-sm text-[#76554d]">
          <Clock3 aria-hidden="true" size={19} className="shrink-0 text-[#ad7a47]"/>
          <span>नई पूजा बुकिंग अस्थायी रूप से बंद है।</span>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#793746] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#622b38]">
            <ArrowLeft size={17} aria-hidden="true"/> मुख्य पृष्ठ पर जाएँ
          </Link>
          <Link href="/puja-bookings" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d9b99f] bg-white px-6 py-3 text-sm font-semibold text-[#7c3945] transition hover:bg-[#fff3e5]">
            पुरानी बुकिंग देखें
          </Link>
        </div>
      </section>
    </main>
  );
}
