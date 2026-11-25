"use client";

import { cloneElement,useEffect,useId,useRef,useState,type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2,Mail,X } from "lucide-react";
import { autoReportDeliveryMessage,checkAutomaticInputs } from "@/lib/reports/automatic-report-input";
import {reportRequestCopy,reportRequestErrorKey,type ReportRequestCopyKey} from "@/lib/reports/report-request-copy";
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

// Native time controls can include zero seconds. The report contract uses minute precision;
// never silently discard nonzero seconds or change the selected local birth time.
function minuteBirthTime(value:string){return value.replace(/^((?:[01]\d|2[0-3]):[0-5]\d):00(?:\.0+)?$/, "$1");}
// Native form values are the submit-time source of truth, including Safari,
// autofill and IME inputs whose React change event may be delayed.
function reportField(fields:FormData,name:string){
  const value=fields.get(name);
  return typeof value==="string"?value:"";
}
function selectedPlace(form:HTMLFormElement,field:string){
  return form.querySelector<HTMLInputElement>('input[data-field="'+field+'"]')?.value??"";
}

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
  const copy=reportRequestCopy[apiLocale];
  const [birthPlace, setBirthPlace] = useState("");
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [language, setLanguage] = useState(apiLocale);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<ReportRequestCopyKey | null>(null);
  const [loading, setLoading] = useState(false);
  const submissionInFlight=useRef(false);
  const [prepared,setPrepared]=useState<{token:string;details:Record<string,unknown>}|null>(null);
  const [capturedId,setCapturedId]=useState<string|null>(null);
  const [offset,setOffset]=useState("");
  const [partnerPlace,setPartnerPlace]=useState("");
  const [partnerLocation,setPartnerLocation]=useState<ResolvedLocation|null>(null);
  const [partnerOffset,setPartnerOffset]=useState("");
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
  function autoDetails(fields:FormData,form:HTMLFormElement){
    const field=(name:string)=>reportField(fields,name);
    const partnerOffsetValue=field("reportPartnerOffset");
    const resolvedPartner=couple&&partnerLocation&&selectedPlace(form,"partnerBirthPlace")===partnerLocation.displayName?partnerLocation:null;
    return {
      confirmed:fields.has("reportConfirmed"),
      partnerPermission:couple?fields.has("reportPartnerPermission"):undefined,
      partner:resolvedPartner?{name:field("reportPartnerName"),gender:field("reportPartnerGender"),dateOfBirth:field("reportPartnerDate"),timeOfBirth:minuteBirthTime(field("reportPartnerTime")),birthPlace:resolvedPartner.displayName,latitude:resolvedPartner.latitude,longitude:resolvedPartner.longitude,timezone:partnerOffsetValue.trim()===""?undefined:Number(partnerOffsetValue)}:undefined,
      romanName:nameCorrection||numerologyName?field("reportRomanName"):undefined,
      candidateNames:nameCorrection||babyName?field("reportCandidateNames").split(/[\n,]/).map(s=>s.trim()).filter(Boolean):undefined
    };
  }
  function clearFieldError(field:keyof Errors){
    setErrors(previous=>previous[field]?{...previous,[field]:undefined}:previous);
  }
  function validate(actual:{fullName:string;dateOfBirth:string;timeOfBirth:string;birthPlace:string;concern:string}) {
    const next: Errors = {};
    if (!actual.fullName.trim()) next.fullName = requiredMessage;
    if (!actual.dateOfBirth) next.dateOfBirth = requiredMessage;
    if (!actual.timeOfBirth) next.timeOfBirth = requiredMessage;
    if (!actual.birthPlace.trim() || !location || actual.birthPlace!==location.displayName) next.birthPlace = actual.birthPlace.trim() ? tr("selectLocationFromSuggestions") : requiredMessage;
    if (!actual.concern.trim()) next.concern = requiredMessage;
    setErrors(next);
    if (Object.keys(next).length) scrollToFirstError(next);
    return Object.keys(next).length === 0;
  }

  async function savePaidDetails(details:Record<string,unknown>,verifiedOrderId?:string){
    const response=await secureFetch("/api/report-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...details,...(verifiedOrderId?{orderId:verifiedOrderId}:{})})});
    const json=await response.json().catch(()=>null);
    if(!response.ok||!json?.data?.reportRequest?.id){setStatus(reportRequestErrorKey(json?.error,verifiedOrderId||paymentVerified?"paid":"manual",response.status));return false;}
    if(json.data.automaticQueued)siteNotice.success(autoReportDeliveryMessage(apiLocale),copy.received);
    router.push(`/report-request/success?id=${encodeURIComponent(json.data.reportRequest.id)}`);
    return true;
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(submissionInFlight.current||loading)return;
    const form=event.currentTarget;
    const fields=new FormData(form);
    const fullName=reportField(fields,"reportFullName"),gender=reportField(fields,"reportGender");
    const actualDate=reportField(fields,"reportBirthDate"),actualTime=minuteBirthTime(reportField(fields,"reportBirthTime"));
    const actualPlace=selectedPlace(form,"birthPlace"),concern=reportField(fields,"reportConcern");
    if(!validate({fullName,dateOfBirth:actualDate,timeOfBirth:actualTime,birthPlace:actualPlace,concern}))return;
    setStatus(null);
    const offsetValue=reportField(fields,"reportBirthOffset");
    const timezone=needsSpecialistDetails?(offsetValue.trim()===""?undefined:Number(offsetValue)):location?.timezoneOffset;
    const birth={name:fullName,gender,dateOfBirth:actualDate,timeOfBirth:actualTime,birthPlace:location?.displayName??actualPlace,latitude:location?.latitude,longitude:location?.longitude,timezone};
    const automaticDetails=needsSpecialistDetails?autoDetails(fields,form):undefined;
    if(needsSpecialistDetails){const checked=checkAutomaticInputs(reportSlug,birth,automaticDetails);if(!checked.ok){setStatus(reportRequestErrorKey(checked.reason,preflight?"preflight":paymentVerified?"paid":"manual"));return;}}
    const preferred=reportField(fields,"reportLanguage");
    const selectedLanguage=preferred==="en"||preferred==="hi"||preferred==="hinglish"?preferred:language;
    const details={orderId,planType:plan,reportSlug,adminBypass,deliveryEmail:userEmail,fullName,gender,dateOfBirth:actualDate,timeOfBirth:actualTime,birthPlace:birth.birthPlace,latitude:birth.latitude,longitude:birth.longitude,timezone:birth.timezone,phone:reportField(fields,"reportPhone"),concern,questionOrConcern:concern,language:selectedLanguage,automaticDetails};
    submissionInFlight.current=true;
    setLoading(true);
    try{
      if(preflight){
        const response=await secureFetch("/api/report-requests/preflight",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reportSlug,deliveryEmail:userEmail,birth,automaticDetails,concern})});
        const json=await response.json().catch(()=>null);
        if(!response.ok||typeof json?.data?.token!=="string"||json.data.reportId!==preflight.reportId||json.data.price!==preflight.price||json.data.expiresInSeconds!==1200){setStatus(reportRequestErrorKey(json?.error,"preflight",response.status));return;}
        setPrepared({token:json.data.token,details});return;
      }
      await savePaidDetails(details);
    }catch{setStatus(preflight?"preflightFailed":paymentVerified?"interrupted":"manualInterrupted");}
    finally{submissionInFlight.current=false;setLoading(false);}
  }
  if(preflight&&prepared)return (
    <section className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-5">
      <h2 className="font-cinzel text-xl font-bold">{capturedId?copy.verified:copy.review}</h2>
      <p>{reportName} · {preflight.price}</p>
      <p className="text-sm">{copy.pagePrivacy}</p>
      {!capturedId?<><RazorpayCheckoutButton payload={{purpose:preflight.purpose,reportId:preflight.reportId,preflightToken:prepared.token}} label={`${copy.pay} ${preflight.price}`} onVerified={async id=>{setCapturedId(id);setLoading(true);setStatus(null);try{await savePaidDetails(prepared.details,id);}catch{setStatus("saveInterrupted");}finally{setLoading(false);}}}/><p className="text-xs">{copy.expiry}</p></>:<Button type="button" disabled={loading} onClick={async()=>{if(!capturedId)return;setLoading(true);try{await savePaidDetails(prepared.details,capturedId);}catch{setStatus("saveUnconfirmed");}finally{setLoading(false);}}}>{loading?copy.saving:copy.retry}</Button>}
      {status?<p role="alert" className="text-sm text-destructive">{copy[status]}</p>:null}
      <Link className="inline-block underline" href="/dashboard">{copy.paymentHistory}</Link>
    </section>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      {automaticDelivery&&<dialog ref={paymentDialog} aria-labelledby="report-payment-title" className="m-auto w-[min(92vw,30rem)] max-h-[90dvh] overflow-y-auto rounded-2xl border border-[#D4AF37]/40 bg-[#fff9ef] p-6 text-[#412b36] shadow-2xl backdrop:bg-black/60">
        <button type="button" onClick={()=>paymentDialog.current?.close()} aria-label={copy.closePayment} className="absolute right-3 top-3 rounded-lg p-2"><X className="h-5 w-5"/></button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e2f4e8] text-[#217642]"><CheckCircle2 className="h-7 w-7"/></div>
        <h2 id="report-payment-title" className="mt-3 font-cinzel text-xl font-bold">{copy.successful}</h2>
        <p className="mt-2 font-semibold text-[#7b3043]">{reportName}</p>
        <p className="mt-3 text-sm leading-7">{autoReportDeliveryMessage(apiLocale)}</p>
        <p className="mt-3 flex items-start gap-2 break-all rounded-xl border border-[#e3c7a0] bg-white p-3 text-sm"><Mail className="h-4 w-4 shrink-0"/>{userEmail}</p>
        <p className="mt-2 text-xs leading-6">{copy.completeAfterPayment}</p>
        <Button className="mt-5 w-full" type="button" onClick={()=>paymentDialog.current?.close()}>{copy.completeDetails}</Button>
      </dialog>}
      <div className="rounded-lg border border-[#d8c0a1] bg-[#fff9ef] p-4 text-sm text-[#372630]">
        <div className="flex items-start gap-2">
          {paymentVerified || adminBypass ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /> : null}
          <div>
            <p className="font-semibold">{reportName}{preflight?` · ${preflight.price}`:""}</p>
            <p className="mt-1">{tr("reportDeliveryEmailNotice")}: <span className="font-semibold">{userEmail}</span></p>
            <span className="mt-2 block text-[#55474b]">
              {paymentVerified
                ? automaticDelivery ? autoReportDeliveryMessage(apiLocale) : copy.linkedPayment
                : adminBypass
                  ? tr("adminTestingModePaymentBypassed")
                  : preflight?copy.noCharge:copy.manualNoCharge}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={tr("fullName")} error={errors.fullName}>
          <Input data-field="fullName" name="reportFullName" onInput={()=>clearFieldError("fullName")} className={cn(errorClass(Boolean(errors.fullName)))} />
        </Field>
        <Field label={tr("gender")}>
          <select name="reportGender" defaultValue="" className="cosmic-select">
            <option value="">{tr("genderPreferNotToSay")}</option>
            <option value="Male">{tr("genderMale")}</option>
            <option value="Female">{tr("genderFemale")}</option>
            <option value="Other">{tr("genderOther")}</option>
          </select>
        </Field>
        <Field label={tr("dateOfBirth")} error={errors.dateOfBirth}>
          <Input data-field="dateOfBirth" name="reportBirthDate" type="date" onInput={()=>clearFieldError("dateOfBirth")} className={cn(errorClass(Boolean(errors.dateOfBirth)))} />
        </Field>
        <Field label={tr("timeOfBirth")} error={errors.timeOfBirth}>
          <Input data-field="timeOfBirth" name="reportBirthTime" type="time" step={60} onInput={()=>clearFieldError("timeOfBirth")} className={cn(errorClass(Boolean(errors.timeOfBirth)))} />
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
        {needsSpecialistDetails&&<div className="space-y-2 md:col-span-2"><Label htmlFor="report-birth-offset">{copy.offset}</Label><Input id="report-birth-offset" name="reportBirthOffset" type="number" step="any" min={-12} max={14} required value={offset} onInput={e=>setOffset(e.currentTarget.value)} onChange={e=>setOffset(e.target.value)}/><p className="text-xs naksh-muted-text">{copy.offsetHint}</p></div>}
        <Field label={tr("phone")}>
          <Input name="reportPhone" />
        </Field>
        <Field label={tr("preferredLanguage")}>
          <select name="reportLanguage" value={language} onChange={(event) => setLanguage(event.target.value as typeof apiLocale)} className="cosmic-select">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </Field>
        <Field label={tr("reportTypePlan")}>
          <Input value={`${reportName} · ${plan === "VIP" ? tr("vip") : tr("premium")}`} readOnly />
        </Field>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="report-concern">{tr("mainQuestionConcern")}</Label>
          <textarea id="report-concern" aria-invalid={Boolean(errors.concern)} aria-describedby={errors.concern?"report-concern-error":undefined} data-field="concern" name="reportConcern" onInput={()=>clearFieldError("concern")} maxLength={2000} rows={4} className={cn("cosmic-textarea", errorClass(Boolean(errors.concern)))} />
          {errors.concern ? <p id="report-concern-error" role="alert" className="text-sm text-destructive">{errors.concern}</p> : null}
        </div>
      </div>

      {couple&&<fieldset className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-4">
        <legend className="px-2 font-semibold">{copy.partnerLegend}</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={copy.partnerName}><Input required name="reportPartnerName" maxLength={100}/></Field>
          <Field label={copy.optionalGender}><select className="cosmic-select" name="reportPartnerGender" defaultValue=""><option value="">{tr("genderPreferNotToSay")}</option><option value="Male">{tr("genderMale")}</option><option value="Female">{tr("genderFemale")}</option><option value="Other">{tr("genderOther")}</option></select></Field>
          <Field label={tr("dateOfBirth")}><Input required name="reportPartnerDate" type="date"/></Field>
          <Field label={tr("timeOfBirth")}><Input required name="reportPartnerTime" type="time" step={60}/></Field>
          <div className="md:col-span-2"><LocationAutocomplete value={partnerPlace} onChange={value=>{setPartnerPlace(value);if(value!==partnerLocation?.displayName){setPartnerLocation(null);setPartnerOffset("")}}} onResolvedLocation={next=>{setPartnerLocation(next);setPartnerOffset(next?.timezoneOffset===undefined?"":String(next.timezoneOffset))}} label={copy.partnerPlace} dataField="partnerBirthPlace" required/></div>
          <Field label={copy.partnerOffset}><Input name="reportPartnerOffset" type="number" required min={-12} max={14} step="any" value={partnerOffset} onInput={e=>setPartnerOffset(e.currentTarget.value)} onChange={e=>setPartnerOffset(e.target.value)}/></Field>
        </div><label className="flex items-start gap-3 text-sm"><input type="checkbox" name="reportPartnerPermission" required/> {copy.partnerPermission}</label>
      </fieldset>}
      {numerologyName&&<Field label={copy.romanFullName}><Input required name="reportRomanName" maxLength={100} placeholder={copy.nameExample}/></Field>}
      {(nameCorrection||babyName)&&<fieldset className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-4"><legend className="px-2 font-semibold">{nameCorrection?copy.nameCompare:copy.babyPreferences}</legend>{nameCorrection&&<Field label={copy.romanCurrent}><Input required name="reportRomanName" maxLength={100}/></Field>}<Field label={nameCorrection?copy.alternatives:copy.preferredNames}><textarea name="reportCandidateNames" required={nameCorrection} maxLength={1200} rows={3} className="cosmic-textarea" placeholder={copy.romanPlaceholder}/></Field></fieldset>}
      {needsSpecialistDetails&&<label className="flex items-start gap-3 rounded-lg border border-[#D4AF37]/30 p-4 text-sm"><input type="checkbox" name="reportConfirmed" required className="mt-1"/>{copy.consent}</label>}
      {status ? <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" aria-live="polite">{copy[status]}</p> : null}
      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? tr("submittingReportRequest") : preflight ? copy.validate : automaticDelivery ? copy.generate : tr("submitReportRequest")}
      </Button>
    </form>
  );
}

function Field({label,error,children}:{label:string;error?:string;children:ReactElement<{id?:string;"aria-invalid"?:boolean;"aria-describedby"?:string}>}){
 const id=useId();return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{cloneElement(children,{id,"aria-invalid":Boolean(error),"aria-describedby":error?id+"-error":undefined})}{error?<p id={id+"-error"} role="alert" className="text-sm text-destructive">{error}</p>:null}</div>;
}
