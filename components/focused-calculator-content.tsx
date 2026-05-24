"use client";

import { useMemo, useRef, useState } from "react";
import type React from "react";
import Link from "next/link";
import { ArrowLeft, Car, CheckCircle2, Clock3, Loader2, MoonStar, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";
import { secureFetch } from "@/lib/security/csrf";
import { calculationFailed, calculateFocusedNumerology, localizedError, type FocusedCalculatorKind, type FocusedNumerologyResult } from "@/lib/focused-calculators";
import { cn } from "@/lib/utils";
import type { DashaPeriod, VimshottariDashaCalculation } from "@/lib/astrology/types";
import type { Locale } from "@/lib/i18n";

type AstroForm = {
  name: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
};

type NumberForm = {
  name: string;
  dateOfBirth: string;
  targetNumber: string;
  purpose: string;
};

type FieldErrors = Record<string, string | undefined>;

type FocusedAstroResult = {
  kind: "dasha" | "nakshatra";
  profile?: { name?: string; gender?: string };
  birthDetails?: { dateOfBirth?: string; timeOfBirth?: string; birthPlace?: string; timezone?: string };
  avakhada?: {
    moonSign?: string;
    ascendant?: string;
    nakshatra?: string;
    nakshatraIndex?: number;
    pada?: string | number;
    gana?: string;
    yoni?: string;
    nadi?: string;
  };
  dasha?: VimshottariDashaCalculation;
  dashaTimeline?: DashaPeriod[];
  nakshatraAnalysis?: string;
};

const defaultAstro: AstroForm = { name: "", gender: "", dateOfBirth: "", timeOfBirth: "", birthPlace: "" };
const defaultNumber: NumberForm = { name: "", dateOfBirth: "", targetNumber: "", purpose: "" };

export function FocusedCalculatorContent({ kind }: { kind: FocusedCalculatorKind }) {
  const { locale } = useLanguage();
  const labels = pageLabels(locale, kind);
  const isAstro = kind === "dasha" || kind === "nakshatra";
  const [astroForm, setAstroForm] = useState<AstroForm>(defaultAstro);
  const [numberForm, setNumberForm] = useState<NumberForm>(defaultNumber);
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [astroResult, setAstroResult] = useState<FocusedAstroResult | null>(null);
  const [numberResult, setNumberResult] = useState<FocusedNumerologyResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (isAstro) await submitAstro();
    else submitNumber();
  }

  async function submitAstro() {
    const nextErrors = validateAstro(astroForm, locale);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstInvalid();
      return;
    }
    setLoading(true);
    try {
      const resolved = location?.displayName === astroForm.birthPlace ? location : await resolveLocation(astroForm.birthPlace);
      if (!resolved) {
        const invalid = locationMessage(locale);
        setErrors({ birthPlace: invalid });
        setMessage(invalid);
        focusFirstInvalid();
        return;
      }
      setLocation(resolved);
      const response = await secureFetch("/api/focused-calculators/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: astroForm.name,
          gender: astroForm.gender,
          dateOfBirth: astroForm.dateOfBirth,
          timeOfBirth: astroForm.timeOfBirth,
          birthPlace: resolved.displayName,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          timezone: resolved.timezone ?? "Asia/Kolkata",
          language: locale
        })
      });
      const json = await response.json();
      if (!response.ok || !json.data) throw new Error("focused_calculation_failed");
      setAstroResult(json.data as FocusedAstroResult);
      setNumberResult(null);
      setErrors({});
    } catch {
      setMessage(calculationFailed(locale));
    } finally {
      setLoading(false);
    }
  }

  function submitNumber() {
    const nextErrors = validateNumber(numberForm, locale, kind);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstInvalid();
      return;
    }
    try {
      const result = calculateFocusedNumerology({
        kind: kind === "vehicle" ? "vehicle" : "mobile",
        name: numberForm.name,
        dateOfBirth: numberForm.dateOfBirth,
        targetNumber: numberForm.targetNumber,
        purpose: numberForm.purpose
      });
      setNumberResult(result);
      setAstroResult(null);
      setErrors({});
    } catch {
      setMessage(calculationFailed(locale));
    }
  }

  function focusFirstInvalid() {
    window.setTimeout(() => {
      const first = formRef.current?.querySelector<HTMLElement>("[data-invalid='true']");
      first?.focus();
    }, 0);
  }

  const Icon = kind === "dasha" ? Clock3 : kind === "nakshatra" ? MoonStar : kind === "vehicle" ? Car : Phone;

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">
                <Icon className="h-4 w-4" />
                {labels.eyebrow}
              </p>
              <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
            </div>
            <Button variant="outline" asChild className="w-fit">
              <Link href="/free-calculators"><ArrowLeft className="mr-2 h-4 w-4" />{labels.back}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="inner-card">
            <CardContent className="p-6">
              <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{labels.whatShows}</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#a8b3c7]">
                {labels.highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#00f5a0]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl border border-[#263957] bg-[#142647]/60 p-4">
                <p className="text-sm font-semibold text-[#f3d382]">{labels.requiredDetails}</p>
                <p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{labels.requiredCopy}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="inner-card">
            <CardContent className="p-6">
              <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{labels.formTitle}</h2>
              <form ref={formRef} onSubmit={onSubmit} className="mt-5 grid gap-4">
                {isAstro ? (
                  <AstroFields
                    values={astroForm}
                    errors={errors}
                    labels={labels}
                    onChange={(field, value) => {
                      setAstroForm((current) => ({ ...current, [field]: value }));
                      if (field === "birthPlace") setLocation(null);
                      setErrors((current) => ({ ...current, [field]: undefined }));
                    }}
                    onResolvedLocation={(next) => {
                      setLocation(next);
                      setErrors((current) => ({ ...current, birthPlace: undefined }));
                    }}
                  />
                ) : (
                  <NumberFields
                    values={numberForm}
                    errors={errors}
                    labels={labels}
                    kind={kind}
                    onChange={(field, value) => {
                      setNumberForm((current) => ({ ...current, [field]: value }));
                      setErrors((current) => ({ ...current, [field]: undefined }));
                    }}
                  />
                )}
                {message ? <p className="rounded-xl border border-[#ef4444]/35 bg-[#ef4444]/10 p-3 text-sm text-[#fecaca]">{message}</p> : null}
                <Button type="submit" disabled={loading} className="bg-[#009b72] text-white hover:bg-[#008766]">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {labels.calculate}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          {astroResult ? <AstroResultView result={astroResult} locale={locale} kind={kind as "dasha" | "nakshatra"} /> : null}
          {numberResult ? <NumberResultView result={numberResult} locale={locale} /> : null}
        </div>

        <ReportCta locale={locale} kind={kind} visible={Boolean(astroResult || numberResult)} />
        <Disclaimer locale={locale} kind={kind} />
      </Section>
    </main>
  );
}

