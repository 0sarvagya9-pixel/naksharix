"use client";

import { useState } from "react";
import { Calculator, Heart, MapPin, Moon, Sparkles, Star, Sun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { useLanguage } from "@/components/language-provider";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";

type CalculatorResult = {
  moonSign?: string;
  sunSign?: string;
  ascendant?: string;
  nakshatra?: string;
  ayanamsa?: string;
  loveScore?: number;
  friendshipScore?: number;
  guidance?: string;
  numerology?: { lifePathNumber?: number };
};

const defaultPlace: ResolvedLocation = { displayName: "Delhi, India", city: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" };

export function CalculatorSuite() {
  const { tr, requiredMessage } = useLanguage();
  const [form, setForm] = useState({ name: "", birthDate: "", birthTime: "06:30", birthPlace: "Delhi, India" });
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation | null>(defaultPlace);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = ["name", "birthDate", "birthTime", "birthPlace"].reduce<FieldErrors>((acc, field) => {
      if (isBlank(form[field as keyof typeof form])) acc[field] = requiredMessage;
      return acc;
    }, {});
    if (!nextErrors.birthPlace && (!resolvedLocation || resolvedLocation.displayName !== form.birthPlace)) {
      nextErrors.birthPlace = tr("selectValidBirthLocation");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      scrollToFirstError(nextErrors);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await secureFetch("/api/calculators/core", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birthDate: form.birthDate,
          birthTime: form.birthTime,
          latitude: resolvedLocation?.latitude,
          longitude: resolvedLocation?.longitude
        })
      });
      const json = await response.json();
      if (!response.ok) {
        setError("Please review your birth details and try again.");
        return;
      }
      setResult(json.data.calculators);
    } catch {
      setError("Calculators are temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof typeof form, value: string) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "birthPlace") setResolvedLocation(null);
  }

  function updateResolvedLocation(location: ResolvedLocation | null) {
    setResolvedLocation(location);
    if (location) {
      setForm((current) => ({ ...current, birthPlace: location.displayName }));
      setErrors((current) => ({ ...current, birthPlace: undefined }));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="glass h-fit">
        <CardHeader><CardTitle className="font-cinzel">{tr("calculatorTitle")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label={tr("name")} error={errors.name}><Input data-field="name" value={form.name} className={errorClass(Boolean(errors.name))} onChange={(event) => update("name", event.target.value)} /></Field>
            <Field label={tr("dateOfBirth")} error={errors.birthDate}><Input data-field="birthDate" type="date" value={form.birthDate} className={errorClass(Boolean(errors.birthDate))} onChange={(event) => update("birthDate", event.target.value)} /></Field>
            <Field label={tr("timeOfBirth")} error={errors.birthTime}><Input data-field="birthTime" type="time" value={form.birthTime} className={errorClass(Boolean(errors.birthTime))} onChange={(event) => update("birthTime", event.target.value)} /></Field>
            <LocationAutocomplete
              label={tr("locationBirthPlace")}
              required
              dataField="birthPlace"
              value={form.birthPlace}
              onChange={(value) => update("birthPlace", value)}
              onResolvedLocation={updateResolvedLocation}
              error={errors.birthPlace}
              placeholder={tr("searchLocationPlaceholder")}
            />
            <p className="rounded-md border border-[#D4AF37]/20 bg-[#061D3C]/70 p-3 text-xs leading-5 naksh-muted-text sm:col-span-2"><MapPin className="mr-1 inline h-3 w-3 text-[#FFD700]" />{tr("calculatorLocationNote")}</p>
            <Button className="h-11 sm:col-span-2" disabled={loading}>
              <Calculator className="h-4 w-4" />
              {loading ? tr("calculating") : tr("calculate")}
            </Button>
          </form>
          {error ? <p className="mt-4 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="font-cinzel">{tr("calculatorResults")}</CardTitle></CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ResultCard icon={<Moon />} label={tr("moonSign")} value={result.moonSign} />
                <ResultCard icon={<Sun />} label={tr("sunSign")} value={result.sunSign} />
                <ResultCard icon={<Star />} label={tr("ascendant")} value={result.ascendant} />
                <ResultCard icon={<Sparkles />} label={tr("nakshatra")} value={result.nakshatra} />
                <ResultCard icon={<Calculator />} label={tr("ayanamsa")} value={result.ayanamsa} />
                <ResultCard icon={<Heart />} label={tr("loveScore")} value={`${result.loveScore ?? 0}%`} />
                <ResultCard icon={<Users />} label={tr("friendshipScore")} value={`${result.friendshipScore ?? 0}%`} />
                <ResultCard icon={<Calculator />} label={tr("lifePath")} value={String(result.numerology?.lifePathNumber ?? "-")} />
              </div>
              <p className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-4 text-sm leading-7 naksh-muted-text">{result.guidance}</p>
            </div>
          ) : (
            <p className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-5 text-sm leading-6 naksh-muted-text">{tr("calculatorEmpty")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}

function ResultCard({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return <div className="rounded-lg border border-[#D4AF37]/25 bg-[#061D3C]/70 p-4"><div className="text-[#FFD700]">{icon}</div><p className="mt-3 text-xs uppercase tracking-[0.18em] naksh-muted-text">{label}</p><p className="mt-1 font-cinzel text-xl font-bold">{value ?? "Calculated"}</p></div>;
}
