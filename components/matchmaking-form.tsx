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
  factors?: Array<{ name?: string; score?: number; max?: number; meaning?: string }>;
  gunaMilan?: { totalScore?: number; maxScore?: number; percentage?: number; verdict?: string; ashtakoot?: Array<{ name?: string; score?: number; maxScore?: number; meaning?: string; result?: string }> };
  doshaAnalysis?: { manglikCompatibility?: string; nadiDosh?: { present?: boolean; summary?: string }; bhakootDosh?: { present?: boolean; summary?: string }; remedies?: string[] };
  compatibility?: { emotional?: number; mental?: number; physical?: number; financial?: number; family?: number; longTerm?: number };
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
    const validationErrors = validateMatchFields(people, locations, requiredMessage, tr("selectLocationFromSuggestions"));
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
      {error ? <p className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{tr("locationConvertedInternally")}</p>
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
      <CardHeader className="border-b border-amber-200/10 bg-white/5">
        <CardTitle className="font-cinzel text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 overflow-visible p-4 sm:grid-cols-2 sm:p-6">
        <Field label={tr("name")} error={err("name")}><Input data-field={`${personKey}.name`} className={errorClass(Boolean(err("name")))} value={value.name} onChange={(event) => onChange({ name: event.target.value })} /></Field>
        <Field label={tr("gender")}>
          <select value={value.gender} onChange={(event) => onChange({ gender: event.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
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
      <CardHeader className="border-b border-amber-200/10 bg-white/5">
        <CardTitle className="font-cinzel text-2xl">{tr("premiumCompatibilityReport")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard icon={<HeartHandshake />} label={tr("compatibility")} value={`${result.compatibility?.longTerm ?? result.compatibilityScore ?? result.matchPercentage ?? 0}%`} />
          <ScoreCard icon={<Sparkles />} label={tr("gunaMilan")} value={`${result.gunaMilan?.totalScore ?? result.guna ?? 0}/${result.gunaMilan?.maxScore ?? result.maxGuna ?? 36}`} />
          <ScoreCard icon={<ShieldCheck />} label={tr("manglikStatus")} value={result.doshaAnalysis?.manglikCompatibility ?? (result.manglikCompatible ? tr("compatibility") : tr("challenge"))} />
          <ScoreCard icon={<CalendarHeart />} label={tr("matchPercent")} value={`${result.gunaMilan?.percentage ?? result.matchPercentage ?? 0}%`} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <InsightCard title={tr("brideDetails")} icon={<HeartHandshake className="h-4 w-4" />} text={chartSummary(result.brideProfile, result.brideChart, tr("notAvailable"), chartSummaryLabels(apiLocale))} />
          <InsightCard title={tr("groomDetails")} icon={<HeartHandshake className="h-4 w-4" />} text={chartSummary(result.groomProfile, result.groomChart, tr("notAvailable"), chartSummaryLabels(apiLocale))} />
          <InsightCard title={tr("emotionalCompatibility")} icon={<HeartHandshake className="h-4 w-4" />} text={result.aiSummary ?? result.emotionalCompatibility ?? result.relationshipAnalysis} />
          <InsightCard title={tr("careerFinanceCompatibility")} icon={<WalletCards className="h-4 w-4" />} text={compatibilityLine(apiLocale, result.compatibility?.financial ?? 0, result.compatibility?.mental ?? 0)} />
          <InsightCard title={tr("marriageRecommendation")} icon={<CalendarHeart className="h-4 w-4" />} text={result.gunaMilan?.verdict ?? result.marriageRecommendation ?? result.marriagePrediction} />
          <InsightCard title={tr("remedies")} icon={<Sparkles className="h-4 w-4" />} text={result.doshaAnalysis?.remedies?.join(" ") ?? result.remedies} />
        </div>
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold">{tr("gunaMilan")}</h3>
            <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs text-amber-100">{tr("pdfComingSoon")}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(result.gunaMilan?.ashtakoot ?? result.factors ?? []).map((factor) => (
              <div key={factor.name} className="rounded-lg border border-amber-200/20 bg-white/[0.04] p-4">
                <p className="font-semibold">{factor.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{factor.score ?? 0} / {getFactorMax(factor)}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{factor.meaning ?? tr("notAvailable")}</p>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}

function validateMatchFields(people: Record<PersonKey, VisiblePerson>, locations: Record<PersonKey, ResolvedLocation | null>, requiredMessage: string, invalidLocationMessage: string) {
  const required: (keyof VisiblePerson)[] = ["name", "birthDate", "birthTime", "birthPlace"];
  return (["bride", "groom"] as PersonKey[]).reduce<FieldErrors>((errors, key) => {
    required.forEach((field) => {
      if (isBlank(people[key][field])) errors[`${key}.${field}`] = requiredMessage;
    });
    if (!errors[`${key}.birthPlace`] && (!locations[key] || locations[key]?.displayName !== people[key].birthPlace)) errors[`${key}.birthPlace`] = invalidLocationMessage;
    return errors;
  }, {});
}

function ScoreCard({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return <div className="rounded-lg border border-amber-200/20 bg-gradient-to-br from-primary/20 to-amber-300/10 p-5"><div className="mb-3 text-amber-200">{icon}</div><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p><p className="mt-2 font-cinzel text-3xl font-black">{value}</p></div>;
}

function InsightCard({ title, icon, text }: { title: string; icon: React.ReactNode; text?: string }) {
  const { tr } = useLanguage();
  return <div className="rounded-lg border border-amber-200/20 bg-white/[0.04] p-4"><h3 className="flex items-center gap-2 font-semibold text-amber-200">{icon}{title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{text ?? tr("notAvailable")}</p></div>;
}

function getFactorMax(factor: { max?: number; maxScore?: number }) {
  return factor.maxScore ?? factor.max ?? 0;
}

function toFriendlyError(message: string | undefined, fallback: string) {
  if (!message || /server|unexpected|database|prisma|validation/i.test(message)) return fallback;
  return message;
}


function chartSummary(profile: MatchResult["brideProfile"], chart: MatchResult["brideChart"], fallback: string, labels: { lagna: string; rashi: string; nakshatra: string }) {
  const avakhada = chart?.avakhada;
  return `${profile?.name ?? fallback} | ${labels.lagna}: ${avakhada?.ascendant ?? fallback} | ${labels.rashi}: ${avakhada?.moonSign ?? fallback} | ${labels.nakshatra}: ${avakhada?.nakshatra ?? fallback}`;
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