function AstroFields({ values, errors, labels, onChange, onResolvedLocation }: {
  values: AstroForm;
  errors: FieldErrors;
  labels: ReturnType<typeof pageLabels>;
  onChange: (field: keyof AstroForm, value: string) => void;
  onResolvedLocation: (location: ResolvedLocation | null) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={labels.fullName} error={errors.name}><Input data-invalid={Boolean(errors.name)} value={values.name} onChange={(event) => onChange("name", event.target.value)} className={fieldClass(errors.name)} /></Field>
      <Field label={labels.gender} error={errors.gender}>
        <select data-invalid={Boolean(errors.gender)} value={values.gender} onChange={(event) => onChange("gender", event.target.value)} className={fieldClass(errors.gender)}>
          <option value="">{labels.selectGender}</option>
          <option value="Male">{labels.male}</option>
          <option value="Female">{labels.female}</option>
          <option value="Prefer not to say">{labels.preferNot}</option>
        </select>
      </Field>
      <Field label={labels.dateOfBirth} error={errors.dateOfBirth}><Input data-invalid={Boolean(errors.dateOfBirth)} type="date" value={values.dateOfBirth} onChange={(event) => onChange("dateOfBirth", event.target.value)} className={fieldClass(errors.dateOfBirth)} /></Field>
      <Field label={labels.timeOfBirth} error={errors.timeOfBirth}><Input data-invalid={Boolean(errors.timeOfBirth)} type="time" value={values.timeOfBirth} onChange={(event) => onChange("timeOfBirth", event.target.value)} className={fieldClass(errors.timeOfBirth)} /></Field>
      <div className="md:col-span-2">
        <LocationAutocomplete value={values.birthPlace} onChange={(value) => onChange("birthPlace", value)} onResolvedLocation={onResolvedLocation} label={labels.birthPlace} required dataField="birthPlace" error={errors.birthPlace} placeholder={labels.birthPlacePlaceholder} />
      </div>
    </div>
  );
}

