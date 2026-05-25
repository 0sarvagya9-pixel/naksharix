"use client";

import { useRef, useState } from "react";
import type React from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/section";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";
import { useLanguage } from "@/components/language-provider";
import { secureFetch } from "@/lib/security/csrf";
import { calculateFocusedNumerology, calculatePersonalityNumberValue, calculationFailed, dateDigitCounts, localizedError, type FocusedCalculatorKind, type FocusedNumerologyResult } from "@/lib/focused-calculators";
import { calculateNumerologyReport, type NumerologyReport } from "@/lib/numerology";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import type { DashaPeriod, VimshottariDashaCalculation, YogaAnalysis, DoshaAnalysis, AshtakootFactor } from "@/lib/astrology/types";

type AstroKind = Extract<FocusedCalculatorKind, "dasha" | "nakshatra" | "moon-sign" | "lagna" | "manglik" | "yoga">;
type NumberKind = Extract<FocusedCalculatorKind, "vehicle" | "mobile" | "name-number" | "lo-shu" | "destiny" | "personality">;
type MatchKind = Extract<FocusedCalculatorKind, "guna-milan" | "nadi-dosha" | "bhakoot" | "marriage-suitability">;
type Errors = Record<string, string | undefined>;

type AstroForm = { name: string; gender: string; dateOfBirth: string; timeOfBirth: string; birthPlace: string };
type NumberForm = { name: string; dateOfBirth: string; targetNumber: string; purpose: string };
type MatchPerson = { name: string; dateOfBirth: string; timeOfBirth: string; birthPlace: string };

type AstroResult = {
  kind: AstroKind;
  avakhada?: { moonSign?: string; ascendant?: string; nakshatra?: string; nakshatraIndex?: number; pada?: string | number; gana?: string; yoni?: string; nadi?: string };
  moon?: PlanetMini;
  mars?: PlanetMini;
  venus?: PlanetMini;
  dasha?: VimshottariDashaCalculation;
  dashaTimeline?: DashaPeriod[];
  doshaAnalysis?: DoshaAnalysis;
  yogaAnalysis?: YogaAnalysis;
  calculationMeta?: { ascendantLongitude?: number };
  nakshatraAnalysis?: string;
  lagnaAnalysis?: string;
};
type PlanetMini = { planet: string; sign?: string; degree?: number; house?: number; nakshatra?: string; pada?: number; absoluteLongitude?: number };
type MatchResult = {
  gunaMilan?: { totalScore: number; maxScore: number; percentage: number; verdict?: string; ashtakoot: AshtakootFactor[] };
  calculationBasis?: { bride?: Record<string, string | number | undefined>; groom?: Record<string, string | number | undefined> };
  manglikComparison?: { brideStatus?: string; groomStatus?: string; compatible?: boolean; note?: string };
  strengths?: string[];
  concerns?: string[];
  practicalGuidance?: string[];
};

const astroKinds: AstroKind[] = ["dasha", "nakshatra", "moon-sign", "lagna", "manglik", "yoga"];
const numberKinds: NumberKind[] = ["vehicle", "mobile", "name-number", "lo-shu", "destiny", "personality"];
const matchKinds: MatchKind[] = ["guna-milan", "nadi-dosha", "bhakoot", "marriage-suitability"];
const defaultAstro: AstroForm = { name: "", gender: "", dateOfBirth: "", timeOfBirth: "", birthPlace: "" };
const defaultNumber: NumberForm = { name: "", dateOfBirth: "", targetNumber: "", purpose: "" };
const defaultPerson: MatchPerson = { name: "", dateOfBirth: "", timeOfBirth: "", birthPlace: "" };
const signLords: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };

