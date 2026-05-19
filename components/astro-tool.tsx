"use client";

import { useState } from "react";
import type React from "react";
import { CalendarDays, Gem, Globe2, Hash, Heart, Palette, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { Input } from "@/components/ui/input";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";

type ToolType = "horoscope" | "tarot" | "numerology" | "chat";
type HoroscopeResult = { zodiac?: string; period?: string; category?: string; locale?: string; content?: string; luckyNumber?: number; luckyColor?: string; gemstone?: string };
type PersonalizedResult = { period?: string; profile?: { name?: string }; birthDetails?: { birthPlace?: string }; calculationData?: { moonSign?: string; nakshatra?: string }; sections?: Record<string, string | string[]>; aiSummary?: string; lockedSections?: string[]; disclaimer?: string };

const zodiacOptions = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] as const;
const categoryOptions = ["general", "love", "career", "finance", "health", "education", "family", "travel"] as const;
const periodOptions = ["daily", "weekly", "monthly", "yearly"] as const;
const hindiZodiacMap: Record<string, string> = { Aries: "मेष", Taurus: "वृषभ", Gemini: "मिथुन", Cancer: "कर्क", Leo: "सिंह", Virgo: "कन्या", Libra: "तुला", Scorpio: "वृश्चिक", Sagittarius: "धनु", Capricorn: "मकर", Aquarius: "कुंभ", Pisces: "मीन" };
const hindiCategoryMap: Record<string, string> = { general: "सामान्य", love: "प्रेम", career: "करियर", finance: "वित्त", health: "स्वास्थ्य", education: "शिक्षा", family: "परिवार", travel: "यात्रा" };
const hindiPeriodMap: Record<string, string> = { daily: "दैनिक", weekly: "साप्ताहिक", monthly: "मासिक", yearly: "वार्षिक" };