function NumberFields({ values, errors, labels, kind, onChange }: {
  values: NumberForm;
  errors: FieldErrors;
  labels: ReturnType<typeof pageLabels>;
  kind: FocusedCalculatorKind;
  onChange: (field: keyof NumberForm, value: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={labels.fullName} error={errors.name}><Input data-invalid={Boolean(errors.name)} value={values.name} onChange={(event) => onChange("name", event.target.value)} className={fieldClass(errors.name)} /></Field>
      <Field label={labels.dateOfBirth} error={errors.dateOfBirth}><Input data-invalid={Boolean(errors.dateOfBirth)} type="date" value={values.dateOfBirth} onChange={(event) => onChange("dateOfBirth", event.target.value)} className={fieldClass(errors.dateOfBirth)} /></Field>
      <Field label={kind === "vehicle" ? labels.vehicleNumber : labels.mobileNumber} error={errors.targetNumber}><Input data-invalid={Boolean(errors.targetNumber)} value={values.targetNumber} onChange={(event) => onChange("targetNumber", event.target.value)} className={fieldClass(errors.targetNumber)} placeholder={kind === "vehicle" ? "DL01AB1234" : "9876543210"} /></Field>
      <Field label={kind === "vehicle" ? labels.vehiclePurpose : labels.usagePurpose} required={false}>
        <select value={values.purpose} onChange={(event) => onChange("purpose", event.target.value)} className={fieldClass(undefined)}>
          <option value="">{labels.optional}</option>
          {(kind === "vehicle" ? labels.vehiclePurposes : labels.mobilePurposes).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </Field>
    </div>
  );
}

function Field({ label, error, children, required = true }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white">
      <span>{label}{required ? <span className="ml-1 text-[#ef4444]">*</span> : null}</span>
      {children}
      {error ? <span className="text-xs font-medium text-[#fecaca]">{error}</span> : null}
    </label>
  );
}

function AstroResultView({ result, locale, kind }: { result: FocusedAstroResult; locale: Locale; kind: "dasha" | "nakshatra" }) {
  return kind === "dasha" ? <DashaResult result={result} locale={locale} /> : <NakshatraResult result={result} locale={locale} />;
}

function DashaResult({ result, locale }: { result: FocusedAstroResult; locale: Locale }) {
  const labels = resultLabels(locale);
  const dasha = result.dasha;
  const current = dasha?.currentMahadasha;
  const currentAntar = dasha?.currentAntardasha;
  const nextAntar = useMemo(() => {
    if (!currentAntar || !dasha?.currentAntardashas?.length) return undefined;
    const index = dasha.currentAntardashas.findIndex((item) => item.planet === currentAntar.planet && item.startsAt === currentAntar.startsAt);
    return index >= 0 ? dasha.currentAntardashas[index + 1] : undefined;
  }, [currentAntar, dasha]);

  if (!dasha?.available || !current) return <EmptyResult locale={locale} />;

  return (
    <ResultShell title={labels.dashaResult}>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label={labels.currentMahadasha} value={current.planet} />
        <Metric label={labels.currentAntardasha} value={currentAntar?.planet ?? labels.notAvailable} />
        <Metric label={labels.currentStatus} value={labels.activePeriod} />
        <Metric label={labels.dateRange} value={current.period ?? `${current.startsAt} - ${current.endsAt}`} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoBlock title={labels.dashaTimeline} items={[
          `${labels.currentMahadasha}: ${current.planet} (${current.startsAt} - ${current.endsAt})`,
          `${labels.currentAntardasha}: ${currentAntar ? `${currentAntar.planet} (${currentAntar.startsAt} - ${currentAntar.endsAt})` : labels.notAvailable}`,
          `${labels.nextAntardasha}: ${nextAntar ? `${nextAntar.planet} (${nextAntar.startsAt} - ${nextAntar.endsAt})` : labels.notAvailable}`
        ]} />
        <InfoBlock title={labels.dashaMeaning} items={dashaMeaning(current.planet, currentAntar?.planet, locale)} />
      </div>
      <InfoBlock title={labels.practicalGuidance} items={dashaGuidance(locale)} />
    </ResultShell>
  );
}

function NakshatraResult({ result, locale }: { result: FocusedAstroResult; locale: Locale }) {
  const labels = resultLabels(locale);
  const avakhada = result.avakhada;
  if (!avakhada?.nakshatra) return <EmptyResult locale={locale} />;
  return (
    <ResultShell title={labels.nakshatraResult}>
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label={labels.nakshatra} value={`${avakhada.nakshatra}${avakhada.nakshatraIndex ? ` (${avakhada.nakshatraIndex})` : ""}`} />
        <Metric label={labels.pada} value={String(avakhada.pada ?? labels.notAvailable)} />
        <Metric label={labels.moonSign} value={avakhada.moonSign ?? labels.notAvailable} />
        <Metric label={labels.nakshatraLord} value={nakshatraLord(avakhada.nakshatra) ?? labels.notAvailable} />
        <Metric label={labels.ganaNadi} value={[avakhada.gana, avakhada.nadi].filter(Boolean).join(" / ") || labels.notAvailable} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoBlock title={labels.nakshatraNature} items={nakshatraNature(avakhada.nakshatra, locale)} />
        <InfoBlock title={labels.lifeGuidance} items={nakshatraGuidance(avakhada.nakshatra, avakhada.moonSign, locale)} />
      </div>
      <InfoBlock title={labels.practicalSuggestions} items={nakshatraSuggestions(locale)} />
    </ResultShell>
  );
}

function NumberResultView({ result, locale }: { result: FocusedNumerologyResult; locale: Locale }) {
  const labels = resultLabels(locale);
  const isVehicle = result.kind === "vehicle";
  return (
    <ResultShell title={isVehicle ? labels.vehicleResult : labels.mobileResult}>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label={isVehicle ? labels.vehicleNumber : labels.mobileNumber} value={result.targetNumber} />
        <Metric label={labels.numberTotal} value={String(result.rawTotal)} />
        <Metric label={labels.reducedNumber} value={String(result.reducedNumber)} />
        <Metric label={labels.verdict} value={verdictText(result.verdict, locale)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoBlock title={labels.personalCompatibility} items={[
          relationLine(labels.moolank, result.moolank, result.reducedNumber, locale),
          relationLine(labels.bhagyank, result.bhagyank, result.reducedNumber, locale),
          relationLine(labels.naamank, result.naamank, result.reducedNumber, locale),
          loshuLine(result, locale)
        ]} />
        <InfoBlock title={isVehicle ? labels.vehicleEnergy : labels.communicationEnergy} items={isVehicle ? vehicleEnergy(result, locale) : mobileEnergy(result, locale)} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoBlock title={labels.cautions} items={numberCautions(result, locale)} />
        <InfoBlock title={labels.suggestedInfluences} items={[
          `${labels.supportiveNumbers}: ${formatNumbers(result.supportiveNumbers)}`,
          `${labels.neutralNumbers}: ${formatNumbers(result.neutralNumbers)}`,
          `${labels.carefulNumbers}: ${formatNumbers(result.carefulNumbers)}`
        ]} />
      </div>
    </ResultShell>
  );
}

function ResultShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="inner-card border-[#00f5a0]/25">
      <CardContent className="grid gap-6 p-6">
        <h2 className="font-cinzel text-2xl font-black text-[#f3d382]">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#263957] bg-[#142647]/72 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8b3c7]">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value || "-"}</p>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-[#263957] bg-[#111f3a]/80 p-5">
      <h3 className="font-cinzel text-lg font-bold text-[#f3d382]">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#a8b3c7]">
        {items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f5a0]" />{item}</li>)}
      </ul>
    </div>
  );
}

function ReportCta({ locale, kind, visible }: { locale: Locale; kind: FocusedCalculatorKind; visible: boolean }) {
  if (!visible) return null;
  const labels = resultLabels(locale);
  const href = kind === "dasha" || kind === "nakshatra" ? "/reports/premium-kundli" : "/reports/numerology-lo-shu-report";
  return (
    <div className="mt-8 rounded-3xl border border-[#dca956]/30 bg-[#dca956]/10 p-6">
      <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{kind === "dasha" ? labels.deeperTiming : kind === "nakshatra" ? labels.fullBirthChart : labels.deeperNumbers}</h2>
      <p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{labels.reportCtaCopy}</p>
      <Button asChild className="mt-5 bg-[#009b72] text-white hover:bg-[#008766]">
        <Link href={href}>{kind === "dasha" || kind === "nakshatra" ? labels.premiumKundliReport : labels.numerologyReport}</Link>
      </Button>
    </div>
  );
}