export function FocusedCalculatorContent({ kind }: { kind: FocusedCalculatorKind }) {
  const { locale } = useLanguage();
  const labels = copy(locale, kind);
  const [astro, setAstro] = useState<AstroForm>(defaultAstro);
  const [number, setNumber] = useState<NumberForm>(defaultNumber);
  const [bride, setBride] = useState<MatchPerson>(defaultPerson);
  const [groom, setGroom] = useState<MatchPerson>(defaultPerson);
  const [locations, setLocations] = useState<Record<string, ResolvedLocation | null>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [astroResult, setAstroResult] = useState<AstroResult | null>(null);
  const [numberResult, setNumberResult] = useState<FocusedNumerologyResult | NumerologyReport | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const family = astroKinds.includes(kind as AstroKind) ? "astro" : numberKinds.includes(kind as NumberKind) ? "number" : "match";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (family === "astro") await submitAstro(kind as AstroKind);
    if (family === "number") submitNumber(kind as NumberKind);
    if (family === "match") await submitMatch();
  }

  async function submitAstro(nextKind: AstroKind) {
    const nextErrors = requireFields(astro, ["name", "gender", "dateOfBirth", "timeOfBirth", "birthPlace"], locale);
    if (blockIfErrors(nextErrors)) return;
    setLoading(true);
    try {
      const place = locations.astro?.displayName === astro.birthPlace ? locations.astro : await resolveLocation(astro.birthPlace);
      if (!place) return setLocationError("birthPlace");
      setLocations((current) => ({ ...current, astro: place }));
      const response = await secureFetch("/api/focused-calculators/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: nextKind, ...astro, birthPlace: place.displayName, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone ?? "Asia/Kolkata", language: locale })
      });
      const json = await response.json();
      if (!response.ok || !json.data) throw new Error("failed");
      setAstroResult(json.data as AstroResult);
      setNumberResult(null);
      setMatchResult(null);
      setErrors({});
    } catch {
      setMessage(calculationFailed(locale));
    } finally {
      setLoading(false);
    }
  }

  function submitNumber(nextKind: NumberKind) {
    const required: (keyof NumberForm)[] = nextKind === "personality" ? ["name"] : nextKind === "destiny" || nextKind === "lo-shu" ? ["dateOfBirth"] : nextKind === "name-number" ? ["name", "dateOfBirth"] : ["name", "dateOfBirth", "targetNumber"];
    const nextErrors = requireFields(number, required, locale);
    if (blockIfErrors(nextErrors)) return;
    try {
      if (nextKind === "mobile" || nextKind === "vehicle") {
        setNumberResult(calculateFocusedNumerology({ kind: nextKind, name: number.name, dateOfBirth: number.dateOfBirth, targetNumber: number.targetNumber, purpose: number.purpose }));
      } else {
        setNumberResult(calculateNumerologyReport({ name: number.name || "Native", dateOfBirth: number.dateOfBirth || "2000-01-01", locale: "en" }));
      }
      setAstroResult(null);
      setMatchResult(null);
      setErrors({});
    } catch {
      setMessage(calculationFailed(locale));
    }
  }

  async function submitMatch() {
    const nextErrors = { ...requireFields(bride, ["name", "dateOfBirth", "timeOfBirth", "birthPlace"], locale, "bride."), ...requireFields(groom, ["name", "dateOfBirth", "timeOfBirth", "birthPlace"], locale, "groom.") };
    if (blockIfErrors(nextErrors)) return;
    setLoading(true);
    try {
      const bridePlace = locations.bride?.displayName === bride.birthPlace ? locations.bride : await resolveLocation(bride.birthPlace);
      const groomPlace = locations.groom?.displayName === groom.birthPlace ? locations.groom : await resolveLocation(groom.birthPlace);
      if (!bridePlace) return setLocationError("bride.birthPlace");
      if (!groomPlace) return setLocationError("groom.birthPlace");
      setLocations((current) => ({ ...current, bride: bridePlace, groom: groomPlace }));
      const response = await secureFetch("/api/kundli-match/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: locale,
          bride: { ...bride, gender: "Female", birthPlace: bridePlace.displayName, latitude: bridePlace.latitude, longitude: bridePlace.longitude, timezone: bridePlace.timezone ?? "Asia/Kolkata" },
          groom: { ...groom, gender: "Male", birthPlace: groomPlace.displayName, latitude: groomPlace.latitude, longitude: groomPlace.longitude, timezone: groomPlace.timezone ?? "Asia/Kolkata" }
        })
      });
      const json = await response.json();
      if (!response.ok || !json.data?.report) throw new Error("failed");
      setMatchResult(json.data.report as MatchResult);
      setAstroResult(null);
      setNumberResult(null);
      setErrors({});
    } catch {
      setMessage(calculationFailed(locale));
    } finally {
      setLoading(false);
    }
  }

  function blockIfErrors(nextErrors: Errors) {
    if (Object.keys(nextErrors).length === 0) return false;
    setErrors(nextErrors);
    window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("[data-invalid='true']")?.focus(), 0);
    return true;
  }

  function setLocationError(field: string) {
    const text = locationMessage(locale);
    setErrors({ [field]: text });
    setMessage(text);
    window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("[data-invalid='true']")?.focus(), 0);
  }

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section>
        <div className="inner-section rounded-3xl border border-[#263957] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]"><Calculator className="h-4 w-4" />{labels.eyebrow}</p>
              <h1 className="mt-3 font-cinzel text-4xl font-black text-[#f3d382] sm:text-5xl">{labels.title}</h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-[#a8b3c7]">{labels.subtitle}</p>
            </div>
            <Button variant="outline" asChild className="w-fit"><Link href="/free-calculators"><ArrowLeft className="mr-2 h-4 w-4" />{labels.back}</Link></Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="inner-card"><CardContent className="p-6">
            <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{labels.whatShows}</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#a8b3c7]">{labels.highlights.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#00f5a0]" /><span>{item}</span></li>)}</ul>
            <div className="mt-5 rounded-2xl border border-[#263957] bg-[#142647]/60 p-4"><p className="text-sm font-semibold text-[#f3d382]">{labels.requiredDetails}</p><p className="mt-2 text-sm leading-6 text-[#a8b3c7]">{labels.requiredCopy}</p></div>
          </CardContent></Card>

          <Card className="inner-card"><CardContent className="p-6">
            <h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{labels.formTitle}</h2>
            <form ref={formRef} onSubmit={submit} className="mt-5 grid gap-4">
              {family === "astro" ? <AstroFields values={astro} errors={errors} labels={labels} set={(field, value) => { setAstro((current) => ({ ...current, [field]: value })); if (field === "birthPlace") setLocations((current) => ({ ...current, astro: null })); setErrors((e) => ({ ...e, [field]: undefined })); }} resolve={(location) => setLocations((current) => ({ ...current, astro: location }))} /> : null}
              {family === "number" ? <NumberFields kind={kind as NumberKind} values={number} errors={errors} labels={labels} set={(field, value) => { setNumber((current) => ({ ...current, [field]: value })); setErrors((e) => ({ ...e, [field]: undefined })); }} /> : null}
              {family === "match" ? <MatchFields bride={bride} groom={groom} errors={errors} labels={labels} setBride={(field, value) => { setBride((current) => ({ ...current, [field]: value })); if (field === "birthPlace") setLocations((current) => ({ ...current, bride: null })); setErrors((e) => ({ ...e, [`bride.${field}`]: undefined })); }} setGroom={(field, value) => { setGroom((current) => ({ ...current, [field]: value })); if (field === "birthPlace") setLocations((current) => ({ ...current, groom: null })); setErrors((e) => ({ ...e, [`groom.${field}`]: undefined })); }} resolve={(key, location) => setLocations((current) => ({ ...current, [key]: location }))} /> : null}
              {message ? <p className="rounded-xl border border-[#ef4444]/35 bg-[#ef4444]/10 p-3 text-sm text-[#fecaca]">{message}</p> : null}
              <Button type="submit" disabled={loading} className="bg-[#009b72] text-white hover:bg-[#008766]">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{labels.calculate}</Button>
            </form>
          </CardContent></Card>
        </div>

        <div className="mt-8">
          {astroResult ? <AstroResultView kind={kind as AstroKind} result={astroResult} locale={locale} /> : null}
          {numberResult ? <NumberResultView kind={kind as NumberKind} result={numberResult} form={number} locale={locale} /> : null}
          {matchResult ? <MatchResultView kind={kind as MatchKind} result={matchResult} locale={locale} /> : null}
        </div>
        {(astroResult || numberResult || matchResult) ? <ReportCta kind={kind} locale={locale} /> : null}
        <p className="mt-8 rounded-2xl border border-[#263957] bg-[#111f3a]/70 p-4 text-sm leading-6 text-[#a8b3c7]">{labels.disclaimer}</p>
      </Section>
    </main>
  );
}

function AstroFields({ values, errors, labels, set, resolve }: { values: AstroForm; errors: Errors; labels: PageCopy; set: (field: keyof AstroForm, value: string) => void; resolve: (location: ResolvedLocation | null) => void }) {
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label={labels.fullName} error={errors.name}><Input data-invalid={Boolean(errors.name)} value={values.name} onChange={(event) => set("name", event.target.value)} className={fieldClass(errors.name)} /></Field>
    <Field label={labels.gender} error={errors.gender}><select data-invalid={Boolean(errors.gender)} value={values.gender} onChange={(event) => set("gender", event.target.value)} className={fieldClass(errors.gender)}><option value="">{labels.selectGender}</option><option value="Male">{labels.male}</option><option value="Female">{labels.female}</option><option value="Prefer not to say">{labels.preferNot}</option></select></Field>
    <Field label={labels.dateOfBirth} error={errors.dateOfBirth}><Input data-invalid={Boolean(errors.dateOfBirth)} type="date" value={values.dateOfBirth} onChange={(event) => set("dateOfBirth", event.target.value)} className={fieldClass(errors.dateOfBirth)} /></Field>
    <Field label={labels.timeOfBirth} error={errors.timeOfBirth}><Input data-invalid={Boolean(errors.timeOfBirth)} type="time" value={values.timeOfBirth} onChange={(event) => set("timeOfBirth", event.target.value)} className={fieldClass(errors.timeOfBirth)} /></Field>
    <div className="md:col-span-2"><LocationAutocomplete value={values.birthPlace} onChange={(value) => set("birthPlace", value)} onResolvedLocation={resolve} label={labels.birthPlace} required dataField="birthPlace" error={errors.birthPlace} placeholder={labels.birthPlacePlaceholder} /></div>
  </div>;
}

