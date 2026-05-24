"use client";

import { useState } from "react";
import type React from "react";
import { CalendarHeart, HeartHandshake, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";

type PersonKey = "bride" | "groom";
type VisiblePerson = { name: string; gender: string; birthDate: string; birthTime: string; birthPlace: string };
type DisplayFactor = { name?: string; koot?: string; score?: number; max?: number; maxScore?: number; meaning?: string; result?: string; brideValue?: string; groomValue?: string; explanation?: string; basis?: string; status?: string };
type MatchResult = {
  brideProfile?: { name?: string; gender?: string; birthPlace?: string };
  groomProfile?: { name?: string; gender?: string; birthPlace?: string };
  brideChart?: { avakhada?: { ascendant?: string; moonSign?: string; nakshatra?: string } };
  groomChart?: { avakhada?: { ascendant?: string; moonSign?: string; nakshatra?: string } };
  compatibilityScore?: number;
  guna?: number;
  maxGuna?: number;
  matchPercentage?: number;
  manglikCompatible?: boolean;
  marriagePrediction?: string;
  relationshipAnalysis?: string;
  emotionalCompatibility?: string;
  careerFinanceCompatibility?: string;
  marriageRecommendation?: string;
  remedies?: string;
  factors?: DisplayFactor[];
  gunaMilan?: { totalScore?: number; maxScore?: number; percentage?: number; verdict?: string; ashtakoot?: DisplayFactor[] };
  doshaAnalysis?: { manglikCompatibility?: string; nadiDosh?: { present?: boolean; summary?: string }; bhakootDosh?: { present?: boolean; summary?: string }; remedies?: string[] };
  compatibility?: { emotional?: number; mental?: number; physical?: number; financial?: number; family?: number; longTerm?: number };
  limitationNotes?: string[];
  strengths?: string[];
  concerns?: string[];
  practicalGuidance?: string[];
  moonCompatibility?: string;
  nakshatraCompatibility?: string;
  calculationBasis?: { bride?: Record<string, string | number | undefined>; groom?: Record<string, string | number | undefined> };
  manglikComparison?: { brideStatus?: string; groomStatus?: string; brideBasis?: string; groomBasis?: string; compatible?: boolean; note?: string };
  reportReady?: { title?: string; sections?: string[]; downloadAvailable?: boolean; note?: string };
  aiSummary?: string;
  disclaimer?: string;
};

const defaultPlace: ResolvedLocation = { displayName: "Delhi, India", city: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };
const initialPerson = (): VisiblePerson => ({ name: "", gender: "Prefer not to say", birthDate: "", birthTime: "", birthPlace: "Delhi, India" });

export function MatchmakingForm() {
  const { apiLocale, requiredMessage, tr } = useLanguage();
  const [people, setPeople] = useState<Record<PersonKey, VisiblePerson>>({ bride: initialPerson(), groom: initialPerson() });
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [locations, setLocations] = useState<Record<PersonKey, ResolvedLocation | null>>({ bride: defaultPlace, groom: defaultPlace });
  const [loading, setLoading] = useState(false);

  function updatePerson(key: PersonKey, patch: Partial<VisiblePerson>) {
    setFieldErrors((current) => {
      const next = { ...current };
      Object.keys(patch).forEach((field) => delete next[`${key}.${field}`]);
      return next;
    });
    setPeople((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
    if (patch.birthPlace !== undefined) setLocations((current) => ({ ...current, [key]: null }));
  }

  function updateResolvedLocation(key: PersonKey, location: ResolvedLocation | null) {
    setLocations((current) => ({ ...current, [key]: location }));
    if (location) {
      setPeople((current) => ({ ...current, [key]: { ...current[key], birthPlace: location.displayName } }));
      setFieldErrors((current) => ({ ...current, [`${key}.birthPlace`]: undefined }));
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateMatchFields(people, locations, {
      required: requiredMessage,
      invalidLocation: tr("selectLocationFromSuggestions"),
      invalidDate: tr("invalidDate"),
      invalidTime: tr("invalidTime")
    });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await secureFetch("/api/kundli-match/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bride: { name: people.bride.name, gender: people.bride.gender, dateOfBirth: people.bride.birthDate, timeOfBirth: people.bride.birthTime, birthPlace: people.bride.birthPlace, latitude: locations.bride?.latitude, longitude: locations.bride?.longitude, timezone: locations.bride?.timezone ?? "Asia/Kolkata" },
          groom: { name: people.groom.name, gender: people.groom.gender, dateOfBirth: people.groom.birthDate, timeOfBirth: people.groom.birthTime, birthPlace: people.groom.birthPlace, latitude: locations.groom?.latitude, longitude: locations.groom?.longitude, timezone: locations.groom?.timezone ?? "Asia/Kolkata" },
          language: apiLocale,
          locale: apiLocale
        })
      });
      const json = await response.json();
      if (!response.ok) {
        setError(toFriendlyError(json.error, tr("matchGenerationFailed")));
        return;
      }
      setResult(json.data.report);
    } catch {
      setError(tr("matchGenerationFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <div className="grid gap-5 xl:grid-cols-2">
        <PersonPanel title={tr("brideDetails")} personKey="bride" value={people.bride} errors={fieldErrors} onChange={(patch) => updatePerson("bride", patch)} onResolvedLocation={(location) => updateResolvedLocation("bride", location)} />
        <PersonPanel title={tr("groomDetails")} personKey="groom" value={people.groom} errors={fieldErrors} onChange={(patch) => updatePerson("groom", patch)} onResolvedLocation={(location) => updateResolvedLocation("groom", location)} />
      </div>
      {error ? <p className="rounded-lg border border-[#FF4D4F]/30 bg-[#FF4D4F]/10 p-3 text-sm text-[#FF4D4F]">{error}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm naksh-muted-text">{tr("locationConvertedInternally")}</p>
        <Button type="submit" size="lg" className="h-12 w-full sm:w-auto" disabled={loading}>
          <HeartHandshake className="h-4 w-4" />
          {loading ? tr("preparingReading") : tr("generateMatch")}
        </Button>
      </div>
      {result ? <MatchResultView result={result} /> : null}
    </form>
  );
}

function PersonPanel({ title, personKey, value, onChange, onResolvedLocation, errors }: { title: string; personKey: PersonKey; value: VisiblePerson; errors: FieldErrors; onChange: (patch: Partial<VisiblePerson>) => void; onResolvedLocation: (location: ResolvedLocation | null) => void }) {
  const { tr } = useLanguage();
  const err = (field: keyof VisiblePerson) => errors[`${personKey}.${field}`];
  return (
    <Card className="glass overflow-visible">
      <CardHeader className="border-b border-[#1e293b] bg-[#0a1224]/70">
        <CardTitle className="font-cinzel text-2xl text-[#f3d382]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 overflow-visible p-4 sm:grid-cols-2 sm:p-6">
        <Field label={tr("name")} error={err("name")}><Input data-field={`${personKey}.name`} className={errorClass(Boolean(err("name")))} value={value.name} onChange={(event) => onChange({ name: event.target.value })} /></Field>
        <Field label={tr("gender")}>
          <select value={value.gender} onChange={(event) => onChange({ gender: event.target.value })} className="h-10 w-full rounded-md border border-[#1e293b] bg-[#0f1c3a] px-3 text-sm text-[#ffffff] outline-none transition focus:border-[#dca956] focus:ring-2 focus:ring-[#00f5a0]/20">
            <option value="Prefer not to say">{tr("genderPreferNotToSay")}</option>
            <option value="Female">{tr("genderFemale")}</option>
            <option value="Male">{tr("genderMale")}</option>
            <option value="Other">{tr("genderOther")}</option>
          </select>
        </Field>
        <Field label={tr("dateOfBirth")} error={err("birthDate")}><Input data-field={`${personKey}.birthDate`} className={errorClass(Boolean(err("birthDate")))} type="date" value={value.birthDate} onChange={(event) => onChange({ birthDate: event.target.value })} /></Field>
        <Field label={tr("timeOfBirth")} error={err("birthTime")}><Input data-field={`${personKey}.birthTime`} className={errorClass(Boolean(err("birthTime")))} type="time" value={value.birthTime} onChange={(event) => onChange({ birthTime: event.target.value })} /></Field>
        <LocationAutocomplete
          label={tr("birthPlace")}
          required
          dataField={`${personKey}.birthPlace`}
          value={value.birthPlace}
          onChange={(birthPlace) => onChange({ birthPlace })}
          onResolvedLocation={onResolvedLocation}
          error={err("birthPlace")}
          placeholder={tr("searchLocationPlaceholder")}
        />
      </CardContent>
    </Card>
  );
}

function MatchResultView({ result }: { result: MatchResult }) {
  const { tr, apiLocale } = useLanguage();
  return (
    <Card className="glass overflow-visible">
      <CardHeader className="border-b border-[#1e293b] bg-[#0a1224]/70">
        <CardTitle className="font-cinzel text-2xl text-[#f3d382]">{tr("premiumCompatibilityReport")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard icon={<Sparkles />} label={tr("totalGuna")} value={`${result.gunaMilan?.totalScore ?? result.guna ?? 0} / ${result.gunaMilan?.maxScore ?? result.maxGuna ?? 36}`} />
          <ScoreCard icon={<CalendarHeart />} label={tr("matchPercent")} value={`${result.gunaMilan?.percentage ?? result.matchPercentage ?? 0}%`} />
          <ScoreCard icon={<ShieldCheck />} label={tr("manglikStatus")} value={result.manglikComparison?.compatible ? tr("balanced") : tr("reviewNeeded")} />
          <ScoreCard icon={<HeartHandshake />} label={tr("overallGuidance")} value={guidanceLabel(result.gunaMilan?.totalScore ?? result.guna ?? 0, apiLocale)} />
        </div>
        <p className="rounded-xl border border-[#dca956]/25 bg-[#dca956]/10 p-4 text-sm leading-6 text-[#f3d382]">{tr("gunaScoreNote")}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <InsightCard title={tr("brideDetails")} icon={<HeartHandshake className="h-4 w-4" />} text={chartSummary(result.brideProfile, result.brideChart, tr("notAvailable"), chartSummaryLabels(apiLocale), apiLocale)} />
          <InsightCard title={tr("groomDetails")} icon={<HeartHandshake className="h-4 w-4" />} text={chartSummary(result.groomProfile, result.groomChart, tr("notAvailable"), chartSummaryLabels(apiLocale), apiLocale)} />
          <InsightCard title={tr("brideAstroBasis")} icon={<Sparkles className="h-4 w-4" />} text={basisLine(result.calculationBasis?.bride, tr("notAvailable"), apiLocale)} />
          <InsightCard title={tr("groomAstroBasis")} icon={<Sparkles className="h-4 w-4" />} text={basisLine(result.calculationBasis?.groom, tr("notAvailable"), apiLocale)} />
          <InsightCard title={tr("moonSignCompatibility")} icon={<HeartHandshake className="h-4 w-4" />} text={result.moonCompatibility} />
          <InsightCard title={tr("nakshatraCompatibility")} icon={<Sparkles className="h-4 w-4" />} text={result.nakshatraCompatibility} />
          <InsightCard title={tr("emotionalCompatibility")} icon={<HeartHandshake className="h-4 w-4" />} text={result.emotionalCompatibility ?? result.relationshipAnalysis ?? scoreLine(apiLocale, tr("emotionalCompatibility"), result.compatibility?.emotional)} />
          <InsightCard title={tr("mentalCompatibility")} icon={<Sparkles className="h-4 w-4" />} text={scoreLine(apiLocale, tr("mentalCompatibility"), result.compatibility?.mental)} />
          <InsightCard title={tr("physicalCompatibility")} icon={<ShieldCheck className="h-4 w-4" />} text={scoreLine(apiLocale, tr("physicalCompatibility"), result.compatibility?.physical)} />
          <InsightCard title={tr("careerFinanceCompatibility")} icon={<WalletCards className="h-4 w-4" />} text={compatibilityLine(apiLocale, result.compatibility?.financial ?? 0, result.compatibility?.mental ?? 0)} />
          <InsightCard title={tr("familyMarriageStability")} icon={<CalendarHeart className="h-4 w-4" />} text={scoreLine(apiLocale, tr("familyMarriageStability"), result.compatibility?.family ?? result.compatibility?.longTerm)} />
          <InsightCard title={tr("manglikAnalysis")} icon={<ShieldCheck className="h-4 w-4" />} text={manglikLine(result, tr("notAvailable"), apiLocale)} />
          <InsightCard title={tr("finalRecommendation")} icon={<CalendarHeart className="h-4 w-4" />} text={result.gunaMilan?.verdict ?? result.marriageRecommendation ?? result.marriagePrediction} />
          <InsightCard title={tr("reportReadyOutput")} icon={<WalletCards className="h-4 w-4" />} text={reportReadyLine(result, tr("notAvailable"))} />
          <ListCard title={tr("strengths")} items={result.strengths} empty={tr("notAvailable")} />
          <ListCard title={tr("concerns")} items={result.concerns} empty={tr("notAvailable")} />
          <ListCard title={tr("practicalGuidance")} items={result.practicalGuidance ?? result.doshaAnalysis?.remedies} empty={tr("notAvailable")} />
          <ListCard title={tr("limitationNotes")} items={result.limitationNotes} empty={tr("notAvailable")} />
        </div>
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-[#f3d382]">{tr("ashtakootBreakdown")}</h3>
            <span className="rounded-full border border-[#dca956]/25 bg-[#dca956]/10 px-3 py-1 text-xs text-[#f3d382]">{tr("reportReadyOutput")}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(result.gunaMilan?.ashtakoot ?? result.factors ?? []).map((factor, index) => (
              <div key={`${factor.name ?? "factor"}-${index}`} className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/78 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-[#f3d382]">{safeText(factor.koot ?? factor.name, tr("notAvailable"))}</p>
                  <span className={`rounded-full border px-2 py-1 text-[11px] ${statusPillClass(factor.status)}`}>{safeText(factor.result ?? factor.status, tr("notAvailable"))}</span>
                </div>
                <p className="mt-2 font-cinzel text-2xl font-black text-[#fbc02d]">{factor.score ?? 0} / {getFactorMax(factor)}</p>
                <div className="mt-3 grid gap-2 text-xs leading-5 naksh-muted-text">
                  <p><span className="text-white">{tr("brideDetails")}:</span> {safeText(factor.brideValue, tr("notAvailable"))}</p>
                  <p><span className="text-white">{tr("groomDetails")}:</span> {safeText(factor.groomValue, tr("notAvailable"))}</p>
                  <p>{safeText(factor.explanation ?? factor.meaning, tr("notAvailable"))}</p>
                  <p className="text-[#dca956]">{safeText(factor.basis, tr("notAvailable"))}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <p className="rounded-xl border border-[#1e293b] bg-[#020612]/72 p-4 text-xs leading-6 text-[#94a3b8]">{safeText(result.disclaimer, tr("notAvailable"))}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-[#FF4D4F]">{error}</p> : null}</div>;
}

function validateMatchFields(people: Record<PersonKey, VisiblePerson>, locations: Record<PersonKey, ResolvedLocation | null>, messages: { required: string; invalidLocation: string; invalidDate: string; invalidTime: string }) {
  const required: (keyof VisiblePerson)[] = ["name", "birthDate", "birthTime", "birthPlace"];
  return (["bride", "groom"] as PersonKey[]).reduce<FieldErrors>((errors, key) => {
    required.forEach((field) => {
      if (isBlank(people[key][field])) errors[`${key}.${field}`] = messages.required;
    });
    if (!errors[`${key}.birthDate`] && Number.isNaN(new Date(`${people[key].birthDate}T00:00:00.000Z`).getTime())) errors[`${key}.birthDate`] = messages.invalidDate;
    if (!errors[`${key}.birthTime`] && !/^\d{2}:\d{2}$/.test(people[key].birthTime)) errors[`${key}.birthTime`] = messages.invalidTime;
    if (!errors[`${key}.birthPlace`] && (!locations[key] || locations[key]?.displayName !== people[key].birthPlace)) errors[`${key}.birthPlace`] = messages.invalidLocation;
    return errors;
  }, {});
}

function ScoreCard({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return <div className="rounded-lg border border-[#1e293b] bg-[radial-gradient(circle_at_top,rgba(0,245,160,0.08),transparent_14rem),#0f1c3a] p-5"><div className="mb-3 text-[#dca956]">{icon}</div><p className="text-xs uppercase tracking-[0.18em] naksh-muted-text">{label}</p><p className="mt-2 font-cinzel text-3xl font-black text-[#fbc02d]">{value}</p></div>;
}

function InsightCard({ title, icon, text }: { title: string; icon: React.ReactNode; text?: string }) {
  const { tr } = useLanguage();
  return <div className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/78 p-4"><h3 className="flex items-center gap-2 font-semibold text-[#f3d382]">{icon}{title}</h3><p className="mt-3 text-sm leading-7 naksh-muted-text">{safeText(text, tr("notAvailable"))}</p></div>;
}

function ListCard({ title, items, empty }: { title: string; items?: string[]; empty: string }) {
  const cleanItems = (items ?? []).filter((item) => safeText(item, "") !== "");
  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/78 p-4">
      <h3 className="font-semibold text-[#f3d382]">{title}</h3>
      {cleanItems.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 naksh-muted-text">
          {cleanItems.map((item, index) => <li key={`${title}-${index}`} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00f5a0]" />{item}</li>)}
        </ul>
      ) : <p className="mt-3 text-sm naksh-muted-text">{empty}</p>}
    </div>
  );
}

function getFactorMax(factor: { max?: number; maxScore?: number }) {
  return factor.maxScore ?? factor.max ?? 0;
}

function toFriendlyError(message: string | undefined, fallback: string) {
  if (!message || /server|unexpected|database|prisma|validation/i.test(message)) return fallback;
  return message;
}


function chartSummary(profile: MatchResult["brideProfile"], chart: MatchResult["brideChart"], fallback: string, labels: { lagna: string; rashi: string; nakshatra: string }, language: "en" | "hi" | "hinglish") {
  const avakhada = chart?.avakhada;
  return `${profile?.name ?? fallback} | ${labels.lagna}: ${localizeSign(avakhada?.ascendant, language, fallback)} | ${labels.rashi}: ${localizeSign(avakhada?.moonSign, language, fallback)} | ${labels.nakshatra}: ${localizeNakshatra(avakhada?.nakshatra, language, fallback)}`;
}

function chartSummaryLabels(language: "en" | "hi" | "hinglish") {
  if (language === "hi") return { lagna: "लग्न", rashi: "राशि", nakshatra: "नक्षत्र" };
  if (language === "hinglish") return { lagna: "Lagna", rashi: "Rashi", nakshatra: "Nakshatra" };
  return { lagna: "Lagna", rashi: "Rashi", nakshatra: "Nakshatra" };
}

function compatibilityLine(language: "en" | "hi" | "hinglish", financial: number, mental: number) {
  if (language === "hi") return `वित्तीय अनुकूलता: ${financial}%. मानसिक अनुकूलता: ${mental}%.`;
  if (language === "hinglish") return `Financial compatibility: ${financial}%. Mental compatibility: ${mental}%.`;
  return `Financial compatibility: ${financial}%. Mental compatibility: ${mental}%.`;
}

function scoreLine(language: "en" | "hi" | "hinglish", label: string, value?: number) {
  if (typeof value !== "number") return undefined;
  if (language === "hi") return `${label}: ${value}%.`;
  return `${label}: ${value}%.`;
}

function doshaLine(result: MatchResult, fallback: string) {
  return [
    result.doshaAnalysis?.manglikCompatibility,
    result.doshaAnalysis?.nadiDosh?.summary,
    result.doshaAnalysis?.bhakootDosh?.summary
  ].filter((item): item is string => typeof item === "string" && item.trim().length > 0).join(" ") || fallback;
}

function reportReadyLine(result: MatchResult, fallback: string) {
  const sections = result.reportReady?.sections?.filter(Boolean).join(", ");
  const note = safeText(result.reportReady?.note, "");
  return [safeText(result.reportReady?.title, ""), sections, note].filter(Boolean).join(" | ") || fallback;
}

function manglikLine(result: MatchResult, fallback: string, language: "en" | "hi" | "hinglish") {
  const comparison = result.manglikComparison;
  const labels = manglikLabels(language);
  if (comparison) {
    const parts = [
      comparison.compatible ? `${labels.status}: ${labels.balanced}` : `${labels.status}: ${labels.review}`,
      comparison.brideStatus ? `${labels.bride}: ${comparison.brideStatus}` : null,
      comparison.groomStatus ? `${labels.groom}: ${comparison.groomStatus}` : null,
      comparison.note ? `${labels.note}: ${comparison.note}` : null
    ];
    const basis = [comparison.brideBasis, comparison.groomBasis].filter((item) => item && !isGenericUnavailable(item, fallback));
    return [...parts, ...basis].filter((item): item is string => typeof item === "string" && item.trim().length > 0).join(" ");
  }
  return doshaLine(result, fallback);
}

function basisLine(basis: Record<string, string | number | undefined> | undefined, fallback: string, language: "en" | "hi" | "hinglish") {
  if (!basis) return fallback;
  const labels = ["moonSign", "moonLord", "nakshatra", "gana", "nadi", "yoni", "varna", "vashya"] as const;
  return labels.map((key) => `${basisLabel(key, language)}: ${basis[key] ?? fallback}`).join(" | ");
}

function basisLabel(key: string, language: "en" | "hi" | "hinglish") {
  if (language === "hi") {
    return ({ moonSign: "चंद्र राशि", moonLord: "राशि स्वामी", nakshatra: "नक्षत्र", gana: "गण", nadi: "नाड़ी", yoni: "योनि", varna: "वर्ण", vashya: "वश्य" } as Record<string, string>)[key] ?? key;
  }
  if (language === "hinglish") {
    return ({ moonSign: "Moon Sign", moonLord: "Rashi Lord", nakshatra: "Nakshatra", gana: "Gana", nadi: "Nadi", yoni: "Yoni", varna: "Varna", vashya: "Vashya" } as Record<string, string>)[key] ?? key;
  }
  return ({ moonSign: "Moon Sign", moonLord: "Rashi Lord", nakshatra: "Nakshatra", gana: "Gana", nadi: "Nadi", yoni: "Yoni", varna: "Varna", vashya: "Vashya" } as Record<string, string>)[key] ?? key;
}

function guidanceLabel(score: number, language: "en" | "hi" | "hinglish") {
  if (language === "hi") {
    if (score >= 28) return "मजबूत";
    if (score >= 24) return "अच्छा";
    if (score >= 18) return "औसत";
    return "समीक्षा आवश्यक";
  }
  if (score >= 28) return "Strong";
  if (score >= 24) return "Good";
  if (score >= 18) return "Average";
  return language === "hinglish" ? "Review needed" : "Needs review";
}

function statusPillClass(status?: string) {
  if (status === "good") return "border-[#00f5a0]/30 bg-[#00f5a0]/10 text-[#00f5a0]";
  if (status === "average") return "border-[#fbc02d]/30 bg-[#fbc02d]/10 text-[#fbc02d]";
  return "border-[#ea580c]/35 bg-[#ea580c]/10 text-[#f3d382]";
}

function manglikLabels(language: "en" | "hi" | "hinglish") {
  if (language === "hi") return { status: "मांगलिक स्थिति", bride: "वधू", groom: "वर", note: "नोट", balanced: "संतुलित", review: "समीक्षा आवश्यक" };
  if (language === "hinglish") return { status: "Manglik Status", bride: "Bride", groom: "Groom", note: "Note", balanced: "Balanced", review: "Review needed" };
  return { status: "Manglik Status", bride: "Bride", groom: "Groom", note: "Note", balanced: "Balanced", review: "Needs review" };
}

function isGenericUnavailable(value: string | undefined, fallback: string) {
  const normalized = safeText(value, "").toLowerCase();
  return !normalized || normalized === fallback.toLowerCase() || normalized.includes("not available") || normalized.includes("available nahi") || normalized.includes("उपलब्ध नहीं");
}

function localizeSign(value: string | undefined, language: "en" | "hi" | "hinglish", fallback: string) {
  const signs: Record<string, { hi: string; hinglish: string }> = {
    Aries: { hi: "मेष", hinglish: "Aries" }, Taurus: { hi: "वृषभ", hinglish: "Taurus" }, Gemini: { hi: "मिथुन", hinglish: "Gemini" }, Cancer: { hi: "कर्क", hinglish: "Cancer" },
    Leo: { hi: "सिंह", hinglish: "Leo" }, Virgo: { hi: "कन्या", hinglish: "Virgo" }, Libra: { hi: "तुला", hinglish: "Libra" }, Scorpio: { hi: "वृश्चिक", hinglish: "Scorpio" },
    Sagittarius: { hi: "धनु", hinglish: "Sagittarius" }, Capricorn: { hi: "मकर", hinglish: "Capricorn" }, Aquarius: { hi: "कुंभ", hinglish: "Aquarius" }, Pisces: { hi: "मीन", hinglish: "Pisces" }
  };
  if (!value) return fallback;
  if (language === "hi") return signs[value]?.hi ?? value;
  if (language === "hinglish") return signs[value]?.hinglish ?? value;
  return value;
}

function localizeNakshatra(value: string | undefined, language: "en" | "hi" | "hinglish", fallback: string) {
  const nakshatras: Record<string, string> = {
    Ashwini: "अश्विनी", Bharani: "भरणी", Krittika: "कृत्तिका", Rohini: "रोहिणी", Mrigashira: "मृगशिरा", Ardra: "आर्द्रा", Punarvasu: "पुनर्वसु", Pushya: "पुष्य", Ashlesha: "आश्लेषा",
    Magha: "मघा", "Purva Phalguni": "पूर्वा फाल्गुनी", "Uttara Phalguni": "उत्तरा फाल्गुनी", Hasta: "हस्त", Chitra: "चित्रा", Swati: "स्वाती", Vishakha: "विशाखा", Anuradha: "अनुराधा",
    Jyeshtha: "ज्येष्ठा", Mula: "मूल", "Purva Ashadha": "पूर्वाषाढ़ा", "Uttara Ashadha": "उत्तराषाढ़ा", Shravana: "श्रवण", Dhanishta: "धनिष्ठा", Shatabhisha: "शतभिषा",
    "Purva Bhadrapada": "पूर्व भाद्रपद", "Uttara Bhadrapada": "उत्तर भाद्रपद", Revati: "रेवती"
  };
  if (!value) return fallback;
  return language === "hi" ? nakshatras[value] ?? value : value;
}

function safeText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text || text === "undefined" || text === "null" || text === "[object Object]") return fallback;
  if (/^\s*[{[]/.test(text)) return fallback;
  return text;
}