function Disclaimer({ locale, kind }: { locale: Locale; kind: FocusedCalculatorKind }) {
  const labels = resultLabels(locale);
  return <p className="mt-8 rounded-2xl border border-[#263957] bg-[#111f3a]/70 p-4 text-sm leading-6 text-[#a8b3c7]">{kind === "vehicle" ? labels.vehicleDisclaimer : kind === "mobile" ? labels.mobileDisclaimer : labels.astroDisclaimer}</p>;
}

function EmptyResult({ locale }: { locale: Locale }) {
  return <p className="rounded-2xl border border-[#ef4444]/35 bg-[#ef4444]/10 p-4 text-sm text-[#fecaca]">{calculationFailed(locale)}</p>;
}

async function resolveLocation(query: string): Promise<ResolvedLocation | null> {
  try {
    const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } });
    const json = await response.json();
    return Array.isArray(json.data?.suggestions) ? json.data.suggestions[0] ?? null : null;
  } catch {
    return null;
  }
}

function validateAstro(values: AstroForm, locale: Locale): FieldErrors {
  const required = localizedError(locale);
  const errors: FieldErrors = {};
  (["name", "gender", "dateOfBirth", "timeOfBirth", "birthPlace"] as const).forEach((field) => {
    if (!values[field].trim()) errors[field] = required;
  });
  return errors;
}

function validateNumber(values: NumberForm, locale: Locale, kind: FocusedCalculatorKind): FieldErrors {
  const required = localizedError(locale);
  const errors: FieldErrors = {};
  (["name", "dateOfBirth", "targetNumber"] as const).forEach((field) => {
    if (!values[field].trim()) errors[field] = required;
  });
  if (kind === "mobile" && values.targetNumber.trim() && values.targetNumber.replace(/\D/g, "").length < 8) errors.targetNumber = invalidNumber(locale);
  if (kind === "vehicle" && values.targetNumber.trim() && !/[A-Za-z0-9]/.test(values.targetNumber)) errors.targetNumber = invalidNumber(locale);
  return errors;
}

function fieldClass(error?: string) {
  return cn("w-full rounded-md border bg-[#07111f]/80 px-3 text-white outline-none", error ? "border-[#ef4444] focus-visible:ring-[#ef4444]/40" : "border-[#263957] focus-visible:border-[#dca956]/70 focus-visible:ring-[#00f5a0]/30");
}

function invalidNumber(locale: Locale) {
  if (locale === "hi") return "कृपया सही नंबर दर्ज करें।";
  if (locale === "hinglish") return "Please sahi number enter karein.";
  return "Please enter a valid number.";
}

function locationMessage(locale: Locale) {
  if (locale === "hi") return "कृपया जन्म स्थान सुझाव से चुनें या शहर और देश लिखकर फिर प्रयास करें।";
  if (locale === "hinglish") return "Birth place suggestion se select karein ya city, country likhkar fir try karein.";
  return "Please select a birth location from suggestions or enter city and country, then try again.";
}

function formatNumbers(values: number[]) {
  return values.length ? values.join(", ") : "-";
}

function relationLine(label: string, personal: number, target: number, locale: Locale) {
  if (personal === target) {
    if (locale === "hi") return `${label} ${personal} इस नंबर से सीधा सहयोग दिखाता है।`;
    if (locale === "hinglish") return `${label} ${personal} is number ke saath direct support dikhata hai.`;
    return `${label} ${personal} shows direct support with this number.`;
  }
  if (locale === "hi") return `${label} ${personal} और यह नंबर ${target} को संतुलित रूप से देखना चाहिए।`;
  if (locale === "hinglish") return `${label} ${personal} aur ye number ${target} ko balanced way mein review karein.`;
  return `${label} ${personal} and this number ${target} should be reviewed as a balanced influence.`;
}

function loshuLine(result: FocusedNumerologyResult, locale: Locale) {
  if (result.loshuSupport.missingSupported.length) {
    const nums = formatNumbers(result.loshuSupport.missingSupported);
    if (locale === "hi") return `यह नंबर लो शू में अनुपस्थित ${nums} अंक को सहयोग दे सकता है।`;
    if (locale === "hinglish") return `Ye number Lo Shu missing ${nums} ko support kar sakta hai.`;
    return `This number may support missing Lo Shu number(s) ${nums}.`;
  }
  if (locale === "hi") return "लो शू missing pattern के साथ इसका प्रभाव तटस्थ है।";
  if (locale === "hinglish") return "Lo Shu missing pattern ke saath iska influence neutral hai.";
  return "Its influence is neutral with the Lo Shu missing-number pattern.";
}

function vehicleEnergy(result: FocusedNumerologyResult, locale: Locale) {
  if (locale === "hi") return [
    `वाहन नंबर ${result.reducedNumber} यात्रा और movement energy को reflective तरीके से दिखाता है।`,
    "सुरक्षा, अनुशासन, दस्तावेज़ और vehicle maintenance हमेशा practical priority रहें।",
    result.purpose ? `Usage purpose: ${result.purpose}. इसे practical need के साथ देखें।` : "Personal या business usage के अनुसार number influence को context में समझें।"
  ];
  if (locale === "hinglish") return [
    `Vehicle number ${result.reducedNumber} movement aur travel energy ka reflective signal deta hai.`,
    "Safety, discipline, documents aur vehicle maintenance hamesha practical priority rahenge.",
    result.purpose ? `Usage purpose: ${result.purpose}. Isko practical need ke saath dekhein.` : "Personal ya business usage ke context mein number influence review karein."
  ];
  return [
    `Vehicle number ${result.reducedNumber} is a reflective signal for movement and travel energy.`,
    "Safety, discipline, documentation, and vehicle maintenance remain practical priorities.",
    result.purpose ? `Usage purpose: ${result.purpose}. Review the number with that practical need in mind.` : "Review the influence in the context of personal or business usage."
  ];
}

