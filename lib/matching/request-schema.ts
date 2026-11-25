import {z} from "zod";
import {normalizeBirthDate,normalizeBirthTime,parseTimezoneOffsetToHours} from "@/lib/astrology/own-engine/time";

// Both existing endpoints keep their response contracts, but consume the
// same validated birth inputs. No null/blank coordinate coercion, silent
// timezone fallback, conflicting aliases or rolled-over calendar dates.
const text=z.string().trim().min(1).max(80);
const coordinate=z.union([z.number().finite(),z.string().trim().regex(/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/).transform(Number)]).pipe(z.number().finite());
const person=z.object({
 name:z.string().trim().min(2).max(80),gender:z.string().trim().max(80).optional(),
 dateOfBirth:text.optional(),birthDate:text.optional(),timeOfBirth:text.optional(),birthTime:text.optional(),
 birthPlace:z.string().trim().min(2).max(160),
 latitude:coordinate.pipe(z.number().min(-90).max(90)),longitude:coordinate.pipe(z.number().min(-180).max(180)),
 timezone:z.string().trim().min(1).max(100).default("Asia/Kolkata")
}).transform((v,ctx)=>{
 let dateOfBirth:string,timeOfBirth:string;
 try{
  const raw=v.dateOfBirth??v.birthDate;
  if(!raw)throw Error();
  dateOfBirth=normalizeBirthDate(raw);
  if(v.dateOfBirth&&v.birthDate&&normalizeBirthDate(v.birthDate)!==dateOfBirth)throw Error();
 }catch{ctx.addIssue({code:"custom",path:["dateOfBirth"],message:"Provide a valid and consistent birth date."});return z.NEVER;}
 try{
  const raw=v.timeOfBirth??v.birthTime;
  if(!raw)throw Error();
  timeOfBirth=normalizeBirthTime(raw);
  if(v.timeOfBirth&&v.birthTime&&normalizeBirthTime(v.birthTime)!==timeOfBirth)throw Error();
 }catch{ctx.addIssue({code:"custom",path:["timeOfBirth"],message:"Provide a valid and consistent birth time."});return z.NEVER;}
 try{parseTimezoneOffsetToHours(v.timezone,dateOfBirth,timeOfBirth);}
 catch{ctx.addIssue({code:"custom",path:["timezone"],message:"Provide a valid timezone and unambiguous birth time."});return z.NEVER;}
 return {name:v.name,gender:v.gender||"Prefer not to say",dateOfBirth,timeOfBirth,birthPlace:v.birthPlace,latitude:v.latitude,longitude:v.longitude,timezone:v.timezone};
});
const language=z.enum(["en","hi","hinglish"]);
export const matchingRequestSchema=z.object({bride:person,groom:person,locale:language.optional(),language:language.optional()});
