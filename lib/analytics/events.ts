import { secureFetch } from "@/lib/security/csrf";
import { analyticsConsentKey, analyticsEventNames, publicAnalyticsRoute, type AggregateEventName } from "@/lib/analytics/public-routes";
export type AnalyticsEventName = AggregateEventName;
type AnalyticsMetadata = Record<string,string|number|boolean|undefined>;
/** No arbitrary metadata, query strings, identities or birth data leave the browser. */
export function trackNaksharixEvent(eventName:AnalyticsEventName,_metadata:AnalyticsMetadata={}) {
  if(typeof window==='undefined'||!analyticsEventNames.includes(eventName))return;
  const privacy=navigator as Navigator & {globalPrivacyControl?:boolean};
  if(navigator.doNotTrack==='1'||privacy.globalPrivacyControl)return;
  try {if(localStorage.getItem(analyticsConsentKey)!=='granted')return;}catch{return;}
  const path=publicAnalyticsRoute(window.location.pathname);if(!path)return;
  // Use the original public pathname only for server normalization; never search/hash or referrer.
  void secureFetch('/api/analytics/aggregate',{method:'POST',headers:{'Content-Type':'application/json'},
    signal:AbortSignal.timeout(6000),body:JSON.stringify({consent:true,event:eventName,path:window.location.pathname})}).catch(()=>{});
}
