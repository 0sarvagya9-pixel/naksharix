import Link from "next/link";
import { Section } from "@/components/section";
import { JsonLd } from "@/components/seo/json-ld";
import { canonicalSeoOrigin } from "@/lib/seo-origin";
import { env } from "@/lib/env";
import { nextTwoYearsPujaCalendar } from "@/lib/puja/observances";
import { KUMBH_2027_PROMOTION_END } from "@/lib/puja/service-catalogue";
import { seasonalSources, seasonalPaths, festivalHindi, kumbhGuideDates, indiaEclipseDates, SEASONAL_REVIEW_DATE } from "@/lib/seo-seasonal";
import { seasonalCopy } from "@/lib/seo-seasonal-copy";
type Locale = "en" | "hi";
type Guide = keyof typeof seasonalPaths;
function dateLabel(date:string,locale:Locale) {
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN",{timeZone:"UTC",day:"numeric",month:"long",year:"numeric"}).format(new Date(date+"T12:00:00Z"));
}
const panel="rounded-2xl border border-[#e4cbaa] bg-[#fffdf8] p-5 sm:p-7";
const linkClass="font-semibold text-[#70283d] underline underline-offset-4";
export function SeasonalGuide({guide,locale}:{guide:Guide;locale:Locale}) {
  const hi=locale==="hi", data=seasonalCopy[guide][locale], other=hi?"en":"hi", path=seasonalPaths[guide][locale];
  const origin=canonicalSeoOrigin(env.NEXT_PUBLIC_APP_URL), url=origin+path;
  const refs=guide==="kumbh"?[seasonalSources.kumbhCalendar,seasonalSources.kumbhSchedule,seasonalSources.kumbhSafety,seasonalSources.kumbhFaq]:guide==="eclipses"?[seasonalSources.eclipses,seasonalSources.indiaSolar,seasonalSources.indiaLunar,seasonalSources.solarSafety]:[seasonalSources.december2026,seasonalSources.hindu2027];
  const calendar=guide==="festivals"?nextTwoYearsPujaCalendar():null;
  return <main lang={locale} className="min-h-screen bg-[#fff8ee] text-[#35242b]">
    <JsonLd id={"seasonal-guide-"+guide} data={{"@context":"https://schema.org","@type":"WebPage","@id":url+"#webpage",url,name:data.title,description:data.intro,inLanguage:locale,publisher:{"@id":origin+"/#organization"},isPartOf:{"@id":origin+"/#website"},citation:refs,dateModified:SEASONAL_REVIEW_DATE}}/>
    <Section first>
      <header className={panel}>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#835a28]">NAKSHARIX · {hi?"स्रोत आधारित जानकारी":"Source-reviewed guide"}</p>
        <h1 className="mt-4 font-cinzel text-3xl font-black leading-tight text-[#70283d] sm:text-5xl">{data.title}</h1>
        <p className="mt-5 max-w-4xl text-base leading-8">{data.intro}</p>
        <p className="mt-4 text-sm text-[#65545c]">{hi?"स्रोत जाँचे गए":"Sources reviewed"}: <time dateTime={SEASONAL_REVIEW_DATE}>{dateLabel(SEASONAL_REVIEW_DATE,locale)}</time></p>
        <div className="mt-5 flex flex-wrap gap-4"><Link href={seasonalPaths[guide][other]} hrefLang={other} className={linkClass}>{hi?"Read in English":"हिंदी में पढ़ें"}</Link><Link href="/panchang" className={linkClass}>{hi?"स्थानीय पंचांग":"Local Panchang"}</Link></div>
      </header>
      <div className="mt-7 space-y-6">
        {guide==="kumbh"?<section className={panel}>
          <h2 className="text-2xl font-bold text-[#70283d]">{hi?"कुंभ मेला 2027 की प्रमुख तिथियाँ":"Kumbh Mela 2027 key dates"}</h2>
          <p className="mt-3 text-sm leading-7">{hi?"प्रकाशित आधिकारिक तिथियाँ व्यक्तिगत पूजा की आरक्षित समय-सारणी नहीं हैं।":"Published calendar dates are not reserved individual ceremony times."}</p>
          <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead className="bg-[#f5e8d9]"><tr>{(hi?["तिथि","आयोजन","स्थान"]:["Date","Event","Location"]).map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{kumbhGuideDates.map(row=><tr key={row.date} className="border-b border-[#ead9c2]"><td className="p-3 whitespace-nowrap"><time dateTime={row.date}>{dateLabel(row.date,locale)}</time></td><td className="p-3">{hi?row.hi:row.en}</td><td className="p-3">{hi?row.placeHi:row.placeEn}</td></tr>)}</tbody></table></div>
          <p className="mt-4"><a href={seasonalSources.kumbhCalendar} target="_blank" rel="noopener noreferrer" className={linkClass}>{hi?"आधिकारिक स्नान कैलेंडर":"Official Snan calendar"}</a>{" · "}<a href={seasonalSources.kumbhSchedule} target="_blank" rel="noopener noreferrer" className={linkClass}>{hi?"आधिकारिक समय-सारणी":"Official schedule"}</a></p>
        </section>:null}
        {calendar?<section className={panel}>
          <h2 className="text-2xl font-bold text-[#70283d]">{hi?"आगामी त्योहार और व्रत":"Upcoming festivals and vrat dates"}</h2>
          <p className="mt-3 text-sm leading-7">{hi?"यह चयनित संदर्भ तिथियों की सूची है, संपूर्ण क्षेत्रीय पंचांग नहीं।":"Selected reference dates, not a comprehensive regional calendar."}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{calendar.events.slice(0,24).map(e=><article key={e.id} className="rounded-xl border border-[#e8d5bb] bg-white p-4"><h3 className="font-semibold text-[#70283d]">{hi?(festivalHindi[e.name]??e.name):e.name}</h3><time dateTime={e.date} className="mt-2 block">{dateLabel(e.date,locale)}</time><a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>{hi?"तिथि का स्रोत":"Date source"}</a></article>)}</div>
          {!calendar.events.length?<p>{hi?"नई जाँची गई तिथियाँ उपलब्ध होने पर प्रकाशित होंगी।":"Further dates will be added after review."}</p>:null}
          <Link href="/puja-calendar" className="mt-5 inline-flex rounded-xl bg-[#76263b] px-5 py-3 font-bold text-white">{hi?"पूरा दो वर्षीय पूजा कैलेंडर":"Full two-year Puja calendar"}</Link>
        </section>:null}
        {guide==="eclipses"?<section className={panel}><h2 className="text-2xl font-bold text-[#70283d]">{hi?"भारत में 2027 के दृश्य ग्रहण":"2027 eclipses visible from India"}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{indiaEclipseDates.map(e=><article key={e.date} className="rounded-xl border border-[#e8d5bb] bg-white p-4"><h3 className="font-semibold">{hi?e.hi:e.en}</h3><time dateTime={e.date} className="mt-2 block">{dateLabel(e.date,locale)}</time><a href={e.source} target="_blank" rel="noopener noreferrer" className={linkClass}>{hi?"स्थानीय दृश्यता और समय":"Local visibility and timing"}</a></article>)}</div></section>:null}
        {data.sections.map(([heading,body,href])=><section key={heading} className={panel}><h2 className="font-cinzel text-xl font-bold text-[#70283d] sm:text-2xl">{heading}</h2><p className="mt-3 leading-8">{body}</p>{href.startsWith("https://")?<a href={href} target="_blank" rel="noopener noreferrer" className={"mt-3 inline-block "+linkClass}>{hi?"संदर्भ स्रोत":"Reference source"}</a>:href==="/pujas"&&Date.now()>=Date.parse(KUMBH_2027_PROMOTION_END)?null:<Link href={href} className={"mt-3 inline-block "+linkClass}>{href==="/pujas"?(hi?"वर्तमान पूजा अनुरोध उपलब्धता देखें":"Check current Puja request availability"):(hi?"संबंधित जानकारी":"Related information")}</Link>}</section>)}
      </div>
      <nav aria-label={hi?"संबंधित मार्गदर्शिकाएँ":"Related guides"} className="mt-8 flex flex-wrap gap-3">{(Object.keys(seasonalPaths) as Guide[]).filter(g=>g!==guide).map(g=><Link key={g} href={seasonalPaths[g][locale]} className="rounded-xl border border-[#e1c7a6] bg-white px-4 py-3 text-sm font-semibold text-[#70283d]">{seasonalCopy[g][locale].title}</Link>)}<Link href={hi?"/hi/free-kundli":"/free-kundli"} className="rounded-xl border border-[#e1c7a6] bg-white px-4 py-3 text-sm font-semibold text-[#70283d]">{hi?"निःशुल्क जन्म कुंडली":"Free Kundli"}</Link></nav>
    </Section>
  </main>
}
