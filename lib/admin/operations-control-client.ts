import {EMAIL_TEST_CATEGORIES} from "@/lib/admin/operations-control-copy";
const object=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
export type EmailTestResult={mode:"single"|"suite";acceptedCount:number;requestedCount:number;outcomes:{index:number;providerAccepted:boolean}[]};
export function emailTestResult(value:unknown,mode:"single"|"suite"):EmailTestResult|null{
 if(!object(value)||value.mode!==mode)return null;
 if(mode==="single")return value.providerAccepted===true&&value.acceptedCount===1&&value.requestedCount===1&&value.recipient==="configured admin mailbox"?{mode,acceptedCount:1,requestedCount:1,outcomes:[]}:null;
 if(value.requestedCount!==11||!Array.isArray(value.outcomes)||value.outcomes.length!==11||value.recipient!=="configured owner acceptance mailbox")return null;
 if(!value.outcomes.every((v,i)=>object(v)&&v.index===i+1&&v.category===EMAIL_TEST_CATEGORIES[i]&&typeof v.providerAccepted==="boolean"))return null;
 const accepted=value.outcomes.filter(v=>v.providerAccepted).length;
 return value.acceptedCount===accepted&&value.providerAccepted===(accepted===11)?{mode,acceptedCount:accepted,requestedCount:11,outcomes:value.outcomes}:null;
}
export function freshRestoreTimestamp(value:unknown,now=Date.now()):value is string{if(typeof value!=="string")return false;const time=Date.parse(value),age=now-time;return Number.isFinite(time)&&age>=0&&age<36*3600000;}
export function recoveryReceipt(value:unknown,kind:"run"|"status"):string|null{
 if(!object(value)||value.encrypted!==true||value.restoreVerified!==true||!freshRestoreTimestamp(value.lastSuccessfulAt))return null;
 if(kind==="run"?(value.state!=="verified"||value.privateStore!==true||typeof value.alreadyVerified!=="boolean"):(value.configured!==true||value.operational!==true))return null;
 return value.lastSuccessfulAt;
}
export function explicitlyUnverified(value:unknown){return object(value)&&typeof value.configured==="boolean"&&value.operational===false&&["protected_setup_missing","fresh_verified_receipt_missing"].includes(String(value.reason));}
