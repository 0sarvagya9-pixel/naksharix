/** Only generic account-update signals; no user data or message payload is sent. */
export const WEB_PUSH_CONSENT_VERSION="account-update-push-v1";
export function allowedPushEndpoint(value:unknown):string|null{
 if(typeof value!=="string"||value.length>2048||/[\s\u0000-\u001f\u007f]/.test(value))return null;
 try{
 const u=new URL(value);
 if(u.protocol!=="https:"||u.username||u.password||u.port||u.hash||u.search)return null;
 const host=u.hostname;
 if(host==="fcm.googleapis.com"&&/^\/(?:fcm\/send|wp)\/[A-Za-z0-9_:%.-]+$/.test(u.pathname))return u.href;
 if((host==="updates.push.services.mozilla.com"||host==="push.services.mozilla.com")&&/^\/wpush\/v[12]\/[A-Za-z0-9_-]+$/.test(u.pathname))return u.href;
 // Apple documents HTTPS *.push.apple.com for its Web Push service.
 if(/^(?:[a-z0-9-]+\.)+push\.apple\.com$/.test(host)&&/^\/[A-Za-z0-9_:%./-]+$/.test(u.pathname)&&u.pathname.length>8)return u.href;
 return null;
 }catch{return null;}
}
export function validPushEvent(kind:string,reference:string,status:string){
 return ["report","puja","shop"].includes(kind)&&/^[a-zA-Z0-9_-]{1,150}$/.test(reference)&&/^[A-Z_]{1,50}$/.test(status);
}
export function pushOutcome(status:number){
 return status>=200&&status<300?"provider_accepted":status===404||status===410?"expired":"failed_or_unknown";
}
