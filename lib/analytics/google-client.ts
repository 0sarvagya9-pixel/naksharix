"use client";
import { getCsrfToken, csrfHeaderName } from "@/lib/security/csrf";
import { publicAnalyticsRoute, type AggregateEventName } from "@/lib/analytics/public-routes";
import { classifySource, googleConsentKey, googleSessionKey, type GoogleSession } from "@/lib/analytics/google-contract";

export function googleAnalyticsSession(): GoogleSession | undefined {
  if (typeof window === "undefined") return;
  const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (navigator.doNotTrack === "1" || privacy.globalPrivacyControl) return;
  try {
    if (localStorage.getItem(googleConsentKey) !== "granted") return;
    const now = Date.now();
    const old = JSON.parse(sessionStorage.getItem(googleSessionKey) || "null") as (GoogleSession & {last:number}) | null;
    let session: GoogleSession;
    if (old && Number.isFinite(old.last) && now >= old.last && now - old.last < 30 * 60 * 1000 &&
        /^\d{1,10}\.\d{10}$/.test(old.client_id) && Number.isSafeInteger(old.session_id)) {
      session = {client_id:old.client_id,session_id:old.session_id,source:old.source,medium:old.medium};
    } else {
      const random = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
      const seconds = Math.floor(now / 1000);
      session = {client_id:random+"."+seconds,session_id:seconds,...classifySource(new URLSearchParams(location.search).get("utm_source") || "",document.referrer)};
    }
    sessionStorage.setItem(googleSessionKey,JSON.stringify({...session,last:now}));
    return session;
  } catch { return; }
}
export function trackGooglePublicEvent(event: AggregateEventName) {
  const session = googleAnalyticsSession();
  if (!session || !publicAnalyticsRoute(location.pathname)) return;
  void (async()=>{
    const signal=AbortSignal.timeout(5000);
    const token=await getCsrfToken(signal);
    await fetch("/api/analytics/google",{method:"POST",credentials:"same-origin",signal,
      headers:{"Content-Type":"application/json",[csrfHeaderName]:token},
      body:JSON.stringify({consent:true,event,path:location.pathname,session})});
  })().catch(()=>{});
}
