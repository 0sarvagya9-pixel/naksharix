import {sanitizeInput} from "@/lib/security/sanitize";
import {validConsultationSlotWindow} from "@/lib/consultations/slot-contract";
export const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==="object"&&!Array.isArray(value);
export const nonempty=(value:unknown):value is string=>typeof value==="string"&&!!value.trim();
const numeric=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)||typeof value==="string"&&/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)&&Number.isFinite(Number(value));
export function profilePayload(form:FormData,skills:string[],languages:string[]):Record<string,unknown>{
 const payload:Record<string,unknown>=sanitizeInput({...Object.fromEntries(form.entries()),skills:skills.join(", "),specialization:skills.join(", "),languages:languages.join(", "),availableForChat:form.has("availableForChat"),availableForCall:form.has("availableForCall"),availableForVideo:form.has("availableForVideo")});
 // Omit an unset optional amount: the existing coercing schema turns an empty string into zero.
 if(payload.pricePerSession==="")delete payload.pricePerSession;
 return payload;
}
export function profileMatches(value:unknown,expected:Record<string,unknown>,userId:string,profileId?:string){
 if(!object(value)||!nonempty(value.id)||!nonempty(userId)||value.userId!==userId||profileId&&value.id!==profileId||value.status!=="PENDING_REVIEW"||value.approvedAt!==null)return false;
 for(const key of ["displayName","bio","specialization","availabilityStatus","availableForChat","availableForCall","availableForVideo"])if(value[key]!==expected[key])return false;
 for(const key of ["photoUrl","introLine","city","country"])if(value[key]!== (expected[key]||null))return false;
 for(const key of ["experienceYears","consultationPrice"])if(!numeric(value[key])||Number(value[key])!==Number(expected[key]))return false;
 if(expected.pricePerSession===""||expected.pricePerSession===undefined){if(value.pricePerSession!==null)return false;}else if(!numeric(value.pricePerSession)||Number(value.pricePerSession)!==Number(expected.pricePerSession))return false;
 for(const key of ["skills","languages"]){const actual=value[key],chosen=String(expected[key]).split(",").map(x=>x.trim()).filter(Boolean);if(!Array.isArray(actual)||actual.length!==chosen.length||actual.some((item,i)=>item!==chosen[i]))return false;}
 return true;
}
export function noteMatches(value:unknown,expected:{userId:string;title:string;body:string}){return object(value)&&nonempty(value.id)&&nonempty(value.astrologerProfileId)&&value.userId===expected.userId&&value.title===expected.title&&value.body===expected.body&&value.private===true;}
export type ProviderSlot={id:string;dayOfWeek:number;startTime:string;endTime:string;isActive?:boolean;consultationType?:string;status?:string;isHoliday?:boolean};
export function readProviderSlot(value:unknown):ProviderSlot|null{
 if(!object(value)||!nonempty(value.id)||typeof value.dayOfWeek!=="number"||typeof value.startTime!=="string"||typeof value.endTime!=="string"||typeof value.isActive!=="boolean"||typeof value.isHoliday!=="boolean"||typeof value.consultationType!=="string"||typeof value.status!=="string"||!["ONLINE","BUSY","OFFLINE"].includes(value.status))return null;
 const slot={id:value.id,dayOfWeek:value.dayOfWeek,startTime:value.startTime,endTime:value.endTime,isActive:value.isActive,isHoliday:value.isHoliday,consultationType:value.consultationType,status:value.status};
 return !slot.isActive||validConsultationSlotWindow(slot)?slot:null;
}
