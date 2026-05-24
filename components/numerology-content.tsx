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
    "mt-2 w-full rounded-xl border bg-[#0f1c3a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#64748b]",
    errors[field] ? "border-red-500 focus:border-red-500" : "border-[#1e293b] focus:border-[#dca956]"
  ].join(" ");

  return (
    <main className="star-field bg-[#020612]">
      <Section>
        <div className="relative overflow-hidden rounded-3xl border border-[#1e293b] bg-[radial-gradient(circle_at_78%_16%,rgba(0,245,160,0.12),transparent_24rem),radial-gradient(circle_at_10%_10%,rgba(220,169,86,0.14),transparent_22rem),linear-gradient(135deg,#0a1224,#020612_82%)] p-6 shadow-[0_24px_80px_rgba(2,6,18,0.48)] sm:p-8">
          <div className="max-w-3xl">
            <p className="font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{tr("navNumerology")}</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{tr("numerologyTitle")}</h1>
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

          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-[#1e293b] bg-[#0a1224]/94 p-5 shadow-[0_18px_60px_rgba(2,6,18,0.35)] sm:p-6" noValidate>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{lang.formTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{lang.formCopy}</p>
              </div>
              <Button type="submit" disabled={status === "loading"} className="bg-[#009b72] text-white hover:bg-[#00f5a0] hover:text-[#020612]">
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
              <section>
                <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{lang.coreNumbers}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {coreNumbers.map((item) => <NumberCard key={item.key} item={item} labels={lang} locale={locale} />)}
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <Card className="border-[#1e293b] bg-[#0f1c3a]/90">
                  <CardContent className="p-5">
                    <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]"><span className="notranslate" translate="no">{lang.loShu}</span></h2>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {report.loShuGrid.map((cell) => (
                        <div key={cell.number} className={`min-h-24 rounded-xl border p-3 text-center ${cell.present ? "border-[#dca956]/60 bg-[#0a1224]" : "border-[#1e293b] bg-[#020612]/72"}`}>
                          <div className="text-2xl font-black text-[#fbc02d]">{cell.number}</div>
                          <div className="mt-1 text-sm font-semibold text-white">x{cell.count}</div>
                          <p className="mt-2 text-xs leading-5 text-[#94a3b8]">{loShuNumberMeaning(cell.number, locale)}</p>
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

              <section>
                <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{lang.numerologyCompatibility}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <InsightList title={lang.nameCompatibility} items={nameCompatibility(report, locale)} />
                  <InsightList title={lang.phoneCompatibility} items={phoneCompatibility(report, locale)} />
                  <InsightList title={lang.vehicleCompatibility} items={vehicleCompatibility(report, locale)} />
                  <InsightList title={lang.compatibleSuggestions} items={compatibleNumberSuggestions(report, locale)} />
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                {report.mobileAnalysis ? <NumberCard item={{ key: "mobile", value: report.mobileAnalysis.value }} labels={lang} locale={locale} /> : null}
                {report.vehicleAnalysis ? <NumberCard item={{ key: "vehicle", value: report.vehicleAnalysis.value }} labels={lang} locale={locale} /> : null}
                <Card className="border-[#1e293b] bg-[#0f1c3a]/90 md:col-span-2">
                  <CardContent className="p-5">
                    <h2 className="font-cinzel text-xl font-bold text-[#f3d382]">{lang.daily}: {report.dailyPrediction.personalDayNumber}</h2>
                    <p className="mt-3 text-sm leading-6 text-white">{report.dailyPrediction.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {numberProfile(reduceDisplayNumber(report.lifePath.value + new Date(report.dailyPrediction.date).getDate()), locale).strengths.map((item) => <span key={item} className="rounded-full border border-[#1e293b] bg-[#0a1224] px-3 py-1 text-xs font-semibold text-[#00f5a0]">{item}</span>)}
                    </div>
                  </CardContent>
                </Card>
                <InsightList title={lang.remedies} items={numerologyRemedies(locale)} />
              </section>

              <p className="rounded-2xl border border-[#1e293b] bg-[#0a1224]/86 p-4 text-sm leading-6 text-[#94a3b8]">{numerologyDisclaimer(locale)} {lang.loShuDisclaimer}</p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map(({ titleKey, copyKey, icon: Icon }) => (
              <Card key={titleKey} className="border-[#1e293b] bg-[#0f1c3a]/88 shadow-[0_18px_60px_rgba(2,6,18,0.32)]">
                <CardContent className="p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#dca956]/10 text-[#dca956] shadow-[0_0_22px_rgba(220,169,86,0.12)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 font-cinzel text-xl font-bold text-[#ffffff]">{tr(titleKey)}</h2>
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
    <label className="block text-sm font-semibold text-white">
      {label}
      {children}
      {error ? <span className="mt-2 block text-xs font-semibold text-red-300">{error}</span> : null}
    </label>
  );
}

function NumberCard({ item, labels, locale }: { item: { key: string; value: number }; labels: Record<string, string>; locale: Locale }) {
  const profile = numberProfile(item.value, locale);
  return (
    <Card className="border-[#1e293b] bg-[#0f1c3a]/90">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-cinzel text-lg font-bold text-white"><span className="notranslate" translate="no">{numberLabel(item.key, locale)}</span></h3>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dca956] text-xl font-black text-[#020612]">{item.value}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#94a3b8]">{profile.meaning}</p>
        <p className="mt-4 text-sm font-semibold text-[#f3d382]">{labels.guidance}</p>
        <p className="mt-2 text-sm leading-6 text-white">{profile.guidance}</p>
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
      <p className={`text-xs font-bold uppercase ${tone === "mint" ? "text-[#00f5a0]" : "text-[#dca956]"}`}>{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className="rounded-full border border-[#1e293b] bg-[#0a1224] px-2.5 py-1 text-xs text-white">{item}</span>)}
      </div>
    </div>
  );
}

function InsightList({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <Card className="border-[#1e293b] bg-[#0f1c3a]/90">
      <CardContent className="p-5">
        <h2 className="font-cinzel text-xl font-bold text-[#f3d382]">{title}</h2>
        <div className="mt-4 space-y-3">
          {items.length ? items.map((item) => <p key={item} className="rounded-xl border border-[#1e293b] bg-[#0a1224] p-3 text-sm leading-6 text-white">{item}</p>) : <p className="text-sm leading-6 text-[#94a3b8]">{empty}</p>}
        </div>
      </CardContent>
    </Card>
  );
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
  if (locale === "hi") return `${loShuNumberMeaning(number, locale)} को सचेत अभ्यास से विकसित करना उपयोगी रहेगा।`;
  if (locale === "hinglish") return `${loShuNumberMeaning(number, locale)} ko conscious practice se develop karna helpful rahega.`;
  return `${loShuNumberMeaning(number, locale)} needs conscious cultivation.`;
}

function repeatedNumberText(number: number, locale: Locale) {
  if (locale === "hi") return `${number} का दोहराव मजबूत ऊर्जा दिखा सकता है। इसे संतुलित अभ्यास से संभालें।`;
  if (locale === "hinglish") return `Repeated ${number} strong energy dikhata hai. Isko balanced practice se handle karein.`;
  return `Repeated ${number} can show strong energy. Balance it with conscious practice.`;
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
  const supportive = compatibleSet(report.moolank.value).includes(number) || compatibleSet(report.lifePath.value).includes(number);
  const fillsMissing = missingValues(report).includes(number);
  const repeated = repeatedValues(report).includes(number);
  if (locale === "hi") return [
    `${type === "phone" ? "फोन" : "वाहन"} नंबर कुल: ${number}`,
    supportive ? "यह मूलांक या जीवन पथ अंक के साथ सहयोगी माना जा सकता है।" : "यह तटस्थ है; भविष्य में मूलांक या जीवन पथ से मेल खाते नंबर पर विचार किया जा सकता है।",
    fillsMissing ? "यह लो शू के अनुपस्थित अंक को संतुलित करने में सहयोगी हो सकता है।" : repeated ? "यह पहले से सक्रिय अंक को और मजबूत कर सकता है; संतुलन रखें।" : "लो शू पैटर्न के साथ इसका प्रभाव तटस्थ दिखता है।"
  ];
  if (locale === "hinglish") return [
    `${type === "phone" ? "Phone" : "Vehicle"} number total: ${number}`,
    supportive ? "Ye moolank ya life path ke saath supportive maana ja sakta hai." : "Ye neutral hai; future me moolank ya life path aligned number consider kiya ja sakta hai.",
    fillsMissing ? "Ye Lo Shu missing number ko balance karne me support kar sakta hai." : repeated ? "Ye already active number ko aur strong kar sakta hai; balance rakhein." : "Lo Shu pattern ke saath iska effect neutral dikhta hai."
  ];
  return [
    `${type === "phone" ? "Phone" : "Vehicle"} number total: ${number}`,
    supportive ? "This may be supportive for your birth or life path number." : "This is neutral; numbers aligned with your birth or life path can be considered in future choices.",
    fillsMissing ? "It may help balance a missing Lo Shu number." : repeated ? "It can amplify an already active pattern; keep balance." : "Its Lo Shu influence appears neutral."
  ];
}

function compatibleNumberSuggestions(report: NumerologyReport, locale: Locale) {
  const best = Array.from(new Set([report.moolank.value, report.lifePath.value, report.nameNumber.value, ...missingValues(report).slice(0, 3)].map(reduceDisplayNumber))).slice(0, 5);
  const careful = repeatedValues(report).slice(0, 4);
  if (locale === "hi") return [
    `सहयोगी अंक: ${best.join(", ")}. इन्हें भविष्य के फोन/वाहन विकल्पों में विचार किया जा सकता है।`,
    careful.length ? `संतुलन से उपयोग करें: ${careful.join(", ")}.` : "कोई अत्यधिक दोहराया गया अंक स्पष्ट नहीं है।",
    "आधिकारिक नाम या नंबर बदलने से पहले व्यावहारिक और कानूनी पहलू जरूर देखें।"
  ];
  if (locale === "hinglish") return [
    `Supportive numbers: ${best.join(", ")}. Future phone/vehicle choices me consider kiye ja sakte hain.`,
    careful.length ? `Balance carefully: ${careful.join(", ")}.` : "Koi over-repeated number clearly nahi hai.",
    "Official name ya number change se pehle practical aur legal points zaroor dekhein."
  ];
  return [
    `Supportive numbers: ${best.join(", ")}. These can be considered in future phone or vehicle choices.`,
    careful.length ? `Balance carefully: ${careful.join(", ")}.` : "No strongly over-repeated number is visible.",
    "Review practical and legal considerations before changing official names or numbers."
  ];
}

function compatibleSet(value: number) {
  const n = reduceDisplayNumber(value);
  return Array.from(new Set([n, ((n + 2 - 1) % 9) + 1, ((n + 4 - 1) % 9) + 1]));
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
