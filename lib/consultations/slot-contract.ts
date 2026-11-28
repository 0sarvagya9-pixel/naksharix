import {CONSULTATION_SESSION_MINUTES} from "./pricing";
export function consultationClockMinutes(value:unknown){
 if(typeof value!=="string"||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value))return null;
 return Number(value.slice(0,2))*60+Number(value.slice(3));
}
export type ConsultationSlotWindow={dayOfWeek:number;startTime:string;endTime:string;isActive:boolean;isHoliday:boolean;consultationType:string};
export function validConsultationSlotWindow(slot:ConsultationSlotWindow){
 const start=consultationClockMinutes(slot.startTime),end=consultationClockMinutes(slot.endTime);
 return Number.isInteger(slot.dayOfWeek)&&slot.dayOfWeek>=0&&slot.dayOfWeek<=6&&start!==null&&end!==null&&end>start&&
  ["CHAT","CALL","VIDEO"].includes(slot.consultationType)&&
  (slot.isHoliday||end-start>=CONSULTATION_SESSION_MINUTES);
}
export function isBookableConsultationSlot(slot:ConsultationSlotWindow){
 return slot.isActive&&!slot.isHoliday&&validConsultationSlotWindow(slot);
}
export function verifiedConsultationPractitioner(profile:{status:string;user:{role:string;emailVerified:Date|null;emailVerifiedAt:Date|null}}){
 return profile.status==="APPROVED"&&["ASTROLOGER","CONSULTANT"].includes(profile.user.role)&&
  Boolean(profile.user.emailVerified||profile.user.emailVerifiedAt);
}
export function validOptionalConsultationBirth(date:unknown,time:unknown,now=new Date()){
 if(time!==undefined&&time!==""&&consultationClockMinutes(time)===null)return false;
 if(date===undefined||date==="")return true;
 if(typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const d=new Date(date+"T00:00:00.000Z");
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===date&&date>="1900-01-01"&&date<=now.toISOString().slice(0,10);
}
