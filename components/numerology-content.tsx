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
    guidance: "मार्गदर्शन"
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
    guidance: "Guidance"
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
  const coreNumbers = useMemo(() => report ? [report.moolank, report.lifePath, report.destiny, report.nameNumber, report.soulUrge, report.personality] : [], [report]);

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
                  {coreNumbers.map((item) => <NumberCard key={item.label} item={item} labels={lang} />)}
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <Card className="border-[#1e293b] bg-[#0f1c3a]/90">
                  <CardContent className="p-5">
                    <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{lang.loShu}</h2>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {report.loShuGrid.map((cell) => (
                        <div key={cell.number} className={`min-h-24 rounded-xl border p-3 text-center ${cell.present ? "border-[#dca956]/60 bg-[#0a1224]" : "border-[#1e293b] bg-[#020612]/72"}`}>
                          <div className="text-2xl font-black text-[#fbc02d]">{cell.number}</div>
                          <div className="mt-1 text-sm font-semibold text-white">x{cell.count}</div>
                          <p className="mt-2 text-xs leading-5 text-[#94a3b8]">{cell.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-5">
                  <InsightList title={lang.missing} empty={lang.noMissing} items={report.missingNumbers.map((item) => `${item.value}: ${item.meaning}`)} />
                  <InsightList title={lang.repeated} empty={lang.noRepeated} items={report.repeatedNumbers.map((item) => `${item.value} x${item.count}: ${item.meaning}`)} />
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                {report.mobileAnalysis ? <NumberCard item={report.mobileAnalysis} labels={lang} /> : null}
                {report.vehicleAnalysis ? <NumberCard item={report.vehicleAnalysis} labels={lang} /> : null}
                <Card className="border-[#1e293b] bg-[#0f1c3a]/90 md:col-span-2">
                  <CardContent className="p-5">
                    <h2 className="font-cinzel text-xl font-bold text-[#f3d382]">{lang.daily}: {report.dailyPrediction.personalDayNumber}</h2>
                    <p className="mt-3 text-sm leading-6 text-white">{report.dailyPrediction.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {report.dailyPrediction.focus.map((item) => <span key={item} className="rounded-full border border-[#1e293b] bg-[#0a1224] px-3 py-1 text-xs font-semibold text-[#00f5a0]">{item}</span>)}
                    </div>
                  </CardContent>
                </Card>
                <InsightList title={lang.remedies} items={report.remedies} />
              </section>

              <p className="rounded-2xl border border-[#1e293b] bg-[#0a1224]/86 p-4 text-sm leading-6 text-[#94a3b8]">{report.disclaimer}</p>
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

function NumberCard({ item, labels }: { item: NumerologyReport["moolank"]; labels: Record<string, string> }) {
  return (
    <Card className="border-[#1e293b] bg-[#0f1c3a]/90">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-cinzel text-lg font-bold text-white">{item.label}</h3>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dca956] text-xl font-black text-[#020612]">{item.value}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#94a3b8]">{item.meaning}</p>
        <p className="mt-4 text-sm font-semibold text-[#f3d382]">{labels.guidance}</p>
        <p className="mt-2 text-sm leading-6 text-white">{item.guidance}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TagGroup title={labels.strengths} items={item.strengths} tone="mint" />
          <TagGroup title={labels.growth} items={item.growthAreas} tone="gold" />
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
