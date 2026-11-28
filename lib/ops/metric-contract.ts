export const opsMetricNames=[
 "ga4_public_accepted","ga4_public_failed_or_unknown","ga4_checkout_accepted","ga4_checkout_failed_or_unknown","ga4_purchase_accepted","ga4_purchase_failed_or_unknown","ga4_session_rejected","request_failure","sentry_accepted","sentry_failed_or_unknown"
] as const;
export type OpsMetric=typeof opsMetricNames[number];
export function isOpsMetric(value:unknown):value is OpsMetric{return typeof value==="string"&&(opsMetricNames as readonly string[]).includes(value);}
export function googleTransportMetric(eventName:string|undefined,accepted:boolean):OpsMetric{
 const kind=eventName==="purchase"?"purchase":eventName==="begin_checkout"?"checkout":"public";
 return ("ga4_"+kind+(accepted?"_accepted":"_failed_or_unknown")) as OpsMetric;
}
