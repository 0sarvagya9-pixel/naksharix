"use client";

import { cloneElement,useEffect,useId,useRef,useState,type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2,Mail,X } from "lucide-react";
import { autoReportDeliveryMessage,checkNewReportInputs } from "@/lib/reports/automatic-report-input";
import {parseTimezoneOffsetToHours} from "@/lib/astrology/own-engine/time";
import {correctionCopy} from "@/lib/reports/report-correction-copy";
import {reportIntakeScope} from "@/lib/reports/public-intake";
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
  correctionId?: string;
  plan: "PREMIUM" | "VIP";
  reportSlug?: string;
  reportName?: string;
  paymentVerified?: boolean;
  resumeReviewed?:boolean;
  replaceExpiredReview?:boolean;
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
function birthOffset(place:ResolvedLocation|null,date:string,time:string){
  if(!place)return "";
  if(place.source==="manual")return place.timezoneOffset===undefined?"":String(place.timezoneOffset);
  if(!date||!time||!place.timezone)return "";
  try{return String(parseTimezoneOffsetToHours(place.timezone,date,time));}catch{return "";}
}
function selectedPlace(form:HTMLFormElement,field:string){
  return form.querySelector<HTMLInputElement>('input[data-field="'+field+'"]')?.value??"";
}

export function ReportRequestForm({
  userEmail,
  correctionId,
  orderId,
  plan,
  reportSlug = "premium-kundli",
  reportName = "Premium Astrology Report",
  paymentVerified = false,
  resumeReviewed = false,
  replaceExpiredReview = false,
  automaticDelivery = false,
  specialistDetails = false,
  adminBypass = false,
  preflight
}: Props) {
  const router = useRouter();
  const [correctionError,setCorrectionError]=useState(false);
  const { tr, apiLocale, requiredMessage } = useLanguage();
  const copy=reportRequestCopy[apiLocale];
  const [birthPlace, setBirthPlace] = useState("");
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [language, setLanguage] = useState(apiLocale);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<ReportRequestCopyKey | null>(null);
  const [loading, setLoading] = useState(false);
  const submissionInFlight=useRef(false);
  const [prepared,setPrepared]=useState<{token:string;details:Record<string,unknown>;reviewedInput:Record<string,unknown>}|null>(null);
  const [capturedId,setCapturedId]=useState<string|null>(null);
  const [timeAccuracy,setTimeAccuracy]=useState("known"),[partnerAccuracy,setPartnerAccuracy]=useState("known");
  const [date,setDate]=useState(""),[time,setTime]=useState("");
  const [partnerDate,setPartnerDate]=useState(""),[partnerTime,setPartnerTime]=useState("");
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
  const intake=reportIntakeScope(reportSlug);
  const dateNameOnly=intake.dateNameOnly;
  useEffect(()=>setOffset(birthOffset(location,date,time)),[location,date,time]);
  useEffect(()=>setPartnerOffset(birthOffset(partnerLocation,partnerDate,partnerTime)),[partnerLocation,partnerDate,partnerTime]);
  const couple=needsSpecialistDetails&&intake.couple;
  const nameCorrection=needsSpecialistDetails&&intake.nameCorrection;
  const babyName=needsSpecialistDetails&&intake.babyName;
  const numerologyName=needsSpecialistDetails&&intake.numerologyName;
  function autoDetails(fields:FormData,form:HTMLFormElement){
    const field=(name:string)=>reportField(fields,name);
    const partnerOffsetValue=field("reportPartnerOffset");
    const resolvedPartner=couple&&partnerLocation&&selectedPlace(form,"partnerBirthPlace")===partnerLocation.displayName?partnerLocation:null;
    return {
      confirmed:fields.has("reportConfirmed"),
      birthZone:!dateNameOnly&&location?.source!=="manual"?location?.timezone:undefined,
      partnerZone:resolvedPartner&&resolvedPartner.source!=="manual"?resolvedPartner.timezone:undefined,
      guardianPermission:babyName?fields.has("reportGuardianPermission"):undefined,
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
    if (!dateNameOnly&&!actual.timeOfBirth) next.timeOfBirth = requiredMessage;
    if (!dateNameOnly&&(!actual.birthPlace.trim() || !location || actual.birthPlace!==location.displayName)) next.birthPlace = actual.birthPlace.trim() ? tr("selectLocationFromSuggestions") : requiredMessage;
    setErrors(next);
    if (Object.keys(next).length) scrollToFirstError(next);
    return Object.keys(next).length === 0;
  }

  async function savePaidDetails(details:Record<string,unknown>,verifiedOrderId?:string){
    const response=await secureFetch("/api/report-requests",{silent:true,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...details,...(verifiedOrderId?{orderId:verifiedOrderId}:{})})});
    const json=await response.json().catch(()=>null);
    if(!response.ok||!json?.data?.reportRequest?.id){setStatus(reportRequestErrorKey(json?.error,verifiedOrderId||paymentVerified?"paid":"manual",response.status));return false;}
    siteNotice.success(json.data.automaticQueued?autoReportDeliveryMessage(apiLocale):copy.received,copy.received);
    router.push(`/report-request/success?id=${encodeURIComponent(json.data.reportRequest.id)}`);
    return true;
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(submissionInFlight.current||loading||(!dateNameOnly&&(timeAccuracy!=="known"||(couple&&partnerAccuracy!=="known"))))return;
    const form=event.currentTarget;
    const fields=new FormData(form);
    const fullName=reportField(fields,"reportFullName"),gender=reportField(fields,"reportGender");
    const actualDate=reportField(fields,"reportBirthDate"),actualTime=minuteBirthTime(reportField(fields,"reportBirthTime"));
    const actualPlace=selectedPlace(form,"birthPlace"),concern=reportField(fields,"reportConcern");
    if(!validate({fullName,dateOfBirth:actualDate,timeOfBirth:actualTime,birthPlace:actualPlace,concern}))return;
    setStatus(null);
    const offsetValue=reportField(fields,"reportBirthOffset");
    const timezone=needsSpecialistDetails?(offsetValue.trim()===""?undefined:Number(offsetValue)):location?.timezoneOffset;
    const chartFields={gender,timeOfBirth:actualTime,birthPlace:location?.displayName??actualPlace,latitude:location?.latitude,longitude:location?.longitude,timezone};
    const birth={name:fullName,dateOfBirth:actualDate,...(dateNameOnly?{}:chartFields)};
    const automaticDetails=needsSpecialistDetails?autoDetails(fields,form):undefined;
    if(needsSpecialistDetails){const checked=checkNewReportInputs(reportSlug,birth,automaticDetails);if(!checked.ok){setStatus(reportRequestErrorKey(checked.reason,preflight?"preflight":paymentVerified?"paid":"manual"));return;}}
    const preferred=reportField(fields,"reportLanguage");
    const selectedLanguage=preferred==="en"||preferred==="hi"||preferred==="hinglish"?preferred:language;
    const details={...(replaceExpiredReview&&fields.has("reportReplacementConfirmed")?{replaceExpiredReview:true}:{}),orderId,planType:plan,reportSlug,adminBypass,deliveryEmail:userEmail,fullName,dateOfBirth:actualDate,...(dateNameOnly?{}:{...chartFields,phone:reportField(fields,"reportPhone")}),concern,questionOrConcern:concern,language:selectedLanguage,automaticDetails};
    submissionInFlight.current=true;
    setLoading(true);
    try{
      if(correctionId){
        setCorrectionError(false);
        const response=await secureFetch(`/api/report-requests/${correctionId}/revisions`,{silent:true,method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({birth,extra:automaticDetails,question:concern,language:selectedLanguage})});
        if(!response.ok){setCorrectionError(true);return;}
        siteNotice.success(correctionCopy[apiLocale].saved);
        router.push("/report-request/success?id="+encodeURIComponent(correctionId));
        return;
      }
      if(preflight){
        const reviewedInput={birth,automaticDetails,concern,language:selectedLanguage,...(dateNameOnly?{}:{phone:reportField(fields,"reportPhone")})};
        const response=await secureFetch("/api/report-requests/preflight",{silent:true,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reportSlug,deliveryEmail:userEmail,...reviewedInput})});
        const json=await response.json().catch(()=>null);
        if(!response.ok||typeof json?.data?.token!=="string"||json.data.reportId!==preflight.reportId||json.data.price!==preflight.price||json.data.expiresInSeconds!==1200){setStatus(reportRequestErrorKey(json?.error,"preflight",response.status));return;}
        setPrepared({token:json.data.token,details,reviewedInput});return;
      }
      await savePaidDetails(details);
    }catch{if(correctionId)setCorrectionError(true);else setStatus(preflight?"preflightFailed":paymentVerified?"interrupted":"manualInterrupted");}
    finally{submissionInFlight.current=false;setLoading(false);}
  }
  if(resumeReviewed&&paymentVerified&&orderId)return <section className="space-y-3"><p>{copy.recoverDetails}</p>
    <Button type="button" disabled={loading} onClick={async()=>{if(submissionInFlight.current)return;submissionInFlight.current=true;setLoading(true);try{await savePaidDetails({resumeReviewed:true},orderId);}catch{setStatus("saveInterrupted");}finally{submissionInFlight.current=false;setLoading(false);}}}>{loading?copy.saving:copy.generate}</Button>
    {status&&<p role="alert">{copy[status]}</p>}</section>;
  const review=preflight&&prepared?(
    <section className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-5">
      <h2 className="font-cinzel text-xl font-bold">{capturedId?copy.verified:copy.review}</h2>
      <p>{reportName} · {preflight.price}</p>
      <p className="text-sm">{copy.pagePrivacy}</p>
      {!capturedId&&<dl className="grid gap-3 text-sm sm:grid-cols-2">
        {[[tr("fullName"),prepared.details.fullName],[tr("dateOfBirth"),prepared.details.dateOfBirth],[tr("timeOfBirth"),prepared.details.timeOfBirth],[tr("birthPlace"),prepared.details.birthPlace],[copy.offset,prepared.details.timezone],[copy.romanFullName,(prepared.details.automaticDetails as ReturnType<typeof autoDetails>)?.romanName],[nameCorrection?copy.alternatives:copy.preferredNames,(prepared.details.automaticDetails as ReturnType<typeof autoDetails>)?.candidateNames?.join(", ")],[copy.partnerLegend,(()=>{const partner=(prepared.details.automaticDetails as ReturnType<typeof autoDetails>)?.partner;return partner&&[partner.name,partner.dateOfBirth,partner.timeOfBirth,partner.birthPlace,"UTC "+partner.timezone].join(" · ");})()],[tr("preferredLanguage"),prepared.details.language],[copy.optionalQuestion,prepared.details.concern]].filter(([,value])=>value!==undefined&&value!=="").map(([label,value])=><div key={String(label)}><dt className="font-semibold">{String(label)}</dt><dd className="break-words">{String(value)}</dd></div>)}
      </dl>}
      {!capturedId?<><Button type="button" onClick={()=>{setPrepared(null);setStatus(null);}}>{copy.editDetails}</Button><RazorpayCheckoutButton payload={{purpose:preflight.purpose,reportId:preflight.reportId,preflightToken:prepared.token,reviewedInput:prepared.reviewedInput}} label={`${copy.pay} ${preflight.price}`} onVerified={async id=>{setCapturedId(id);setLoading(true);setStatus(null);try{await savePaidDetails(prepared.details,id);}catch{setStatus("saveInterrupted");}finally{setLoading(false);}}}/><p className="text-xs">{copy.expiry}</p></>:<Button type="button" disabled={loading} onClick={async()=>{if(!capturedId)return;setLoading(true);try{await savePaidDetails(prepared.details,capturedId);}catch{setStatus("saveUnconfirmed");}finally{setLoading(false);}}}>{loading?copy.saving:copy.retry}</Button>}
      {status?<p role="alert" className="text-sm text-destructive">{copy[status]}</p>:null}
      <Link className="inline-block underline" href="/dashboard">{copy.paymentHistory}</Link>
    </section>
  ):null;

  return (<>
    {review}
    <div hidden={Boolean(review)}><form onSubmit={submit} className="space-y-5">
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
              {correctionId ? correctionCopy[apiLocale].instructions : paymentVerified
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
          <Input data-field="fullName" name="reportFullName" maxLength={100} onInput={()=>clearFieldError("fullName")} className={cn(errorClass(Boolean(errors.fullName)))} />
        </Field>
        {!dateNameOnly&&<Field label={tr("gender")}>
          <select name="reportGender" defaultValue="" className="cosmic-select">
            <option value="">{tr("genderPreferNotToSay")}</option>
            <option value="Male">{tr("genderMale")}</option>
            <option value="Female">{tr("genderFemale")}</option>
            <option value="Other">{tr("genderOther")}</option>
          </select>
        </Field>}
        <Field label={tr("dateOfBirth")} error={errors.dateOfBirth}>
          <Input data-field="dateOfBirth" name="reportBirthDate" type="date" onInput={e=>{setDate(e.currentTarget.value);clearFieldError("dateOfBirth");}} className={cn(errorClass(Boolean(errors.dateOfBirth)))} />
        </Field>
        {!dateNameOnly&&<><Field label={copy.timeAccuracy}>
          <select value={timeAccuracy} onChange={e=>setTimeAccuracy(e.target.value)} className="cosmic-select"><option value="known">{copy.exactTime}</option><option value="approximate">{copy.approximateTime}</option><option value="unknown">{copy.unknownTime}</option></select>
        </Field><Field label={tr("timeOfBirth")} error={errors.timeOfBirth}>
          <Input data-field="timeOfBirth" name="reportBirthTime" disabled={timeAccuracy!=="known"} type="time" step={60} onInput={e=>{setTime(e.currentTarget.value);clearFieldError("timeOfBirth");}} className={cn(errorClass(Boolean(errors.timeOfBirth)))} />
        </Field>
        <p className="text-xs md:col-span-2">{copy.knownTime}</p>
        <div className="md:col-span-2">
          <LocationAutocomplete
            value={birthPlace}
            onChange={(value) => { setBirthPlace(value); if(value!==location?.displayName){setLocation(null);setOffset("");} setErrors((e) => ({ ...e, birthPlace: undefined })); }}
            onResolvedLocation={(next) => { setLocation(next); setErrors((e) => ({ ...e, birthPlace: undefined })); }}
            label={tr("birthPlace")}
            required
            dataField="birthPlace"
            error={errors.birthPlace}
          />
        </div>
        {needsSpecialistDetails&&<div className="space-y-2 md:col-span-2"><Label htmlFor="report-birth-offset">{copy.offset}</Label><Input id="report-birth-offset" name="reportBirthOffset" type="number" step="any" min={-12} max={14} required value={offset} onInput={e=>setOffset(e.currentTarget.value)} onChange={e=>setOffset(e.target.value)}/><p className="text-xs naksh-muted-text">{copy.offsetHint}</p></div>}
        <Field label={tr("phone")}>
          <Input name="reportPhone" />
        </Field></>}
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
          <Label htmlFor="report-concern">{copy.optionalQuestion}</Label>
          <textarea id="report-concern" aria-invalid={Boolean(errors.concern)} aria-describedby={errors.concern?"report-concern-error":undefined} data-field="concern" name="reportConcern" onInput={()=>clearFieldError("concern")} maxLength={2000} rows={4} className={cn("cosmic-textarea", errorClass(Boolean(errors.concern)))} />
          {errors.concern ? <p id="report-concern-error" role="alert" className="text-sm text-destructive">{errors.concern}</p> : null}
        </div>
      </div>

      {couple&&<fieldset className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-4">
        <legend className="px-2 font-semibold">{copy.partnerLegend}</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={copy.partnerName}><Input required name="reportPartnerName" maxLength={100}/></Field>
          <Field label={copy.optionalGender}><select className="cosmic-select" name="reportPartnerGender" defaultValue=""><option value="">{tr("genderPreferNotToSay")}</option><option value="Male">{tr("genderMale")}</option><option value="Female">{tr("genderFemale")}</option><option value="Other">{tr("genderOther")}</option></select></Field>
          <Field label={tr("dateOfBirth")}><Input required name="reportPartnerDate" type="date" onInput={e=>setPartnerDate(e.currentTarget.value)}/></Field>
          <Field label={copy.timeAccuracy}><select value={partnerAccuracy} onChange={e=>setPartnerAccuracy(e.target.value)} className="cosmic-select"><option value="known">{copy.exactTime}</option><option value="approximate">{copy.approximateTime}</option><option value="unknown">{copy.unknownTime}</option></select></Field>
          {partnerAccuracy!=="known"&&<p className="text-sm" role="status">{copy.knownTime}</p>}
          <Field label={tr("timeOfBirth")}><Input required disabled={partnerAccuracy!=="known"} name="reportPartnerTime" type="time" onInput={e=>setPartnerTime(e.currentTarget.value)} step={60}/></Field>
          <div className="md:col-span-2"><LocationAutocomplete value={partnerPlace} onChange={value=>{setPartnerPlace(value);if(value!==partnerLocation?.displayName){setPartnerLocation(null);setPartnerOffset("")}}} onResolvedLocation={next=>{setPartnerLocation(next)}} label={copy.partnerPlace} dataField="partnerBirthPlace" required/></div>
          <Field label={copy.partnerOffset}><Input name="reportPartnerOffset" type="number" required min={-12} max={14} step="any" value={partnerOffset} onInput={e=>setPartnerOffset(e.currentTarget.value)} onChange={e=>setPartnerOffset(e.target.value)}/></Field>
        </div><label className="flex items-start gap-3 text-sm"><input type="checkbox" name="reportPartnerPermission" required/> {copy.partnerPermission}</label>
      </fieldset>}
      {numerologyName&&<Field label={copy.romanFullName}><Input required name="reportRomanName" maxLength={100} placeholder={copy.nameExample}/></Field>}
      {(nameCorrection||babyName)&&<fieldset className="space-y-4 rounded-xl border border-[#D4AF37]/30 p-4"><legend className="px-2 font-semibold">{nameCorrection?copy.nameCompare:copy.babyPreferences}</legend>{nameCorrection&&<Field label={copy.romanCurrent}><Input required name="reportRomanName" maxLength={100}/></Field>}<Field label={nameCorrection?copy.alternatives:copy.preferredNames}><textarea name="reportCandidateNames" required={nameCorrection} maxLength={1200} rows={3} className="cosmic-textarea" placeholder={copy.romanPlaceholder}/></Field></fieldset>}
      {replaceExpiredReview&&<label className="flex items-start gap-3 text-sm"><input type="checkbox" required name="reportReplacementConfirmed"/>{copy.replaceExpired}</label>}
      {babyName&&<label className="flex items-start gap-3 text-sm"><input type="checkbox" required name="reportGuardianPermission"/>{copy.guardianPermission}</label>}
      {needsSpecialistDetails&&<label className="flex items-start gap-3 rounded-lg border border-[#D4AF37]/30 p-4 text-sm"><input type="checkbox" name="reportConfirmed" required className="mt-1"/>{dateNameOnly?copy.dateNameConsent:copy.consent}</label>}
      {status ? <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" aria-live="polite">{copy[status]}</p> : null}
      {correctionError&&<p role="alert" className="text-destructive">{correctionCopy[apiLocale].failed}</p>}
      <Button type="submit" disabled={loading||(!dateNameOnly&&(timeAccuracy!=="known"||(couple&&partnerAccuracy!=="known")))} className="w-full md:w-auto">
        {loading ? tr("submittingReportRequest") : correctionId ? correctionCopy[apiLocale].submit : preflight ? copy.validate : automaticDelivery ? copy.generate : tr("submitReportRequest")}
      </Button>
    </form></div></>
  );
}

function Field({label,error,children}:{label:string;error?:string;children:ReactElement<{id?:string;"aria-invalid"?:boolean;"aria-describedby"?:string}>}){
 const id=useId();return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{cloneElement(children,{id,"aria-invalid":Boolean(error),"aria-describedby":error?id+"-error":undefined})}{error?<p id={id+"-error"} role="alert" className="text-sm text-destructive">{error}</p>:null}</div>;
}
