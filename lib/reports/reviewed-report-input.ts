import {checkAutomaticInputs,decodeAutomaticReportInput,autoReportSlugSet,type AutomaticReportExtra} from "@/lib/reports/automatic-report-input";
import {getManualReport} from "@/lib/manual-catalogue";

type StoredInput={reportSlug:string;fullName:string;gender:string|null;dateOfBirth:string;timeOfBirth:string;birthPlace:string;latitude:number|null;longitude:number|null;timezone:number|null;concern:string|null;language:string};

/** The route must first verify a real admin's current review and entitlement.
 * Never invent the missing partner, name spelling or permission of an old order. */
export function prepareReviewedSpecialistInput(row:StoredInput){
 const slug=getManualReport(row.reportSlug)?.slug??row.reportSlug;
 if(!autoReportSlugSet.has(slug))return {kind:"legacy" as const};
 const envelope=decodeAutomaticReportInput(row.concern);
 if(!envelope&&row.concern?.includes('"version":"naksharix-auto-report-v1"'))return {kind:"invalid" as const,reason:"The saved specialist details require review."};
 const extra:AutomaticReportExtra=envelope?.extra??{confirmed:true,...(slug==="numerology-lo-shu-report"&&/^[A-Za-z][A-Za-z .'-]*$/.test(row.fullName.trim())?{romanName:row.fullName.trim()}: {})};
 const birth={name:row.fullName,gender:row.gender??undefined,dateOfBirth:row.dateOfBirth,timeOfBirth:row.timeOfBirth,birthPlace:row.birthPlace,latitude:row.latitude,longitude:row.longitude,timezone:row.timezone};
 const checked=checkAutomaticInputs(slug,birth,extra);
 if(!checked.ok)return {kind:"invalid" as const,reason:checked.reason};
 const question=(envelope?.question??row.concern??"").trim();
 if(question.length>2000)return {kind:"invalid" as const,reason:"The saved report question requires review."};
 const language:"hi"|"hinglish"|"en"=row.language==="hi"||row.language==="hinglish"?row.language:"en";
 return {kind:"specialist" as const,slug,birth:checked.birth,extra:checked.extra,question,language};
}