function NumberFields({ kind, values, errors, labels, set }: { kind: NumberKind; values: NumberForm; errors: Errors; labels: PageCopy; set: (field: keyof NumberForm, value: string) => void }) {
  const needsName = !["lo-shu", "destiny"].includes(kind);
  const needsDob = kind !== "personality";
  const needsTarget = kind === "vehicle" || kind === "mobile";
  return <div className="grid gap-4 md:grid-cols-2">
    {needsName ? <Field label={labels.fullName} error={errors.name}><Input data-invalid={Boolean(errors.name)} value={values.name} onChange={(event) => set("name", event.target.value)} className={fieldClass(errors.name)} /></Field> : null}
    {needsDob ? <Field label={labels.dateOfBirth} error={errors.dateOfBirth}><Input data-invalid={Boolean(errors.dateOfBirth)} type="date" value={values.dateOfBirth} onChange={(event) => set("dateOfBirth", event.target.value)} className={fieldClass(errors.dateOfBirth)} /></Field> : null}
    {needsTarget ? <Field label={kind === "vehicle" ? labels.vehicleNumber : labels.mobileNumber} error={errors.targetNumber}><Input data-invalid={Boolean(errors.targetNumber)} value={values.targetNumber} onChange={(event) => set("targetNumber", event.target.value)} className={fieldClass(errors.targetNumber)} placeholder={kind === "vehicle" ? "DL01AB1234" : "9876543210"} /></Field> : null}
    {needsTarget ? <Field label={labels.usagePurpose} required={false}><select value={values.purpose} onChange={(event) => set("purpose", event.target.value)} className={fieldClass(undefined)}><option value="">{labels.optional}</option>{labels.purposes.map((item) => <option key={item}>{item}</option>)}</select></Field> : null}
  </div>;
}

function MatchFields({ bride, groom, errors, labels, setBride, setGroom, resolve }: { bride: MatchPerson; groom: MatchPerson; errors: Errors; labels: PageCopy; setBride: (field: keyof MatchPerson, value: string) => void; setGroom: (field: keyof MatchPerson, value: string) => void; resolve: (key: "bride" | "groom", location: ResolvedLocation | null) => void }) {
  return <div className="grid gap-5">
    <PersonFields title={labels.brideDetails} prefix="bride" person={bride} errors={errors} labels={labels} set={setBride} resolve={(location) => resolve("bride", location)} />
    <PersonFields title={labels.groomDetails} prefix="groom" person={groom} errors={errors} labels={labels} set={setGroom} resolve={(location) => resolve("groom", location)} />
  </div>;
}

function PersonFields({ title, prefix, person, errors, labels, set, resolve }: { title: string; prefix: string; person: MatchPerson; errors: Errors; labels: PageCopy; set: (field: keyof MatchPerson, value: string) => void; resolve: (location: ResolvedLocation | null) => void }) {
  return <div className="rounded-2xl border border-[#263957] bg-[#142647]/50 p-4"><h3 className="font-cinzel text-lg font-bold text-[#f3d382]">{title}</h3><div className="mt-4 grid gap-4 md:grid-cols-2">
    <Field label={labels.fullName} error={errors[`${prefix}.name`]}><Input data-invalid={Boolean(errors[`${prefix}.name`])} value={person.name} onChange={(event) => set("name", event.target.value)} className={fieldClass(errors[`${prefix}.name`])} /></Field>
    <Field label={labels.dateOfBirth} error={errors[`${prefix}.dateOfBirth`]}><Input data-invalid={Boolean(errors[`${prefix}.dateOfBirth`])} type="date" value={person.dateOfBirth} onChange={(event) => set("dateOfBirth", event.target.value)} className={fieldClass(errors[`${prefix}.dateOfBirth`])} /></Field>
    <Field label={labels.timeOfBirth} error={errors[`${prefix}.timeOfBirth`]}><Input data-invalid={Boolean(errors[`${prefix}.timeOfBirth`])} type="time" value={person.timeOfBirth} onChange={(event) => set("timeOfBirth", event.target.value)} className={fieldClass(errors[`${prefix}.timeOfBirth`])} /></Field>
    <LocationAutocomplete value={person.birthPlace} onChange={(value) => set("birthPlace", value)} onResolvedLocation={resolve} label={labels.birthPlace} required dataField={`${prefix}.birthPlace`} error={errors[`${prefix}.birthPlace`]} placeholder={labels.birthPlacePlaceholder} />
  </div></div>;
}

function AstroResultView({ kind, result, locale }: { kind: AstroKind; result: AstroResult; locale: Locale }) {
  const l = resultCopy(locale);
  if (kind === "dasha") return <ResultShell title={l.dashaResult}><MetricGrid items={[[l.currentMahadasha, result.dasha?.currentMahadasha?.planet], [l.currentAntardasha, result.dasha?.currentAntardasha?.planet], [l.dateRange, result.dasha?.currentMahadasha?.period], [l.nakshatra, result.avakhada?.nakshatra]]} /><InfoBlock title={l.practicalGuidance} items={guidance(locale, "dasha")} /></ResultShell>;
  if (kind === "nakshatra") return <ResultShell title={l.nakshatraResult}><MetricGrid items={[[l.nakshatra, `${safe(result.avakhada?.nakshatra)}${result.avakhada?.nakshatraIndex ? ` (${result.avakhada.nakshatraIndex})` : ""}`], [l.pada, result.avakhada?.pada], [l.moonSign, result.avakhada?.moonSign], [l.nakshatraLord, nakshatraLord(result.avakhada?.nakshatra)]]} /><InfoBlock title={l.nature} items={[result.nakshatraAnalysis || sentence(locale, "nakshatra"), ...guidance(locale, "nakshatra")]} /></ResultShell>;
  if (kind === "moon-sign") return <ResultShell title={l.moonResult}><MetricGrid items={[[l.moonSign, result.avakhada?.moonSign], [l.rashiLord, signLords[result.avakhada?.moonSign ?? ""]], [l.moonDegree, degree(result.moon?.degree)], [l.nakshatra, result.avakhada?.nakshatra]]} /><InfoBlock title={l.emotionalNature} items={guidance(locale, "moon")} /></ResultShell>;
  if (kind === "lagna") return <ResultShell title={l.lagnaResult}><MetricGrid items={[[l.lagna, result.avakhada?.ascendant], [l.lagnaLord, signLords[result.avakhada?.ascendant ?? ""]], [l.ascDegree, degree(result.calculationMeta?.ascendantLongitude ? result.calculationMeta.ascendantLongitude % 30 : undefined)]]} /><InfoBlock title={l.personalityDirection} items={[result.lagnaAnalysis || sentence(locale, "lagna"), ...guidance(locale, "lagna")]} /></ResultShell>;
  if (kind === "manglik") return <ResultShell title={l.manglikResult}><MetricGrid items={[[l.manglikStatus, result.doshaAnalysis?.manglik?.severity || (result.doshaAnalysis?.manglik?.present ? l.needsReview : l.nonManglik)], [l.marsHouse, result.doshaAnalysis?.manglik?.marsHouseFromLagna], [l.moonBasis, result.doshaAnalysis?.manglik?.marsHouseFromMoon], [l.venusBasis, result.doshaAnalysis?.manglik?.marsHouseFromVenus]]} /><InfoBlock title={l.relationshipGuidance} items={[result.doshaAnalysis?.manglik?.summary || sentence(locale, "manglik"), ...guidance(locale, "manglik")]} /></ResultShell>;
  const yogas = result.yogaAnalysis?.evaluated?.filter((yoga) => yoga.detected) ?? result.yogaAnalysis?.detected ?? [];
  return <ResultShell title={l.yogaResult}><MetricGrid items={[[l.yogasFound, yogas.length], [l.strongestYoga, yogas[0]?.name || l.none], [l.overallTheme, yogas.length ? l.supportiveThemes : l.needsFullReview]]} />{yogas.length ? <div className="grid gap-4 md:grid-cols-2">{yogas.map((yoga) => <InfoBlock key={yoga.name} title={yoga.name} items={[yoga.interpretation, yoga.basis, yoga.caveat]} />)}</div> : <InfoBlock title={l.yogaList} items={[l.noYoga]} />}</ResultShell>;
}

