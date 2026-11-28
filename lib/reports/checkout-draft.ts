import {createHmac} from "node:crypto";
import {z} from "zod";
import {checkNewReportInputs} from "./automatic-report-input";

export const CHECKOUT_DRAFT_LIFETIME_MS=7*24*3600000;

export const reviewedFieldsSchema=z.object({
  birth:z.unknown(),automaticDetails:z.unknown(),concern:z.string().trim().max(2000).default(""),
  language:z.enum(["en","hi","hinglish"]).default("en"),phone:z.string().trim().max(45).optional()
}).strict();

export function normalizeReviewedFields(slug:string,raw:unknown){
  const parsed=reviewedFieldsSchema.safeParse(raw);
  if(!parsed.success)return {ok:false as const,reason:"Check your report details before starting payment."};
  const {birth,automaticDetails,concern,language,phone}=parsed.data;
  const checked=checkNewReportInputs(slug,birth,automaticDetails);
  if(!checked.ok)return checked;
  if(phone&&!("timeOfBirth" in checked.birth))return {ok:false as const,reason:"Remove extra personal details that are not required for this report."};
  return {ok:true as const,fields:{birth:checked.birth,automaticDetails:checked.extra,concern,language,...(phone?{phone}:{})}};
}

export type ReviewedFields=Extract<ReturnType<typeof normalizeReviewedFields>,{ok:true}>["fields"];
export function reviewedInputDigest(userId:string,slug:string,fields:ReviewedFields,secret:string){
  // Zod constructs each nested object in schema order. No raw personal fields
  // appear in the short-lived eligibility token or processor metadata.
  return createHmac("sha256",secret).update("naksharix-private-intake-v1\0").update(JSON.stringify([userId,slug,fields])).digest("hex");
}

export function fieldsForSubmission(fields:ReviewedFields){
  const {name,...birth}=fields.birth;
  return {fullName:name,...birth,automaticDetails:fields.automaticDetails,language:fields.language,concern:fields.concern,...(fields.phone?{phone:fields.phone}:{})};
}
