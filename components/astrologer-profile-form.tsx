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

type ProfileDefaults = {
  displayName?: string;
  photoUrl?: string;
  bio?: string;
  experienceYears?: number;
  specialization?: string;
  languages?: string[];
  consultationPrice?: string;
  skills?: string[];
  availabilityStatus?: "ONLINE" | "BUSY" | "OFFLINE";
};

export function AstrologerProfileForm({ defaults }: { defaults?: ProfileDefaults }) {
  const { requiredMessage } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  async function save(formData: FormData) {
    const required = ["displayName", "bio", "experienceYears", "specialization", "languages", "consultationPrice", "skills", "availabilityStatus"];
    const nextErrors = required.reduce<FieldErrors>((acc, field) => {
      if (isBlank(formData.get(field))) acc[field] = requiredMessage;
      return acc;
    }, {});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      scrollToFirstError(nextErrors);
      return;
    }

    setStatus("Saving your marketplace profile...");
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
      <div className="flex items-center gap-4 rounded-lg border border-amber-200/15 bg-card/60 p-4">
        <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary/15 text-primary">
          <UserRound className="h-8 w-8" />
        </div>
        <div>
          <p className="font-cinzel text-lg font-bold">Photo placeholder</p>
          <p className="text-sm text-muted-foreground">Add an image URL now. File uploads can be connected later.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Display name" name="displayName" error={errors.displayName}>
          <Input name="displayName" data-field="displayName" defaultValue={defaults?.displayName ?? ""} className={errorClass(Boolean(errors.displayName))} onChange={() => clear("displayName")} />
        </Field>
        <Field label="Photo URL" name="photoUrl">
          <Input name="photoUrl" data-field="photoUrl" defaultValue={defaults?.photoUrl ?? ""} placeholder="https://..." />
        </Field>
        <Field label="Experience years" name="experienceYears" error={errors.experienceYears}>
          <Input name="experienceYears" data-field="experienceYears" type="number" min="0" max="80" defaultValue={defaults?.experienceYears ?? 0} className={errorClass(Boolean(errors.experienceYears))} onChange={() => clear("experienceYears")} />
        </Field>
        <Field label="Consultation price" name="consultationPrice" error={errors.consultationPrice}>
          <Input name="consultationPrice" data-field="consultationPrice" type="number" min="0" defaultValue={defaults?.consultationPrice ?? "0"} className={errorClass(Boolean(errors.consultationPrice))} onChange={() => clear("consultationPrice")} />
        </Field>
        <Field label="Specialization" name="specialization" error={errors.specialization}>
          <Input name="specialization" data-field="specialization" defaultValue={defaults?.specialization ?? "Vedic Astrology"} className={errorClass(Boolean(errors.specialization))} onChange={() => clear("specialization")} />
        </Field>
        <Field label="Languages" name="languages" error={errors.languages}>
          <Input name="languages" data-field="languages" defaultValue={(defaults?.languages ?? ["Hindi", "English"]).join(", ")} className={errorClass(Boolean(errors.languages))} onChange={() => clear("languages")} />
        </Field>
        <Field label="Skills" name="skills" error={errors.skills}>
          <Input name="skills" data-field="skills" defaultValue={(defaults?.skills ?? ["Kundli", "Marriage", "Career"]).join(", ")} className={errorClass(Boolean(errors.skills))} onChange={() => clear("skills")} />
        </Field>
        <Field label="Availability status" name="availabilityStatus" error={errors.availabilityStatus}>
          <select name="availabilityStatus" data-field="availabilityStatus" defaultValue={defaults?.availabilityStatus ?? "OFFLINE"} className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm ${errorClass(Boolean(errors.availabilityStatus))}`} onChange={() => clear("availabilityStatus")}>
            <option value="ONLINE">Online</option>
            <option value="BUSY">Busy</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </Field>
      </div>

      <Field label="Bio" name="bio" error={errors.bio}>
        <Textarea name="bio" data-field="bio" defaultValue={defaults?.bio ?? ""} className={errorClass(Boolean(errors.bio))} onChange={() => clear("bio")} />
      </Field>

      <div className="rounded-lg border border-amber-200/15 bg-card/60 p-4 text-sm text-muted-foreground">
        Certificates placeholder: add certificate names in skills/bio for Phase 1. Secure document upload can be enabled in a later phase.
      </div>

      <Button className="w-full sm:w-fit">
        <Save className="h-4 w-4" />
        Save profile
      </Button>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
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
