"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Download, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { birthDetailsSchema } from "@/lib/validations/astrology";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import type { Locale } from "@/lib/i18n";
import { errorClass, scrollToFirstError } from "@/lib/form-validation";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";
import { KundliReportDashboard } from "@/components/kundli/kundli-report-dashboard";
import { VimshottariDashaTimeline, type DashaTimelinePeriod } from "@/components/kundli/vimshottari-dasha-timeline";
import { translateAstroValue, translateSign, type AstroValueCategory } from "@/lib/kundli/chart-mapping";

type BirthDetailsInput = z.input<typeof birthDetailsSchema>;
type PlanetPosition = { planet?: string; sign?: string; house?: number; degree?: number; nakshatra?: string; pada?: number; dignity?: string };
type KundliResult = {
  reportId?: string;
  generatedAt?: string;
  language?: "en" | "hi" | "hinglish";
  profile?: { name?: string; gender?: string };
  birthDetails?: { dateOfBirth?: string; timeOfBirth?: string; birthPlace?: string; latitude?: number; longitude?: number; timezone?: string };
  saved?: boolean;
  aiSummary?: string;
  planetPositions?: PlanetPosition[];
  vimshottariDasha?: DashaTimelinePeriod[];
  calculatedDasha?: {
    available?: boolean;
    note?: string;
    birthMahadasha?: string;
    birthBalanceYears?: number;
    currentMahadasha?: DashaTimelinePeriod;
    currentAntardasha?: DashaTimelinePeriod;
  };
  chalitChart?: {
    available?: boolean;
    method?: string;
    note?: string;
    placements?: Array<{ planet?: string; sign?: string; d1House?: number; chalitHouse?: number; degree?: number; changed?: boolean; note?: string }>;
  };
  doshaAnalysis?: {
    manglik?: { present?: boolean; severity?: string; summary?: string; marsHouseFromLagna?: number; marsHouseFromMoon?: number; marsHouseFromVenus?: number; remedies?: string[] };
    kaalSarp?: { present?: boolean; severity?: string; summary?: string; remedies?: string[] };
    notes?: string[];
  };
  yogaAnalysis?: {
    detected?: Array<{ name?: string; detected?: boolean; basis?: string; interpretation?: string; caveat?: string }>;
    note?: string;
  };
  charts?: { lagna?: Array<{ house?: number; sign?: string; planets?: string[] }>; navamsa?: Array<{ house?: number; sign?: string; planets?: string[] }> };
  remedies?: string[];
  panchang?: { tithi?: string; paksha?: string; vaar?: string; nakshatra?: string; nakshatraPada?: string | number; yoga?: string; karan?: string; sunrise?: string; sunset?: string; rahuKaal?: string; muhurat?: string };
  avakhada?: { moonSign?: string; sunSign?: string; ascendant?: string; nakshatra?: string };
  manglikDosha?: { present?: boolean; severity?: string; summary?: string; remedies?: string[] };
  kaalSarpDosha?: { present?: boolean; summary?: string };
  sadeSati?: { status?: string; phase?: string; guidance?: string };
  nakshatraAnalysis?: string;
  lagnaAnalysis?: string;
  personalityAnalysis?: string;
  careerAnalysis?: string;
  marriageAnalysis?: string;
  financeAnalysis?: string;
  healthAnalysis?: string;
  educationAnalysis?: string;
  disclaimer?: string;
};

const defaultPlace: ResolvedLocation = { displayName: "Delhi, India", city: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };
const reportStorageKey = "naksharix-latest-kundli-report";

