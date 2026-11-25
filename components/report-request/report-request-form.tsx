"use client";

import { useEffect,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2,Mail,X } from "lucide-react";
import { autoReportDeliveryMessage,checkAutomaticInputs } from "@/lib/reports/automatic-report-input";
import { siteNotice } from "@/lib/ui/site-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationAutocomplete, type ResolvedLocation } from "@/components/location-autocomplete";
import { useLanguage } from "@/components/language-provider";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, scrollToFirstError } from "@/lib/form-validation";
import { cn } from "@/lib/utils";
import {RazorpayCheckoutButton} from "@/components/razorpay-checkout-button";
import Link from "next/link";

type Props = {
  userEmail: string;
  orderId?: string;
  plan: "PREMIUM" | "VIP";
  reportSlug?: string;
  reportName?: string;
  paymentVerified?: boolean;
  automaticDelivery?: boolean;
  specialistDetails?: boolean;
  adminBypass?: boolean;
  preflight?:{reportId:string;purpose:"KUNDLI_REPORT"|"YEARLY_REPORT"|"MATCH_REPORT";price:string};
};

type Errors = Partial<Record<"fullName" | "dateOfBirth" | "timeOfBirth" | "birthPlace" | "concern", string>>;

export function ReportRequestForm({
  userEmail,
  orderId,
  plan,
  reportSlug = "premium-kundli",
  reportName = "Premium Astrology Report",
  paymentVerified = false,
  automaticDelivery = false,
  specialistDetails = false,
  adminBypass = false,
  preflight
}: Props) {
  const router = useRouter();
  const { tr, apiLocale, requiredMessage } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState("");
  const [language, setLanguage] = useState(apiLocale);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prepared,setPrepared]=useState<{token:string;details:Record<string,unknown>}|null>(null);
  const [capturedId,setCapturedId]=useState<string|null>(null);
  const [offset,setOffset]=useState("");
  const [partnerName,setPartnerName]=useState("");
  const [partnerGender,setPartnerGender]=useState("");
  const [partnerDate,setPartnerDate]=useState("");
  const [partnerTime,setPartnerTime]=useState("");
  const [partnerPlace,setPartnerPlace]=useState("");
  const [partnerLocation,setPartnerLocation]=useState<ResolvedLocation|null>(null);
  const [partnerOffset,setPartnerOffset]=useState("");
  const [partnerPermission,setPartnerPermission]=useState(false);
  const [romanName,setRomanName]=useState("");
  const [names,setNames]=useState("");
  const [confirmed,setConfirmed]=useState(false);
  const paymentDialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const dialog=paymentDialog.current;
    if(!automaticDelivery||!paymentVerified||!orderId||!dialog)return;
    const key="naksharix:report-payment:"+orderId;
    try{if(sessionStorage.getItem(key))return;}catch{/* optional session storage */}
    try{dialog.showModal();try{sessionStorage.setItem(key,"shown")}catch{/* no session storage */}}catch{/* fallback to inline notice */}
    return()=>{if(dialog.open)dialog.close()};
  },[automaticDelivery,paymentVerified,orderId]);
  // Fulfilment mode must not determine which purchased report inputs are collected.
  const needsSpecialistDetails=specialistDetails||automaticDelivery||Boolean(preflight);
  const couple=needsSpecialistDetails&&reportSlug==="couple-kundli";
  const nameCorrection=needsSpecialistDetails&&reportSlug==="name-correction-report";
  const babyName=needsSpecialistDetails&&reportSlug==="baby-name-report";
  const numerologyName=needsSpecialistDetails&&reportSlug==="numerology-lo-shu-report";
  function autoDetails(){return {confirmed,partnerPermission:couple?partnerPermission:undefined,
    partner:couple&&partnerLocation?{name:partnerName,gender:partnerGender,dateOfBirth:partnerDate,timeOfBirth:partnerTime,birthPlace:partnerLocation.displayName,latitude:partnerLocation.latitude,longitude:partnerLocation.longitude,timezone:partnerOffset.trim()===""?undefined:Number(partnerOffset)}:undefined,
    romanName:nameCorrection||numerologyName?romanName:undefined,candidateNames:nameCorrection||babyName?names.split(/[\n,]/).map(s=>s.trim()).filter(Boolean):undefined};}
  function primaryOffset(){return needsSpecialistDetails?(offset.trim()===""?undefined:Number(offset)):location?.timezoneOffset;}

  function validate() {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = requiredMessage;
    if (!dateOfBirth) next.dateOfBirth = requiredMessage;
    if (!timeOfBirth) next.timeOfBirth = requiredMessage;
    if (!birthPlace.trim() || !location) next.birthPlace = birthPlace.trim() ? tr("selectLocationFromSuggestions") : requiredMessage;
    if (!concern.trim()) next.concern = requiredMessage;
    setErrors(next);
    if (Object.keys(next).length) scrollToFirstError(next);
    return Object.keys(next).length === 0;
  }

  async function savePaidDetails(details:Record<string,unknown>,verifiedOrderId?:string){
    const response=await secureFetch("/api/report-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...details,...(verifiedOrderId?{orderId:verifiedOrderId}:{})})});
    const json=await response.json().catch(()=>null);
    if(!response.ok||!json?.data?.reportRequest?.id){setStatus(json?.error??"Request could not be confirmed. Check Payment History before retrying.");return false;}
    if(json.data.automaticQueued)siteNotice.success(autoReportDeliveryMessage(language),"Report request received");
    router.push(`/report-request/success?id=${encodeURIComponent(json.data.reportRequest.id)}`);
    return true;
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(loading||!validate())return;
    setStatus(null);
    const birth={name:fullName,gender,dateOfBirth,timeOfBirth,birthPlace:location?.displayName??birthPlace,latitude:location?.latitude,longitude:location?.longitude,timezone:primaryOffset()};
    const automaticDetails=needsSpecialistDetails?autoDetails():undefined;
    if(needsSpecialistDetails){const checked=checkAutomaticInputs(reportSlug,birth,automaticDetails);if(!checked.ok){setStatus(checked.reason);return;}}
    const details={orderId,planType:plan,reportSlug,adminBypass,deliveryEmail:userEmail,fullName,gender,dateOfBirth,timeOfBirth,birthPlace:birth.birthPlace,latitude:birth.latitude,longitude:birth.longitude,timezone:birth.timezone,phone,concern,questionOrConcern:concern,language,automaticDetails};
    setLoading(true);
    try{
      if(preflight){
        const response=await secureFetch("/api/report-requests/preflight",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reportSlug,deliveryEmail:userEmail,birth,automaticDetails,concern})});
        const json=await response.json().catch(()=>null);
        if(!response.ok||typeof json?.data?.token!=="string"){setStatus(json?.error??"Unable to validate details. No payment was started.");return;}
        setPrepared({token:json.data.token,details});return;
      }
      await savePaidDetails(details);
    }catch{setStatus(preflight?"Unable to validate details. No payment was started.":"Connection interrupted. Check Payment History; do not pay again.");}
    finally{setLoading(false);}
  }
  if(preflight&&prepared)return (
    <section className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-5">
      <h2 className="font-cinzel text-xl font-bold">{capturedId?"Payment verified":"Details validated - review payment"}</h2>
      <p>{reportName} · {preflight.price}</p>
      <p className="text-sm">The validated details are kept only in this open page until payment is verified. If the page closes after payment, finish your report from Payment History without paying again.</p>
      {!capturedId?<><RazorpayCheckoutButton payload={{purpose:preflight.purpose,reportId:preflight.reportId,preflightToken:prepared.token}} label={`Pay ${preflight.price}`} onVerified={async id=>{setCapturedId(id);setLoading(true);setStatus(null);try{await savePaidDetails(prepared.details,id);}catch{setStatus("Payment verified, report submission interrupted. Continue from Payment History.");}finally{setLoading(false);}}}/><p className="text-xs">Validation is valid for 20 minutes. If expired, reload this page and validate again. If money has been deducted, check Payment History first.</p></>:<Button type="button" disabled={loading} onClick={async()=>{if(!capturedId)return;setLoading(true);try{await savePaidDetails(prepared.details,capturedId);}catch{setStatus("Report details could not be confirmed. Continue from Payment History.");}finally{setLoading(false);}}}>{loading?"Saving report details...":"Retry report submission - no new payment"}</Button>}
      {status?<p role="alert" className="text-sm text-destructive">{status}</p>:null}
      <Link className="inline-block underline" href="/dashboard">Open Payment History</Link>
    </section>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      {automaticDelivery&&<dialog ref={paymentDialog} aria-labelledby="report-payment-title" className="m-auto w-[min(92vw,30rem)] max-h-[90dvh] overflow-y-auto rounded-2xl border border-[#D4AF37]/40 bg-[#fff9ef] p-6 text-[#412b36] shadow-2xl backdrop:bg-black/60">
        <button type="button" onClick={()=>paymentDialog.current?.close()} aria-label="Close payment confirmation" className="absolute right-3 top-3 rounded-lg p-2"><X className="h-5 w-5"/></button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2f4e8] text-[#217642]"><CheckCircle2 className="h-7 w-7"/></div>
        <h2 id="report-payment-title" className="mt-3 font-cinzel text-xl font-bold">Payment successful</h2>
        <p className="mt-2 font-semibold text-[#7b3043]">{reportName}</p>
        <p className="mt-3 text-sm leading-7">{autoReportDeliveryMessage(language)}</p>
        <p className="mt-3 flex items-start gap-2 break-all rounded-xl border border-[#e3c7a0] bg-white p-3 text-sm"><Mail className="h-4 w-4 shrink-0"/>{userEmail}</p>
        <p className="mt-2 text-xs leading-6">Complete your details below and verify your registered email. Your payment is already recorded; you do not need to pay again.</p>
        <Button className="mt-5 w-full" type="button" onClick={()=>paymentDialog.current?.close()}>Complete report details</Button>
      </dialog>}
      <div className="rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-4 text-sm text-[#FFFFFF]">
        <div className="flex items-start gap-2">
          {paymentVerified || adminBypass ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /> : null}
          <div>
            <p className="font-semibold">{reportName}</p>
            <p className="mt-1">{tr("reportDeliveryEmailNotice")}: <span className="font-semibold">{userEmail}</span></p>
            <span className="mt-2 block text-[#CBD5E1]">
              {paymentVerified
                ? automaticDelivery ? autoReportDeliveryMessage(language) : "Razorpay payment has been verified. This request will be linked to the paid order."
                : adminBypass
                  ? tr("adminTestingModePaymentBypassed")
                  : preflight?"Your details will be validated first. No payment is collected by this form.":"This is a manual-review request. No payment is collected at this stage."}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={tr("fullName")} error={errors.fullName}>
          <Input data-field="fullName" value={fullName} onChange={(event) => { setFullName(event.target.value); setErrors((e) => ({ ...e, fullName: undefined })); }} className={cn(errorClass(Boolean(errors.fullName)))} />
        </Field>
        <Field label={tr("gender")}>
          <select value={gender} onChange={(event) => setGender(event.target.value)} className="cosmic-select">
            <option value="">{tr("genderPreferNotToSay")}</option>
            <option value="Male">{tr("genderMale")}</option>
            <option value="Female">{tr("genderFemale")}</option>
            <option value="Other">{tr("genderOther")}</option>
          </select>
        </Field>
        <Field label={tr("dateOfBirth")} error={errors.dateOfBirth}>
          <Input data-field="dateOfBirth" type="date" value={dateOfBirth} onChange={(event) => { setDateOfBirth(event.target.value); setErrors((e) => ({ ...e, dateOfBirth: undefined })); }} className={cn(errorClass(Boolean(errors.dateOfBirth)))} />
        </Field>
        <Field label={tr("timeOfBirth")} error={errors.timeOfBirth}>
          <Input data-field="timeOfBirth" type="time" value={timeOfBirth} onChange={(event) => { setTimeOfBirth(event.target.value); setErrors((e) => ({ ...e, timeOfBirth: undefined })); }} className={cn(errorClass(Boolean(errors.timeOfBirth)))} />
        </Field>
        <div className="md:col-span-2">
          <LocationAutocomplete
            value={birthPlace}
            onChange={(value) => { setBirthPlace(value); if(value!==location?.displayName){setLocation(null);setOffset("");} setErrors((e) => ({ ...e, birthPlace: undefined })); }}
            onResolvedLocation={(next) => { setLocation(next); setOffset(next?.timezoneOffset===undefined?"":String(next.timezoneOffset)); setErrors((e) => ({ ...e, birthPlace: undefined })); }}
            label={tr("birthPlace")}
            required
            dataField="birthPlace"
            error={errors.birthPlace}
          />
        </div>
        {needsSpecialistDetails&&<div className="space-y-2 md:col-span-2"><Label htmlFor="report-birth-offset">UTC offset at birth (hours)</Label><Input id="report-birth-offset" type="number" step="any" min={-12} max={14} required value={offset} onChange={e=>setOffset(e.target.value)}/><p className="text-xs naksh-muted-text">Confirm the actual offset at your birth, including daylight saving if applicable. India: usually +5.5. The location suggestion is only a starting value.</p></div>}
        <Field label={tr("phone")}>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
        <Field label={tr("preferredLanguage")}>
          <select value={language} onChange={(event) => setLanguage(event.target.value as typeof apiLocale)} className="cosmic-select">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </Field>
        <Field label={tr("reportTypePlan")}>
          <Input value={`${reportName} · ${plan === "VIP" ? tr("vip") : tr("premium")}`} readOnly />
        </Field>
        <div className="space-y-2 md:col-span-2">
          <Label>{tr("mainQuestionConcern")}</Label>
          <textarea data-field="concern" value={concern} onChange={(event) => { setConcern(event.target.value); setErrors((e) => ({ ...e, concern: undefined })); }} maxLength={2000} rows={4} className={cn("cosmic-textarea", errorClass(Boolean(errors.concern)))} />
          {errors.concern ? <p className="text-sm text-destructive">{errors.concern}</p> : null}
        </div>
      </div>

      {couple&&<fieldset className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-4">
        <legend className="px-2 font-semibold">Second person&apos;s birth details (required for Kundli matching)</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Second person’s full name"><Input required maxLength={100} value={partnerName} onChange={e=>setPartnerName(e.target.value)}/></Field>
          <Field label="Gender (optional)"><select className="cosmic-select" value={partnerGender} onChange={e=>setPartnerGender(e.target.value)}><option value="">Prefer not to say</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></Field>
          <Field label="Date of birth"><Input required type="date" value={partnerDate} onChange={e=>setPartnerDate(e.target.value)}/></Field>
          <Field label="Time of birth"><Input required type="time" value={partnerTime} onChange={e=>setPartnerTime(e.target.value)}/></Field>
          <div className="md:col-span-2"><LocationAutocomplete value={partnerPlace} onChange={value=>{setPartnerPlace(value);if(value!==partnerLocation?.displayName){setPartnerLocation(null);setPartnerOffset("")}}} onResolvedLocation={next=>{setPartnerLocation(next);setPartnerOffset(next?.timezoneOffset===undefined?"":String(next.timezoneOffset))}} label="Birth place of second person" required/></div>
          <Field label="Second person’s UTC offset at birth"><Input type="number" required min={-12} max={14} step="any" value={partnerOffset} onChange={e=>setPartnerOffset(e.target.value)}/></Field>
        </div><label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={partnerPermission} onChange={e=>setPartnerPermission(e.target.checked)}/> I have permission to submit the other person’s birth details for this report.</label>
      </fieldset>}
      {numerologyName&&<Field label="Full name in Roman letters (for name numerology)"><Input required maxLength={100} value={romanName} onChange={e=>setRomanName(e.target.value)} placeholder="Example: Asha Sharma"/></Field>}
      {(nameCorrection||babyName)&&<fieldset className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-4"><legend className="px-2 font-semibold">{nameCorrection?"Name spelling comparison":"Baby name preferences"}</legend>{nameCorrection&&<Field label="Current name in Roman letters"><Input required maxLength={100} value={romanName} onChange={e=>setRomanName(e.target.value)}/></Field>}<Field label={nameCorrection?"Alternative name spellings (at least one)":"Preferred names (optional)"}><textarea required={nameCorrection} value={names} maxLength={1200} onChange={e=>setNames(e.target.value)} rows={3} className="cosmic-textarea" placeholder="Enter Roman-letter names, separated by commas"/></Field></fieldset>}
      {needsSpecialistDetails&&<label className="flex items-start gap-3 rounded-lg border border-[#D4AF37]/30 p-4 text-sm"><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-1"/>I confirm these birth details and birth-time UTC offsets are accurate. I request the selected private report and a secure access link to my registered account when delivery is available.</label>}
      {status ? <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" aria-live="polite">{status}</p> : null}
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? tr("submittingReportRequest") : preflight ? "Validate details and continue" : automaticDelivery ? "Generate my report" : tr("submitReportRequest")}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