function NumberResultView({ kind, result, form, locale }: { kind: NumberKind; result: FocusedNumerologyResult | NumerologyReport; form: NumberForm; locale: Locale }) {
  const l = resultCopy(locale);
  if (kind === "mobile" || kind === "vehicle") {
    const r = result as FocusedNumerologyResult;
    return <ResultShell title={kind === "mobile" ? l.mobileResult : l.vehicleResult}><MetricGrid items={[[kind === "mobile" ? l.mobileNumber : l.vehicleNumber, r.targetNumber], [l.numberTotal, r.rawTotal], [l.reducedNumber, r.reducedNumber], [l.verdict, verdict(r.verdict, locale)]]} /><InfoBlock title={l.personalCompatibility} items={[`${l.moolank}: ${r.moolank}`, `${l.bhagyank}: ${r.bhagyank}`, `${l.naamank}: ${r.naamank}`, `${l.supportiveNumbers}: ${r.supportiveNumbers.join(", ")}`]} /><InfoBlock title={l.cautions} items={numberGuidance(locale)} /></ResultShell>;
  }
  const r = result as NumerologyReport;
  if (kind === "name-number") return <ResultShell title={l.nameNumberResult}><MetricGrid items={[[l.naamank, r.nameNumber.value], [l.moolank, r.moolank.value], [l.bhagyank, r.lifePath.value], [l.verdict, verdict(compatVerdict(r.nameNumber.value, [r.moolank.value, r.lifePath.value]), locale)]]} /><InfoBlock title={l.nameEnergy} items={[r.nameNumber.meaning, r.nameNumber.guidance, ...r.nameNumber.strengths]} /></ResultShell>;
  if (kind === "destiny") return <ResultShell title={l.destinyResult}><MetricGrid items={[[l.bhagyank, r.lifePath.value], [l.calculationBasis, l.dobDigits], [l.coreTheme, r.lifePath.meaning]]} /><InfoBlock title={l.practicalGuidance} items={[r.lifePath.guidance, ...r.lifePath.strengths, ...r.lifePath.growthAreas]} /></ResultShell>;
  if (kind === "personality") {
    const value = calculatePersonalityNumberValue(form.name);
    return <ResultShell title={l.personalityResult}><MetricGrid items={[[l.personalityNumber, value], [l.outerExpression, personalityTheme(value, locale)]]} /><InfoBlock title={l.practicalGuidance} items={numberGuidance(locale)} /></ResultShell>;
  }
  const counts = dateDigitCounts(form.dateOfBirth);
  const order = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const missing = order.filter((n) => !counts[n]);
  const repeated = order.filter((n) => (counts[n] ?? 0) > 1);
  return <ResultShell title={l.loShuResult}><div className="grid max-w-md grid-cols-3 gap-3">{order.map((n) => <div key={n} className={cn("relative rounded-2xl border p-5 text-center", counts[n] ? "border-[#00f5a0]/35 bg-[#00f5a0]/10 text-white" : "border-dashed border-[#263957] bg-[#111f3a]/60 text-[#64748b]")}><span className="text-2xl font-black">{n}</span>{(counts[n] ?? 0) > 1 ? <span className="absolute right-2 top-2 rounded-full bg-[#dca956] px-2 text-xs text-[#020612]">x{counts[n]}</span> : null}</div>)}</div><div className="grid gap-4 md:grid-cols-2"><InfoBlock title={l.missingNumbers} items={[missing.join(", ") || l.none, ...missing.slice(0, 4).map((n) => missingMeaning(n, locale))]} /><InfoBlock title={l.repeatedNumbers} items={[repeated.join(", ") || l.none, ...repeated.slice(0, 4).map((n) => repeatedMeaning(n, locale))]} /></div><InfoBlock title={l.practicalGuidance} items={numberGuidance(locale)} /></ResultShell>;
}