export function AstroTool({ type }: { type: ToolType }) {
  const { locale, apiLocale, requiredMessage, tr } = useLanguage();
  const [result, setResult] = useState<HoroscopeResult | null>(null);
  const [personalizedResult, setPersonalizedResult] = useState<PersonalizedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"general" | "personalized">("general");
  const [personalized, setPersonalized] = useState({ name: "", gender: "Prefer not to say", dateOfBirth: "", timeOfBirth: "", birthPlace: "", period: "daily" });
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation | null>(null);

  async function run(formData: FormData) {
    const validationErrors = ["zodiac", "category", "period"].reduce<FieldErrors>((errors, field) => {
      if (isBlank(formData.get(field))) errors[field] = requiredMessage;
      return errors;
    }, {});
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = { zodiac: formData.get("zodiac"), period: formData.get("period"), category: formData.get("category"), locale: apiLocale };
      const response = await secureFetch("/api/horoscope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await response.json();
      if (!response.ok) {
        setError(tr("errorGeneric"));
        return;
      }
      setResult(json.data.horoscope);
    } catch {
      setError(tr("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  if (type !== "horoscope") return null;

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="border-b border-[#D4AF37]/15 bg-[#061D3C]/70">
        <CardTitle className="flex items-center gap-2 font-cinzel text-xl sm:text-2xl">
          <Sparkles className="h-5 w-5 text-[#FFD700]" />
          {tr("horoscopeStudio")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-5 grid gap-2 rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/45 p-1 sm:grid-cols-2">
          <button type="button" onClick={() => setMode("general")} className={`rounded-md px-4 py-3 font-cinzel text-sm transition ${mode === "general" ? "bg-[#D4AF37] text-background" : "naksh-muted-text hover:bg-[#061D3C]/70"}`}>{tr("generalHoroscope")}</button>
          <button type="button" onClick={() => setMode("personalized")} className={`rounded-md px-4 py-3 font-cinzel text-sm transition ${mode === "personalized" ? "bg-[#D4AF37] text-background" : "naksh-muted-text hover:bg-[#061D3C]/70"}`}>{tr("personalizedHoroscope")}</button>
        </div>
        {mode === "general" ? (
          <form key={`${type}-${apiLocale}`} action={run} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField label={tr("zodiacLabel")} name="zodiac" options={zodiacOptions.map((sign) => [sign, locale === "hi" ? hindiZodiacMap[sign] : sign] as const)} defaultValue="Aries" error={fieldErrors.zodiac} />
            <SelectField label={tr("category")} name="category" options={categoryOptions.map((value) => [value, tr(value)] as const)} defaultValue="general" error={fieldErrors.category} />
            <SelectField label={tr("period")} name="period" options={periodOptions.map((value) => [value, tr(value)] as const)} defaultValue="daily" error={fieldErrors.period} />
            <Button className="h-12 w-full sm:col-span-2 lg:col-span-3" disabled={loading} size="lg">
              {loading ? tr("preparingReading") : tr("generateReading")}
            </Button>
          </form>
        ) : (
          <PersonalizedHoroscopeForm
            values={personalized}
            setValues={setPersonalized}
            resolvedLocation={resolvedLocation}
            setResolvedLocation={setResolvedLocation}
            loading={loading}
            errors={fieldErrors}
            onSubmit={runPersonalized}
          />
        )}
        {error ? <p className="mt-5 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        {mode === "general" && result ? <HoroscopeResultView data={result} /> : null}
        {mode === "personalized" && personalizedResult ? <PersonalizedHoroscopeView data={personalizedResult} /> : null}
      </CardContent>
    </Card>
  );

  async function runPersonalized() {
    const validationErrors: FieldErrors = {};
    (["name", "gender", "dateOfBirth", "timeOfBirth", "birthPlace", "period"] as const).forEach((field) => {
      if (isBlank(personalized[field])) validationErrors[field] = requiredMessage;
    });
    if (!validationErrors.birthPlace && (!resolvedLocation || resolvedLocation.displayName !== personalized.birthPlace)) validationErrors.birthPlace = tr("selectValidBirthLocation");
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      scrollToFirstError(validationErrors);
      return;
    }
    setLoading(true);
    setError(null);
    setPersonalizedResult(null);
    try {
      const response = await secureFetch("/api/horoscope/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...personalized,
          latitude: resolvedLocation?.latitude,
          longitude: resolvedLocation?.longitude,
          timezone: resolvedLocation?.timezone ?? "Asia/Kolkata",
          language: apiLocale
        })
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? tr("errorGeneric"));
        return;
      }
      setPersonalizedResult(json.data.prediction);
    } catch {
      setError(tr("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }
}

function SelectField({ label, name, options, defaultValue, error }: { label: string; name: string; options: readonly (readonly [string, string])[]; defaultValue: string; error?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select name={name} data-field={name} defaultValue={defaultValue} className={`h-12 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C]/70 px-3 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#FFD700]/30 ${errorClass(Boolean(error))}`}>
        {options.map(([value, text]) => <option key={value} value={value} className="bg-[#02112C] text-foreground">{text}</option>)}
      </select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function HoroscopeResultView({ data }: { data: HoroscopeResult }) {
  const { tr } = useLanguage();
  const isHindi = data.locale === "hi";
  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MiniCard icon={<Star />} label={tr("zodiacLabel")} value={formatZodiac(data.zodiac ?? "Aries", isHindi)} />
        <MiniCard icon={<CalendarDays />} label={tr("period")} value={formatPeriod(data.period ?? "daily", isHindi)} />
        <MiniCard icon={<Heart />} label={tr("category")} value={formatCategory(data.category ?? "general", isHindi)} />
        <MiniCard icon={<Globe2 />} label={tr("language")} value={isHindi ? tr("hindi") : data.locale === "hinglish" ? "Hinglish" : tr("english")} />
        <MiniCard icon={<Hash />} label={tr("luckyNumber")} value={String(data.luckyNumber ?? 7)} />
        <MiniCard icon={<Gem />} label={tr("gemstone")} value={data.gemstone ?? (isHindi ? "पीला पुखराज" : "Yellow Sapphire")} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
        <MiniCard icon={<Palette />} label={tr("luckyColor")} value={data.luckyColor ?? (isHindi ? "राजसी सुनहरा" : "Royal Gold")} />
        <article className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-5 leading-7 naksh-muted-text">
          <p>{data.content ?? fallbackHoroscope(data.zodiac, data.category, data.locale)}</p>
        </article>
      </div>
    </div>
  );
}

function MiniCard({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return <div className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-4"><div className="mb-3 text-[#FFD700]">{icon}</div><p className="text-xs uppercase tracking-[0.18em] naksh-muted-text">{label}</p><p className="mt-1 font-cinzel text-lg font-bold capitalize text-foreground">{value}</p></div>;
}

function PersonalizedHoroscopeForm({ values, setValues, resolvedLocation, setResolvedLocation, loading, errors, onSubmit }: { values: { name: string; gender: string; dateOfBirth: string; timeOfBirth: string; birthPlace: string; period: string }; setValues: React.Dispatch<React.SetStateAction<{ name: string; gender: string; dateOfBirth: string; timeOfBirth: string; birthPlace: string; period: string }>>; resolvedLocation: ResolvedLocation | null; setResolvedLocation: (location: ResolvedLocation | null) => void; loading: boolean; errors: FieldErrors; onSubmit: () => void }) {
  const { tr } = useLanguage();
  const update = (patch: Partial<typeof values>) => setValues((current) => ({ ...current, ...patch }));
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TextField label={tr("name")} error={errors.name}><Input data-field="name" className={errorClass(Boolean(errors.name))} value={values.name} onChange={(event) => update({ name: event.target.value })} /></TextField>
      <TextField label={tr("gender")} error={errors.gender}>
        <select data-field="gender" value={values.gender} onChange={(event) => update({ gender: event.target.value })} className={`h-12 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C]/70 px-3 text-sm ${errorClass(Boolean(errors.gender))}`}>
          <option value="Prefer not to say">{tr("genderPreferNotToSay")}</option>
          <option value="Female">{tr("genderFemale")}</option>
          <option value="Male">{tr("genderMale")}</option>
          <option value="Other">{tr("genderOther")}</option>
        </select>
      </TextField>
      <TextField label={tr("dateOfBirth")} error={errors.dateOfBirth}><Input data-field="dateOfBirth" type="date" className={errorClass(Boolean(errors.dateOfBirth))} value={values.dateOfBirth} onChange={(event) => update({ dateOfBirth: event.target.value })} /></TextField>
      <TextField label={tr("timeOfBirth")} error={errors.timeOfBirth}><Input data-field="timeOfBirth" type="time" className={errorClass(Boolean(errors.timeOfBirth))} value={values.timeOfBirth} onChange={(event) => update({ timeOfBirth: event.target.value })} /></TextField>
      <TextField label={tr("period")} error={errors.period}>
        <select data-field="period" value={values.period} onChange={(event) => update({ period: event.target.value })} className={`h-12 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C]/70 px-3 text-sm ${errorClass(Boolean(errors.period))}`}>
          {periodOptions.map((period) => <option key={period} value={period}>{tr(period)}</option>)}
        </select>
      </TextField>
      <LocationAutocomplete
        label={tr("birthPlace")}
        required
        dataField="birthPlace"
        value={values.birthPlace}
        onChange={(birthPlace) => {
          update({ birthPlace });
          setResolvedLocation(null);
        }}
        onResolvedLocation={(location) => {
          setResolvedLocation(location);
          if (location) update({ birthPlace: location.displayName });
        }}
        error={errors.birthPlace}
        placeholder={tr("searchLocationPlaceholder")}
      />
      <Button type="button" onClick={onSubmit} disabled={loading} size="lg" className="h-12 sm:col-span-2 lg:col-span-3">
        {loading ? tr("preparingReading") : tr("generatePersonalizedHoroscope")}
      </Button>
      {resolvedLocation ? <p className="text-xs naksh-muted-text sm:col-span-2 lg:col-span-3">Resolved: {resolvedLocation.displayName}</p> : null}
    </div>
  );
}

function TextField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}

function PersonalizedHoroscopeView({ data }: { data: PersonalizedResult }) {
  const { tr } = useLanguage();
  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniCard icon={<Star />} label={tr("native")} value={data.profile?.name ?? "Native"} />
        <MiniCard icon={<CalendarDays />} label={tr("period")} value={data.period ?? "daily"} />
        <MiniCard icon={<Globe2 />} label={tr("moonSign")} value={data.calculationData?.moonSign ?? "-"} />
        <MiniCard icon={<Gem />} label={tr("nakshatra")} value={data.calculationData?.nakshatra ?? "-"} />
      </div>
      <article className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-5 leading-7 naksh-muted-text">
        <h3 className="mb-3 font-cinzel text-xl font-bold text-[#FFD700]">AI Summary</h3>
        <p>{data.aiSummary}</p>
      </article>
      <div className="grid gap-4 lg:grid-cols-2">
        {Object.entries(data.sections ?? {}).map(([title, value]) => (
          <div key={title} className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-4">
            <h3 className="font-semibold text-[#FFD700]">{title}</h3>
            <p className="mt-2 text-sm leading-7 naksh-muted-text">{Array.isArray(value) ? value.join(", ") : value}</p>
          </div>
        ))}
      </div>
      {data.lockedSections?.length ? <p className="rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-4 text-sm text-[#FFD700]">Premium preview: {data.lockedSections.join(", ")}</p> : null}
      <p className="text-xs naksh-muted-text">{data.disclaimer}</p>
    </div>
  );
}

function fallbackHoroscope(zodiac = "your sign", category = "general", locale = "en") {
  if (locale === "hi") return `${formatZodiac(zodiac, true)} राशि के लिए आज ${formatCategory(category, true)} क्षेत्र में धैर्य, स्पष्टता और संतुलित निर्णय का समय है। शांत शुरुआत करें और जल्दबाज़ी से बचें।`;
  if (locale === "hinglish") return `Aaj ${zodiac} ke liye ${category} matters mein steady progress ka time hai. Ek clear intention rakhein aur jaldbazi se bachein.`;
  return `Today supports steady progress for ${zodiac} in ${category} matters. Start with one clear intention and avoid rushing important conversations.`;
}

function formatZodiac(value: string, isHindi: boolean) {
  return isHindi ? (hindiZodiacMap[value] ?? value) : value;
}

function formatCategory(value: string, isHindi: boolean) {
  return isHindi ? (hindiCategoryMap[value] ?? value) : value.replace(/-/g, " ");
}

function formatPeriod(value: string, isHindi: boolean) {
  return isHindi ? (hindiPeriodMap[value] ?? value) : value.replace(/-/g, " ");
}