function mobileEnergy(result: FocusedNumerologyResult, locale: Locale) {
  if (locale === "hi") return [
    `मोबाइल नंबर ${result.reducedNumber} communication और networking energy को reflective तरीके से दिखाता है।`,
    "Career, family और personal communication में clarity और boundaries helpful रहेंगी।",
    result.purpose ? `Usage purpose: ${result.purpose}. इसे उसी context में पढ़ें।` : "Personal या business use के अनुसार number influence को context में समझें।"
  ];
  if (locale === "hinglish") return [
    `Mobile number ${result.reducedNumber} communication aur networking energy ka reflective signal deta hai.`,
    "Career, family aur personal communication mein clarity aur boundaries helpful rahengi.",
    result.purpose ? `Usage purpose: ${result.purpose}. Isko usi context mein read karein.` : "Personal ya business use ke context mein number influence review karein."
  ];
  return [
    `Mobile number ${result.reducedNumber} is a reflective signal for communication and networking energy.`,
    "Clarity and boundaries are helpful in career, family, and personal communication.",
    result.purpose ? `Usage purpose: ${result.purpose}. Read this number within that context.` : "Review the influence in the context of personal or business use."
  ];
}

function numberCautions(result: FocusedNumerologyResult, locale: Locale) {
  const repeated = result.loshuSupport.overactiveRepeated;
  if (locale === "hi") return [
    repeated.length ? `यह नंबर पहले से दोहराए गए ${formatNumbers(repeated)} प्रभाव को और बढ़ा सकता है, इसलिए संतुलन रखें।` : "कोई बड़ा overactive repeat concern स्पष्ट नहीं दिखता।",
    "किसी नंबर को बदलना जरूरी नहीं है; future choices में supportive influence consider किया जा सकता है।"
  ];
  if (locale === "hinglish") return [
    repeated.length ? `Ye number already repeated ${formatNumbers(repeated)} influence ko badha sakta hai, isliye balance rakhein.` : "Koi major overactive repeat concern clearly nahi dikhta.",
    "Number change karna zaroori nahi hai; future choices mein supportive influence consider kiya ja sakta hai."
  ];
  return [
    repeated.length ? `This number may increase already repeated ${formatNumbers(repeated)} influence, so balance it consciously.` : "No major overactive repeated-number concern is clearly visible.",
    "Changing a number is not required; supportive influence can be considered in future choices."
  ];
}

function verdictText(verdict: FocusedNumerologyResult["verdict"], locale: Locale) {
  const map = {
    en: { supportive: "Supportive", neutral: "Neutral", needsBalance: "Needs Balance" },
    hi: { supportive: "सहयोगी", neutral: "तटस्थ", needsBalance: "संतुलन आवश्यक" },
    hinglish: { supportive: "Supportive", neutral: "Neutral", needsBalance: "Balance Needed" }
  };
  return map[locale][verdict];
}

function dashaMeaning(mahadasha: string, antardasha: string | undefined, locale: Locale) {
  if (locale === "hi") return [
    `${mahadasha} महादशा जीवन के मुख्य theme को दिखाती है और ${antardasha ?? "current"} अंतर्दशा daily focus को refine करती है।`,
    "Career और work में धैर्य, skill-building और timing awareness helpful रहेंगे।",
    "Relationship और family decisions को calm communication और practical responsibility के साथ लें।",
    "Money matters में discipline, planning और impulsive commitments से बचना बेहतर है।"
  ];
  if (locale === "hinglish") return [
    `${mahadasha} Mahadasha life ka main theme dikhati hai aur ${antardasha ?? "current"} Antardasha daily focus ko refine karti hai.`,
    "Career aur work mein patience, skill-building aur timing awareness helpful rahenge.",
    "Relationship aur family decisions calm communication aur practical responsibility ke saath lein.",
    "Money matters mein discipline, planning aur impulsive commitments se bachna better hai."
  ];
  return [
    `${mahadasha} Mahadasha shows the main life theme, while ${antardasha ?? "the current"} Antardasha refines the daily focus.`,
    "Career and work benefit from patience, skill-building, and timing awareness.",
    "Relationship and family decisions are best handled with calm communication and practical responsibility.",
    "Money matters call for discipline, planning, and avoiding impulsive commitments."
  ];
}

function dashaGuidance(locale: Locale) {
  if (locale === "hi") return ["डर के आधार पर निर्णय न लें।", "एक समय में एक priority पर steady action रखें।", "महत्वपूर्ण विवाह, करियर या वित्त निर्णयों के लिए full Kundli, Dasha और transit को साथ में देखें।"];
  if (locale === "hinglish") return ["Fear ke basis par decisions na lein.", "Ek time par ek priority par steady action rakhein.", "Important marriage, career ya finance decisions ke liye full Kundli, Dasha aur transit ko saath mein review karein."];
  return ["Do not make decisions from fear.", "Keep steady action on one priority at a time.", "For major marriage, career, or finance decisions, review the full Kundli, Dasha, and transit together."];
}

function nakshatraNature(nakshatra: string, locale: Locale) {
  if (locale === "hi") return [`${nakshatra} नक्षत्र instinct, emotional rhythm और response style का संकेत देता है।`, "इसे fixed label की तरह नहीं, बल्कि self-reflection tool की तरह देखें।", "Strengths और challenges को Moon sign, Lagna और full Kundli context के साथ समझना बेहतर है।"];
  if (locale === "hinglish") return [`${nakshatra} nakshatra instinct, emotional rhythm aur response style ka signal deta hai.`, "Isse fixed label ki tarah nahi, self-reflection tool ki tarah dekhein.", "Strengths aur challenges ko Moon sign, Lagna aur full Kundli context ke saath samajhna better hai."];
  return [`${nakshatra} Nakshatra indicates instinct, emotional rhythm, and response style.`, "Use it as a self-reflection tool, not a fixed label.", "Strengths and challenges are best understood with Moon sign, Lagna, and full Kundli context."];
}