function MatchResultView({ kind, result, locale }: { kind: MatchKind; result: MatchResult; locale: Locale }) {
  const l = resultCopy(locale);
  const factors = result.gunaMilan?.ashtakoot ?? [];
  const nadi = findFactor(factors, "nadi");
  const bhakoot = findFactor(factors, "bhakoot");
  if (kind === "guna-milan") return <ResultShell title={l.gunaResult}><MetricGrid items={[[l.totalGuna, `${result.gunaMilan?.totalScore ?? "-"} / 36`], [l.matchPercent, `${result.gunaMilan?.percentage ?? "-"}%`], [l.category, suitability(result.gunaMilan?.totalScore ?? 0, locale)]]} /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{factors.map((f) => <Metric key={f.kootKey ?? f.name} label={f.name} value={`${f.score} / ${f.maxScore}`} />)}</div><InfoBlock title={l.guidance} items={result.practicalGuidance ?? guidance(locale, "match")} /></ResultShell>;
  if (kind === "nadi-dosha") return <ResultShell title={l.nadiResult}><MetricGrid items={[[l.brideNadi, valueFromFactor(nadi, "brideValue")], [l.groomNadi, valueFromFactor(nadi, "groomValue")], [l.nadiScore, `${nadi?.score ?? "-"} / 8`], [l.nadiStatus, nadiStatus(nadi?.score, locale)]]} /><InfoBlock title={l.explanation} items={[nadi?.explanation || sentence(locale, "nadi"), ...guidance(locale, "nadi")]} /></ResultShell>;
  if (kind === "bhakoot") return <ResultShell title={l.bhakootResult}><MetricGrid items={[[l.brideMoon, String(result.calculationBasis?.bride?.moonSign ?? "-")], [l.groomMoon, String(result.calculationBasis?.groom?.moonSign ?? "-")], [l.signDistance, String(bhakoot?.details?.distance ?? "-")], [l.bhakootScore, `${bhakoot?.score ?? "-"} / 7`]]} /><InfoBlock title={l.explanation} items={[bhakoot?.explanation || sentence(locale, "bhakoot"), ...guidance(locale, "bhakoot")]} /></ResultShell>;
  return <ResultShell title={l.marriageResult}><MetricGrid items={[[l.marriageSuitability, suitability(result.gunaMilan?.totalScore ?? 0, locale)], [l.totalGuna, `${result.gunaMilan?.totalScore ?? "-"} / 36`], [l.matchPercent, `${result.gunaMilan?.percentage ?? "-"}%`], [l.manglikStatus, result.manglikComparison?.note ?? "-"]]} /><div className="grid gap-4 md:grid-cols-2"><InfoBlock title={l.supportivePoints} items={result.strengths ?? []} /><InfoBlock title={l.cautionPoints} items={result.concerns ?? []} /></div><InfoBlock title={l.reviewChecklist} items={guidance(locale, "marriage")} /></ResultShell>;
}

function ResultShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card className="inner-card border-[#00f5a0]/25"><CardContent className="grid gap-6 p-6"><h2 className="font-cinzel text-2xl font-black text-[#f3d382]">{title}</h2>{children}</CardContent></Card>;
}
function MetricGrid({ items }: { items: Array<[string, unknown]> }) { return <div className="grid gap-4 md:grid-cols-4">{items.map(([label, value]) => <Metric key={label} label={label} value={safe(value)} />)}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-[#263957] bg-[#142647]/72 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8b3c7]">{label}</p><p className="mt-2 text-lg font-bold text-white">{value}</p></div>; }
function InfoBlock({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl border border-[#263957] bg-[#111f3a]/80 p-5"><h3 className="font-cinzel text-lg font-bold text-[#f3d382]">{title}</h3><ul className="mt-3 grid gap-2 text-sm leading-6 text-[#a8b3c7]">{(items.length ? items : ["-"]).map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f5a0]" />{item}</li>)}</ul></div>; }
function Field({ label, error, children, required = true }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) { return <label className="grid gap-2 text-sm font-semibold text-white"><span>{label}{required ? <span className="ml-1 text-[#ef4444]">*</span> : null}</span>{children}{error ? <span className="text-xs font-medium text-[#fecaca]">{error}</span> : null}</label>; }
function fieldClass(error?: string) { return cn("w-full rounded-md border bg-[#07111f]/80 px-3 text-white outline-none", error ? "border-[#ef4444] focus-visible:ring-[#ef4444]/40" : "border-[#263957] focus-visible:border-[#dca956]/70 focus-visible:ring-[#00f5a0]/30"); }

async function resolveLocation(query: string): Promise<ResolvedLocation | null> { try { const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`, { headers: { Accept: "application/json" } }); const json = await response.json(); return Array.isArray(json.data?.suggestions) ? json.data.suggestions[0] ?? null : null; } catch { return null; } }
function requireFields<T extends Record<string, string>>(values: T, fields: (keyof T)[], locale: Locale, prefix = "") { return fields.reduce<Errors>((acc, field) => { if (!values[field]?.trim()) acc[`${prefix}${String(field)}`] = localizedError(locale); return acc; }, {}); }
function safe(value: unknown) { if (value === undefined || value === null || value === "") return "-"; return String(value); }
function degree(value?: number) { return Number.isFinite(value) ? `${Number(value).toFixed(2)}°` : "-"; }
function nakshatraLord(nakshatra?: string) { const order = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]; const names = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]; const index = names.findIndex((item) => item.toLowerCase() === nakshatra?.toLowerCase()); return index >= 0 ? order[index % order.length] : undefined; }
function compatVerdict(value: number, matches: number[]) { return matches.includes(value) ? "supportive" : "neutral"; }
function verdict(value: string, locale: Locale) { const map = { en: { supportive: "Supportive", neutral: "Neutral", needsBalance: "Needs Balance" }, hi: { supportive: "सहयोगी", neutral: "तटस्थ", needsBalance: "संतुलन आवश्यक" }, hinglish: { supportive: "Supportive", neutral: "Neutral", needsBalance: "Balance Needed" } }; return map[locale][value as keyof typeof map.en] ?? value; }
function personalityTheme(value: number, locale: Locale) { if (locale === "hi") return `${value} सामाजिक impression और बाहरी अभिव्यक्ति का संकेत देता है।`; if (locale === "hinglish") return `${value} social impression aur outer expression ka signal deta hai.`; return `${value} reflects social impression and outer expression.`; }
function missingMeaning(n: number, locale: Locale) { if (locale === "hi") return `${n} को संतुलित करने के लिए उससे जुड़े गुणों का practical अभ्यास करें।`; if (locale === "hinglish") return `${n} ko balance karne ke liye related qualities ka practical practice karein.`; return `Balance ${n} through practical habits connected with its qualities.`; }
function repeatedMeaning(n: number, locale: Locale) { if (locale === "hi") return `${n} का दोहराव strong influence दिखाता है; इसे awareness से संतुलित करें।`; if (locale === "hinglish") return `Repeated ${n} strong influence dikhata hai; isko awareness se balance karein.`; return `Repeated ${n} shows a stronger influence; balance it with awareness.`; }
function findFactor(factors: AshtakootFactor[], key: string) { return factors.find((factor) => factor.kootKey === key || factor.name?.toLowerCase().includes(key)); }
function valueFromFactor(factor: AshtakootFactor | undefined, key: "brideValue" | "groomValue") { return safe(factor?.[key] ?? factor?.details?.[key]); }
function nadiStatus(score: number | undefined, locale: Locale) { if (score === 8) return locale === "hi" ? "अनुकूल" : "Compatible"; if (score === 0) return locale === "hi" ? "समीक्षा आवश्यक" : locale === "hinglish" ? "Review Needed" : "Same Nadi Needs Review"; return locale === "hi" ? "गहरी समीक्षा आवश्यक" : "Needs Deeper Review"; }
function suitability(score: number, locale: Locale) { const text = score >= 28 ? ["Strong Match", "मजबूत मिलान", "Strong Match"] : score >= 24 ? ["Good Match", "अच्छा मिलान", "Good Match"] : score >= 18 ? ["Needs Review", "समीक्षा आवश्यक", "Review Needed"] : ["Detailed Review Needed", "गहरी समीक्षा आवश्यक", "Detailed Review Needed"]; return locale === "hi" ? text[1] : locale === "hinglish" ? text[2] : text[0]; }
function locationMessage(locale: Locale) { if (locale === "hi") return "कृपया जन्म स्थान सुझाव से चुनें या शहर और देश लिखकर फिर प्रयास करें।"; if (locale === "hinglish") return "Birth place suggestion se select karein ya city, country likhkar fir try karein."; return "Please select a birth location from suggestions or enter city and country, then try again."; }

function guidance(locale: Locale, topic: string) {
  const en: Record<string, string[]> = {
    dasha: ["Use timing as planning guidance, not a guarantee.", "Focus on steady effort, skill-building, and practical decisions."],
    nakshatra: ["Use Nakshatra as a self-reflection lens.", "Review Moon sign, Lagna, and Dasha for deeper context."],
    moon: ["Emotional patterns are best balanced through clear routines and communication.", "Relationships benefit from listening and patience."],
    lagna: ["Lagna describes life approach and outer personality.", "Career and relationship choices should be reviewed with the full chart."],
    manglik: ["Manglik status needs calm chart review, not fear.", "Discuss temperament, expectations, and compatibility practically."],
    match: ["The score is guidance, not a final verdict.", "Review Nadi, Bhakoot, Gana, Manglik, family context, and practical goals together."],
    nadi: ["Same Nadi needs deeper review, but it does not mean marriage is impossible.", "Use full chart context before decisions."],
    bhakoot: ["Bhakoot reviews Moon-sign distance and long-term harmony.", "Review emotional, family, and stability factors calmly."],
    marriage: ["Family compatibility", "Mutual understanding", "Career and finance expectations", "Lifestyle habits", "Dasha and transit review", "Qualified astrologer review if needed"]
  };
  const hi: Record<string, string[]> = {
    dasha: ["समय संकेत को planning guidance की तरह लें, guarantee की तरह नहीं।", "Steady effort, skill-building और practical decisions पर ध्यान दें।"],
    nakshatra: ["नक्षत्र को self-reflection lens की तरह उपयोग करें।", "Deeper context के लिए Moon sign, Lagna और Dasha देखें।"],
    moon: ["Emotional pattern clear routine और communication से संतुलित होता है।", "Relationships में listening और patience helpful हैं।"],
    lagna: ["लग्न life approach और outer personality दिखाता है।", "Career और relationship choices को full chart के साथ देखें।"],
    manglik: ["मांगलिक स्थिति को भय नहीं, शांत chart review से समझें।", "Temperament, expectations और compatibility पर practical चर्चा करें।"],
    match: ["Score guidance है, final verdict नहीं।", "Nadi, Bhakoot, Gana, Manglik, family context और practical goals साथ में देखें।"],
    nadi: ["Same Nadi deeper review मांगती है, लेकिन विवाह असंभव नहीं बताती।", "निर्णय से पहले full chart context देखें।"],
    bhakoot: ["भकूट Moon-sign distance और long-term harmony देखता है।", "Emotional, family और stability factors calmly review करें।"],
    marriage: ["परिवार की अनुकूलता", "आपसी समझ", "करियर और वित्त अपेक्षाएं", "Lifestyle habits", "दशा और गोचर review", "जरूरत हो तो qualified astrologer review"]
  };
  const hinglish: Record<string, string[]> = {
    dasha: ["Timing ko planning guidance ki tarah lein, guarantee ki tarah nahi.", "Steady effort, skill-building aur practical decisions par focus karein."],
    nakshatra: ["Nakshatra ko self-reflection lens ki tarah use karein.", "Deeper context ke liye Moon sign, Lagna aur Dasha dekhein."],
    moon: ["Emotional patterns clear routines aur communication se balance hote hain.", "Relationships mein listening aur patience helpful hain."],
    lagna: ["Lagna life approach aur outer personality describe karta hai.", "Career aur relationship choices ko full chart ke saath review karein."],
    manglik: ["Manglik status ko fear nahi, calm chart review se samjhein.", "Temperament, expectations aur compatibility practically discuss karein."],
    match: ["Score guidance hai, final verdict nahi.", "Nadi, Bhakoot, Gana, Manglik, family context aur practical goals saath mein review karein."],
    nadi: ["Same Nadi deeper review maangti hai, lekin marriage impossible nahi batati.", "Decision se pehle full chart context dekhein."],
    bhakoot: ["Bhakoot Moon-sign distance aur long-term harmony review karta hai.", "Emotional, family aur stability factors calmly review karein."],
    marriage: ["Family compatibility", "Mutual understanding", "Career aur finance expectations", "Lifestyle habits", "Dasha aur transit review", "Qualified astrologer review if needed"]
  };
  return (locale === "hi" ? hi : locale === "hinglish" ? hinglish : en)[topic] ?? en.match;
}
function numberGuidance(locale: Locale) { if (locale === "hi") return ["किसी official detail को जल्दबाजी में न बदलें।", "Future choices में supportive influence consider किया जा सकता है।", "Practical discipline और communication हमेशा महत्वपूर्ण हैं।"]; if (locale === "hinglish") return ["Official detail ko jaldbazi mein na badlein.", "Future choices mein supportive influence consider kiya ja sakta hai.", "Practical discipline aur communication hamesha important hain."]; return ["Do not change official details in a hurry.", "Supportive influence can be considered in future choices.", "Practical discipline and communication always matter."]; }
function sentence(locale: Locale, topic: string) { if (locale === "hi") return `${topic} result को full chart context के साथ समझना बेहतर है।`; if (locale === "hinglish") return `${topic} result ko full chart context ke saath samajhna better hai.`; return `The ${topic} result is best understood with full chart context.`; }

function ReportCta({ kind, locale }: { kind: FocusedCalculatorKind; locale: Locale }) {
  const href = kind === "manglik" ? "/reports/manglik-kaal-sarp-report" : kind === "name-number" ? "/reports/name-correction-report" : matchKinds.includes(kind as MatchKind) ? "/reports/couple-kundli" : numberKinds.includes(kind as NumberKind) ? "/reports/numerology-lo-shu-report" : "/reports/premium-kundli";
  const label = locale === "hi" ? "गहरी व्यक्तिगत मार्गदर्शन के लिए संबंधित प्रीमियम रिपोर्ट देखें।" : locale === "hinglish" ? "Deeper personalized guidance ke liye related premium report explore karein." : "For deeper personalized guidance, explore the related premium report.";
  return <div className="mt-8 rounded-3xl border border-[#dca956]/30 bg-[#dca956]/10 p-6"><h2 className="font-cinzel text-2xl font-bold text-[#f3d382]">{locale === "hi" ? "संबंधित रिपोर्ट" : "Related Report"}</h2><p className="mt-3 text-sm leading-6 text-[#a8b3c7]">{label}</p><Button asChild className="mt-5 bg-[#009b72] text-white hover:bg-[#008766]"><Link href={href}>{locale === "hi" ? "रिपोर्ट देखें" : "View Report"}</Link></Button></div>;
}

type PageCopy = ReturnType<typeof copy>;
function copy(locale: Locale, kind: FocusedCalculatorKind) {
  const base = locale === "hi" ? {
    eyebrow: "Focused Calculator", back: "मुफ़्त कैलकुलेटर पर वापस", whatShows: "यह कैलकुलेटर क्या दिखाता है", requiredDetails: "आवश्यक विवरण", formTitle: "विवरण दर्ज करें", calculate: "गणना करें", fullName: "पूरा नाम", gender: "लिंग", selectGender: "लिंग चुनें", male: "पुरुष", female: "महिला", preferNot: "न बताना चाहें", dateOfBirth: "जन्म तिथि", timeOfBirth: "जन्म समय", birthPlace: "जन्म स्थान", birthPlacePlaceholder: "शहर, देश खोजें", vehicleNumber: "वाहन नंबर", mobileNumber: "मोबाइल नंबर", usagePurpose: "उपयोग उद्देश्य", optional: "वैकल्पिक", brideDetails: "वधू विवरण", groomDetails: "वर विवरण", purposes: ["Personal", "Business", "Career", "Family"], disclaimer: "यह कैलकुलेटर चिंतनात्मक मार्गदर्शन देता है। यह चिकित्सा, कानूनी, वित्तीय या पेशेवर सलाह का विकल्प नहीं है।"
  } : locale === "hinglish" ? {
    eyebrow: "Focused Calculator", back: "Back to Free Calculators", whatShows: "Ye calculator kya dikhata hai", requiredDetails: "Required details", formTitle: "Details enter karein", calculate: "Calculate", fullName: "Full Name", gender: "Gender", selectGender: "Gender select karein", male: "Male", female: "Female", preferNot: "Prefer not to say", dateOfBirth: "Date of Birth", timeOfBirth: "Time of Birth", birthPlace: "Birth Place", birthPlacePlaceholder: "City, country search karein", vehicleNumber: "Vehicle Number", mobileNumber: "Mobile Number", usagePurpose: "Usage Purpose", optional: "Optional", brideDetails: "Bride Details", groomDetails: "Groom Details", purposes: ["Personal", "Business", "Career", "Family"], disclaimer: "Ye calculator reflective guidance deta hai. Ye medical, legal, financial ya professional advice ka replacement nahi hai."
  } : {
    eyebrow: "Focused Calculator", back: "Back to Free Calculators", whatShows: "What this calculator shows", requiredDetails: "Required details", formTitle: "Enter details", calculate: "Calculate", fullName: "Full Name", gender: "Gender", selectGender: "Select gender", male: "Male", female: "Female", preferNot: "Prefer not to say", dateOfBirth: "Date of Birth", timeOfBirth: "Time of Birth", birthPlace: "Birth Place", birthPlacePlaceholder: "Search city, country", vehicleNumber: "Vehicle Number", mobileNumber: "Mobile Number", usagePurpose: "Usage Purpose", optional: "Optional", brideDetails: "Bride Details", groomDetails: "Groom Details", purposes: ["Personal", "Business", "Career", "Family"], disclaimer: "This calculator provides reflective guidance. It does not replace medical, legal, financial, or professional advice."
  };
  const detail = pageDetails(locale)[kind];
  return { ...base, ...detail };
}

function pageDetails(locale: Locale): Record<FocusedCalculatorKind, { title: string; subtitle: string; requiredCopy: string; highlights: string[] }> {
  const en = {
    astroReq: "Full name, gender, date of birth, exact birth time, and birth place.",
    matchReq: "Bride and groom name, date of birth, time of birth, and birth place.",
    nameDob: "Full name and date of birth.",
    dob: "Date of birth.",
    name: "Full name."
  };
  const hi = {
    astroReq: "पूरा नाम, लिंग, जन्म तिथि, सही जन्म समय और जन्म स्थान।",
    matchReq: "वधू और वर का नाम, जन्म तिथि, जन्म समय और जन्म स्थान।",
    nameDob: "पूरा नाम और जन्म तिथि।",
    dob: "जन्म तिथि।",
    name: "पूरा नाम।"
  };
  const h = locale === "hi" ? hi : en;
  return {
    dasha: { title: locale === "hi" ? "मुफ़्त दशा कैलकुलेटर" : "Free Dasha Calculator", subtitle: "Calculate focused Vimshottari Mahadasha and Antardasha guidance.", requiredCopy: h.astroReq, highlights: ["Current Mahadasha and Antardasha", "Current and next timing period", "Focused practical Dasha guidance"] },
    nakshatra: { title: locale === "hi" ? "मुफ़्त नक्षत्र कैलकुलेटर" : "Free Nakshatra Calculator", subtitle: "Find your birth Nakshatra, Pada, Moon sign, and focused guidance.", requiredCopy: h.astroReq, highlights: ["Birth Nakshatra and index", "Pada, Moon sign, and Nakshatra lord", "Practical suggestions"] },
    "moon-sign": { title: locale === "hi" ? "मुफ़्त चंद्र राशि कैलकुलेटर" : "Free Moon Sign Calculator", subtitle: "Find your Chandra Rashi and emotional nature from complete birth details.", requiredCopy: h.astroReq, highlights: ["Moon sign and Rashi lord", "Moon degree and Nakshatra", "Emotional and practical guidance"] },
    lagna: { title: locale === "hi" ? "मुफ़्त लग्न कैलकुलेटर" : "Free Lagna Calculator", subtitle: "Find your Lagna / Ascendant and life approach.", requiredCopy: h.astroReq, highlights: ["Lagna and Lagna lord", "Ascendant degree if available", "Personality direction"] },
    manglik: { title: locale === "hi" ? "मांगलिक कैलकुलेटर" : "Free Manglik Calculator", subtitle: "Check Manglik indication calmly using Lagna, Moon, and Venus references where available.", requiredCopy: h.astroReq, highlights: ["Manglik status", "Mars house basis", "Non-fear-based relationship guidance"] },
    yoga: { title: locale === "hi" ? "योग कैलकुलेटर" : "Free Yoga Calculator", subtitle: "Review important Kundli yogas without exaggerated claims.", requiredCopy: h.astroReq, highlights: ["Number of yogas found", "Yoga meanings", "Practical guidance"] },
    vehicle: { title: locale === "hi" ? "वाहन नंबर कैलकुलेटर" : "Vehicle Number Numerology Calculator", subtitle: "Check vehicle number compatibility with your personal numerology pattern.", requiredCopy: "Full name, date of birth, and vehicle number.", highlights: ["Vehicle total", "Personal number compatibility", "Safe guidance"] },
    mobile: { title: locale === "hi" ? "मोबाइल नंबर कैलकुलेटर" : "Mobile Number Numerology Calculator", subtitle: "Check mobile number compatibility with your name, DOB, and Lo Shu pattern.", requiredCopy: "Full name, date of birth, and mobile number.", highlights: ["Mobile total", "Communication energy", "Supportive number influences"] },
    "name-number": { title: locale === "hi" ? "नामांक कैलकुलेटर" : "Name Number Calculator", subtitle: "Calculate Naamank and its compatibility with DOB.", requiredCopy: h.nameDob, highlights: ["Name Number / Naamank", "Moolank and Bhagyank comparison", "Name energy suggestions"] },
    "lo-shu": { title: locale === "hi" ? "लो शू ग्रिड कैलकुलेटर" : "Lo Shu Grid Calculator", subtitle: "See missing, repeated, and present numbers in the standard Lo Shu grid.", requiredCopy: h.dob, highlights: ["3x3 Lo Shu grid", "Missing and repeated numbers", "Balancing suggestions"] },
    destiny: { title: locale === "hi" ? "भाग्यांक कैलकुलेटर" : "Destiny Number Calculator", subtitle: "Calculate Bhagyank / Life Path from date of birth.", requiredCopy: h.dob, highlights: ["Life Path number", "Core life theme", "Practical guidance"] },
    personality: { title: locale === "hi" ? "व्यक्तित्व अंक कैलकुलेटर" : "Personality Number Calculator", subtitle: "Calculate outer expression and social impression from name.", requiredCopy: h.name, highlights: ["Personality number", "Outer expression theme", "Communication guidance"] },
    "guna-milan": { title: locale === "hi" ? "गुण मिलान कैलकुलेटर" : "Guna Milan Calculator", subtitle: "Focused Ashtakoot score summary from complete bride and groom birth details.", requiredCopy: h.matchReq, highlights: ["Total Guna / 36", "Match percent", "Ashtakoot mini breakdown"] },
    "nadi-dosha": { title: locale === "hi" ? "नाड़ी दोष कैलकुलेटर" : "Nadi Dosha Calculator", subtitle: "Focused Nadi score and calm compatibility guidance.", requiredCopy: h.matchReq, highlights: ["Bride and groom Nadi", "Nadi score", "Non-fear-based guidance"] },
    bhakoot: { title: locale === "hi" ? "भकूट कैलकुलेटर" : "Bhakoot Calculator", subtitle: "Focused Bhakoot score and Moon-sign distance context.", requiredCopy: h.matchReq, highlights: ["Moon signs", "Sign distance", "Bhakoot guidance"] },
    "marriage-suitability": { title: locale === "hi" ? "विवाह उपयुक्तता कैलकुलेटर" : "Marriage Suitability Calculator", subtitle: "Focused marriage suitability guidance from existing matching result.", requiredCopy: h.matchReq, highlights: ["Marriage suitability", "Supportive points", "Review checklist"] }
  };
}

function resultCopy(locale: Locale) {
  const en = {
    dashaResult: "Dasha Result", nakshatraResult: "Nakshatra Result", moonResult: "Moon Sign Result", lagnaResult: "Lagna Result", manglikResult: "Manglik Result", yogaResult: "Yoga Result", mobileResult: "Mobile Number Result", vehicleResult: "Vehicle Number Result", nameNumberResult: "Name Number Result", loShuResult: "Lo Shu Grid Result", destinyResult: "Destiny Number Result", personalityResult: "Personality Number Result", gunaResult: "Guna Milan Result", nadiResult: "Nadi Result", bhakootResult: "Bhakoot Result", marriageResult: "Marriage Suitability Result",
    currentMahadasha: "Current Mahadasha", currentAntardasha: "Current Antardasha", dateRange: "Date Range", nakshatra: "Nakshatra", pada: "Pada", moonSign: "Moon Sign", nakshatraLord: "Nakshatra Lord", rashiLord: "Rashi Lord", moonDegree: "Moon Degree", lagna: "Lagna", lagnaLord: "Lagna Lord", ascDegree: "Ascendant Degree", manglikStatus: "Manglik Status", marsHouse: "Mars House", moonBasis: "Moon Basis", venusBasis: "Venus Basis", yogasFound: "Yogas Found", strongestYoga: "Strongest Yoga", overallTheme: "Overall Theme", yogaList: "Yoga List",
    numberTotal: "Number Total", reducedNumber: "Reduced Number", verdict: "Verdict", moolank: "Moolank", bhagyank: "Bhagyank", naamank: "Naamank", personalCompatibility: "Compatibility With Personal Numbers", cautions: "Cautions", supportiveNumbers: "Supportive Numbers", vehicleNumber: "Vehicle Number", mobileNumber: "Mobile Number", nameEnergy: "Name Energy Meaning", calculationBasis: "Calculation Basis", dobDigits: "Date-of-birth digits", coreTheme: "Core Life Theme", personalityNumber: "Personality Number", outerExpression: "Outer Expression", missingNumbers: "Missing Numbers", repeatedNumbers: "Repeated Numbers",
    totalGuna: "Total Guna Score", matchPercent: "Match Percent", category: "Category", guidance: "Guidance", brideNadi: "Bride Nadi", groomNadi: "Groom Nadi", nadiScore: "Nadi Score", nadiStatus: "Nadi Status", explanation: "Explanation", brideMoon: "Bride Moon Sign", groomMoon: "Groom Moon Sign", signDistance: "Sign Distance", bhakootScore: "Bhakoot Score", marriageSuitability: "Marriage Suitability", manglikStatusShort: "Manglik", supportivePoints: "Supportive Points", cautionPoints: "Caution Points", reviewChecklist: "Practical Review Checklist", relationshipGuidance: "Relationship Guidance", nature: "Nature", emotionalNature: "Emotional Nature", personalityDirection: "Personality Direction", practicalGuidance: "Practical Guidance",
    nonManglik: "Non-Manglik", needsReview: "Needs Review", none: "None", supportiveThemes: "Supportive themes", needsFullReview: "Needs full chart review", noYoga: "No major yoga was clearly identified from the available calculation. A full chart review may provide deeper context."
  };
  if (locale !== "hi") return en;
  return { ...en, dashaResult: "दशा परिणाम", nakshatraResult: "नक्षत्र परिणाम", moonResult: "चंद्र राशि परिणाम", lagnaResult: "लग्न परिणाम", manglikResult: "मांगलिक परिणाम", yogaResult: "योग परिणाम", gunaResult: "गुण मिलान परिणाम", nadiResult: "नाड़ी परिणाम", bhakootResult: "भकूट परिणाम", marriageResult: "विवाह उपयुक्तता परिणाम", currentMahadasha: "वर्तमान महादशा", currentAntardasha: "वर्तमान अंतर्दशा", moonSign: "चंद्र राशि", nakshatra: "नक्षत्र", lagna: "लग्न", totalGuna: "कुल गुण", matchPercent: "मिलान प्रतिशत", guidance: "मार्गदर्शन", explanation: "व्याख्या", practicalGuidance: "व्यावहारिक मार्गदर्शन" };
}
