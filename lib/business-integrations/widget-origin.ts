/** An origin is not authentication. Only exact canonical HTTPS origins qualify. */
export function canonicalWidgetOrigin(value:unknown):string|null{
 if(typeof value!=="string"||value.length>253||!value.startsWith("https://"))return null;
 try{const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password||u.pathname!=="/"||u.search||u.hash||u.origin!==value||!u.hostname.includes(".")||u.hostname.split(".").some(label=>!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)))return null;return u.origin;}catch{return null;}
}
export const WIDGET_GRANT_MAX_AGE_SECONDS=300;
