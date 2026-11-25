import { z } from "zod";

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
  partner:reportBirthSchema.optional(),
  partnerPermission:z.boolean().optional(),
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
  if(slug==="numerology-lo-shu-report"&&(!e.data.romanName||!/[A-Za-z]/.test(e.data.romanName)))return {ok:false as const,reason:"Enter the full name in Roman letters for name numerology."};
  if(slug==="name-correction-report"&&(!e.data.romanName||!/[A-Za-z]/.test(e.data.romanName)||!e.data.candidateNames?.some(n=>/[A-Za-z]/.test(n)&&n.toLowerCase()!==e.data.romanName!.toLowerCase())))
    return {ok:false as const,reason:"Enter the current name in Roman letters and at least one alternative spelling for comparison."};
  if((slug==="name-correction-report"||slug==="baby-name-report")&&e.data.candidateNames?.some(n=>!/[A-Za-z]/.test(n)))
    return {ok:false as const,reason:"Provide Roman-letter spellings for name numerology."};
  return {ok:true as const,birth:b.data,extra:e.data};
}
// New intake must not collect unrelated birth/name data. Keep the existing
// renderer validator compatible with historical saved report envelopes.
export function checkNewReportInputs(slug:string,birth:unknown,extra:unknown) {
  const checked=checkAutomaticInputs(slug,birth,extra);
  if(!checked.ok)return checked;
  const details=checked.extra;
  const allowedPartner=slug==="couple-kundli";
  const allowedRoman=slug==="numerology-lo-shu-report"||slug==="name-correction-report";
  const allowedCandidates=slug==="baby-name-report"||slug==="name-correction-report";
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