function nakshatraGuidance(nakshatra: string, moonSign: string | undefined, locale: Locale) {
  if (locale === "hi") return [`${moonSign ?? "Moon sign"} और ${nakshatra} मिलकर emotional pattern और work rhythm को समझने में मदद करते हैं।`, "Career में natural rhythm, patience और right environment पर ध्यान दें।", "Relationships में listening, timing और emotional clarity helpful रहेंगी।"];
  if (locale === "hinglish") return [`${moonSign ?? "Moon sign"} aur ${nakshatra} milkar emotional pattern aur work rhythm samajhne mein help karte hain.`, "Career mein natural rhythm, patience aur right environment par dhyan dein.", "Relationships mein listening, timing aur emotional clarity helpful rahengi."];
  return [`${moonSign ?? "Moon sign"} and ${nakshatra} together help read emotional pattern and work rhythm.`, "Career growth benefits from honoring natural rhythm, patience, and the right environment.", "Relationships benefit from listening, timing, and emotional clarity."];
}

function nakshatraSuggestions(locale: Locale) {
  if (locale === "hi") return ["Daily routine में grounding practices रखें।", "जल्दबाजी के बजाय observation और right timing पर भरोसा करें।", "Deeper accuracy के लिए full birth chart, Dasha और Chalit context देखें।"];
  if (locale === "hinglish") return ["Daily routine mein grounding practices rakhein.", "Rush ke bajay observation aur right timing par trust karein.", "Deeper accuracy ke liye full birth chart, Dasha aur Chalit context dekhein."];
  return ["Keep grounding practices in the daily routine.", "Trust observation and right timing instead of rushing.", "For deeper accuracy, review the full birth chart, Dasha, and Chalit context."];
}

function nakshatraLord(nakshatra: string | undefined) {
  if (!nakshatra) return undefined;
  const order = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const names = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
  const index = names.findIndex((item) => item.toLowerCase() === nakshatra.toLowerCase());
  return index >= 0 ? order[index % order.length] : undefined;
}

