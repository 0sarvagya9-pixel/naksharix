import {z} from "zod";
import {reportBirthSchema,automaticExtraSchema,checkAutomaticInputs} from "@/lib/reports/automatic-report-input";
import {compareBusinessNames} from "@/lib/digital-packages/business-names";
import {getPackageDefinition,PACKAGE_TERMS_VERSION} from "@/lib/digital-packages/catalogue";
export const packageLanguage=z.enum(["en","hi","hinglish"]);
const subject=z.object({birth:reportBirthSchema,permission:z.literal(true),romanName:z.string().trim().max(100).optional()}).strict();
export const packageDraftSchema=z.object({
 clientIntent:z.string().uuid(),productKey:z.string().max(70),version:z.literal("v1"),pricePaise:z.number().int().min(100).max(10000000),
 termsVersion:z.literal(PACKAGE_TERMS_VERSION),accepted:z.literal(true),language:packageLanguage,
 subjects:z.array(subject).max(3),names:z.array(z.string().max(70)).max(10),question:z.string().trim().max(1000)
}).strict();
export type PackageDraft=z.infer<typeof packageDraftSchema>;
export const reportItemSchema=z.object({birth:reportBirthSchema,extra:automaticExtraSchema,language:packageLanguage,question:z.string().max(1000)}).strict();
export const nameItemSchema=z.object({names:z.array(z.string().max(70)).min(2).max(10)}).strict();
export type ItemInput=z.infer<typeof reportItemSchema>|z.infer<typeof nameItemSchema>|{language:"en"};
export function preparePackageItems(input:PackageDraft):{kind:string;privateInput:ItemInput}[]{
 const def=getPackageDefinition(input.productKey);
 if(!def||input.subjects.length!==def.subjects||input.version!==def.version)throw Error("Select the correct package and complete every required subject.");
 if(def.language==="en"&&input.language!=="en")throw Error("This document is currently offered in English.");
 if(def.key==="business-name-numerology"){
  compareBusinessNames(input.names);
  if(input.question)throw Error("Business-name comparisons require names only; do not add personal information.");
  return [{kind:"business-name",privateInput:{names:input.names}}];
 }
 if(input.names.length)throw Error("Candidate business names are only used in the business-name report.");
 if(def.key==="astrology-workbook"){
  if(input.question)throw Error("The study workbook does not require personal details.");
  return [{kind:"study-workbook",privateInput:{language:"en"}}];
 }
 if(def.key==="marriage-planning"&&JSON.stringify(input.subjects[0].birth)===JSON.stringify(input.subjects[1].birth))throw Error("Provide distinct birth profiles for the two people.");
 if(def.key==="family-three"&&new Set(input.subjects.map(s=>JSON.stringify([s.birth.name.toLowerCase(),s.birth.dateOfBirth,s.birth.timeOfBirth,s.birth.latitude,s.birth.longitude]))).size!==3)throw Error("Enter three distinct family-member records.");
 return def.kinds.map((kind,i)=>{
  if(kind==="marriage-workbook")return {kind,privateInput:{language:"en" as const}};
  const current=input.subjects[def.key==="family-three"?i:0];
  const extra=automaticExtraSchema.parse({confirmed:true,...(kind==="couple-kundli"?{partner:input.subjects[1].birth,partnerPermission:true}:{}),...(kind==="numerology-lo-shu-report"?{romanName:current.romanName}: {})});
  const checked=checkAutomaticInputs(kind,current.birth,extra);
  if(!checked.ok)throw Error(checked.reason);
  return {kind,privateInput:reportItemSchema.parse({birth:checked.birth,extra:checked.extra,language:input.language,question:input.question})};
 });
}
