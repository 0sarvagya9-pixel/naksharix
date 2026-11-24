/** Reject malformed, stale or future backup proof without reading customer records. */
export type RecoveryReceipt={version:1;day:string;completedAt:string;bytes:number;sha256:string;keyFingerprint:string;
  encrypted:true;privateStore:true;restored:true;tables:number;indexes:number;foreignKeys:number;emailAccepted:boolean};
const safeInteger=(value:unknown,min:number,max=Number.MAX_SAFE_INTEGER):value is number=>typeof value==="number"&&Number.isSafeInteger(value)&&value>=min&&value<=max;
export function verifyRecoveryReceipt(value:unknown,day:string,currentKeyFingerprint:string,nowMs:number,maxEnvelopeBytes:number):RecoveryReceipt|null{
 if(!value||typeof value!=="object"||Array.isArray(value)||!Number.isFinite(nowMs))return null;
 const r=value as Partial<RecoveryReceipt>;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||r.day!==day||r.version!==1||r.encrypted!==true||r.privateStore!==true||r.restored!==true)return null;
 if(typeof r.completedAt!=="string"||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.completedAt))return null;
 const completed=Date.parse(r.completedAt),start=Date.parse(day+"T00:00:00Z");
 // A late-night backup may complete just after UTC midnight; never accept a future receipt.
 if(!Number.isFinite(completed)||!Number.isFinite(start)||completed<start||completed>=start+86400000+360000||completed>nowMs)return null;
 if(!safeInteger(r.bytes,42,maxEnvelopeBytes)||!safeInteger(r.tables,43)||!safeInteger(r.indexes,100)||!safeInteger(r.foreignKeys,40)||typeof r.emailAccepted!=="boolean")return null;
 if(typeof r.sha256!=="string"||!/^[a-f0-9]{64}$/.test(r.sha256)||typeof r.keyFingerprint!=="string"||!/^[a-f0-9]{16}$/.test(r.keyFingerprint)||r.keyFingerprint!==currentKeyFingerprint)return null;
 return r as RecoveryReceipt;
}
export function receiptIsFresh(receipt:RecoveryReceipt,nowMs:number){
 const completed=Date.parse(receipt.completedAt),age=nowMs-completed;
 return Number.isFinite(age)&&age>=0&&age<36*3600000;
}
