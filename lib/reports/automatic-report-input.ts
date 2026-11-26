import { z } from "zod";
import {reportRequestCopy} from "./report-request-copy";
import {reportIntakeScope} from "./public-intake";
import {isFullRomanNumerologyName} from "./roman-name";

// Store versioned specialist details in the existing private request concern
// field. Older text-only requests remain readable; no production migration or
// disclosure of birth data into payment metadata is necessary.
export const AUTO_REPORT_INPUT_VERSION = "naksharix-auto-report-v1" as const;
export const AUTO_REPORT_TARGET_HOURS = 24;
export const AUTO_REPORT_SLUGS = [
  "premium-kundli","couple-kundli","career-report","wealth-report","love-report",
  "baby-name-report","sade-sati-report","manglik-kaal-sarp-report","numerology-lo-shu-report",
  "name-correction-report","yearly-horoscope-report","transit-report","rahu-ketu-report",
  "jupiter-transit-report","fortune-report"
] as const;
export type AutoReportSlug = typeof AUTO_REPORT_SLUGS[number];
export const autoReportSlugSet = new Set<string>(AUTO_REPORT_SLUGS);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{
  const ms=Date.parse(value+"T00:00:00Z");
  return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===value&&value>="1900-01-01"&&ms<=Date.now();
},"Enter a valid past or current birth date.");
const timeSchema=z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const reportBirthSchema=z.object({
  name:z.string().trim().min(1).max(100),
  gender:z.string().trim().max(60).optional(),
  dateOfBirth:dateSchema,timeOfBirth:timeSchema,
  birthPlace:z.string().trim().min(2).max(220),
  latitude:z.number().finite().min(-89).max(89),
  longitude:z.number().finite().min(-180).max(180),
  timezone:z.number().finite().min(-12).max(14).refine(n=>Number.isInteger(n*60),"Enter the actual UTC offset at birth.")
}).strict();
export const automaticExtraSchema=z.object({
  confirmed:z.literal(true),
  birthZone:z.string().trim().min(1).max(100).optional(),
  partnerZone:z.string().trim().min(1).max(100).optional(),
  partner:reportBirthSchema.optional(),
  partnerPermission:z.boolean().optional(),
  guardianPermission:z.boolean().optional(),
  romanName:z.string().trim().max(100).optional(),
  candidateNames:z.array(z.string().trim().min(1).max(100)).max(12).optional()
}).strict();
export type ReportBirthDetails=z.infer<typeof reportBirthSchema>;
export type AutomaticReportExtra=z.infer<typeof automaticExtraSchema>;
const envelopeSchema=z.object({version:z.literal(AUTO_REPORT_INPUT_VERSION),question:z.string().trim().max(2000),extra:automaticExtraSchema}).strict();
export function encodeAutomaticReportInput(question:string,extra:AutomaticReportExtra) {
  return JSON.stringify(envelopeSchema.parse({version:AUTO_REPORT_INPUT_VERSION,question,extra}));
}
export function decodeAutomaticReportInput(value:string|null|undefined) {
  if(!value||!value.startsWith("{"))return null;
  try{const result=envelopeSchema.safeParse(JSON.parse(value));return result.success?result.data:null;}catch{return null;}
}
export function reportConcernText(value:string|null|undefined) {
  return decodeAutomaticReportInput(value)?.question??value??"";
}
export function checkAutomaticInputs(slug:string,birth:unknown,extra:unknown) {
  if(!autoReportSlugSet.has(slug))return {ok:false as const,reason:"This report is not in the automatic catalogue."};
  const b=reportBirthSchema.safeParse(birth),e=automaticExtraSchema.safeParse(extra);
  if(!b.success||!e.success)return {ok:false as const,reason:"Confirm complete birth details, including a valid date, time, location and birth-time UTC offset."};
  if(slug==="couple-kundli"&&(!e.data.partner||e.data.partnerPermission!==true))
    return {ok:false as const,reason:"Both people's complete birth details and permission to use the other person's details are required for matching."};
  const nameError=checkReportSpellings(slug,e.data);
  if(nameError)return {ok:false as const,reason:nameError};
  return {ok:true as const,birth:b.data,extra:e.data};
}
function checkReportSpellings(slug:string,extra:AutomaticReportExtra){
  const {romanName,candidateNames}=extra;
  if(slug==="numerology-lo-shu-report"&&!isFullRomanNumerologyName(romanName))return reportRequestCopy.en.invalidRoman;
  if(slug==="name-correction-report"&&(!isFullRomanNumerologyName(romanName)||!candidateNames?.some(n=>n.toLowerCase()!==romanName.toLowerCase())))return reportRequestCopy.en.invalidAlternative;
  if((slug==="name-correction-report"||slug==="baby-name-report")&&candidateNames?.some(n=>!isFullRomanNumerologyName(n)))return reportRequestCopy.en.invalidSpellings;
}

