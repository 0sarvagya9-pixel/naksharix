/** An origin is not authentication. Only exact canonical HTTPS origins qualify. */
export function canonicalWidgetOrigin(value:unknown):string|null{
 if(typeof value!=="string"||value.length>253||!value.startsWith("https://"))return null;
 try{const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password||u.pathname!=="/"||u.search||u.hash||u.origin!==value||!u.hostname.includes(".")||u.hostname.endsWith(".")||u.hostname.includes(":"))return null;return u.origin;}catch{return null;}
}
export const WIDGET_GRANT_MAX_AGE_SECONDS=300;
