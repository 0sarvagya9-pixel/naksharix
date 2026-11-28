import {WEB_PUSH_CONSENT_VERSION} from "@/lib/notifications/push-contract";
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==="object"&&!Array.isArray(value);
export type PushReadiness={ready:boolean;publicKey:string|null;registeredDevices:number;schemaReady:boolean;consentVersion:typeof WEB_PUSH_CONSENT_VERSION};
export function readPushReadiness(value:unknown):PushReadiness|null{
 if(!object(value)||typeof value.ready!=="boolean"||typeof value.schemaReady!=="boolean"||!Number.isInteger(value.registeredDevices)||Number(value.registeredDevices)<0||Number(value.registeredDevices)>5||value.consentVersion!==WEB_PUSH_CONSENT_VERSION)return null;
 if(value.ready?value.schemaReady!==true||typeof value.publicKey!=="string"||!/^[-_A-Za-z0-9]{87}$/.test(value.publicKey):value.publicKey!==null)return null;
 if(!value.schemaReady&&value.registeredDevices!==0)return null;
 return value as PushReadiness;
}
export function revokedPushReceipt(value:unknown,all=false){return object(value)&&value.revoked===true&&Number.isInteger(value.registeredDevices)&&Number(value.registeredDevices)>=0&&Number(value.registeredDevices)<=5&&(!all||value.registeredDevices===0);}
