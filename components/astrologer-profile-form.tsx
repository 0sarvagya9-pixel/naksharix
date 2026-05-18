"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { useLanguage } from "@/components/language-provider";

const expertiseOptions = ["Vedic Astrology", "Kundli", "Numerology", "Tarot", "Palmistry", "Relationship", "Career", "Finance", "Health guidance"];
const languageOptions = ["Hindi", "English", "Hinglish"];

type ProfileDefaults = {
  displayName?: string;
  photoUrl?: string;
  bio?: string;
  introLine?: string;
  experienceYears?: number;
  specialization?: string;
  languages?: string[];
  consultationPrice?: string;
  pricePerSession?: string;
  city?: string;
  country?: string;
  skills?: string[];
  availabilityStatus?: "ONLINE" | "BUSY" | "OFFLINE";
  availableForChat?: boolean;
  availableForCall?: boolean;
  availableForVideo?: boolean;
};

export function AstrologerProfileForm({ defaults }: { defaults?: ProfileDefaults }) {
  const { requiredMessage } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>(defaults?.skills?.length ? defaults.skills : splitDefaults(defaults?.specialization, ["Vedic Astrology"]));
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(defaults?.languages?.length ? defaults.languages : ["Hindi", "English"]);

  async function save(formData: FormData) {
    formData.set("skills", selectedExpertise.join(", "));
    formData.set("specialization", selectedExpertise.join(", "));
    formData.set("languages", selectedLanguages.join(", "));
    formData.set("availableForChat", formData.get("availableForChat") ? "true" : "false");
    formData.set("availableForCall", formData.get("availableForCall") ? "true" : "false");
    formData.set("availableForVideo", formData.get("availableForVideo") ? "true" : "false");

    const required = ["displayName", "bio", "experienceYears", "specialization", "languages", "consultationPrice", "availabilityStatus"];
    const nextErrors = required.reduce<FieldErrors>((acc, field) => {
      if (isBlank(formData.get(field))) acc[field] = requiredMessage;
      return acc;
    }, {});
    if (!selectedExpertise.length) nextErrors.specialization = requiredMessage;
    if (!selectedLanguages.length) nextErrors.languages = requiredMessage;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      scrollToFirstError(nextErrors);
      return;
    }

    setStatus("Saving your professional profile...");
    const response = await secureFetch("/api/astrologer/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const json = await response.json();
    setStatus(response.ok ? "Profile saved and sent for admin review." : json.error ?? "Unable to save profile right now.");
  }

  function clear(field: string) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <form action={save} className="grid gap-5">
      <div className="flex items-center gap-4 rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4">
        <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary/15 text-[#B56CFF]">
          <UserRound className="h-8 w-8" />
        </div>
        <div>
          <p className="font-cinzel text-lg font-bold">Profile photo</p>
          <p className="text-sm naksh-muted-text">Add a public image URL. Upload storage can be connected later.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Display name" name="displayName" error={errors.displayName}>
          <Input name="displayName" data-field="displayName" defaultValue={defaults?.displayName ?? ""} className={errorClass(Boolean(errors.displayName))} onChange={() => clear("displayName")} />
        </Field>
        <Field label="Profile photo URL" name="photoUrl">
          <Input name="photoUrl" data-field="photoUrl" defaultValue={defaults?.photoUrl ?? ""} placeholder="https://..." />
        </Field>
        <Field label="Short intro line" name="introLine">
          <Input name="introLine" data-field="introLine" defaultValue={defaults?.introLine ?? ""} placeholder="Vedic astrologer for career and relationship guidance" />
        </Field>
        <Field label="Experience years" name="experienceYears" error={errors.experienceYears}>
          <Input name="experienceYears" data-field="experienceYears" type="number" min="0" max="80" defaultValue={defaults?.experienceYears ?? 0} className={errorClass(Boolean(errors.experienceYears))} onChange={() => clear("experienceYears")} />
        </Field>
        <Field label="Consultation price per minute" name="consultationPrice" error={errors.consultationPrice}>
          <Input name="consultationPrice" data-field="consultationPrice" type="number" min="0" defaultValue={defaults?.consultationPrice ?? "0"} className={errorClass(Boolean(errors.consultationPrice))} onChange={() => clear("consultationPrice")} />
        </Field>
        <Field label="Consultation price per session" name="pricePerSession">
          <Input name="pricePerSession" data-field="pricePerSession" type="number" min="0" defaultValue={defaults?.pricePerSession ?? ""} />
        </Field>
        <Field label="City" name="city">
          <Input name="city" data-field="city" defaultValue={defaults?.city ?? ""} />
        </Field>
        <Field label="Country" name="country">
          <Input name="country" data-field="country" defaultValue={defaults?.country ?? ""} />
        </Field>
        <Field label="Availability status" name="availabilityStatus" error={errors.availabilityStatus}>
          <select name="availabilityStatus" data-field="availabilityStatus" defaultValue={defaults?.availabilityStatus ?? "OFFLINE"} className={`h-10 w-full rounded-md border border-[#F5C542]/20 bg-[#12051f] px-3 text-sm ${errorClass(Boolean(errors.availabilityStatus))}`} onChange={() => clear("availabilityStatus")}>
            <option value="ONLINE">Online</option>
            <option value="BUSY">Busy</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </Field>
      </div>

      <Field label="Expertise categories" name="specialization" error={errors.specialization}>
        <input type="hidden" name="specialization" value={selectedExpertise.join(", ")} readOnly />
        <input type="hidden" name="skills" value={selectedExpertise.join(", ")} readOnly />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {expertiseOptions.map((item) => (
            <Toggle key={item} checked={selectedExpertise.includes(item)} onChange={() => toggle(item, selectedExpertise, setSelectedExpertise, () => clear("specialization"))}>{item}</Toggle>
          ))}
        </div>
      </Field>

      <Field label="Languages" name="languages" error={errors.languages}>
        <input type="hidden" name="languages" value={selectedLanguages.join(", ")} readOnly />
        <div className="grid gap-2 sm:grid-cols-3">
          {languageOptions.map((item) => (
            <Toggle key={item} checked={selectedLanguages.includes(item)} onChange={() => toggle(item, selectedLanguages, setSelectedLanguages, () => clear("languages"))}>{item}</Toggle>
          ))}
        </div>
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Checkbox name="availableForChat" defaultChecked={defaults?.availableForChat}>Available for chat</Checkbox>
        <Checkbox name="availableForCall" defaultChecked={defaults?.availableForCall}>Available for call</Checkbox>
        <Checkbox name="availableForVideo" defaultChecked={defaults?.availableForVideo}>Available for video</Checkbox>
      </div>

      <Field label="Bio" name="bio" error={errors.bio}>
        <Textarea name="bio" data-field="bio" defaultValue={defaults?.bio ?? ""} className={errorClass(Boolean(errors.bio))} onChange={() => clear("bio")} />
      </Field>

      <div className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4 text-sm naksh-muted-text">
        Education/certification details can be added in your bio for now. Secure document upload can be enabled later.
      </div>

      <Button className="w-full sm:w-fit">
        <Save className="h-4 w-4" />
        Save profile
      </Button>
      {status ? <p className="text-sm naksh-muted-text">{status}</p> : null}
    </form>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onChange} className={`rounded-md border px-3 py-2 text-left text-sm transition ${checked ? "border-[#FFD36A] bg-[#F5C542]/10 text-[#FFD36A]" : "border-[#F5C542]/20 bg-[#12051f]/60 naksh-muted-text hover:border-[#FFD36A]/50"}`}>
      {children}
    </button>
  );
}

function Checkbox({ name, defaultChecked, children }: { name: string; defaultChecked?: boolean; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[#F5C542]/20 bg-[#12051f]/60 p-3 text-sm">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4" />
      {children}
    </label>
  );
}

function toggle(value: string, current: string[], set: (value: string[]) => void, after?: () => void) {
  set(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  after?.();
}

function splitDefaults(value: string | undefined, fallback: string[]) {
  const items = value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  return items.length ? items : fallback;
}
