"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarDays, Calculator, Car, Grid3X3, Hash, Route, Smartphone, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";
import type { NumerologyReport } from "@/lib/numerology";

const featureCards = [
  { titleKey: "numerologyLifePath", copyKey: "numerologyLifePathCopy", icon: Route },
  { titleKey: "numerologyDestinyNumber", copyKey: "numerologyDestinyNumberCopy", icon: Target },
  { titleKey: "numerologyNameNumber", copyKey: "numerologyNameNumberCopy", icon: Sparkles },
  { titleKey: "numerologyLoShu", copyKey: "numerologyLoShuCopy", icon: Grid3X3 },
  { titleKey: "numerologyMobileAnalysis", copyKey: "numerologyMobileAnalysisCopy", icon: Smartphone },
  { titleKey: "numerologyVehicleAnalysis", copyKey: "numerologyVehicleAnalysisCopy", icon: Car },
  { titleKey: "numerologyDaily", copyKey: "numerologyDailyCopy", icon: CalendarDays },
  { titleKey: "numerologyCoreNumbers", copyKey: "numerologyCoreNumbersCopy", icon: Hash }
] as const;

const labels: Record<Locale, Record<string, string>> = {
  en: {
    formTitle: "Calculate your Numerology Report",
    formCopy: "Enter your name and date of birth. Mobile and vehicle numbers are optional.",
    fullName: "Full name",
    dob: "Date of birth",
    mobile: "Mobile number",
    vehicle: "Vehicle number",
    optional: "optional",
    calculate: "Calculate Numerology",
    calculating: "Calculating...",
    reset: "Reset",
    required: "This field is required",
    invalidDate: "Enter a valid date of birth",
    invalidMobile: "Enter a valid mobile number or leave it blank",
    invalidVehicle: "Enter a valid vehicle number or leave it blank",
    error: "Something went wrong. Please try again.",
    coreNumbers: "Core Numbers",
    loShu: "Lo Shu Grid",
    missing: "Missing Numbers",
    repeated: "Repeated Numbers",
    daily: "Daily Numerology",
    remedies: "Practical Remedies",
    noMissing: "No missing Lo Shu numbers from this birth date.",
    noRepeated: "No repeated Lo Shu numbers from this birth date.",
    strengths: "Strengths",
    growth: "Growth areas",
    guidance: "Guidance"
    ,
    numerologyCompatibility: "Numerology Compatibility",
    nameCompatibility: "Name Compatibility",
    phoneCompatibility: "Phone Number Compatibility",
    vehicleCompatibility: "Vehicle Number Compatibility",
    compatibleSuggestions: "Compatible Suggestions",
    loShuResult: "Lo Shu Grid Result",
    summary: "Numerology Summary",
    overallCompatibility: "Overall Numerology Compatibility",
    bestSupportiveNumbers: "Best Supportive Numbers",
    loShuBalanceStatus: "Lo Shu Balance Status",
    supportive: "Supportive",
    neutral: "Neutral",
    needsBalance: "Needs Balance",
    strong: "Strong",
    reviewSuggested: "Review Suggested",
    present: "Present",
    missingLegend: "Missing",
    repeatedLegend: "Repeated",
    coreAnchor: "Core Numbers",
    loShuAnchor: "Lo Shu",
    compatibilityAnchor: "Compatibility",
    suggestionsAnchor: "Suggestions",
    dailyAnchor: "Daily",
    loShuImpact: "Lo Shu Compatibility Impact",
    namePublicBest: "Best for Name/Public Identity",
    phoneBest: "Best for Phone/Communication",
    vehicleBest: "Best for Vehicle/Movement",
    balanceCarefully: "Numbers to Balance Carefully",
    presentNumbers: "Present Numbers",
    strongAreas: "Strong Areas",
    balanceAreas: "Areas to Balance",
    relationshipPattern: "Relationship Pattern",
    careerGrowthPattern: "Career/Growth Pattern",
    practicalBalancing: "Practical Balancing Suggestions",
    loShuDisclaimer: "Lo Shu numerology is a reflective guidance system and should be used with practical judgment."
  },
  hi: {
    formTitle: "अपनी अंक ज्योतिष रिपोर्ट बनाएं",
    formCopy: "नाम और जन्म तिथि भरें। मोबाइल और वाहन नंबर वैकल्पिक हैं।",
    fullName: "पूरा नाम",
    dob: "जन्म तिथि",
    mobile: "मोबाइल नंबर",
    vehicle: "वाहन नंबर",
    optional: "वैकल्पिक",
    calculate: "अंक ज्योतिष गणना करें",
    calculating: "गणना हो रही है...",
    reset: "रीसेट",
    required: "यह फ़ील्ड आवश्यक है",
    invalidDate: "सही जन्म तिथि दर्ज करें",
    invalidMobile: "सही मोबाइल नंबर दर्ज करें या खाली छोड़ें",
    invalidVehicle: "सही वाहन नंबर दर्ज करें या खाली छोड़ें",
    error: "कुछ गलत हो गया। कृपया फिर से प्रयास करें।",
    coreNumbers: "मुख्य अंक",
    loShu: "लो शू ग्रिड",
    missing: "छूटे हुए अंक",
    repeated: "दोहराए गए अंक",
    daily: "दैनिक अंक ज्योतिष",
    remedies: "व्यावहारिक उपाय",
    noMissing: "इस जन्म तिथि से कोई लो शू अंक अनुपस्थित नहीं है।",
    noRepeated: "इस जन्म तिथि से कोई लो शू अंक दोहराया नहीं है।",
    strengths: "शक्तियां",
    growth: "विकास क्षेत्र",
    guidance: "मार्गदर्शन",
    numerologyCompatibility: "अंक ज्योतिष अनुकूलता",
    nameCompatibility: "नाम अनुकूलता",
    phoneCompatibility: "फोन नंबर अनुकूलता",
    vehicleCompatibility: "वाहन नंबर अनुकूलता",
    compatibleSuggestions: "अनुकूल सुझाव",
    loShuResult: "लो शू ग्रिड परिणाम",
    summary: "अंक ज्योतिष सारांश",
    overallCompatibility: "समग्र अंक ज्योतिष अनुकूलता",
    bestSupportiveNumbers: "श्रेष्ठ सहयोगी अंक",
    loShuBalanceStatus: "लो शू संतुलन स्थिति",
    supportive: "सहयोगी",
    neutral: "तटस्थ",
    needsBalance: "संतुलन आवश्यक",
    strong: "मजबूत",
    reviewSuggested: "समीक्षा सुझाई गई",
    present: "उपस्थित",
    missingLegend: "अनुपस्थित",
    repeatedLegend: "दोहराया गया",
    coreAnchor: "मुख्य अंक",
    loShuAnchor: "लो शू",
    compatibilityAnchor: "अनुकूलता",
    suggestionsAnchor: "सुझाव",
    dailyAnchor: "दैनिक",
    loShuImpact: "लो शू अनुकूलता प्रभाव",
    namePublicBest: "नाम/सार्वजनिक पहचान के लिए श्रेष्ठ",
    phoneBest: "फोन/संचार के लिए श्रेष्ठ",
    vehicleBest: "वाहन/यात्रा के लिए श्रेष्ठ",
    balanceCarefully: "सावधानी से संतुलित करने योग्य अंक",
    presentNumbers: "उपस्थित अंक",
    strongAreas: "मजबूत क्षेत्र",
    balanceAreas: "संतुलन की आवश्यकता वाले क्षेत्र",
    relationshipPattern: "संबंध पैटर्न",
    careerGrowthPattern: "करियर/विकास पैटर्न",
    practicalBalancing: "व्यावहारिक संतुलन सुझाव",
    loShuDisclaimer: "लो शू अंक ज्योतिष एक चिंतनात्मक मार्गदर्शन प्रणाली है और इसे व्यावहारिक समझ के साथ उपयोग करना चाहिए।"
  },
  hinglish: {
    formTitle: "Apni Numerology Report Calculate Karein",
    formCopy: "Naam aur date of birth daalein. Mobile aur vehicle number optional hain.",
    fullName: "Full name",
    dob: "Date of birth",
    mobile: "Mobile number",
    vehicle: "Vehicle number",
    optional: "optional",
    calculate: "Numerology Calculate Karein",
    calculating: "Calculate ho raha hai...",
    reset: "Reset",
    required: "Ye field required hai",
    invalidDate: "Valid date of birth daalein",
    invalidMobile: "Valid mobile number daalein ya blank chhodein",
    invalidVehicle: "Valid vehicle number daalein ya blank chhodein",
    error: "Kuch galat ho gaya. Kripya phir se try karein.",
    coreNumbers: "Core Numbers",
    loShu: "Lo Shu Grid",
    missing: "Missing Numbers",
    repeated: "Repeated Numbers",
    daily: "Daily Ank Jyotish",
    remedies: "Practical Remedies",
    noMissing: "Is birth date se koi Lo Shu number missing nahi hai.",
    noRepeated: "Is birth date se koi Lo Shu number repeated nahi hai.",
    strengths: "Strengths",
    growth: "Growth areas",
    guidance: "Guidance",
    numerologyCompatibility: "Numerology Compatibility",
    nameCompatibility: "Name Compatibility",
    phoneCompatibility: "Phone Number Compatibility",
    vehicleCompatibility: "Vehicle Number Compatibility",
    compatibleSuggestions: "Compatible Suggestions",
    loShuResult: "Lo Shu Grid Result",
    summary: "Numerology Summary",
    overallCompatibility: "Overall Numerology Compatibility",
    bestSupportiveNumbers: "Best Supportive Numbers",
    loShuBalanceStatus: "Lo Shu Balance Status",
    supportive: "Supportive",
    neutral: "Neutral",
    needsBalance: "Balance Needed",
    strong: "Strong",
    reviewSuggested: "Review Suggested",
    present: "Present",
    missingLegend: "Missing",
    repeatedLegend: "Repeated",
    coreAnchor: "Core Numbers",
    loShuAnchor: "Lo Shu",
    compatibilityAnchor: "Compatibility",
    suggestionsAnchor: "Suggestions",
    dailyAnchor: "Daily",
    loShuImpact: "Lo Shu Compatibility Impact",
    namePublicBest: "Best for Name/Public Identity",
    phoneBest: "Best for Phone/Communication",
    vehicleBest: "Best for Vehicle/Movement",
    balanceCarefully: "Numbers to Balance Carefully",
    presentNumbers: "Present Numbers",
    strongAreas: "Strong Areas",
    balanceAreas: "Balance Areas",
    relationshipPattern: "Relationship Pattern",
    careerGrowthPattern: "Career/Growth Pattern",
    practicalBalancing: "Practical Balancing Suggestions",
    loShuDisclaimer: "Lo Shu numerology ek reflective guidance system hai, ise practical judgment ke saath use karein."
  }
};