// Historical stored orders may also contain chart fields. Only the civil date
// and display name reach the name/date renderer.
export const dateNameBirth=reportBirthSchema.pick({name:true,dateOfBirth:true}).strip();
export function checkDateNameReportInputs(slug:string,birth:unknown,extra:unknown){
  const b=dateNameBirth.safeParse(birth),e=automaticExtraSchema.safeParse(extra);
  if(!reportIntakeScope(slug).dateNameOnly||!b.success||!e.success)return {ok:false as const,reason:reportRequestCopy.en.invalidDateName};
  const reason=checkReportSpellings(slug,e.data);
  if(reason)return {ok:false as const,reason};
  return {ok:true as const,birth:b.data,extra:e.data};
}

// A supplied offset must convert to the same civil clock in its recorded
// zone. This rejects DST gaps and lets a recorded offset select either fold.
export function matchesBirthZone(birth:ReportBirthDetails,zone:string){
  try{
    const utc=Date.parse(birth.dateOfBirth+"T"+birth.timeOfBirth+":00Z")-Math.round(birth.timezone*3600000);
    const parts=new Intl.DateTimeFormat("en-GB",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(utc);
    const civil=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    return civil.year+"-"+civil.month+"-"+civil.day===birth.dateOfBirth&&civil.hour+":"+civil.minute===birth.timeOfBirth&&civil.second==="00";
  }catch{return false;}
}
// New intake must not collect unrelated birth/name data. Keep the existing
// renderer validator compatible with historical saved report envelopes.
export function checkNewReportInputs(slug:string,birth:unknown,extra:unknown) {
  const scope=reportIntakeScope(slug);
  if(scope.dateNameOnly&&!dateNameBirth.strict().safeParse(birth).success)return {ok:false as const,reason:reportRequestCopy.en.invalidDateName};
  const checked=scope.dateNameOnly?checkDateNameReportInputs(slug,birth,extra):checkAutomaticInputs(slug,birth,extra);
  if(!checked.ok)return checked;
  const details=checked.extra;
  if(slug==="name-correction-report"&&details.romanName){
    const letters=(name:string)=>name.toUpperCase().replace(/[^A-Z]/g,"");
    const names=[details.romanName,...details.candidateNames??[]].map(letters);
    if(new Set(names).size!==names.length)return {ok:false as const,reason:reportRequestCopy.en.invalidAlternative};
  }
  if(slug==="fortune-report"&&!isFullRomanNumerologyName(details.romanName))return {ok:false as const,reason:reportRequestCopy.en.invalidRoman};
  if((details.birthZone&&scope.dateNameOnly)||(!scope.couple&&details.partnerZone))return {ok:false as const,reason:reportRequestCopy.en.invalidExtra};
  if((details.birthZone&&"timeOfBirth" in checked.birth&&!matchesBirthZone(checked.birth as ReportBirthDetails,details.birthZone))||
     (details.partnerZone&&details.partner&&!matchesBirthZone(details.partner,details.partnerZone)))return {ok:false as const,reason:reportRequestCopy.en.invalidZone};
  if(scope.babyName&&details.guardianPermission!==true)return {ok:false as const,reason:reportRequestCopy.en.guardianPermission};
  if(!scope.babyName&&details.guardianPermission!==undefined)return {ok:false as const,reason:reportRequestCopy.en.invalidExtra};
  const allowedPartner=scope.couple,allowedRoman=scope.romanName,allowedCandidates=scope.candidateNames;
  if((!allowedPartner&&(details.partner!==undefined||details.partnerPermission!==undefined))||
     (!allowedRoman&&details.romanName!==undefined)||
     (!allowedCandidates&&details.candidateNames!==undefined))
    return {ok:false as const,reason:"Remove extra personal details that are not required for this report."};
  return checked;
}
export function autoReportDeliveryMessage(language:string) {
  return language==="hi"?"पूरी और सही जन्म जानकारी जमा करने के बाद आपकी रिपोर्ट तैयार करके पंजीकृत ईमेल पर भेजी जाएगी। अनुमानित समय: 24 घंटे के भीतर।":
    language==="hinglish"?"Complete aur correct birth details submit karne ke baad report aapke registered email par bheji jayegi. Estimated delivery: 24 hours ke andar.":
    "After you submit complete and correct birth details, your report will be generated and sent to your registered email. Estimated delivery: within 24 hours.";
}
