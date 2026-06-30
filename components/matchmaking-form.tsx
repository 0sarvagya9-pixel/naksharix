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
type DisplayFactor = { name?: string; koot?: string; kootKey?: string; ruleKey?: string; brideKey?: string; groomKey?: string; details?: Record<string, string | number | boolean | undefined>; score?: number; max?: number; maxScore?: number; meaning?: string; result?: string; brideValue?: string; groomValue?: string; explanation?: string; basis?: string; status?: string };
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
    <Card className="overflow-visible">
      <CardHeader
        className="border-b"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.56)"
        }}
      >
        <CardTitle className="font-cinzel text-2xl text-[#17181d]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 overflow-visible p-4 sm:grid-cols-2 sm:p-6">
        <Field label={tr("name")} error={err("name")}><Input data-field={`${personKey}.name`} className={errorClass(Boolean(err("name")))} value={value.name} onChange={(event) => onChange({ name: event.target.value })} /></Field>
        <Field label={tr("gender")}>
          <select
            value={value.gender}
            onChange={(event) => onChange({ gender: event.target.value })}
            className="h-10 w-full rounded-md border outline-none transition"
            style={{
              background: "rgba(255, 255, 255, 0.52)",
              border: "1px solid rgba(255, 255, 255, 0.50)",
              color: "#17181d"
            }}
          >
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
  const factors = result.gunaMilan?.ashtakoot ?? result.factors ?? [];
  const guidance = marriageGuidance(result.gunaMilan?.totalScore ?? result.guna ?? 0, result.gunaMilan?.percentage ?? result.matchPercentage ?? 0, factors, result.manglikComparison?.compatible ?? true, apiLocale);
  const improvements = matchingSuggestions(factors, result.manglikComparison?.compatible ?? true, apiLocale);
  const strengths = matchingStrengths(factors, result.gunaMilan?.totalScore ?? result.guna ?? 0, result.manglikComparison?.compatible ?? true, apiLocale);
  const concerns = matchingConcerns(factors, result.gunaMilan?.totalScore ?? result.guna ?? 0, result.manglikComparison?.compatible ?? true, apiLocale);
  return (
    <Card className="overflow-visible">
      <CardHeader
        className="border-b"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.56)"
        }}
      >
        <CardTitle className="font-cinzel text-2xl text-[#17181d]">{tr("premiumCompatibilityReport")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard icon={<Sparkles />} label={tr("totalGuna")} value={`${result.gunaMilan?.totalScore ?? result.guna ?? 0} / ${result.gunaMilan?.maxScore ?? result.maxGuna ?? 36}`} />
          <ScoreCard icon={<CalendarHeart />} label={tr("matchPercent")} value={`${result.gunaMilan?.percentage ?? result.matchPercentage ?? 0}%`} />
          <ScoreCard icon={<ShieldCheck />} label={tr("manglikStatus")} value={result.manglikComparison?.compatible ? tr("balanced") : tr("reviewNeeded")} />
          <ScoreCard icon={<HeartHandshake />} label={tr("overallGuidance")} value={guidanceLabel(result.gunaMilan?.totalScore ?? result.guna ?? 0, apiLocale)} />
        </div>
        <p
          className="rounded-xl p-4 text-sm leading-6 text-[#c98924]"
          style={{
            background: "rgba(255, 255, 255, 0.52)",
            border: "1px solid rgba(255, 255, 255, 0.50)"
          }}
        >
          {tr("gunaScoreNote")}
        </p>
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
          <InsightCard title={matchingUi(apiLocale).marriageSuitabilityGuidance} icon={<CalendarHeart className="h-4 w-4" />} text={guidance.summary} />
          <ListCard title={matchingUi(apiLocale).compatibilityImprovementSuggestions} items={improvements} empty={tr("notAvailable")} />
          <ListCard title={matchingUi(apiLocale).supportivePoints} items={guidance.supportive} empty={tr("notAvailable")} />
          <ListCard title={matchingUi(apiLocale).cautionPoints} items={guidance.cautions} empty={tr("notAvailable")} />
          <ListCard title={matchingUi(apiLocale).practicalSteps} items={guidance.steps} empty={tr("notAvailable")} />
          <InsightCard title={tr("finalRecommendation")} icon={<CalendarHeart className="h-4 w-4" />} text={guidance.recommendation} />
          <InsightCard title={tr("reportReadyOutput")} icon={<WalletCards className="h-4 w-4" />} text={reportReadyLine(result, tr("notAvailable"))} />
          <ListCard title={tr("strengths")} items={strengths} empty={tr("notAvailable")} />
          <ListCard title={tr("concerns")} items={concerns} empty={tr("notAvailable")} />
          <ListCard title={tr("practicalGuidance")} items={guidance.steps} empty={tr("notAvailable")} />
          <ListCard title={tr("limitationNotes")} items={calculationBasisNotes(result, apiLocale)} empty={tr("notAvailable")} />
        </div>
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-[#17181d]">{tr("ashtakootBreakdown")}</h3>
            <span
              className="rounded-full border px-3 py-1 text-xs text-[#c98924]"
              style={{
                background: "rgba(255, 255, 255, 0.52)",
                border: "1px solid rgba(255, 255, 255, 0.50)"
              }}
            >
              {tr("reportReadyOutput")}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {factors.map((factor, index) => (
              <div
                key={`${factor.name ?? "factor"}-${index}`}
                className="rounded-lg p-4"
                style={{
                  background: "rgba(255, 255, 255, 0.52)",
                  border: "1px solid rgba(255, 255, 255, 0.50)"
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="notranslate font-semibold text-[#17181d]" translate="no">{localizeKootName(factor, apiLocale, tr("notAvailable"))}</p>
                  <span className={`rounded-full border px-2 py-1 text-[11px] ${statusPillClass(factor.status)}`}>{localizeStatus(factor.status, apiLocale, safeText(factor.result, tr("notAvailable")))}</span>
                </div>
                <p className="mt-2 font-cinzel text-2xl font-black text-[#c98924]">{factor.score ?? 0} / {getFactorMax(factor)}</p>
                <div className="mt-3 grid gap-2 text-xs leading-5 text-[#525866]">
                  <p><span className="text-[#17181d] font-semibold">{tr("brideDetails")}:</span> {localizeFactorValue(factor, "bride", apiLocale, tr("notAvailable"))}</p>
                  <p><span className="text-[#17181d] font-semibold">{tr("groomDetails")}:</span> {localizeFactorValue(factor, "groom", apiLocale, tr("notAvailable"))}</p>
                  <p>{localizeMatchingExplanation(factor, apiLocale, tr("notAvailable"))}</p>
                  <p className="text-[#c98924]">{localizeKootBasis(factor, apiLocale, tr("notAvailable"))}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <p
          className="rounded-xl p-4 text-xs leading-6 text-[#525866]"
          style={{
            background: "rgba(255, 255, 255, 0.52)",
            border: "1px solid rgba(255, 255, 255, 0.50)"
          }}
        >
          {safeText(result.disclaimer, tr("notAvailable"))}
        </p>
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
  return labels.map((key) => `${basisLabel(key, language)}: ${localizeBasisValue(key, basis[key], language, fallback)}`).join(" | ");
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

function matchingUi(language: "en" | "hi" | "hinglish") {
  if (language === "hi") return {
    marriageSuitabilityGuidance: "विवाह उपयुक्तता मार्गदर्शन",
    compatibilityImprovementSuggestions: "अनुकूलता सुधार सुझाव",
    supportivePoints: "सहायक बिंदु",
    cautionPoints: "सावधानी बिंदु",
    practicalSteps: "व्यावहारिक कदम"
  };
  if (language === "hinglish") return {
    marriageSuitabilityGuidance: "Vivah Suitability Guidance",
    compatibilityImprovementSuggestions: "Compatibility Improvement Suggestions",
    supportivePoints: "Supportive Points",
    cautionPoints: "Caution Points",
    practicalSteps: "Practical Steps"
  };
  return {
    marriageSuitabilityGuidance: "Marriage Suitability Guidance",
    compatibilityImprovementSuggestions: "Compatibility Improvement Suggestions",
    supportivePoints: "Supportive Points",
    cautionPoints: "Caution Points",
    practicalSteps: "Practical Steps"
  };
}

function localizeKootName(factor: DisplayFactor, language: "en" | "hi" | "hinglish", fallback: string) {
  const names = {
    en: { varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahaMaitri: "Graha Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi" },
    hi: { varna: "वर्ण", vashya: "वश्य", tara: "तारा", yoni: "योनि", grahaMaitri: "ग्रह मैत्री", gana: "गण", bhakoot: "भकूट", nadi: "नाड़ी" },
    hinglish: { varna: "Varna", vashya: "Vashya", tara: "Tara", yoni: "Yoni", grahaMaitri: "Graha Maitri", gana: "Gana", bhakoot: "Bhakoot", nadi: "Nadi" }
  } as const;
  return names[language][factor.kootKey as keyof typeof names.en] ?? safeText(factor.koot ?? factor.name, fallback);
}

function localizeStatus(status: string | undefined, language: "en" | "hi" | "hinglish", fallback: string) {
  const map = {
    en: { good: "Good", average: "Average", concern: "Concern" },
    hi: { good: "अच्छा", average: "औसत", concern: "चिंता" },
    hinglish: { good: "Good", average: "Average", concern: "Concern" }
  } as const;
  return status ? map[language][status as keyof typeof map.en] ?? fallback : fallback;
}

function localizeFactorValue(factor: DisplayFactor, side: "bride" | "groom", language: "en" | "hi" | "hinglish", fallback: string) {
  const key = side === "bride" ? factor.brideKey : factor.groomKey;
  if (!factor.kootKey || !key) return safeText(side === "bride" ? factor.brideValue : factor.groomValue, fallback);
  if (factor.kootKey === "varna") return localizeVarna(key, language, fallback);
  if (factor.kootKey === "vashya") return localizeVashya(key, language, fallback);
  if (factor.kootKey === "gana") return localizeGana(key, language, fallback);
  if (factor.kootKey === "nadi") return localizeNadi(key, language, fallback);
  if (factor.kootKey === "bhakoot") return localizeSign(key, language, fallback);
  if (factor.kootKey === "grahaMaitri") {
    const lord = side === "bride" ? factor.details?.brideLord : factor.details?.groomLord;
    return `${localizeSign(key, language, fallback)} - ${localizePlanet(String(lord ?? ""), language, fallback)}`;
  }
  if (factor.kootKey === "tara") {
    const index = side === "bride" ? factor.details?.brideIndex : factor.details?.groomIndex;
    return `${localizeNakshatra(key, language, fallback)} (${index ?? ""})`;
  }
  if (factor.kootKey === "yoni") {
    const nak = side === "bride" ? factor.details?.brideNakshatra : factor.details?.groomNakshatra;
    const index = side === "bride" ? factor.details?.brideIndex : factor.details?.groomIndex;
    return `${localizeNakshatra(String(nak ?? ""), language, fallback)} (${index ?? ""}) - ${localizeYoni(key, language, fallback)}`;
  }
  return safeText(key, fallback);
}

function localizeMatchingExplanation(factor: DisplayFactor, language: "en" | "hi" | "hinglish", fallback: string) {
  const status = localizeStatus(factor.status, language, fallback);
  const d = factor.details ?? {};
  if (factor.kootKey === "tara") {
    if (language === "hi") return `वधू से वर तारा दूरी ${d.brideToGroom} और वर से वधू दूरी ${d.groomToBride} है; परिणाम ${status} है।`;
    if (language === "hinglish") return `Bride-to-groom Tara distance ${d.brideToGroom} aur groom-to-bride distance ${d.groomToBride} hai; result ${status} hai.`;
    return `Bride-to-groom Tara distance ${d.brideToGroom}, groom-to-bride distance ${d.groomToBride}; result ${status}.`;
  }
  if (factor.kootKey === "bhakoot") {
    if (language === "hi") return `राशि दूरी ${d.distance}/${d.reverse} है; ${factor.status === "concern" ? "भकूट संबंध सावधानी मांगता है।" : "भकूट दोष स्पष्ट रूप से नहीं दिखता।"}`;
    if (language === "hinglish") return `Sign distance ${d.distance}/${d.reverse} hai; ${factor.status === "concern" ? "Bhakoot relation caution maangta hai." : "Bhakoot concern clearly indicated nahi hai."}`;
    return `Sign distance ${d.distance}/${d.reverse}; ${factor.status === "concern" ? "Bhakoot relation needs caution." : "No Bhakoot concern is indicated."}`;
  }
  if (factor.kootKey === "nadi") {
    if (language === "hi") return d.same ? "समान नाड़ी पर 0 अंक मिलते हैं; गहरी समीक्षा जरूरी है।" : "नाड़ी अलग है; पूर्ण अंक मिलते हैं।";
    if (language === "hinglish") return d.same ? "Same Nadi par deeper review zaroori hai." : "Different Nadi par full score milta hai.";
    return d.same ? "Same Nadi scores 0; deeper review is recommended." : "Different Nadi scores full points.";
  }
  const byRule: Record<string, Record<string, string>> = {
    hi: {
      varna_good: "वर का वर्ण वधू के वर्ण के बराबर या उससे उच्च माना जाता है।", varna_concern: "वर्ण नियम में सावधानी है।", vashya_good: "वश्य वर्ग अनुकूल है।", vashya_average: "वश्य वर्ग आंशिक रूप से अनुकूल है।", yoni_good: "योनि अनुकूलता अच्छी है।", yoni_average: "योनि अनुकूलता औसत है।", yoni_concern: "योनि संकेत सावधानी मांगता है।", graha_good: "ग्रह मैत्री सहायक है।", graha_average: "ग्रह मैत्री औसत है।", graha_concern: "राशि स्वामी संबंध मिश्रित है; परिणाम सावधानी का संकेत देता है।", gana_good: "गण अनुकूलता अच्छी है।", gana_average: "गण अनुकूलता औसत है।", gana_concern: "गण संकेत गहरी समीक्षा मांगता है।"
    },
    hinglish: {
      varna_good: "Groom varna bride ke barabar ya usse higher maana jata hai.", varna_concern: "Varna rule caution dikhata hai.", vashya_good: "Vashya class compatible hai.", vashya_average: "Vashya class partially compatible hai.", yoni_good: "Yoni compatibility good hai.", yoni_average: "Yoni compatibility average hai.", yoni_concern: "Yoni signal caution maangta hai.", graha_good: "Graha Maitri supportive hai.", graha_average: "Graha Maitri average hai.", graha_concern: "Rashi lord relation mixed hai; result concern dikhata hai.", gana_good: "Gana compatibility good hai.", gana_average: "Gana compatibility average hai.", gana_concern: "Gana deeper review maangta hai."
    },
    en: {
      varna_good: "Groom varna is equal to or higher than bride varna.", varna_concern: "Varna rule indicates caution.", vashya_good: "Vashya class is compatible.", vashya_average: "Vashya class is partially compatible.", yoni_good: "Yoni compatibility is good.", yoni_average: "Yoni compatibility is average.", yoni_concern: "Yoni signal needs caution.", graha_good: "Graha Maitri is supportive.", graha_average: "Graha Maitri is average.", graha_concern: "Rashi lord relation is mixed; result indicates caution.", gana_good: "Gana compatibility is good.", gana_average: "Gana compatibility is average.", gana_concern: "Gana needs deeper review."
    }
  };
  return byRule[language][factor.ruleKey ?? ""] ?? safeText(factor.explanation ?? factor.meaning, fallback);
}

function localizeKootBasis(factor: DisplayFactor, language: "en" | "hi" | "hinglish", fallback: string) {
  const map = {
    en: { varna: "Groom varna should be equal to or higher than bride varna.", vashya: "Compatibility of rashi-based Vashya classes.", tara: "9-Tara cycle from each birth nakshatra.", yoni: "Nakshatra yoni animal relationship.", grahaMaitri: "Friendship, neutrality, or enmity of Moon sign lords.", gana: "Traditional Deva, Manushya, Rakshasa table.", bhakoot: "2-12, 5-9, and 6-8 relations are treated as caution combinations.", nadi: "Same Nadi scores 0; different Nadi scores 8." },
    hi: { varna: "वर का वर्ण वधू के वर्ण के बराबर या उच्च होना चाहिए।", vashya: "राशि-आधारित वश्य वर्गों की संगति।", tara: "जन्म नक्षत्र से 9-तारा चक्र में शुभ/अशुभ गणना।", yoni: "नक्षत्र योनि पशु संबंध।", grahaMaitri: "चंद्र राशि स्वामियों की मित्रता/तटस्थता/शत्रुता।", gana: "देव, मनुष्य, राक्षस गण की पारंपरिक तालिका।", bhakoot: "2-12, 5-9 और 6-8 संबंधों को सावधानी माना गया।", nadi: "समान नाड़ी को 0, भिन्न नाड़ी को 8 गुण।" },
    hinglish: { varna: "Groom varna bride varna ke equal ya higher hona chahiye.", vashya: "Rashi-based Vashya classes ki compatibility.", tara: "Birth nakshatra se 9-Tara chakra calculation.", yoni: "Nakshatra yoni animal relation.", grahaMaitri: "Moon sign lords ki friendship/neutrality/enmity.", gana: "Deva, Manushya, Rakshasa traditional table.", bhakoot: "2-12, 5-9 aur 6-8 relations caution hain.", nadi: "Same Nadi 0, different Nadi 8." }
  } as const;
  return map[language][factor.kootKey as keyof typeof map.en] ?? safeText(factor.basis, fallback);
}

function calculationBasisNotes(result: MatchResult, language: "en" | "hi" | "hinglish") {
  const missing = (result.limitationNotes ?? []).filter((item) => /missing|not available|available nahi|उपलब्ध|आवश्यक/i.test(item));
  if (missing.length) return missing;
  if (language === "hi") return ["यह अष्टकूट स्कोर चंद्र राशि, नक्षत्र, गण, नाड़ी, योनि, राशि स्वामी, वर्ण, वश्य, तारा दूरी और भकूट राशि-दूरी नियमों के आधार पर निकाला गया है।"];
  if (language === "hinglish") return ["Ye Ashtakoot score Moon sign, Nakshatra, Gana, Nadi, Yoni, Rashi lord, Varna, Vashya, Tara distance aur Bhakoot sign-distance rules ke basis par calculate hua hai."];
  return ["This Ashtakoot score uses Moon sign, Nakshatra, Gana, Nadi, Yoni, Rashi lord, Varna, Vashya, Tara distance, and Bhakoot sign-distance rules."];
}

function marriageGuidance(score: number, percentage: number, factors: DisplayFactor[], manglikOk: boolean, language: "en" | "hi" | "hinglish") {
  const nadi = factorScore(factors, "nadi");
  const bhakoot = factorScore(factors, "bhakoot");
  const good = score >= 24;
  const strong = score >= 28;
  const low = score < 18;
  const summary = language === "hi"
    ? low ? "इस मिलान को विवाह से पहले गहराई से समझने की आवश्यकता है। इसका अर्थ यह नहीं कि विवाह असंभव है, लेकिन कुछ महत्वपूर्ण क्षेत्रों पर सावधानी से चर्चा करनी चाहिए।" : "विवाह को सकारात्मक रूप से विचार किया जा सकता है, लेकिन अंतिम निर्णय से पहले परिवार की अनुकूलता, आपसी समझ, दशा/गोचर और व्यावहारिक जीवन लक्ष्यों को साथ में देखना चाहिए।"
    : language === "hinglish"
      ? low ? "Is match ko marriage se pehle deeper review ki zaroorat hai. Iska matlab marriage impossible nahi hai, lekin kuch important areas ko carefully discuss karna chahiye." : "Vivah ko positive way mein consider kiya ja sakta hai, lekin final decision se pehle family compatibility, mutual understanding, dasha/transit aur practical life goals ko saath mein dekhna chahiye."
      : low ? "This match needs deeper review before marriage. The result does not mean marriage is impossible, but it suggests that key areas should be discussed carefully." : "Marriage can be considered positively, but final decision should include family compatibility, mutual understanding, dasha/transit review, and practical life goals.";
  return {
    summary,
    recommendation: language === "hi" ? `${strong ? "मजबूत" : good ? "अच्छा" : low ? "विस्तृत समीक्षा आवश्यक" : "औसत / समीक्षा योग्य"} मिलान संकेत। कुल गुण ${score}/36 (${percentage}%)।` : language === "hinglish" ? `${strong ? "Strong" : good ? "Good" : low ? "Detailed review needed" : "Average / needs review"} match signal. Total guna ${score}/36 (${percentage}%).` : `${strong ? "Strong" : good ? "Good" : low ? "Detailed review needed" : "Average / needs review"} match signal. Total guna ${score}/36 (${percentage}%).`,
    supportive: matchingStrengths(factors, score, manglikOk, language),
    cautions: [...matchingConcerns(factors, score, manglikOk, language), ...(nadi === 0 || bhakoot === 0 ? [] : [])],
    steps: basePracticalSteps(language)
  };
}

function matchingSuggestions(factors: DisplayFactor[], manglikOk: boolean, language: "en" | "hi" | "hinglish") {
  const weak = factors.filter((factor) => (factor.score ?? 0) < getFactorMax(factor) * 0.72);
  const suggestions = weak.map((factor) => suggestionForKoot(factor.kootKey, language)).filter(Boolean) as string[];
  if (!manglikOk) suggestions.push(language === "hi" ? "मंगल/मांगलिक संतुलन और cancellation योग को योग्य ज्योतिषी से शांतिपूर्वक समीक्षा कराएं।" : language === "hinglish" ? "Mars/Manglik balance aur cancellation yog ko qualified astrologer se calmly review karayein." : "Review Mars/Manglik balance and cancellation factors calmly with a qualified astrologer.");
  return Array.from(new Set(suggestions)).slice(0, 6);
}

function suggestionForKoot(kootKey: string | undefined, language: "en" | "hi" | "hinglish") {
  const map = {
    varna: ["Discuss expectations, roles, family mindset, and responsibility sharing clearly.", "अपेक्षाओं, भूमिकाओं, परिवार की सोच और जिम्मेदारियों के बंटवारे पर स्पष्ट चर्चा करें।", "Expectations, roles, family mindset aur responsibilities clearly discuss karein."],
    vashya: ["Practice shared decision-making and balanced communication.", "निर्णय लेने और संवाद में संतुलित साझेदारी का अभ्यास करें।", "Decision-sharing aur balanced communication practice karein."],
    tara: ["Use patience, emotional support, and timing awareness during major transitions.", "बड़े बदलावों में धैर्य, भावनात्मक सहयोग और समय की समझ रखें।", "Major transitions me patience, emotional support aur timing awareness rakhein."],
    yoni: ["Discuss comfort, affection style, and personal boundaries respectfully.", "सहजता, स्नेह की शैली और व्यक्तिगत सीमाओं पर सम्मान से बात करें।", "Comfort, affection style aur personal boundaries respectfully discuss karein."],
    grahaMaitri: ["Work on mental compatibility, listening style, and conflict resolution.", "मानसिक तालमेल, सुनने की शैली और विवाद समाधान पर काम करें।", "Mental compatibility, listening style aur conflict resolution par kaam karein."],
    gana: ["Respect temperament, routine, and lifestyle differences.", "स्वभाव, दिनचर्या और जीवनशैली के अंतर का सम्मान करें।", "Temperament, routine aur lifestyle differences ka respect karein."],
    bhakoot: ["Review family expectations, emotional stability, and long-term responsibilities.", "परिवार की अपेक्षाओं, भावनात्मक स्थिरता और दीर्घकालिक जिम्मेदारियों की समीक्षा करें।", "Family expectations, emotional stability aur long-term responsibilities review karein."],
    nadi: ["Take a deeper Nadi review from a qualified astrologer without fear-based conclusions.", "भय के बिना योग्य ज्योतिषी से नाड़ी की गहरी समीक्षा लें।", "Fear-based conclusion ke bina qualified astrologer se Nadi review lein."]
  } as const;
  const item = map[kootKey as keyof typeof map];
  if (!item) return undefined;
  return language === "hi" ? item[1] : language === "hinglish" ? item[2] : item[0];
}

function matchingStrengths(factors: DisplayFactor[], score: number, manglikOk: boolean, language: "en" | "hi" | "hinglish") {
  const items: string[] = [];
  if (score >= 24) items.push(language === "hi" ? "कुल गुण मिलान सहायक श्रेणी में है।" : language === "hinglish" ? "Total Guna supportive range me hai." : "Total Guna score is in a supportive range.");
  factors.filter((factor) => factor.status === "good").slice(0, 3).forEach((factor) => items.push(language === "hi" ? `${localizeKootName(factor, language, "")} मजबूत संकेत देता है।` : `${localizeKootName(factor, language, "")} is a supportive indicator.`));
  if (manglikOk) items.push(language === "hi" ? "मांगलिक स्थिति संतुलित दिखती है।" : language === "hinglish" ? "Manglik status balanced dikhta hai." : "Manglik status looks balanced.");
  return items.length ? items : [language === "hi" ? "स्पष्ट संवाद संबंध की मुख्य ताकत बन सकता है।" : language === "hinglish" ? "Clear communication relation ki strength ban sakti hai." : "Clear communication can become a main strength."];
}

function matchingConcerns(factors: DisplayFactor[], score: number, manglikOk: boolean, language: "en" | "hi" | "hinglish") {
  const items: string[] = [];
  if (score < 18) items.push(language === "hi" ? "कुल गुण 18 से कम हैं; विस्तृत समीक्षा जरूरी है।" : language === "hinglish" ? "Total guna 18 se kam hai; detailed review zaroori hai." : "Total guna is below 18; detailed review is important.");
  else if (score < 24) items.push(language === "hi" ? "कुल गुण औसत हैं; सावधानी और संवाद उपयोगी हैं।" : language === "hinglish" ? "Total guna average hai; caution aur communication helpful hain." : "Total guna is average; caution and communication matter.");
  factors.filter((factor) => factor.status === "concern").slice(0, 3).forEach((factor) => items.push(language === "hi" ? `${localizeKootName(factor, language, "")} में सावधानी संकेत है।` : `${localizeKootName(factor, language, "")} needs review.`));
  if (!manglikOk) items.push(language === "hi" ? "मांगलिक स्तर अलग हैं; शांतिपूर्वक पूर्ण कुंडली समीक्षा करें।" : language === "hinglish" ? "Manglik levels different hain; calmly full kundli review karein." : "Manglik levels differ; review the full chart calmly.");
  items.push(language === "hi" ? "कुंडली मिलान मार्गदर्शन है, विवाह परिणाम की गारंटी नहीं।" : language === "hinglish" ? "Kundli matching guidance hai, marriage outcome ki guarantee nahi." : "Kundli matching is guidance, not a guarantee of marriage outcome.");
  return items;
}

function basePracticalSteps(language: "en" | "hi" | "hinglish") {
  if (language === "hi") return ["अपेक्षाओं, करियर, वित्त और परिवार पर स्पष्ट बात करें।", "परिवारिक संस्कृति और जीवनशैली को सम्मान से समझें।", "दशा, गोचर और व्यावहारिक परिस्थिति को साथ में देखें।"];
  if (language === "hinglish") return ["Expectations, career, finance aur family par clear baat karein.", "Family culture aur lifestyle ko respect se samjhein.", "Dasha, transit aur practical situation saath me dekhein."];
  return ["Discuss expectations, career, finances, and family responsibilities clearly.", "Understand family culture and lifestyle differences respectfully.", "Combine dasha, transits, and practical circumstances."];
}

function factorScore(factors: DisplayFactor[], key: string) {
  return factors.find((factor) => factor.kootKey === key)?.score ?? 0;
}

function localizeBasisValue(key: string, value: string | number | undefined, language: "en" | "hi" | "hinglish", fallback: string) {
  if (typeof value === "number") return String(value);
  if (!value) return fallback;
  if (key === "moonSign") return localizeSign(value, language, fallback);
  if (key === "moonLord") return localizePlanet(value, language, fallback);
  if (key === "nakshatra") return localizeNakshatra(value, language, fallback);
  if (key === "gana") return localizeGana(value, language, fallback);
  if (key === "nadi") return localizeNadi(value, language, fallback);
  if (key === "yoni") return localizeYoni(value, language, fallback);
  if (key === "varna") return localizeVarna(value, language, fallback);
  if (key === "vashya") return localizeVashya(value, language, fallback);
  return value;
}

function localizePlanet(value: string, language: "en" | "hi" | "hinglish", fallback: string) {
  const hi: Record<string, string> = { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" };
  if (!value) return fallback;
  return language === "hi" ? hi[value] ?? value : value;
}

function localizeGana(value: string, language: "en" | "hi" | "hinglish", fallback: string) {
  const hi: Record<string, string> = { Deva: "देव", Manushya: "मनुष्य", Rakshasa: "राक्षस" };
  if (!value) return fallback;
  return language === "hi" ? hi[value] ?? value : value;
}

function localizeNadi(value: string, language: "en" | "hi" | "hinglish", fallback: string) {
  const hi: Record<string, string> = { Adi: "आदि", Madhya: "मध्य", Antya: "अंत्य" };
  if (!value) return fallback;
  return language === "hi" ? hi[value] ?? value : value;
}

function localizeYoni(value: string, language: "en" | "hi" | "hinglish", fallback: string) {
  const hi: Record<string, string> = { Horse: "घोड़ा", Elephant: "हाथी", Sheep: "भेड़", Serpent: "सर्प", Dog: "कुत्ता", Cat: "बिल्ली", Rat: "चूहा", Cow: "गाय", Buffalo: "भैंस", Tiger: "बाघ", Deer: "हिरण", Monkey: "बंदर", Mongoose: "नेवला", Lion: "सिंह" };
  if (!value) return fallback;
  return language === "hi" ? hi[value] ?? value : value;
}

function localizeVarna(value: string, language: "en" | "hi" | "hinglish", fallback: string) {
  const hi: Record<string, string> = { Brahmin: "ब्राह्मण", Kshatriya: "क्षत्रिय", Vaishya: "वैश्य", Shudra: "शूद्र" };
  if (!value) return fallback;
  return language === "hi" ? hi[value] ?? value : value;
}

function localizeVashya(value: string, language: "en" | "hi" | "hinglish", fallback: string) {
  const hi: Record<string, string> = { Chatushpada: "चतुष्पाद", Manav: "मानव", Jalachara: "जलचर", Vanachara: "वनचर", Keeta: "कीट" };
  if (!value) return fallback;
  return language === "hi" ? hi[value] ?? value : value;
}

function safeText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text || text === "undefined" || text === "null" || text === "[object Object]") return fallback;
  if (/^\s*[{[]/.test(text)) return fallback;
  return text;
}