export function KundliForm() {
  const { apiLocale, setLocale, requiredMessage, tr } = useLanguage();
  const [result, setResult] = useState<KundliResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [placeStatus, setPlaceStatus] = useState(tr("defaultLocationNote"));
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation | null>(defaultPlace);
  const [locationError, setLocationError] = useState<string | undefined>();
  const reportRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const form = useForm<BirthDetailsInput>({
    resolver: zodResolver(birthDetailsSchema),
    defaultValues: {
      name: "",
      gender: "Prefer not to say",
      birthTime: "",
      birthPlace: defaultPlace.displayName,
      latitude: defaultPlace.latitude,
      longitude: defaultPlace.longitude,
      timezone: defaultPlace.timezone,
      locale: apiLocale
    }
  });

  useEffect(() => {
    form.setValue("locale", apiLocale, { shouldDirty: true });
  }, [apiLocale, form]);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(reportStorageKey);
      if (saved) setResult(JSON.parse(saved) as KundliResult);
    } catch {}
  }, []);

  useEffect(() => {
    if (result) window.setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [result]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = round(position.coords.latitude);
        const longitude = round(position.coords.longitude);
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        setPlaceStatus(tr("detectedLocationNote"));
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  }, [form, tr]);

  async function onSubmit(values: BirthDetailsInput) {
    setError(null);
    setResult(null);
    if (!resolvedLocation || resolvedLocation.displayName !== values.birthPlace) {
      setLocationError(tr("selectValidBirthLocation"));
      scrollToFirstError({ birthPlace: tr("selectValidBirthLocation") });
      return;
    }
    setGenerating(true);
    const payload = {
      name: values.name,
      gender: values.gender,
      dateOfBirth: values.birthDate,
      timeOfBirth: values.birthTime,
      birthPlace: resolvedLocation.displayName,
      latitude: resolvedLocation.latitude,
      longitude: resolvedLocation.longitude,
      timezone: resolvedLocation.timezone ?? "Asia/Kolkata",
      language: values.locale,
      locale: values.locale
    };
    try {
      const response = await secureFetch("/api/kundli/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await response.json();
      if (!response.ok) {
        setError(toFriendlyError(json.error, tr("errorGeneric")));
        return;
      }
      const report = json.data.report as KundliResult;
      setResult(report);
      try { window.sessionStorage.setItem(reportStorageKey, JSON.stringify(report)); } catch {}
    } catch {
      setError(tr("errorGeneric"));
    } finally {
      setGenerating(false);
    }
  }

  function onInvalid(errors: typeof form.formState.errors) {
    scrollToFirstError(Object.fromEntries(Object.keys(errors).map((key) => [key, requiredMessage])));
  }

  function fieldError(name: keyof BirthDetailsInput) {
    return form.formState.errors[name] ? requiredMessage : undefined;
  }

  function updateLocation(value: string) {
    form.setValue("birthPlace", value, { shouldDirty: true, shouldValidate: true });
    form.clearErrors("birthPlace");
    setLocationError(undefined);
  }

  function resolveLocation(location: ResolvedLocation | null) {
    setResolvedLocation(location);
    if (location) {
      form.setValue("birthPlace", location.displayName, { shouldDirty: true, shouldValidate: true });
      form.setValue("latitude", location.latitude);
      form.setValue("longitude", location.longitude);
      form.setValue("timezone", location.timezone ?? "Asia/Kolkata");
      setPlaceStatus(location.displayName);
      setLocationError(undefined);
    }
  }

  function updateLanguage(value: Locale) {
    form.setValue("locale", value, { shouldDirty: true, shouldValidate: true });
    form.clearErrors("locale");
    setLocale(value);
  }

  function generateAgain() {
    setResult(null);
    setError(null);
    try { window.sessionStorage.removeItem(reportStorageKey); } catch {}
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="space-y-8">
      <div ref={formRef} className="mx-auto max-w-4xl">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel text-2xl">{tr("generateKundliReport")}</CardTitle>
          <p className="text-sm naksh-muted-text">{tr("kundliIntro")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid gap-4 sm:grid-cols-2">
            <Field label={tr("name")} error={fieldError("name")}><Input data-field="name" className={errorClass(Boolean(fieldError("name")))} {...form.register("name", { onChange: () => form.clearErrors("name") })} /></Field>
            <Field label={tr("gender")}>
              <select {...form.register("gender")} className="h-10 w-full rounded-md border border-[#1e293b] bg-[#0f1c3a] px-3 text-sm text-[#ffffff] outline-none transition focus:border-[#dca956] focus:ring-2 focus:ring-[#dca956]/20">
                <option value="Prefer not to say">{tr("genderPreferNotToSay")}</option>
                <option value="Female">{tr("genderFemale")}</option>
                <option value="Male">{tr("genderMale")}</option>
                <option value="Other">{tr("genderOther")}</option>
              </select>
            </Field>
            <Field label={tr("language")}>
              <select
                data-field="locale"
                value={form.watch("locale") ?? apiLocale}
                onChange={(event) => updateLanguage(event.target.value as Locale)}
                className={`h-10 w-full rounded-md border border-[#1e293b] bg-[#0f1c3a] px-3 text-sm text-[#ffffff] outline-none transition focus:border-[#dca956] focus:ring-2 focus:ring-[#dca956]/20 ${errorClass(Boolean(fieldError("locale")))}`}
              >
                <option value="en">{languageOptionLabel("en", apiLocale)}</option>
                <option value="hi">{languageOptionLabel("hi", apiLocale)}</option>
                <option value="hinglish">{languageOptionLabel("hinglish", apiLocale)}</option>
              </select>
              {fieldError("locale") ? <p className="text-sm text-[#FF4D4F]">{fieldError("locale")}</p> : null}
            </Field>
            <Field label={tr("dateOfBirth")} error={fieldError("birthDate")}><Input type="date" data-field="birthDate" className={errorClass(Boolean(fieldError("birthDate")))} {...form.register("birthDate", { onChange: () => form.clearErrors("birthDate") })} /></Field>
            <Field label={tr("timeOfBirth")} error={fieldError("birthTime")}><Input type="time" data-field="birthTime" className={errorClass(Boolean(fieldError("birthTime")))} {...form.register("birthTime", { onChange: () => form.clearErrors("birthTime") })} /></Field>
            <LocationAutocomplete
              label={tr("birthPlace")}
              required
              dataField="birthPlace"
              value={form.watch("birthPlace") ?? ""}
              onChange={updateLocation}
              onResolvedLocation={resolveLocation}
              error={fieldError("birthPlace") ?? locationError}
              placeholder={tr("searchLocationPlaceholder")}
            />
            <div className="flex items-end">
              <p className="rounded-md border border-[#1e293b] bg-[#0f1c3a]/80 p-3 text-xs leading-5 naksh-muted-text"><MapPin className="mr-1 inline h-3 w-3 text-[#dca956]" />{placeStatus}</p>
            </div>
            <Button className="h-12 sm:col-span-2" disabled={form.formState.isSubmitting || generating} size="lg">
              <Sparkles className="h-4 w-4" />
              {generating ? tr("generatingKundli") : tr("generateKundliReport")}
            </Button>
          </form>
          {error ? <p className="mt-4 rounded-lg border border-[#FF4D4F]/30 bg-[#FF4D4F]/10 p-3 text-sm text-[#FF4D4F]">{error}</p> : null}
          {generating ? <GeneratingKundli /> : null}
        </CardContent>
      </Card>
      </div>
      {result ? (
        <div ref={reportRef}>
          <KundliReport result={result} selectedLanguage={(form.watch("locale") ?? apiLocale) as Locale} onRegenerate={generateAgain} />
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-[#FF4D4F]">{error}</p> : null}</div>;
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/85 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] naksh-muted-text">{label}</p>
      <p className="mt-1 break-words font-cinzel text-sm font-bold text-[#ffffff]">{value || "-"}</p>
    </div>
  );
}

function KundliReport({ result, selectedLanguage, onRegenerate }: { result: KundliResult; selectedLanguage: Locale; onRegenerate: () => void }) {
  const { tr } = useLanguage();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function downloadPdf() {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const response = await secureFetch("/api/kundli/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: result, language: selectedLanguage, pdfType: "FREE" })
      });
      if (!response.ok) throw new Error("PDF download failed");
      const blob = await response.blob();
      if (!blob.size) throw new Error("PDF download failed");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "naksharix-free-kundli-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setPdfError(tr("pdfDownloadFailed"));
    } finally {
      setPdfLoading(false);
    }
  }
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-[#1e293b] bg-[radial-gradient(circle_at_10%_10%,rgba(220,169,86,0.13),transparent_26rem),linear-gradient(135deg,#0a1224,#020612_82%)] p-5 shadow-[0_24px_80px_rgba(2,6,18,0.45)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-cinzel text-xs uppercase tracking-[0.28em] text-[#dca956]">Naksharix</p>
            <h2 className="mt-2 font-cinzel text-3xl font-black text-[#f3d382]">{tr("generatedKundliReport")}</h2>
            <div className="mt-4 grid gap-2 text-sm naksh-muted-text sm:grid-cols-2 lg:grid-cols-3">
              <Meta label={tr("name")} value={result.profile?.name} />
              <Meta label={tr("dateOfBirth")} value={result.birthDetails?.dateOfBirth} />
              <Meta label={tr("timeOfBirth")} value={result.birthDetails?.timeOfBirth} />
              <Meta label={tr("birthPlace")} value={result.birthDetails?.birthPlace} />
              <Meta label={tr("reportLanguage")} value={languageOptionLabel(selectedLanguage, selectedLanguage)} />
              <Meta label={tr("generatedDate")} value={formatGeneratedDate(result.generatedAt, selectedLanguage)} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row xl:flex-wrap xl:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={downloadPdf} disabled={pdfLoading}><Download className="h-4 w-4" /> {pdfLoading ? tr("preparingPdf") : tr("downloadFreePdf")}</Button>
            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => window.print()}>{tr("printReport")}</Button>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={onRegenerate}>{tr("generateAgain")}</Button>
            {result.saved && result.reportId ? <Button variant="outline" asChild className="w-full sm:w-auto"><Link href={`/kundli/report/${result.reportId}`}>{tr("viewReport")}</Link></Button> : null}
            <Button asChild className="w-full sm:w-auto"><Link href="/reports/kundli-pro">{tr("unlockPremiumReport")}</Link></Button>
            <Button variant="outline" asChild className="w-full sm:w-auto"><Link href="/astrologers">{tr("talkToAstrologer")}</Link></Button>
          </div>
        </div>
        {pdfError ? <p className="mt-4 rounded-lg border border-[#FF4D4F]/30 bg-[#FF4D4F]/10 p-3 text-sm text-[#FF4D4F]">{pdfError}</p> : null}
        {!result.saved ? <div className="mt-4 rounded-lg border border-[#dca956]/30 bg-[#dca956]/10 p-4 text-sm text-[#ffffff]"><p>{tr("loginToSaveReport")}</p><Button className="mt-3" size="sm" asChild><Link href="/login">{tr("login")}</Link></Button></div> : null}
      </section>
      {result.language && result.language !== selectedLanguage ? (
        <div className="rounded-lg border border-[#dca956]/30 bg-[#dca956]/10 p-4 text-sm text-[#ffffff]">
          <p>{tr("reportLanguageMismatch")}</p>
          <Button className="mt-3" size="sm" variant="outline" onClick={onRegenerate}>
            {tr("regenerateReportSelectedLanguage")}
          </Button>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label={tr("native")} value={result.profile?.name ?? tr("generatedKundliReport")} />
        <SummaryCard label={tr("birthPlace")} value={result.birthDetails?.birthPlace ?? tr("place")} />
        <SummaryCard label={tr("status")} value={result.saved ? tr("savedToDashboard") : tr("loginToSaveReport")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <InfoPanel title={tr("birthDetails")}><p>{safeJoin([result.birthDetails?.dateOfBirth, result.birthDetails?.timeOfBirth, result.birthDetails?.timezone], tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("panchangSnapshot")}><p>{localizedAstro(result.panchang?.tithi, selectedLanguage, "tithi", tr("notAvailable"))} | {tr("nakshatra")}: {localizedAstro(result.panchang?.nakshatra, selectedLanguage, "nakshatra", tr("notAvailable"))} | {tr("rahuKaal")}: {safeText(result.panchang?.rahuKaal, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("avakhada")}><p>{tr("moon")}: {localizedSign(result.avakhada?.moonSign, selectedLanguage, tr("notAvailable"))} | {tr("lagna")}: {localizedSign(result.avakhada?.ascendant, selectedLanguage, tr("notAvailable"))} | {tr("nakshatra")}: {localizedAstro(result.avakhada?.nakshatra, selectedLanguage, "nakshatra", tr("notAvailable"))}</p></InfoPanel>
      </div>
      <InfoPanel title={tr("kundliInterpretation")}><p>{result.aiSummary ?? tr("kundliEmpty")}</p></InfoPanel>
      <KundliReportDashboard report={result} language={selectedLanguage} />
      <CoreAstrologySections result={result} language={selectedLanguage} fallback={tr("notAvailable")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <InfoPanel title={tr("manglikStatus")}><p>{localizedDoshaSummary(result.manglikDosha, selectedLanguage, tr("previewReport"))}</p></InfoPanel>
        <InfoPanel title={tr("sadeSati")}><p>{localizedSadeSati(result.sadeSati, selectedLanguage, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("remedies")}><p>{(result.remedies ?? []).join(" ") || tr("notAvailable")}</p></InfoPanel>
        <InfoPanel title={tr("nakshatraAnalysis")}><p>{safeText(result.nakshatraAnalysis, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("lagnaAnalysis")}><p>{safeText(result.lagnaAnalysis, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("personalityAnalysis")}><p>{safeText(result.personalityAnalysis, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("career")}><p>{safeText(result.careerAnalysis, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("marriageAnalysis")}><p>{safeText(result.marriageAnalysis, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("finance")}><p>{safeText(result.financeAnalysis, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("health")}><p>{safeText(result.healthAnalysis, tr("notAvailable"))}</p></InfoPanel>
        <InfoPanel title={tr("education")}><p>{safeText(result.educationAnalysis, tr("notAvailable"))}</p></InfoPanel>
      </div>
      <VimshottariDashaTimeline mahadashas={result.vimshottariDasha} language={selectedLanguage} />
      <div className="rounded-lg border border-[#1e293b] bg-[linear-gradient(135deg,#0f1c3a,rgba(10,18,36,0.92))] p-5">
        <h3 className="font-cinzel text-xl font-bold text-[#f3d382]">{tr("premiumKundliUpsell")}</h3>
        <p className="mt-2 text-sm leading-6 naksh-muted-text">{tr("premiumKundliUpsellCopy")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild><Link href="/reports/kundli-pro">{tr("unlockPremiumReport")}</Link></Button>
          <Button variant="outline" asChild><Link href="/astrologers">{tr("talkToAstrologer")}</Link></Button>
        </div>
      </div>
    </div>
  );
}

function languageOptionLabel(option: Locale, current: Locale) {
  if (current === "hi") {
    if (option === "en") return "अंग्रेज़ी";
    if (option === "hi") return "हिंदी";
    return "हिंग्लिश";
  }
  if (option === "en") return "English";
  if (option === "hi") return "Hindi";
  return "Hinglish";
}

function CoreAstrologySections({ result, language, fallback }: { result: KundliResult; language: Locale; fallback: string }) {
  const labels = coreAstroLabels(language);
  const dasha = result.calculatedDasha;
  const currentMaha = dasha?.currentMahadasha;
  const currentAntar = dasha?.currentAntardasha;
  const chalitPlacements = result.chalitChart?.placements ?? [];
  const changedPlacements = chalitPlacements.filter((placement) => placement.changed);
  const yogas = result.yogaAnalysis?.detected ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InfoPanel title={labels.dasha}>
        {dasha?.available ? (
          <div className="space-y-2">
            <p><strong className="text-[#f3d382]">{labels.birthMahadasha}:</strong> {localizedPlanet(dasha.birthMahadasha, language, fallback)}{typeof dasha.birthBalanceYears === "number" ? ` (${dasha.birthBalanceYears.toFixed(2)} ${labels.years})` : ""}</p>
            <p><strong className="text-[#f3d382]">{labels.currentMahadasha}:</strong> {formatDashaPeriod(currentMaha, language, fallback)}</p>
            <p><strong className="text-[#f3d382]">{labels.currentAntardasha}:</strong> {formatDashaPeriod(currentAntar, language, fallback)}</p>
          </div>
        ) : <p>{safeText(dasha?.note, labels.dashaMissing)}</p>}
      </InfoPanel>

      <InfoPanel title={labels.chalit}>
        {result.chalitChart?.available ? (
          <div className="space-y-2">
            <p>{result.chalitChart.method}</p>
            <p><strong className="text-[#f3d382]">{labels.changed}:</strong> {changedPlacements.length ? changedPlacements.map((placement) => `${localizedPlanet(placement.planet, language, fallback)} ${placement.d1House ?? "-"}→${placement.chalitHouse ?? "-"}`).join(", ") : labels.noChanged}</p>
          </div>
        ) : <p>{safeText(result.chalitChart?.note, labels.chalitMissing)}</p>}
      </InfoPanel>

      <InfoPanel title={labels.dosha}>
        <div className="space-y-2">
          <p><strong className="text-[#f3d382]">{labels.manglik}:</strong> {safeText(result.doshaAnalysis?.manglik?.severity ?? result.manglikDosha?.severity, fallback)}</p>
          <p>{safeText(result.doshaAnalysis?.manglik?.summary ?? result.manglikDosha?.summary, fallback)}</p>
          <p><strong className="text-[#f3d382]">{labels.kaalSarp}:</strong> {safeText(result.doshaAnalysis?.kaalSarp?.summary ?? result.kaalSarpDosha?.summary, fallback)}</p>
        </div>
      </InfoPanel>

      <InfoPanel title={labels.yoga}>
        {yogas.length ? (
          <div className="space-y-3">
            {yogas.slice(0, 4).map((yoga, index) => (
              <div key={`${yoga.name ?? "yoga"}-${index}`} className="rounded-lg border border-[#1e293b] bg-[#0a1224] p-3">
                <p className="font-semibold text-[#f3d382]">{safeText(yoga.name, fallback)}</p>
                <p>{safeText(yoga.basis, fallback)}</p>
                <p>{safeText(yoga.interpretation, fallback)}</p>
              </div>
            ))}
          </div>
        ) : <p>{safeText(result.yogaAnalysis?.note, labels.noYoga)}</p>}
      </InfoPanel>
    </div>
  );
}

function localizedPlanet(value: unknown, language: Locale, fallback: string) {
  return translateAstroValue(value, language, "planet" as AstroValueCategory) || fallback;
}

function formatDashaPeriod(period: DashaTimelinePeriod | undefined, language: Locale, fallback: string) {
  if (!period) return fallback;
  const planet = localizedPlanet(period.planet, language, fallback);
  const start = period.startsAt ?? period.startDate;
  const end = period.endsAt ?? period.endDate;
  return `${planet}${start || end ? ` (${safeJoin([start, end], fallback)})` : ""}`;
}

function coreAstroLabels(language: Locale) {
  if (language === "hi") {
    return {
      dasha: "विंशोत्तरी दशा",
      birthMahadasha: "जन्म महादशा",
      currentMahadasha: "वर्तमान महादशा",
      currentAntardasha: "वर्तमान अंतर्दशा",
      years: "वर्ष शेष",
      dashaMissing: "दशा गणना के लिए चंद्र नक्षत्र और डिग्री डेटा आवश्यक है।",
      chalit: "चलित चार्ट",
      changed: "बदले हुए भाव",
      noChanged: "कोई प्रमुख भाव परिवर्तन नहीं",
      chalitMissing: "चलित गणना के लिए लग्न डिग्री और ग्रह दीर्घांश डेटा आवश्यक है।",
      dosha: "दोष विश्लेषण",
      manglik: "मांगलिक स्थिति",
      kaalSarp: "काल सर्प संकेत",
      yoga: "योग विश्लेषण",
      noYoga: "उपलब्ध डेटा से कोई प्रमुख योग स्पष्ट रूप से नहीं मिला।"
    };
  }
  if (language === "hinglish") {
    return {
      dasha: "Vimshottari Dasha",
      birthMahadasha: "Birth Mahadasha",
      currentMahadasha: "Current Mahadasha",
      currentAntardasha: "Current Antardasha",
      years: "years balance",
      dashaMissing: "Dasha calculation ke liye Moon nakshatra aur degree data zaroori hai.",
      chalit: "Chalit Chart",
      changed: "Changed houses",
      noChanged: "Koi major house change nahi",
      chalitMissing: "Chalit calculation ke liye lagna degree aur planet longitude data zaroori hai.",
      dosha: "Dosha Analysis",
      manglik: "Manglik Status",
      kaalSarp: "Kaal Sarp Signal",
      yoga: "Yoga Analysis",
      noYoga: "Available data se koi major yoga clearly detect nahi hua."
    };
  }
  return {
    dasha: "Vimshottari Dasha",
    birthMahadasha: "Birth Mahadasha",
    currentMahadasha: "Current Mahadasha",
    currentAntardasha: "Current Antardasha",
    years: "years balance",
    dashaMissing: "Dasha calculation needs Moon nakshatra degree data.",
    chalit: "Chalit Chart",
    changed: "Changed houses",
    noChanged: "No major house changes",
    chalitMissing: "Chalit calculation needs ascendant degree and planetary longitude data.",
    dosha: "Dosha Analysis",
    manglik: "Manglik Status",
    kaalSarp: "Kaal Sarp Signal",
    yoga: "Yoga Analysis",
    noYoga: "No major yoga was detected from the currently available data."
  };
}

function localizedAstro(value: unknown, language: Locale, category: AstroValueCategory, fallback: string) {
  const translated = translateAstroValue(value, language, category);
  return translated || fallback;
}

function localizedSign(value: string | undefined, language: Locale, fallback: string) {
  return translateSign(value, language) || fallback;
}

function safeText(value: unknown, fallback: string) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function safeJoin(values: Array<string | undefined>, fallback: string) {
  const clean = values.filter((value): value is string => Boolean(value));
  return clean.length ? clean.join(" | ") : fallback;
}

function formatGeneratedDate(value: string | undefined, locale: Locale) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return value ?? "-";
  return date.toLocaleString(locale === "hi" ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function localizedDoshaSummary(dosha: KundliResult["manglikDosha"], language: Locale, fallback: string) {
  if (!dosha) return fallback;
  if (language === "hi") {
    return dosha.present
      ? "मांगलिक संकेत दिखाई देते हैं। विवाह संबंधी निर्णय से पहले पूरी कुंडली और अनुकूलता को योग्य ज्योतिषी से अवश्य समझें।"
      : "इस प्राथमिक रिपोर्ट में मांगलिक दोष प्रमुख रूप से दिखाई नहीं देता। संबंधों में संतुलित संवाद बनाए रखें।";
  }
  if (language === "hinglish") {
    return dosha.present
      ? "Manglik sanket dikh rahe hain. Marriage decisions se pehle full kundli aur compatibility ko qualified astrologer ke saath review karein."
      : "Is primary report me Manglik dosh strongly indicate nahi ho raha. Relationships me balanced communication rakhein.";
  }
  return dosha.summary ?? fallback;
}

function localizedSadeSati(sadeSati: KundliResult["sadeSati"], language: Locale, fallback: string) {
  if (!sadeSati) return fallback;
  if (language === "hi") {
    return sadeSati.status === "Active"
      ? "साढ़े साती सक्रिय हो सकती है। धैर्य, अनुशासन और दीर्घकालिक सोच पर ध्यान दें।"
      : "साढ़े साती इस प्राथमिक रिपोर्ट में सक्रिय नहीं दिखती। नियमितता और धैर्य फिर भी लाभदायक रहेंगे।";
  }
  if (language === "hinglish") {
    return sadeSati.status === "Active"
      ? "Sade Sati active ho sakti hai. Patience, discipline aur long-term thinking par focus rakhein."
      : "Sade Sati is primary report me active nahi dikh rahi. Regularity aur patience fir bhi helpful rahenge.";
  }
  return `${sadeSati.status ?? fallback}${sadeSati.phase ? ` | ${sadeSati.phase}` : ""}. ${sadeSati.guidance ?? ""}`;
}

function GeneratingKundli() {
  const { tr } = useLanguage();
  return <div className="mt-4 rounded-lg border border-[#1e293b] bg-[#0f1c3a]/80 p-4"><p className="font-cinzel font-bold text-[#f3d382]"><CalendarDays className="mr-2 inline h-4 w-4 text-[#dca956]" />{tr("generatingKundli")}</p><p className="mt-1 text-sm naksh-muted-text">{tr("kundliIntro")}</p></div>;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/85 p-4"><p className="text-xs uppercase tracking-[0.18em] naksh-muted-text">{label}</p><p className="mt-1 font-cinzel text-lg font-bold text-[#ffffff]">{value}</p></div>;
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-[#1e293b] bg-[#0f1c3a]/85 p-4 text-sm leading-7 naksh-muted-text"><h3 className="mb-3 font-semibold text-[#f3d382]">{title}</h3>{children}</section>;
}

function round(value: number) {
  return Number(value.toFixed(6));
}

function toFriendlyError(message: string | undefined, fallback: string) {
  if (!message || /server|unexpected|database|prisma|validation/i.test(message)) return fallback;
  return message;
}