function pageLabels(locale: Locale, kind: FocusedCalculatorKind) {
  const all = {
    en: {
      eyebrow: "Focused Calculator",
      back: "Back to Free Calculators",
      fullName: "Full Name",
      gender: "Gender",
      selectGender: "Select gender",
      male: "Male",
      female: "Female",
      preferNot: "Prefer not to say",
      dateOfBirth: "Date of Birth",
      timeOfBirth: "Time of Birth",
      birthPlace: "Birth Place",
      birthPlacePlaceholder: "Search city, country",
      vehicleNumber: "Vehicle Number",
      mobileNumber: "Mobile Number",
      vehiclePurpose: "Vehicle Type / Usage Purpose",
      usagePurpose: "Usage Purpose",
      optional: "Optional",
      vehiclePurposes: ["Personal", "Business", "Travel", "Family"],
      mobilePurposes: ["Personal", "Business", "Career", "Family"],
      whatShows: "What this calculator shows",
      requiredDetails: "Required details",
      formTitle: "Enter details",
      calculate: "Calculate",
      dasha: {
        title: "Free Dasha Calculator",
        subtitle: "Calculate focused Vimshottari Mahadasha and Antardasha guidance using complete birth details.",
        required: "Full name, gender, date of birth, exact birth time, and birth place.",
        highlights: ["Current Mahadasha and Antardasha", "Current and next timing period", "Focused practical Dasha guidance"]
      },
      nakshatra: {
        title: "Free Nakshatra Calculator",
        subtitle: "Find your birth Nakshatra, Pada, Moon sign, and focused personality guidance.",
        required: "Full name, gender, date of birth, exact birth time, and birth place.",
        highlights: ["Birth Nakshatra and index", "Pada, Moon sign, and Nakshatra lord", "Nature, strengths, challenges, and practical suggestions"]
      },
      vehicle: {
        title: "Vehicle Number Numerology Calculator",
        subtitle: "Check vehicle number compatibility with your Moolank, Bhagyank, Naamank, and Lo Shu pattern.",
        required: "Full name, date of birth, and vehicle number.",
        highlights: ["Vehicle number total and reduced number", "Compatibility with personal numbers", "Supportive and careful number influences"]
      },
      mobile: {
        title: "Mobile Number Numerology Calculator",
        subtitle: "Check mobile number compatibility with your name, date of birth, and Lo Shu pattern.",
        required: "Full name, date of birth, and mobile number.",
        highlights: ["Mobile number total and reduced number", "Communication energy and compatibility", "Supportive and careful number influences"]
      }
    },
    hi: {
      eyebrow: "Focused Calculator",
      back: "मुफ़्त कैलकुलेटर पर वापस",
      fullName: "पूरा नाम",
      gender: "लिंग",
      selectGender: "लिंग चुनें",
      male: "पुरुष",
      female: "महिला",
      preferNot: "न बताना चाहें",
      dateOfBirth: "जन्म तिथि",
      timeOfBirth: "जन्म समय",
      birthPlace: "जन्म स्थान",
      birthPlacePlaceholder: "शहर, देश खोजें",
      vehicleNumber: "वाहन नंबर",
      mobileNumber: "मोबाइल नंबर",
      vehiclePurpose: "वाहन प्रकार / उपयोग उद्देश्य",
      usagePurpose: "उपयोग उद्देश्य",
      optional: "वैकल्पिक",
      vehiclePurposes: ["Personal", "Business", "Travel", "Family"],
      mobilePurposes: ["Personal", "Business", "Career", "Family"],
      whatShows: "यह कैलकुलेटर क्या दिखाता है",
      requiredDetails: "आवश्यक विवरण",
      formTitle: "विवरण दर्ज करें",
      calculate: "गणना करें",
      dasha: {
        title: "मुफ़्त दशा कैलकुलेटर",
        subtitle: "पूर्ण जन्म विवरण से Vimshottari महादशा और अंतर्दशा का focused guidance देखें।",
        required: "पूरा नाम, लिंग, जन्म तिथि, सही जन्म समय और जन्म स्थान।",
        highlights: ["वर्तमान महादशा और अंतर्दशा", "वर्तमान और अगली timing period", "Focused practical दशा guidance"]
      },
      nakshatra: {
        title: "मुफ़्त नक्षत्र कैलकुलेटर",
        subtitle: "अपना जन्म नक्षत्र, पाद, चंद्र राशि और focused personality guidance देखें।",
        required: "पूरा नाम, लिंग, जन्म तिथि, सही जन्म समय और जन्म स्थान।",
        highlights: ["जन्म नक्षत्र और index", "पाद, चंद्र राशि और नक्षत्र स्वामी", "स्वभाव, strengths, challenges और practical suggestions"]
      },
      vehicle: {
        title: "वाहन नंबर अंक ज्योतिष कैलकुलेटर",
        subtitle: "वाहन नंबर को मूलांक, भाग्यांक, नामांक और लो शू pattern के साथ देखें।",
        required: "पूरा नाम, जन्म तिथि और वाहन नंबर।",
        highlights: ["वाहन नंबर total और reduced number", "Personal numbers के साथ compatibility", "Supportive और careful number influences"]
      },
      mobile: {
        title: "मोबाइल नंबर अंक ज्योतिष कैलकुलेटर",
        subtitle: "मोबाइल नंबर को नाम, जन्म तिथि और लो शू pattern के साथ देखें।",
        required: "पूरा नाम, जन्म तिथि और मोबाइल नंबर।",
        highlights: ["मोबाइल नंबर total और reduced number", "Communication energy और compatibility", "Supportive और careful number influences"]
      }
    },
    hinglish: {
      eyebrow: "Focused Calculator",
      back: "Back to Free Calculators",
      fullName: "Full Name",
      gender: "Gender",
      selectGender: "Gender select karein",
      male: "Male",
      female: "Female",
      preferNot: "Prefer not to say",
      dateOfBirth: "Date of Birth",
      timeOfBirth: "Time of Birth",
      birthPlace: "Birth Place",
      birthPlacePlaceholder: "City, country search karein",
      vehicleNumber: "Vehicle Number",
      mobileNumber: "Mobile Number",
      vehiclePurpose: "Vehicle Type / Usage Purpose",
      usagePurpose: "Usage Purpose",
      optional: "Optional",
      vehiclePurposes: ["Personal", "Business", "Travel", "Family"],
      mobilePurposes: ["Personal", "Business", "Career", "Family"],
      whatShows: "Ye calculator kya dikhata hai",
      requiredDetails: "Required details",
      formTitle: "Details enter karein",
      calculate: "Calculate",
      dasha: {
        title: "Free Dasha Calculator",
        subtitle: "Complete birth details se Vimshottari Mahadasha aur Antardasha focused guidance calculate karein.",
        required: "Full name, gender, DOB, exact birth time aur birth place.",
        highlights: ["Current Mahadasha aur Antardasha", "Current aur next timing period", "Focused practical Dasha guidance"]
      },
      nakshatra: {
        title: "Free Nakshatra Calculator",
        subtitle: "Apna birth Nakshatra, Pada, Moon sign aur focused personality guidance dekhein.",
        required: "Full name, gender, DOB, exact birth time aur birth place.",
        highlights: ["Birth Nakshatra aur index", "Pada, Moon sign aur Nakshatra lord", "Nature, strengths, challenges aur practical suggestions"]
      },
      vehicle: {
        title: "Vehicle Number Numerology Calculator",
        subtitle: "Vehicle number ko Moolank, Bhagyank, Naamank aur Lo Shu pattern ke saath check karein.",
        required: "Full name, DOB aur vehicle number.",
        highlights: ["Vehicle number total aur reduced number", "Personal numbers ke saath compatibility", "Supportive aur careful number influences"]
      },
      mobile: {
        title: "Mobile Number Numerology Calculator",
        subtitle: "Mobile number ko name, DOB aur Lo Shu pattern ke saath check karein.",
        required: "Full name, DOB aur mobile number.",
        highlights: ["Mobile number total aur reduced number", "Communication energy aur compatibility", "Supportive aur careful number influences"]
      }
    }
  }[locale];
  const specific = all[kind];
  return { ...all, title: specific.title, subtitle: specific.subtitle, requiredCopy: specific.required, highlights: specific.highlights };
}

