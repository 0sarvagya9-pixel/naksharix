import type { Metadata } from "next";
import Link from "next/link";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Advertising and Privacy - Naksharix",
  description: "How advertising may work on Naksharix, how privacy choices are handled and how ads are separated from astrology content and payments.",
  path: "/advertising",
  keywords: ["Naksharix advertising disclosure", "Naksharix ads privacy"]
});

export default function AdvertisingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-14 text-[var(--nx-text)]">
      <article className="rounded-xl border border-amber-500/20 bg-white/75 p-7 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider">Advertising disclosure</p>
        <h1 className="mt-3 text-3xl font-bold">Advertising and privacy on Naksharix</h1>
        <p className="mt-5 leading-7">Our free educational articles may contain clearly labelled advertising after our site is approved for Google AdSense and the relevant privacy requirements are met. An advertisement is paid content; it is not our personal recommendation or an astrology calculation.</p>
        <h2 className="mt-8 text-xl font-semibold">Where ads may appear</h2>
        <p className="mt-3 leading-7">We limit advertising to suitable educational Kundli pages. We do not place ads inside payment, checkout, sign-in, private birth-detail forms or personal reports. Ads are not designed to imitate our buttons or results.</p>
        <h2 className="mt-8 text-xl font-semibold">Cookies, consent and third parties</h2>
        <p className="mt-3 leading-7">Once activated, Google and its advertising partners may use cookies or similar technologies for advertising, measurement and fraud prevention, depending on region and privacy choices. Regions requiring a certified consent management platform must be handled through the configured consent flow. Advertising does not begin merely because our website has an ads.txt record.</p>
        <p className="mt-4 leading-7">See <Link className="underline" href="/privacy-policy">our privacy policy</Link> and <a className="underline" href="https://policies.google.com/technologies/ads" rel="noreferrer" target="_blank">Google advertising technologies</a>. Available choices may also be managed through the consent message presented to eligible visitors and <a className="underline" href="https://myadcenter.google.com/" rel="noreferrer" target="_blank">Google My Ad Center</a>.</p>
        <h2 className="mt-8 text-xl font-semibold">Advertising questions</h2>
        <p className="mt-3 leading-7">Contact <a href="mailto:care@naksharix.com" className="underline">care@naksharix.com</a>. Never send passwords, OTPs or banking credentials.</p>
      </article>
    </main>
  );
}