type FormState = {
  name: string;
  dateOfBirth: string;
  mobile: string;
  vehicle: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export function NumerologyContent() {
  const { tr, locale, apiLocale } = useLanguage();
  const lang = labels[locale];
  const [form, setForm] = useState<FormState>({ name: "", dateOfBirth: "", mobile: "", vehicle: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [report, setReport] = useState<NumerologyReport | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const nameRef = useRef<HTMLInputElement | null>(null);
  const dateOfBirthRef = useRef<HTMLInputElement | null>(null);
  const mobileRef = useRef<HTMLInputElement | null>(null);
  const vehicleRef = useRef<HTMLInputElement | null>(null);
  const coreNumbers = useMemo(() => report ? [
    { key: "moolank", value: report.moolank.value },
    { key: "lifePath", value: report.lifePath.value },
    { key: "destiny", value: report.destiny.value },
    { key: "nameNumber", value: report.nameNumber.value },
    { key: "soulUrge", value: report.soulUrge.value },
    { key: "personality", value: report.personality.value }
  ] : [], [report]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const next: Errors = {};
    if (!form.name.trim()) next.name = lang.required;
    if (!form.dateOfBirth) next.dateOfBirth = lang.required;
    else if (Number.isNaN(new Date(`${form.dateOfBirth}T00:00:00.000Z`).getTime())) next.dateOfBirth = lang.invalidDate;
    if (form.mobile.trim() && !/^\+?[0-9\s-]{7,20}$/.test(form.mobile.trim())) next.mobile = lang.invalidMobile;
    if (form.vehicle.trim() && !/^[A-Za-z0-9\s-]{2,20}$/.test(form.vehicle.trim())) next.vehicle = lang.invalidVehicle;
    setErrors(next);
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      if (validation.name) nameRef.current?.focus();
      else if (validation.dateOfBirth) dateOfBirthRef.current?.focus();
      else if (validation.mobile) mobileRef.current?.focus();
      else if (validation.vehicle) vehicleRef.current?.focus();
      return;
    }
    setStatus("loading");
    setReport(null);
    try {
      const response = await fetch("/api/numerology", {
        method: "POST",
        headers: { "content-type": "application/json", "x-naksharix-language": apiLocale },
        body: JSON.stringify({ ...form, locale: apiLocale })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.data?.report) throw new Error("Numerology calculation failed");
      setReport(payload.data.report as NumerologyReport);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const inputClass = (field: keyof FormState) => [
    "mt-2 w-full rounded-xl border bg-[rgba(255,255,255,0.78)] px-4 py-3 text-sm text-[#1e1e1f] outline-none transition placeholder:text-[#64748b]",
    errors[field] ? "border-red-500 focus:border-red-500" : "border-[rgba(255,255,255,0.55)] focus:border-[#dca956]"
  ].join(" ");

  return (
    <main className="inner-page-shell star-field">
      <Section first>
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8" style={{ background: "linear-gradient(135deg, rgba(255,248,234,0.96) 0%, rgba(255,243,220,0.92) 100%)", border: "1.5px solid rgba(20, 20, 20, 0.08)", boxShadow: "0 12px 48px rgba(180,120,20,0.16)" }}>
          <div className="max-w-3xl">
            <p className="font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-[#d89a2b]">{tr("navNumerology")}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-neutral-800 sm:text-5xl">{tr("numerologyTitle")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 naksh-muted-text">{tr("numerologyDescription")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/calculators"><Calculator className="h-4 w-4" />{tr("numerologyCta")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/reports">{tr("premiumReports")}</Link>
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] p-5 shadow-[0_18px_60px_rgba(2,6,18,0.35)] sm:p-6" noValidate>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-cinzel text-2xl font-bold text-neutral-800">{lang.formTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{lang.formCopy}</p>
              </div>
              <Button type="submit" disabled={status === "loading"} className="bg-[#d89a2b] text-white hover:bg-[#00f5a0] hover:text-[#020612]">
                {status === "loading" ? lang.calculating : lang.calculate}
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label={lang.fullName} error={errors.name}>
                <input ref={nameRef} className={inputClass("name")} value={form.name} onChange={(event) => updateField("name", event.target.value)} onBlur={validate} placeholder="Arjun Sharma" />
              </Field>
              <Field label={lang.dob} error={errors.dateOfBirth}>
                <input ref={dateOfBirthRef} className={inputClass("dateOfBirth")} type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} onBlur={validate} />
              </Field>
              <Field label={`${lang.mobile} (${lang.optional})`} error={errors.mobile}>
                <input ref={mobileRef} className={inputClass("mobile")} value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} onBlur={validate} placeholder="+91 9876543210" />
              </Field>
              <Field label={`${lang.vehicle} (${lang.optional})`} error={errors.vehicle}>
                <input ref={vehicleRef} className={inputClass("vehicle")} value={form.vehicle} onChange={(event) => updateField("vehicle", event.target.value)} onBlur={validate} placeholder="MP09AB1234" />
              </Field>
            </div>

            {status === "error" ? <p className="mt-4 rounded-xl border border-red-500/40 bg-red-950/35 px-4 py-3 text-sm text-red-100">{lang.error}</p> : null}
          </form>

          {report ? (
            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap gap-2">
                {[
                  [lang.coreAnchor, "#numerology-core"],
                  [lang.loShuAnchor, "#numerology-loshu"],
                  [lang.compatibilityAnchor, "#numerology-compatibility"],
                  [lang.suggestionsAnchor, "#numerology-suggestions"],
                  [lang.dailyAnchor, "#numerology-daily"]
                ].map(([label, href]) => (
                  <a key={href} href={href} className="rounded-full px-3 py-1.5 text-xs font-semibold border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] text-[#1b1c22] hover:-translate-y-0.5 hover:bg-white transition-all shadow-sm">{label}</a>
                ))}
              </div>

              <section id="numerology-summary" className="rounded-2xl p-5 border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]">
                <h2 className="font-cinzel text-2xl font-bold text-neutral-800">{lang.summary}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard label={lang.overallCompatibility} value={verdictLabel(overallNumerologyVerdict(report), locale, lang)} tone={overallNumerologyVerdict(report)} />
                  <SummaryCard label={lang.bestSupportiveNumbers} value={supportiveNumbers(report).join(", ")} tone="supportive" />
                  <SummaryCard label={lang.missing} value={missingValues(report).join(", ") || "-"} tone={missingValues(report).length ? "needsBalance" : "strong"} />
                  <SummaryCard label={lang.repeated} value={repeatedValues(report).join(", ") || "-"} tone={repeatedValues(report).length ? "reviewSuggested" : "strong"} />
                  <SummaryCard label={lang.nameCompatibility} value={verdictLabel(nameVerdict(report), locale, lang)} tone={nameVerdict(report)} />
                  <SummaryCard label={lang.phoneCompatibility} value={verdictLabel(numberVerdict(report, report.mobileAnalysis?.value), locale, lang)} tone={numberVerdict(report, report.mobileAnalysis?.value)} />
                  <SummaryCard label={lang.vehicleCompatibility} value={verdictLabel(numberVerdict(report, report.vehicleAnalysis?.value), locale, lang)} tone={numberVerdict(report, report.vehicleAnalysis?.value)} />
                  <SummaryCard label={lang.loShuBalanceStatus} value={verdictLabel(loShuVerdict(report), locale, lang)} tone={loShuVerdict(report)} />
                </div>
              </section>

              <section id="numerology-core">
                <h2 className="font-cinzel text-2xl font-bold text-neutral-800">{lang.coreNumbers}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {coreNumbers.map((item) => <NumberCard key={item.key} item={item} labels={lang} locale={locale} />)}
                </div>
              </section>

              <section id="numerology-loshu" className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <Card className="border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <CardContent className="p-5">
                    <h2 className="font-cinzel text-2xl font-bold text-neutral-800"><span className="notranslate" translate="no">{lang.loShu}</span></h2>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <LegendDot tone="present" label={lang.present} />
                      <LegendDot tone="missing" label={lang.missingLegend} />
                      <LegendDot tone="repeated" label={lang.repeatedLegend} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {report.loShuGrid.map((cell) => (
                        <div key={cell.number} className={`relative min-h-28 rounded-xl border p-3 text-center ${loShuCellClass(cell)}`}>
                          {cell.count > 1 ? <span className="absolute right-2 top-2 rounded-full bg-[#00f5a0] px-2 py-0.5 text-[10px] font-black text-[#020612]">x{cell.count}</span> : null}
                          <div className={`text-3xl font-black ${cell.present ? "text-[#e6941a]" : "text-neutral-400"}`}>{cell.number}</div>
                          <div className={`mt-1 text-xs font-semibold ${cell.present ? "text-[#e6941a]" : "text-neutral-400"}`}>{cell.present ? lang.present : lang.missingLegend}</div>
                          <p className="mt-2 text-xs leading-5 text-neutral-500">{loShuNumberMeaning(cell.number, locale)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-5">
                  <InsightList title={lang.missing} empty={lang.noMissing} items={report.missingNumbers.map((item) => `${item.value}: ${missingNumberText(item.value, locale)}`)} />
                  <InsightList title={lang.repeated} empty={lang.noRepeated} items={report.repeatedNumbers.map((item) => `${item.value} x${item.count}: ${repeatedNumberText(item.value, locale)}`)} />
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <InsightList title={lang.presentNumbers} items={presentNumbers(report).map((number) => `${number}: ${loShuNumberMeaning(number, locale)}`)} />
                <InsightList title={lang.strongAreas} items={loShuStrongAreas(report, locale)} />
                <InsightList title={lang.balanceAreas} items={loShuBalanceAreas(report, locale)} />
                <InsightList title={lang.practicalBalancing} items={loShuBalancingSuggestions(report, locale)} />
                <InsightList title={lang.relationshipPattern} items={[relationshipPattern(report, locale)]} />
                <InsightList title={lang.careerGrowthPattern} items={[careerPattern(report, locale)]} />
              </section>

              <section id="numerology-compatibility">
                <h2 className="font-cinzel text-2xl font-bold text-neutral-800">{lang.numerologyCompatibility}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <CompatibilityCard title={lang.nameCompatibility} verdict={nameVerdict(report)} items={nameCompatibility(report, locale)} lang={lang} locale={locale} />
                  <CompatibilityCard title={lang.phoneCompatibility} verdict={numberVerdict(report, report.mobileAnalysis?.value)} items={phoneCompatibility(report, locale)} lang={lang} locale={locale} />
                  <CompatibilityCard title={lang.vehicleCompatibility} verdict={numberVerdict(report, report.vehicleAnalysis?.value)} items={vehicleCompatibility(report, locale)} lang={lang} locale={locale} />
                  <InsightList title={lang.loShuImpact} items={loShuImpact(report, locale, form)} />
                  <div id="numerology-suggestions"><InsightList title={lang.compatibleSuggestions} items={compatibleNumberSuggestions(report, locale, lang)} /></div>
                </div>
              </section>

              <section id="numerology-daily" className="grid gap-4 md:grid-cols-2">
                {report.mobileAnalysis ? <NumberCard item={{ key: "mobile", value: report.mobileAnalysis.value }} labels={lang} locale={locale} /> : null}
                {report.vehicleAnalysis ? <NumberCard item={{ key: "vehicle", value: report.vehicleAnalysis.value }} labels={lang} locale={locale} /> : null}
                <Card className="border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] md:col-span-2">
                  <CardContent className="p-5">
                    <h2 className="font-cinzel text-xl font-bold text-neutral-800">{lang.daily}: {report.dailyPrediction.personalDayNumber}</h2>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{report.dailyPrediction.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {numberProfile(reduceDisplayNumber(report.lifePath.value + new Date(report.dailyPrediction.date).getDate()), locale).strengths.map((item) => <span key={item} className="rounded-full border border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] px-3 py-1 text-xs font-semibold text-[#e6941a]">{item}</span>)}
                    </div>
                  </CardContent>
                </Card>
                <InsightList title={lang.remedies} items={numerologyRemedies(locale)} />
              </section>

              <p className="rounded-2xl border border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] p-4 text-sm leading-6 text-neutral-500">{numerologyDisclaimer(locale)} {lang.loShuDisclaimer}</p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map(({ titleKey, copyKey, icon: Icon }) => (
              <Card key={titleKey} className="border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] shadow-[0_18px_60px_rgba(2,6,18,0.32)]">
                <CardContent className="p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#dca956]/10 text-[#d89a2b] shadow-[0_0_22px_rgba(220,169,86,0.12)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 font-cinzel text-xl font-bold text-neutral-800">{tr(titleKey)}</h2>
                  <p className="mt-3 text-sm leading-6 naksh-muted-text">{tr(copyKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-neutral-700">
      {label}
      {children}
      {error ? <span className="mt-2 block text-xs font-semibold text-red-300">{error}</span> : null}
    </label>
  );
}

function NumberCard({ item, labels, locale }: { item: { key: string; value: number }; labels: Record<string, string>; locale: Locale }) {
  const profile = numberProfile(item.value, locale);
  return (
    <Card className="border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-cinzel text-lg font-bold text-neutral-800"><span className="notranslate" translate="no">{numberLabel(item.key, locale)}</span></h3>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dca956] text-xl font-black text-[#020612]">{item.value}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-neutral-500">{profile.meaning}</p>
        <p className="mt-4 text-sm font-semibold text-neutral-800">{labels.guidance}</p>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{profile.guidance}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TagGroup title={labels.strengths} items={profile.strengths} tone="mint" />
          <TagGroup title={labels.growth} items={profile.growthAreas} tone="gold" />
        </div>
      </CardContent>
    </Card>
  );
}

function TagGroup({ title, items, tone }: { title: string; items: string[]; tone: "mint" | "gold" }) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase ${tone === "mint" ? "text-[#d89a2b]" : "text-[#d89a2b]"}`}>{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className="rounded-full border border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] px-2.5 py-1 text-xs text-neutral-600">{item}</span>)}
      </div>
    </div>
  );
}

function InsightList({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <Card className="border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]">
      <CardContent className="p-5">
        <h2 className="font-cinzel text-xl font-bold text-neutral-800">{title}</h2>
        <div className="mt-4 space-y-3">
          {items.length ? items.map((item) => <p key={item} className="rounded-xl border border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] p-3 text-sm leading-6 text-neutral-600">{item}</p>) : <p className="text-sm leading-6 text-neutral-500">{empty}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

type Verdict = "supportive" | "neutral" | "needsBalance" | "strong" | "reviewSuggested";

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: Verdict }) {
  return (
    <div className={`rounded-xl border p-4 ${toneClass(tone)}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-black text-neutral-800">{value}</p>
    </div>
  );
}

function CompatibilityCard({ title, verdict, items, lang, locale }: { title: string; verdict: Verdict; items: string[]; lang: Record<string, string>; locale: Locale }) {
  return (
    <Card className="border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]">
      <CardContent className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="font-cinzel text-xl font-bold text-neutral-800">{title}</h2>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${toneClass(verdict)}`}>{verdictLabel(verdict, locale, lang)}</span>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((item) => <p key={item} className="rounded-xl border border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] p-3 text-sm leading-6 text-neutral-600">{item}</p>)}
        </div>
      </CardContent>
    </Card>
  );
}

function LegendDot({ tone, label }: { tone: "present" | "missing" | "repeated"; label: string }) {
  const cls = tone === "present" ? "bg-[#fbc02d]" : tone === "repeated" ? "bg-[#00f5a0]" : "bg-[#64748b]";
  return <span className="inline-flex items-center gap-2 rounded-full border border border-[rgba(255,255,255,0.55)] bg-[rgba(255,255,255,0.78)] shadow-[0_12px_40px_rgba(18,22,35,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] px-3 py-1 text-neutral-500"><span className={`h-2.5 w-2.5 rounded-full ${cls}`} />{label}</span>;
}

function loShuCellClass(cell: { present: boolean; count: number }) {
  if (!cell.present) return "border-dashed border-[rgba(20,20,20,0.12)] bg-[rgba(255,255,255,0.4)]";
  if (cell.count > 1) return "border-[#009b72]/45 bg-[rgba(0,155,114,0.05)]";
  return "border-[#dca956]/45 bg-[rgba(220,169,86,0.05)]";
}

function toneClass(tone: Verdict) {
  if (tone === "strong") return "border-[#00f5a0]/45 bg-[#00f5a0]/12 text-[#d89a2b]";
  if (tone === "supportive") return "border-[#009b72]/45 bg-[#009b72]/14 text-[#d89a2b]";
  if (tone === "neutral") return "border-[#dca956]/40 bg-[#dca956]/12 text-neutral-800";
  if (tone === "reviewSuggested") return "border-[#ea580c]/45 bg-[#ea580c]/12 text-neutral-800";
  return "border-[#fbc02d]/45 bg-[#fbc02d]/12 text-[#d89a2b]";
}

function verdictLabel(verdict: Verdict, locale: Locale, lang: Record<string, string>) {
  if (verdict === "strong") return lang.strong;
  if (verdict === "supportive") return lang.supportive;
  if (verdict === "neutral") return lang.neutral;
  if (verdict === "reviewSuggested") return lang.reviewSuggested;
  return lang.needsBalance;
}

function numberLabel(key: string, locale: Locale) {
  const map: Record<Locale, Record<string, string>> = {
    en: { moolank: "Moolank / Birth Number", lifePath: "Bhagyank / Life Path Number", destiny: "Destiny Number", nameNumber: "Name Number / Naamank", soulUrge: "Soul Urge Number", personality: "Personality Number", mobile: "Mobile Number Analysis", vehicle: "Vehicle Number Analysis" },
    hi: { moolank: "मूलांक / जन्मांक", lifePath: "भाग्यांक / जीवन पथ अंक", destiny: "भाग्यांक", nameNumber: "नामांक", soulUrge: "आत्मिक ऊर्जा अंक", personality: "व्यक्तित्व अंक", mobile: "मोबाइल नंबर विश्लेषण", vehicle: "वाहन नंबर विश्लेषण" },
    hinglish: { moolank: "Moolank / Birth Number", lifePath: "Bhagyank / Life Path Number", destiny: "Destiny Number", nameNumber: "Naamank", soulUrge: "Soul Urge Number", personality: "Personality Number", mobile: "Mobile Number Analysis", vehicle: "Vehicle Number Analysis" }
  };
  return map[locale][key] ?? key;
}

function numberProfile(value: number, locale: Locale) {
  const profiles: Record<Locale, Record<number, { meaning: string; strengths: string[]; growthAreas: string[]; guidance: string }>> = {
    en: {
      1: p("leadership, confidence, individuality", ["confidence", "initiative"], ["ego balance", "patience"], "Practice independent decision-making with listening and teamwork."),
      2: p("sensitivity, cooperation, emotional balance", ["cooperation", "patience"], ["over-dependence", "hesitation"], "Build emotional expression, listening, and balanced partnership."),
      3: p("creativity, expression, learning", ["creativity", "communication"], ["scattered focus", "over-talking"], "Use writing, learning, and focused expression."),
      4: p("discipline, structure, stability", ["planning", "reliability"], ["rigidity", "fear of change"], "Use routine, planning, and step-by-step discipline."),
      5: p("balance, adaptability, communication", ["adaptability", "movement"], ["restlessness", "inconsistency"], "Balance freedom with clear communication and practical planning."),
      6: p("responsibility, family, care", ["care", "harmony"], ["over-responsibility", "control"], "Support family harmony without carrying everything alone."),
      7: p("analysis, spirituality, inner wisdom", ["analysis", "intuition"], ["isolation", "overthinking"], "Balance reflection with grounded routines."),
      8: p("ambition, management, material growth", ["execution", "management"], ["pressure", "work imbalance"], "Use money discipline, ethical ambition, and resource tracking."),
      9: p("compassion, wisdom, completion", ["compassion", "maturity"], ["emotional heaviness", "attachment"], "Complete old cycles and serve with boundaries.")
    },
    hi: {
      1: p("नेतृत्व, आत्मविश्वास, व्यक्तिगत पहचान", ["आत्मविश्वास", "पहल"], ["अहं संतुलन", "धैर्य"], "स्वतंत्र निर्णय लेने और सुनने की क्षमता पर काम करें।"),
      2: p("संवेदनशीलता, सहयोग, भावनात्मक संतुलन", ["सहयोग", "धैर्य"], ["अधिक निर्भरता", "हिचकिचाहट"], "भावनात्मक अभिव्यक्ति, सुनने और साझेदारी को संतुलित करें।"),
      3: p("रचनात्मकता, अभिव्यक्ति, सीखने की क्षमता", ["रचनात्मकता", "संवाद"], ["बिखरा ध्यान", "अधिक बोलना"], "लेखन, सीखने और केंद्रित अभिव्यक्ति का अभ्यास करें।"),
      4: p("अनुशासन, संरचना, स्थिरता", ["योजना", "विश्वसनीयता"], ["कठोरता", "बदलाव का भय"], "दिनचर्या, योजना और चरणबद्ध अनुशासन अपनाएं।"),
      5: p("संतुलन, अनुकूलन, संवाद", ["अनुकूलन", "गतिशीलता"], ["बेचैनी", "अनियमितता"], "स्वतंत्रता को स्पष्ट संवाद और व्यावहारिक योजना से संतुलित करें।"),
      6: p("जिम्मेदारी, परिवार, देखभाल", ["देखभाल", "सामंजस्य"], ["अधिक जिम्मेदारी", "नियंत्रण"], "सब कुछ अकेले उठाए बिना परिवारिक सामंजस्य बनाएं।"),
      7: p("विश्लेषण, आध्यात्मिकता, आंतरिक ज्ञान", ["विश्लेषण", "अंतर्ज्ञान"], ["अलगाव", "अधिक सोचना"], "चिंतन को स्थिर दिनचर्या से संतुलित करें।"),
      8: p("महत्वाकांक्षा, प्रबंधन, भौतिक विकास", ["कार्यान्वयन", "प्रबंधन"], ["दबाव", "काम असंतुलन"], "धन अनुशासन, नैतिक महत्वाकांक्षा और संसाधन प्रबंधन रखें।"),
      9: p("करुणा, ज्ञान, पूर्णता", ["करुणा", "परिपक्वता"], ["भावनात्मक भारीपन", "लगाव"], "पुराने चक्र पूरे करें और सीमाओं के साथ सेवा करें।")
    },
    hinglish: {
      1: p("leadership, confidence, individuality", ["confidence", "initiative"], ["ego balance", "patience"], "Independent decision-making aur listening par kaam karein."),
      2: p("sensitivity, cooperation, emotional balance", ["cooperation", "patience"], ["over-dependence", "hesitation"], "Emotional expression, listening aur partnership balance karein."),
      3: p("creativity, expression, learning", ["creativity", "communication"], ["scattered focus", "over-talking"], "Writing, learning aur focused expression practice karein."),
      4: p("discipline, structure, stability", ["planning", "reliability"], ["rigidity", "change fear"], "Routine, planning aur step-by-step discipline use karein."),
      5: p("balance, adaptability, communication", ["adaptability", "movement"], ["restlessness", "inconsistency"], "Freedom ko clear communication aur planning ke saath balance karein."),
      6: p("responsibility, family, care", ["care", "harmony"], ["over-responsibility", "control"], "Family harmony support karein, sab kuch akela carry na karein."),
      7: p("analysis, spirituality, inner wisdom", ["analysis", "intuition"], ["isolation", "overthinking"], "Reflection ko grounded routine se balance karein."),
      8: p("ambition, management, material growth", ["execution", "management"], ["pressure", "work imbalance"], "Money discipline, ethical ambition aur resource tracking rakhein."),
      9: p("compassion, wisdom, completion", ["compassion", "maturity"], ["emotional heaviness", "attachment"], "Old cycles complete karein aur boundaries ke saath serve karein.")
    }
  };
  return profiles[locale][reduceDisplayNumber(value)];
}

function p(meaning: string, strengths: string[], growthAreas: string[], guidance: string) {
  return { meaning, strengths, growthAreas, guidance };
}

function reduceDisplayNumber(value: number): number {
  if (value <= 9) return Math.max(1, value);
  return reduceDisplayNumber(String(value).split("").reduce((sum, digit) => sum + Number(digit), 0));
}

function loShuNumberMeaning(number: number, locale: Locale) {
  return numberProfile(number, locale).meaning;
}

function missingNumberText(number: number, locale: Locale) {
  const text: Record<Locale, Record<number, string>> = {
    en: {
      1: "Confidence, independent decisions, and personal initiative need conscious strengthening. Practice small self-led decisions.",
      2: "Emotional balance, cooperation, and listening need attention. Build calm partnership habits.",
      3: "Creativity, expression, learning, and communication need active practice. Write, speak, and complete ideas.",
      4: "Routine, discipline, planning, and structure need strengthening. Use lists, schedules, and steady systems.",
      5: "Adaptability, balance, and practical communication need cultivation. Keep flexibility with clear priorities.",
      6: "Family responsibility, care, and harmony need conscious support. Practice balanced responsibility without over-carrying.",
      7: "Reflection, analysis, and spiritual learning need more space. Balance solitude with grounded action.",
      8: "Money discipline, management, and responsibility need strengthening. Track resources and commitments carefully.",
      9: "Compassion, completion, and broad thinking need cultivation. Finish old cycles and serve with boundaries."
    },
    hi: {
      1: "आत्मविश्वास, स्वतंत्र निर्णय और व्यक्तिगत पहल को सचेत रूप से मजबूत करने की आवश्यकता है। छोटे स्वतंत्र निर्णयों का अभ्यास करें।",
      2: "भावनात्मक संतुलन, सहयोग और सुनने की क्षमता पर ध्यान देना उपयोगी रहेगा। शांत साझेदारी की आदतें बनाएं।",
      3: "रचनात्मकता, अभिव्यक्ति, सीखने और संवाद को सक्रिय अभ्यास की आवश्यकता है। लिखें, बोलें और विचार पूरे करें।",
      4: "दिनचर्या, अनुशासन, योजना और संरचना को मजबूत करने की आवश्यकता है। सूची, समय-सारणी और स्थिर प्रणाली अपनाएं।",
      5: "अनुकूलन, संतुलन और व्यावहारिक संवाद को विकसित करना उपयोगी रहेगा। स्पष्ट प्राथमिकताओं के साथ लचीलापन रखें।",
      6: "परिवारिक जिम्मेदारी, देखभाल और सामंजस्य को सचेत सहयोग चाहिए। सब कुछ अकेले उठाए बिना जिम्मेदारी निभाएं।",
      7: "चिंतन, विश्लेषण और आध्यात्मिक सीख के लिए अधिक स्थान बनाना उपयोगी रहेगा। एकांत को grounded action से संतुलित करें।",
      8: "धन अनुशासन, प्रबंधन और जिम्मेदारी को मजबूत करने की आवश्यकता है। संसाधन और commitments ध्यान से ट्रैक करें।",
      9: "करुणा, पूर्णता और व्यापक सोच को विकसित करना उपयोगी रहेगा। पुराने चक्र पूरे करें और सीमाओं के साथ सेवा करें।"
    },
    hinglish: {
      1: "Confidence, independent decisions aur personal initiative ko consciously strong karna helpful rahega. Chhote self-led decisions practice karein.",
      2: "Emotional balance, cooperation aur listening par dhyan dena helpful rahega. Calm partnership habits build karein.",
      3: "Creativity, expression, learning aur communication ko active practice chahiye. Write, speak aur ideas complete karein.",
      4: "Routine, discipline, planning aur structure ko strong karna helpful rahega. Lists, schedule aur steady systems use karein.",
      5: "Adaptability, balance aur practical communication develop karna helpful rahega. Clear priorities ke saath flexibility rakhein.",
      6: "Family responsibility, care aur harmony ko conscious support chahiye. Sab kuch akela carry kiye bina responsibility nibhayein.",
      7: "Reflection, analysis aur spiritual learning ke liye space banana helpful rahega. Solitude ko grounded action se balance karein.",
      8: "Money discipline, management aur responsibility ko strong karna helpful rahega. Resources aur commitments carefully track karein.",
      9: "Compassion, completion aur broad thinking develop karna helpful rahega. Old cycles complete karein aur boundaries ke saath serve karein."
    }
  };
  return text[locale][number] ?? `${loShuNumberMeaning(number, locale)}`;
}

function repeatedNumberText(number: number, locale: Locale) {
  const text: Record<Locale, Record<number, string>> = {
    en: {
      1: "Repeated 1 shows strong individuality and self-drive. Balance it with listening, teamwork, and patience.",
      2: "Repeated 2 shows heightened sensitivity and emotional awareness. Balance it with clear boundaries.",
      3: "Repeated 3 shows expressive and creative energy. Balance it by completing ideas before starting new ones.",
      4: "Repeated 4 shows strong structure and work focus. Balance it with flexibility and rest.",
      5: "Repeated 5 shows movement, change, and communication. Balance it with consistency and grounded choices.",
      6: "Repeated 6 shows care, family, and responsibility energy. Balance it by avoiding over-responsibility.",
      7: "Repeated 7 shows analysis and inner inquiry. Balance it with practical action and social connection.",
      8: "Repeated 8 shows ambition and management energy. Balance it with ethics, rest, and money discipline.",
      9: "Repeated 9 shows compassion, wisdom, and completion energy. Balance it by avoiding emotional overload and over-giving."
    },
    hi: {
      1: "1 का दोहराव मजबूत व्यक्तिगत ऊर्जा और आत्म-प्रेरणा दिखाता है। इसे सुनने की क्षमता, टीमवर्क और धैर्य से संतुलित करें।",
      2: "2 का दोहराव संवेदनशीलता और भावनात्मक जागरूकता दिखाता है। इसे स्पष्ट सीमाओं से संतुलित करें।",
      3: "3 का दोहराव अभिव्यक्ति और रचनात्मक ऊर्जा दिखाता है। नए विचार शुरू करने से पहले पुराने पूरे करें।",
      4: "4 का दोहराव मजबूत संरचना और कार्य-केंद्रित ऊर्जा दिखाता है। इसे लचीलापन और विश्राम से संतुलित करें।",
      5: "5 का दोहराव गति, बदलाव और संवाद की ऊर्जा दिखाता है। इसे नियमितता और grounded choices से संतुलित करें।",
      6: "6 का दोहराव देखभाल, परिवार और जिम्मेदारी की ऊर्जा दिखाता है। अत्यधिक जिम्मेदारी से बचकर संतुलन रखें।",
      7: "7 का दोहराव विश्लेषण और आंतरिक खोज दिखाता है। इसे व्यावहारिक action और सामाजिक जुड़ाव से संतुलित करें।",
      8: "8 का दोहराव महत्वाकांक्षा और प्रबंधन ऊर्जा दिखाता है। इसे नैतिकता, विश्राम और धन अनुशासन से संतुलित करें।",
      9: "9 का दोहराव करुणा, ज्ञान और पूर्णता की ऊर्जा दिखाता है। भावनात्मक बोझ और अत्यधिक देने की प्रवृत्ति से संतुलन रखें।"
    },
    hinglish: {
      1: "Repeated 1 strong individuality aur self-drive dikhata hai. Isko listening, teamwork aur patience se balance karein.",
      2: "Repeated 2 sensitivity aur emotional awareness dikhata hai. Isko clear boundaries se balance karein.",
      3: "Repeated 3 expressive aur creative energy dikhata hai. New ideas se pehle old ideas complete karein.",
      4: "Repeated 4 structure aur work focus dikhata hai. Isko flexibility aur rest se balance karein.",
      5: "Repeated 5 movement, change aur communication dikhata hai. Isko consistency aur grounded choices se balance karein.",
      6: "Repeated 6 care, family aur responsibility energy dikhata hai. Over-responsibility se balance rakhein.",
      7: "Repeated 7 analysis aur inner inquiry dikhata hai. Isko practical action aur social connection se balance karein.",
      8: "Repeated 8 ambition aur management energy dikhata hai. Isko ethics, rest aur money discipline se balance karein.",
      9: "Repeated 9 compassion, wisdom aur completion energy dikhata hai. Emotional overload aur over-giving se balance rakhein."
    }
  };
  return text[locale][number] ?? `${number}`;
}

function presentNumbers(report: NumerologyReport) {
  return report.loShuGrid.filter((cell) => cell.present).map((cell) => cell.number);
}

function missingValues(report: NumerologyReport) {
  return report.missingNumbers.map((item) => item.value);
}

function repeatedValues(report: NumerologyReport) {
  return report.repeatedNumbers.map((item) => item.value);
}

function loShuStrongAreas(report: NumerologyReport, locale: Locale) {
  const repeated = repeatedValues(report);
  const present = presentNumbers(report);
  const source = repeated.length ? repeated : present.slice(0, 3);
  return source.map((number) => `${number}: ${loShuNumberMeaning(number, locale)}`);
}

function loShuBalanceAreas(report: NumerologyReport, locale: Locale) {
  return missingValues(report).map((number) => `${number}: ${missingNumberText(number, locale)}`);
}

function loShuBalancingSuggestions(report: NumerologyReport, locale: Locale) {
  const missing = missingValues(report);
  const repeated = repeatedValues(report);
  const suggestions = missing.slice(0, 5).map((number) => numberProfile(number, locale).guidance);
  repeated.slice(0, 2).forEach((number) => suggestions.push(repeatedNumberText(number, locale)));
  return suggestions.length ? suggestions : [locale === "hi" ? "ग्रिड संतुलित दिखता है; नियमित अभ्यास और व्यावहारिक निर्णय बनाए रखें।" : locale === "hinglish" ? "Grid balanced dikhta hai; regular practice aur practical decisions maintain karein." : "The grid looks balanced; maintain steady habits and practical choices."];
}

function relationshipPattern(report: NumerologyReport, locale: Locale) {
  const has2 = presentNumbers(report).includes(2);
  const has6 = presentNumbers(report).includes(6);
  if (locale === "hi") return has2 || has6 ? "संबंधों में सहयोग, देखभाल और संवाद सहायक रहेंगे।" : "संबंधों में सुनना, भावनात्मक अभिव्यक्ति और परिवारिक जिम्मेदारी पर सचेत काम उपयोगी रहेगा।";
  if (locale === "hinglish") return has2 || has6 ? "Relationships me cooperation, care aur communication supportive rahenge." : "Relationships me listening, emotional expression aur family responsibility par conscious work helpful rahega.";
  return has2 || has6 ? "Cooperation, care, and communication can support relationships." : "Listening, emotional expression, and family responsibility need conscious attention.";
}

function careerPattern(report: NumerologyReport, locale: Locale) {
  const has4 = presentNumbers(report).includes(4);
  const has8 = presentNumbers(report).includes(8);
  if (locale === "hi") return has4 || has8 ? "करियर में योजना, प्रबंधन और अनुशासित प्रयास सहायक रहेंगे।" : "करियर विकास के लिए संरचना, धन अनुशासन और स्पष्ट लक्ष्य बनाना उपयोगी रहेगा।";
  if (locale === "hinglish") return has4 || has8 ? "Career me planning, management aur disciplined effort supportive rahenge." : "Career growth ke liye structure, money discipline aur clear goals helpful rahenge.";
  return has4 || has8 ? "Planning, management, and disciplined effort can support career growth." : "Structure, money discipline, and clear goals will be useful for career growth.";
}

function nameCompatibility(report: NumerologyReport, locale: Locale) {
  const aligned = compatibleSet(report.lifePath.value).includes(reduceDisplayNumber(report.nameNumber.value));
  const missing = missingValues(report);
  const nameSupportsMissing = missing.includes(reduceDisplayNumber(report.nameNumber.value));
  if (locale === "hi") return [
    aligned ? "आपका नामांक जीवन पथ अंक के लिए सहयोगी है।" : "नामांक तटस्थ है; व्यक्तित्व अभिव्यक्ति में संतुलन उपयोगी हो सकता है।",
    nameSupportsMissing ? "नामांक लो शू के अनुपस्थित अंक पैटर्न को संतुलित करने में सहयोगी माना जा सकता है।" : "किसी आधिकारिक नाम परिवर्तन से पहले spelling या public name review को शांतिपूर्वक समझें।"
  ];
  if (locale === "hinglish") return [
    aligned ? "Aapka naamank life path ke liye supportive hai." : "Naamank neutral hai; personality expression me balance helpful ho sakta hai.",
    nameSupportsMissing ? "Naamank Lo Shu missing pattern ko balance karne me supportive maana ja sakta hai." : "Official name change se pehle spelling ya public name review calmly samjhein."
  ];
  return [
    aligned ? "Your name number is supportive for your life path." : "Your name number is neutral; personality expression may need more balance.",
    nameSupportsMissing ? "Your name number may help balance a missing Lo Shu pattern." : "Review spelling or public name presentation before considering any official name change."
  ];
}

function phoneCompatibility(report: NumerologyReport, locale: Locale) {
  if (!report.mobileAnalysis) return [locale === "hi" ? "मोबाइल नंबर नहीं दिया गया है।" : locale === "hinglish" ? "Mobile number provide nahi kiya gaya." : "Mobile number was not provided."];
  return compatibilityForNumber(report, report.mobileAnalysis.value, "phone", locale);
}

function vehicleCompatibility(report: NumerologyReport, locale: Locale) {
  if (!report.vehicleAnalysis) return [locale === "hi" ? "वाहन नंबर नहीं दिया गया है।" : locale === "hinglish" ? "Vehicle number provide nahi kiya gaya." : "Vehicle number was not provided."];
  const lines = compatibilityForNumber(report, report.vehicleAnalysis.value, "vehicle", locale);
  lines.push(locale === "hi" ? "अंक ज्योतिष सुरक्षित ड्राइविंग, कानूनी नियम, बीमा या वाहन रखरखाव का विकल्प नहीं है।" : locale === "hinglish" ? "Numerology safe driving, legal compliance, insurance ya vehicle maintenance ka replacement nahi hai." : "Numerology does not replace safe driving, legal compliance, insurance, or vehicle maintenance.");
  return lines;
}

function compatibilityForNumber(report: NumerologyReport, value: number, type: "phone" | "vehicle", locale: Locale) {
  const number = reduceDisplayNumber(value);
  const moolankSupport = compatibleSet(report.moolank.value).includes(number);
  const lifePathSupport = compatibleSet(report.lifePath.value).includes(number);
  const supportive = moolankSupport || lifePathSupport;
  const fillsMissing = missingValues(report).includes(number);
  const repeated = repeatedValues(report).includes(number);
  if (locale === "hi") return [
    `${type === "phone" ? "फोन" : "वाहन"} नंबर कुल: ${number}`,
    `मूलांक संबंध: ${moolankSupport ? "सहयोगी" : "तटस्थ"}। भाग्यांक संबंध: ${lifePathSupport ? "सहयोगी" : "तटस्थ"}।`,
    supportive ? `${type === "phone" ? "फोन" : "वाहन"} कुल ${number} जिम्मेदारी, संवाद या विकास को आपके अंक पैटर्न के अनुसार सहयोग दे सकता है।` : "यह तटस्थ है; भविष्य में मूलांक या जीवन पथ से मेल खाते नंबर पर विचार किया जा सकता है।",
    fillsMissing ? "यह लो शू के अनुपस्थित अंक को संतुलित करने में सहयोगी हो सकता है।" : repeated ? "यह पहले से सक्रिय अंक को और मजबूत कर सकता है; संतुलन रखें।" : "लो शू पैटर्न के साथ इसका प्रभाव तटस्थ दिखता है।"
  ];
  if (locale === "hinglish") return [
    `${type === "phone" ? "Phone" : "Vehicle"} number total: ${number}`,
    `Moolank relation: ${moolankSupport ? "Supportive" : "Neutral"}. Bhagyank relation: ${lifePathSupport ? "Supportive" : "Neutral"}.`,
    supportive ? `${type === "phone" ? "Phone" : "Vehicle"} total ${number} aapke number pattern ke hisab se communication, responsibility ya growth ko support kar sakta hai.` : "Ye neutral hai; future me moolank ya life path aligned number consider kiya ja sakta hai.",
    fillsMissing ? "Ye Lo Shu missing number ko balance karne me support kar sakta hai." : repeated ? "Ye already active number ko aur strong kar sakta hai; balance rakhein." : "Lo Shu pattern ke saath iska effect neutral dikhta hai."
  ];
  return [
    `${type === "phone" ? "Phone" : "Vehicle"} number total: ${number}`,
    `Moolank relation: ${moolankSupport ? "Supportive" : "Neutral"}. Bhagyank relation: ${lifePathSupport ? "Supportive" : "Neutral"}.`,
    supportive ? `${type === "phone" ? "Phone" : "Vehicle"} total ${number} may support communication, responsibility, or growth based on your pattern.` : "This is neutral; numbers aligned with your birth or life path can be considered in future choices.",
    fillsMissing ? "It may help balance a missing Lo Shu number." : repeated ? "It can amplify an already active pattern; keep balance." : "Its Lo Shu influence appears neutral."
  ];
}

function compatibleNumberSuggestions(report: NumerologyReport, locale: Locale, lang: Record<string, string>) {
  const careful = repeatedValues(report).slice(0, 4);
  const name = Array.from(new Set([report.nameNumber.value, report.lifePath.value].map(reduceDisplayNumber))).join(", ");
  const phone = Array.from(new Set([report.moolank.value, report.lifePath.value, 5, ...missingValues(report).slice(0, 2)].map(reduceDisplayNumber))).slice(0, 4).join(", ");
  const vehicle = Array.from(new Set([report.moolank.value, 4, 6, ...missingValues(report).slice(0, 2)].map(reduceDisplayNumber))).slice(0, 4).join(", ");
  if (locale === "hi") return [
    `${lang.namePublicBest}: ${name}. ये सार्वजनिक पहचान या नाम समीक्षा में सहयोगी माने जा सकते हैं।`,
    `${lang.phoneBest}: ${phone}. इन्हें भविष्य के फोन विकल्पों में विचार किया जा सकता है।`,
    `${lang.vehicleBest}: ${vehicle}. इन्हें वाहन/यात्रा ऊर्जा के लिए विचार किया जा सकता है।`,
    careful.length ? `${lang.balanceCarefully}: ${careful.join(", ")}.` : "कोई अत्यधिक दोहराया गया अंक स्पष्ट नहीं है।",
    "आधिकारिक नाम या नंबर बदलने से पहले व्यावहारिक और कानूनी पहलू जरूर देखें।"
  ];
  if (locale === "hinglish") return [
    `${lang.namePublicBest}: ${name}. Public identity ya name review me supportive maana ja sakta hai.`,
    `${lang.phoneBest}: ${phone}. Future phone choices me consider kiye ja sakte hain.`,
    `${lang.vehicleBest}: ${vehicle}. Vehicle/movement energy ke liye consider kiye ja sakte hain.`,
    careful.length ? `${lang.balanceCarefully}: ${careful.join(", ")}.` : "Koi over-repeated number clearly nahi hai.",
    "Official name ya number change se pehle practical aur legal points zaroor dekhein."
  ];
  return [
    `${lang.namePublicBest}: ${name}. These may support public identity or name review.`,
    `${lang.phoneBest}: ${phone}. These can be considered in future phone choices.`,
    `${lang.vehicleBest}: ${vehicle}. These can be considered for vehicle or movement energy.`,
    careful.length ? `${lang.balanceCarefully}: ${careful.join(", ")}.` : "No strongly over-repeated number is visible.",
    "Review practical and legal considerations before changing official names or numbers."
  ];
}

function compatibleSet(value: number) {
  const n = reduceDisplayNumber(value);
  return Array.from(new Set([n, ((n + 2 - 1) % 9) + 1, ((n + 4 - 1) % 9) + 1]));
}

function supportiveNumbers(report: NumerologyReport) {
  return Array.from(new Set([report.moolank.value, report.lifePath.value, report.nameNumber.value, ...missingValues(report).slice(0, 3)].map(reduceDisplayNumber))).slice(0, 5);
}

function overallNumerologyVerdict(report: NumerologyReport): Verdict {
  const missingCount = missingValues(report).length;
  const repeatedCount = repeatedValues(report).length;
  const name = nameVerdict(report);
  if (missingCount <= 2 && repeatedCount <= 2 && name !== "needsBalance") return "strong";
  if (missingCount <= 4 && name !== "needsBalance") return "supportive";
  if (missingCount >= 6 || repeatedCount >= 5) return "needsBalance";
  return "neutral";
}

function loShuVerdict(report: NumerologyReport): Verdict {
  const missingCount = missingValues(report).length;
  const repeatedCount = repeatedValues(report).length;
  if (missingCount <= 1 && repeatedCount <= 2) return "strong";
  if (missingCount <= 3) return "supportive";
  if (missingCount >= 6 || repeatedCount >= 5) return "reviewSuggested";
  return "needsBalance";
}

function nameVerdict(report: NumerologyReport): Verdict {
  const nameNumber = reduceDisplayNumber(report.nameNumber.value);
  if (compatibleSet(report.lifePath.value).includes(nameNumber)) return "supportive";
  if (missingValues(report).includes(nameNumber)) return "supportive";
  if (repeatedValues(report).includes(nameNumber)) return "needsBalance";
  return "neutral";
}

function numberVerdict(report: NumerologyReport, value?: number): Verdict {
  if (!value) return "neutral";
  const number = reduceDisplayNumber(value);
  const supportive = compatibleSet(report.moolank.value).includes(number) || compatibleSet(report.lifePath.value).includes(number) || missingValues(report).includes(number);
  if (supportive && !repeatedValues(report).includes(number)) return "supportive";
  if (repeatedValues(report).includes(number)) return "needsBalance";
  return "neutral";
}

function loShuImpact(report: NumerologyReport, locale: Locale, form: FormState) {
  const missing = missingValues(report);
  const repeated = repeatedValues(report);
  const nameNumber = reduceDisplayNumber(report.nameNumber.value);
  const phoneDigits = digitsFromInput(form.mobile);
  const vehicleDigits = digitsFromInput(form.vehicle);
  const phoneSupport = missing.filter((number) => phoneDigits.includes(number));
  const vehicleSupport = missing.filter((number) => vehicleDigits.includes(number));
  const overactivePhone = repeated.filter((number) => phoneDigits.includes(number));
  const overactiveVehicle = repeated.filter((number) => vehicleDigits.includes(number));
  const lines: string[] = [];
  if (locale === "hi") {
    lines.push(missing.includes(nameNumber) ? `नामांक ${nameNumber} लो शू के अनुपस्थित अंक को संतुलित करने में सहयोग दे सकता है।` : `नामांक ${nameNumber} आपके मूल अंक पैटर्न के साथ ${nameVerdict(report) === "supportive" ? "सहयोगी" : "तटस्थ"} दिखता है।`);
    lines.push(phoneSupport.length ? `आपके फोन नंबर में ${phoneSupport.join(", ")} है, जो लो शू के अनुपस्थित पैटर्न को सहयोग दे सकता है।` : "फोन नंबर लो शू के अनुपस्थित अंकों को सीधे नहीं भरता; इसे तटस्थ रूप से देखें।");
    lines.push(vehicleSupport.length ? `आपके वाहन नंबर में ${vehicleSupport.join(", ")} है, जो यात्रा/गतिशीलता में संतुलन संकेत दे सकता है।` : "वाहन नंबर लो शू के अनुपस्थित अंकों को सीधे नहीं भरता; सुरक्षित ड्राइविंग सबसे महत्वपूर्ण है।");
    if (overactivePhone.length || overactiveVehicle.length) lines.push(`पहले से सक्रिय अंक ${[...overactivePhone, ...overactiveVehicle].join(", ")} दोहर रहे हैं; इन्हें संतुलित आदतों से संभालें।`);
    lines.push(missing.length ? `श्रेष्ठ संतुलन दिशा: ${missing.slice(0, 3).map((number) => `${number} (${loShuNumberMeaning(number, locale)})`).join(", ")}.` : "श्रेष्ठ संतुलन दिशा: मौजूदा strengths को स्थिर अभ्यास से बनाए रखें।");
    return lines;
  }
  if (locale === "hinglish") {
    lines.push(missing.includes(nameNumber) ? `Naamank ${nameNumber} Lo Shu missing number ko balance karne me support kar sakta hai.` : `Naamank ${nameNumber} aapke pattern ke saath ${nameVerdict(report) === "supportive" ? "supportive" : "neutral"} dikhta hai.`);
    lines.push(phoneSupport.length ? `Aapke phone number mein ${phoneSupport.join(", ")} hai, jo Lo Shu missing pattern ko support kar sakta hai.` : "Phone number Lo Shu missing numbers ko directly fill nahi karta; ise neutral dekhein.");
    lines.push(vehicleSupport.length ? `Aapke vehicle number mein ${vehicleSupport.join(", ")} hai, jo movement energy me balance signal de sakta hai.` : "Vehicle number Lo Shu missing numbers ko directly fill nahi karta; safe driving most important hai.");
    if (overactivePhone.length || overactiveVehicle.length) lines.push(`Already active numbers ${[...overactivePhone, ...overactiveVehicle].join(", ")} repeat ho rahe hain; balanced habits se handle karein.`);
    lines.push(missing.length ? `Best balancing direction: ${missing.slice(0, 3).map((number) => `${number} (${loShuNumberMeaning(number, locale)})`).join(", ")}.` : "Best balancing direction: existing strengths ko steady practice se maintain karein.");
    return lines;
  }
  lines.push(missing.includes(nameNumber) ? `Your name number ${nameNumber} may help balance a missing Lo Shu number.` : `Your name number ${nameNumber} looks ${nameVerdict(report) === "supportive" ? "supportive" : "neutral"} with your pattern.`);
  lines.push(phoneSupport.length ? `Your phone number includes ${phoneSupport.join(", ")}, which may support missing Lo Shu patterns.` : "Your phone number does not directly fill missing Lo Shu numbers; treat it as neutral.");
  lines.push(vehicleSupport.length ? `Your vehicle number includes ${vehicleSupport.join(", ")}, which may support movement and balance themes.` : "Your vehicle number does not directly fill missing Lo Shu numbers; safe driving remains most important.");
  if (overactivePhone.length || overactiveVehicle.length) lines.push(`Already active numbers ${[...overactivePhone, ...overactiveVehicle].join(", ")} repeat in phone/vehicle inputs; balance them with steady habits.`);
  lines.push(missing.length ? `Best balancing direction: ${missing.slice(0, 3).map((number) => `${number} (${loShuNumberMeaning(number, locale)})`).join(", ")}.` : "Best balancing direction: maintain existing strengths with steady practice.");
  return lines;
}

function digitsFromInput(value: string) {
  return value.replace(/\D/g, "").split("").map(Number).filter((number) => number >= 1 && number <= 9);
}

function numerologyRemedies(locale: Locale) {
  if (locale === "hi") return ["दिन के लिए एक स्पष्ट संकल्प रखें।", "बड़े निर्णय से पहले अनुशासित संवाद रखें।", "कृतज्ञता, सेवा और स्थिर दिनचर्या का अभ्यास करें।"];
  if (locale === "hinglish") return ["Din ke liye ek clear intention rakhein.", "Major decisions se pehle disciplined communication rakhein.", "Gratitude, seva aur steady routine practice karein."];
  return ["Keep one clear intention for the day.", "Use disciplined communication before major decisions.", "Practice gratitude, service, and steady routines."];
}

function numerologyDisclaimer(locale: Locale) {
  if (locale === "hi") return "अंक ज्योतिष आत्मचिंतन और योजना का साधन है। यह चिकित्सा, कानूनी, वित्तीय या मानसिक स्वास्थ्य सलाह का विकल्प नहीं है।";
  if (locale === "hinglish") return "Numerology reflection aur planning tool hai. Yeh medical, legal, financial ya mental-health advice ka replacement nahi hai.";
  return "Numerology is a reflective planning tool. It does not replace professional medical, legal, financial, or mental-health advice.";
}