function resultLabels(locale: Locale) {
  if (locale === "hi") {
    return {
      dashaResult: "दशा परिणाम", nakshatraResult: "नक्षत्र परिणाम", vehicleResult: "वाहन नंबर परिणाम", mobileResult: "मोबाइल नंबर परिणाम",
      currentMahadasha: "वर्तमान महादशा", currentAntardasha: "वर्तमान अंतर्दशा", currentStatus: "स्थिति", activePeriod: "सक्रिय", dateRange: "अवधि", dashaTimeline: "दशा टाइमलाइन", nextAntardasha: "अगली अंतर्दशा", dashaMeaning: "दशा अर्थ", practicalGuidance: "व्यावहारिक मार्गदर्शन",
      nakshatra: "नक्षत्र", pada: "पाद", moonSign: "चंद्र राशि", nakshatraLord: "नक्षत्र स्वामी", ganaNadi: "गण / नाड़ी", nakshatraNature: "नक्षत्र स्वभाव", lifeGuidance: "जीवन मार्गदर्शन", practicalSuggestions: "व्यावहारिक सुझाव",
      vehicleNumber: "वाहन नंबर", mobileNumber: "मोबाइल नंबर", numberTotal: "कुल योग", reducedNumber: "Reduced Number", verdict: "Verdict", personalCompatibility: "Personal Numbers Compatibility", moolank: "मूलांक", bhagyank: "भाग्यांक", naamank: "नामांक", vehicleEnergy: "वाहन ऊर्जा", communicationEnergy: "Communication Energy", cautions: "सावधानियां", suggestedInfluences: "Suggested Compatible Number Influences", supportiveNumbers: "Supportive Numbers", neutralNumbers: "Neutral Numbers", carefulNumbers: "Balance Carefully",
      deeperTiming: "गहरी timing analysis चाहिए?", fullBirthChart: "Full birth chart analysis चाहिए?", deeperNumbers: "Full numerology और Lo Shu guidance चाहिए?", reportCtaCopy: "गहरी व्यक्तिगत मार्गदर्शन के लिए संबंधित प्रीमियम रिपोर्ट देखें।", premiumKundliReport: "Premium Kundli Report देखें", numerologyReport: "Numerology + Lo Shu Report देखें",
      astroDisclaimer: "यह कैलकुलेटर चिंतनात्मक ज्योतिष मार्गदर्शन देता है। यह medical, legal, financial या professional advice का विकल्प नहीं है।", vehicleDisclaimer: "Numerology safe driving, legal compliance, insurance या vehicle maintenance का विकल्प नहीं है।", mobileDisclaimer: "Numerology communication guidance के लिए reflective tool है और success या wealth की guarantee नहीं देता।", notAvailable: "उपलब्ध नहीं"
    };
  }
  if (locale === "hinglish") {
    return {
      dashaResult: "Dasha Result", nakshatraResult: "Nakshatra Result", vehicleResult: "Vehicle Number Result", mobileResult: "Mobile Number Result",
      currentMahadasha: "Current Mahadasha", currentAntardasha: "Current Antardasha", currentStatus: "Status", activePeriod: "Active", dateRange: "Date Range", dashaTimeline: "Dasha Timeline", nextAntardasha: "Next Antardasha", dashaMeaning: "Dasha Meaning", practicalGuidance: "Practical Guidance",
      nakshatra: "Nakshatra", pada: "Pada", moonSign: "Moon Sign", nakshatraLord: "Nakshatra Lord", ganaNadi: "Gana / Nadi", nakshatraNature: "Nakshatra Nature", lifeGuidance: "Life Guidance", practicalSuggestions: "Practical Suggestions",
      vehicleNumber: "Vehicle Number", mobileNumber: "Mobile Number", numberTotal: "Number Total", reducedNumber: "Reduced Number", verdict: "Verdict", personalCompatibility: "Personal Numbers Compatibility", moolank: "Moolank", bhagyank: "Bhagyank", naamank: "Naamank", vehicleEnergy: "Vehicle Energy", communicationEnergy: "Communication Energy", cautions: "Cautions", suggestedInfluences: "Suggested Compatible Number Influences", supportiveNumbers: "Supportive Numbers", neutralNumbers: "Neutral Numbers", carefulNumbers: "Balance Carefully",
      deeperTiming: "Deeper timing analysis chahiye?", fullBirthChart: "Full birth chart analysis chahiye?", deeperNumbers: "Full numerology aur Lo Shu guidance chahiye?", reportCtaCopy: "Deeper personalized guidance ke liye related premium report explore karein.", premiumKundliReport: "View Premium Kundli Report", numerologyReport: "View Numerology + Lo Shu Report",
      astroDisclaimer: "Ye calculator reflective astrology guidance deta hai. Ye medical, legal, financial ya professional advice ka replacement nahi hai.", vehicleDisclaimer: "Numerology safe driving, legal compliance, insurance ya vehicle maintenance ka replacement nahi hai.", mobileDisclaimer: "Numerology communication guidance ka reflective tool hai aur success ya wealth guarantee nahi karta.", notAvailable: "Not available"
    };
  }
  return {
    dashaResult: "Dasha Result", nakshatraResult: "Nakshatra Result", vehicleResult: "Vehicle Number Result", mobileResult: "Mobile Number Result",
    currentMahadasha: "Current Mahadasha", currentAntardasha: "Current Antardasha", currentStatus: "Status", activePeriod: "Active", dateRange: "Date Range", dashaTimeline: "Dasha Timeline", nextAntardasha: "Next Antardasha", dashaMeaning: "Dasha Meaning", practicalGuidance: "Practical Guidance",
    nakshatra: "Nakshatra", pada: "Pada", moonSign: "Moon Sign", nakshatraLord: "Nakshatra Lord", ganaNadi: "Gana / Nadi", nakshatraNature: "Nakshatra Nature", lifeGuidance: "Life Guidance", practicalSuggestions: "Practical Suggestions",
    vehicleNumber: "Vehicle Number", mobileNumber: "Mobile Number", numberTotal: "Number Total", reducedNumber: "Reduced Number", verdict: "Verdict", personalCompatibility: "Personal Numbers Compatibility", moolank: "Moolank", bhagyank: "Bhagyank", naamank: "Naamank", vehicleEnergy: "Vehicle Energy", communicationEnergy: "Communication Energy", cautions: "Cautions", suggestedInfluences: "Suggested Compatible Number Influences", supportiveNumbers: "Supportive Numbers", neutralNumbers: "Neutral Numbers", carefulNumbers: "Balance Carefully",
    deeperTiming: "Want deeper timing analysis?", fullBirthChart: "Want your full birth chart analysis?", deeperNumbers: "Want full numerology and Lo Shu guidance?", reportCtaCopy: "For deeper personalized guidance, explore the related premium report.", premiumKundliReport: "View Premium Kundli Report", numerologyReport: "View Numerology + Lo Shu Report",
    astroDisclaimer: "This calculator provides reflective astrology guidance. It does not replace medical, legal, financial, or professional advice.", vehicleDisclaimer: "Numerology does not replace safe driving, legal compliance, insurance, or vehicle maintenance.", mobileDisclaimer: "Numerology is a reflective communication guidance tool and does not guarantee success or wealth.", notAvailable: "Not available"
  };
}
