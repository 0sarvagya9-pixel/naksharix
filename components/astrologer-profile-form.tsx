"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { useLanguage } from "@/components/language-provider";
import {workspaceCopy,workspaceFailure,type WorkspaceMessage} from "@/lib/astrologers/workspace-copy";
import {profilePayload,profileMatches} from "@/lib/astrologers/client-contract";

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

export function AstrologerProfileForm({defaults,userId,profileId}:{defaults?:ProfileDefaults;userId:string;profileId?:string}) {
  const router = useRouter();
  const { requiredMessage,locale } = useLanguage(),copy=workspaceCopy(locale),lock=useRef(false);
  const [busy,setBusy]=useState(false),[uncertain,setUncertain]=useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<WorkspaceMessage | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>(defaults?.skills?.length ? defaults.skills : splitDefaults(defaults?.specialization, ["Vedic Astrology"]));
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(defaults?.languages?.length ? defaults.languages : ["Hindi", "English"]);

  async function save(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(lock.current||uncertain)return;
    const payload=profilePayload(new FormData(event.currentTarget),selectedExpertise,selectedLanguages);
    const required=["displayName","bio","experienceYears","specialization","languages","consultationPrice","availabilityStatus"];
    const nextErrors=required.reduce<FieldErrors>((acc,field)=>{if(isBlank(payload[field]))acc[field]=requiredMessage;return acc;},{});
    if(!selectedExpertise.length)nextErrors.specialization=requiredMessage;
    if(!selectedLanguages.length)nextErrors.languages=requiredMessage;
    setErrors(nextErrors);if(Object.keys(nextErrors).length){scrollToFirstError(nextErrors);return;}
    lock.current=true;setBusy(true);setStatus("saving");let committed=false;
    try{
      const response=await secureFetch("/api/astrologer/profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),silent:true});
      const json=await response.json();
      if(!response.ok){const kind=workspaceFailure(response.status);setStatus(kind);setUncertain(kind==="uncertain"||kind==="conflict");return;}
      if(!profileMatches(json?.data?.profile,payload,userId,profileId))throw Error("Unconfirmed profile");
      setStatus("profileSaved");committed=true;router.push("/astrologer/dashboard");router.refresh();
    }catch{setStatus("uncertain");setUncertain(true);}
    finally{if(!committed){lock.current=false;setBusy(false);}}
  }

  function clear(field: string) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <form onSubmit={save} className="grid gap-5"><fieldset disabled={busy||uncertain} className="grid gap-5">
      <div className="flex items-center gap-4 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4">
        <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary/15 text-[#01A361]">
          <UserRound className="h-8 w-8" />
        </div>
        <div>
          <p className="font-cinzel text-lg font-bold">{copy.photo}</p>
          <p className="text-sm naksh-muted-text">{copy.photoHelp}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={copy.displayName} name="displayName" error={errors.displayName}>
          <Input id="displayName" name="displayName" data-field="displayName" defaultValue={defaults?.displayName ?? ""} className={errorClass(Boolean(errors.displayName))} onChange={() => clear("displayName")} />
        </Field>
        <Field label={copy.photoUrl} name="photoUrl">
          <Input id="photoUrl" name="photoUrl" data-field="photoUrl" defaultValue={defaults?.photoUrl ?? ""} placeholder="https://..." />
        </Field>
        <Field label={copy.introLine} name="introLine">
          <Input id="introLine" name="introLine" data-field="introLine" defaultValue={defaults?.introLine ?? ""} placeholder={copy.introPlaceholder} />
        </Field>
        <Field label={copy.experienceYears} name="experienceYears" error={errors.experienceYears}>
          <Input id="experienceYears" name="experienceYears" data-field="experienceYears" type="number" min="0" max="80" defaultValue={defaults?.experienceYears ?? 0} className={errorClass(Boolean(errors.experienceYears))} onChange={() => clear("experienceYears")} />
        </Field>
        <Field label={copy.consultationPrice} name="consultationPrice" error={errors.consultationPrice}>
          <Input id="consultationPrice" name="consultationPrice" data-field="consultationPrice" type="number" min="0" defaultValue={defaults?.consultationPrice ?? "0"} className={errorClass(Boolean(errors.consultationPrice))} onChange={() => clear("consultationPrice")} />
        </Field>
        <Field label={copy.pricePerSession} name="pricePerSession">
          <Input id="pricePerSession" name="pricePerSession" data-field="pricePerSession" type="number" min="0" defaultValue={defaults?.pricePerSession ?? ""} />
        </Field>
        <Field label={copy.city} name="city">
          <Input id="city" name="city" data-field="city" defaultValue={defaults?.city ?? ""} />
        </Field>
        <Field label={copy.country} name="country">
          <Input id="country" name="country" data-field="country" defaultValue={defaults?.country ?? ""} />
        </Field>
        <Field label={copy.availabilityStatus} name="availabilityStatus" error={errors.availabilityStatus}>
          <select id="availabilityStatus" name="availabilityStatus" data-field="availabilityStatus" defaultValue={defaults?.availabilityStatus ?? "OFFLINE"} className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.availabilityStatus))}`} onChange={() => clear("availabilityStatus")}>
            <option value="ONLINE">{copy.ONLINE}</option>
            <option value="BUSY">{copy.BUSY}</option>
            <option value="OFFLINE">{copy.OFFLINE}</option>
          </select>
        </Field>
      </div>

      <Field label={copy.specialization} name="specialization" error={errors.specialization}>
        <input type="hidden" name="specialization" value={selectedExpertise.join(", ")} readOnly />
        <input type="hidden" name="skills" value={selectedExpertise.join(", ")} readOnly />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {expertiseOptions.map((item) => (
            <Toggle key={item} checked={selectedExpertise.includes(item)} onChange={() => toggle(item, selectedExpertise, setSelectedExpertise, () => clear("specialization"))}>{copy[item as WorkspaceMessage]}</Toggle>
          ))}
        </div>
      </Field>

      <Field label={copy.languages} name="languages" error={errors.languages}>
        <input type="hidden" name="languages" value={selectedLanguages.join(", ")} readOnly />
        <div className="grid gap-2 sm:grid-cols-3">
          {languageOptions.map((item) => (
            <Toggle key={item} checked={selectedLanguages.includes(item)} onChange={() => toggle(item, selectedLanguages, setSelectedLanguages, () => clear("languages"))}>{copy[item as WorkspaceMessage]}</Toggle>
          ))}
        </div>
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Checkbox name="availableForChat" defaultChecked={defaults?.availableForChat}>{copy.availableForChat}</Checkbox>
        <Checkbox name="availableForCall" defaultChecked={defaults?.availableForCall}>{copy.availableForCall}</Checkbox>
        <Checkbox name="availableForVideo" defaultChecked={defaults?.availableForVideo}>{copy.availableForVideo}</Checkbox>
      </div>

      <Field label={copy.bio} name="bio" error={errors.bio}>
        <Textarea id="bio" name="bio" data-field="bio" defaultValue={defaults?.bio ?? ""} className={errorClass(Boolean(errors.bio))} onChange={() => clear("bio")} />
      </Field>

      <div className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">
        {copy.bioHelp}
      </div>

      <Button type="submit" className="w-full sm:w-fit">
        <Save className="h-4 w-4" />
        {busy?copy.saving:copy.saveProfile}
      </Button>
      </fieldset>{uncertain?<Button type="button" variant="outline" onClick={()=>window.location.reload()}>{copy.refresh}</Button>:null}
      {status ? <p role={status==="saving"||status==="profileSaved"?"status":"alert"} className="text-sm naksh-muted-text">{copy[status]}</p> : null}
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
    <button type="button" aria-pressed={checked} onClick={onChange} className={`rounded-md border px-3 py-2 text-left text-sm transition ${checked ? "border-[#FFD700] bg-[#D4AF37]/10 text-[#FFD700]" : "border-[#D4AF37]/20 bg-[#02112C]/60 naksh-muted-text hover:border-[#FFD700]/50"}`}>
      {children}
    </button>
  );
}

function Checkbox({ name, defaultChecked, children }: { name: string; defaultChecked?: boolean; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 text-sm">
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
