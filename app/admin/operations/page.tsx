import Link from "next/link";
import { requireAdminRole } from "@/lib/auth/roles";
import { aggregateAnalytics } from "@/lib/analytics/aggregate";
import { recoveryHealth } from "@/lib/ops/daily-recovery";
import {businessReadiness} from "@/lib/ops/business-readiness";
import {operationalMetrics} from "@/lib/ops/metrics";
import {googleAnalyticsEnabled} from "@/lib/analytics/google";
import {getMonitoringReadiness} from "@/lib/monitoring/logger";
import { isOwnerRecoveryOperator } from "@/lib/ops/owner-recovery-authorization";
import { ManualEncryptedRecoveryControl } from "@/components/admin/manual-encrypted-recovery-control";
import { Section } from "@/components/section";
export const dynamic='force-dynamic';
export default async function OperationsPage() {
  const admin=await requireAdminRole();
  const ownerAccess=await isOwnerRecoveryOperator(admin);
  const [traffic,recovery,business,transport]=await Promise.all([aggregateAnalytics(),recoveryHealth(),businessReadiness(),operationalMetrics()]);
  const monitoring=getMonitoringReadiness();
  return <Section><h1 className="text-3xl font-bold text-[#572735]">Operations and traffic</h1>
    <p className="mt-3 text-[#66555b]">Live private operational status. Aggregate pageviews are not unique visitors, revenue or verified fulfilment.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-3">
      <article className="rounded-xl border border-[#dcc1a8] bg-white p-5"><h2 className="font-bold">Encrypted recovery</h2><p className="mt-3">{recovery.operational?'Verified backup and restore are current':'Recovery setup or a fresh verified run is still required'}</p><p className="mt-2 text-sm">Private encrypted storage · seven-day retention · isolated restore.</p></article>
      <article className="rounded-xl border border-[#dcc1a8] bg-white p-5"><h2 className="font-bold">Consented pageviews</h2><p className="my-3 text-3xl font-bold">{traffic.pageviews}</p><p>Last 30 days; no visitor identifiers.</p></article>
      <article className="rounded-xl border border-[#dcc1a8] bg-white p-5"><h2 className="font-bold">Consented interactions</h2><p className="my-3 text-3xl font-bold">{traffic.interactions}</p><p>Public-page events only.</p></article>
    </div>
    <section className="mt-8 rounded-xl border border-[#dcc1a8] bg-white p-5" aria-labelledby="business-reconciliation"><h2 id="business-reconciliation" className="text-xl font-bold">Customer journey and reconciliation</h2><p className="mt-2 text-sm">Live read-only aggregates from the database. A PAID record is not independent bank settlement evidence. Review discrepancies through the authorized admin workflows; do not automatically approve a practitioner, retry a payment or send marketing email.</p>{business.available?<dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[
      ["Customer accounts",business.counts.customers],
      ["Non-admin unverified email accounts",business.counts.unverifiedCustomers],
      ["Pending report payments",business.counts.pendingReportOrders],
      ["Pending report payments over 24h",business.counts.oldPendingReportOrders],
      ["Captured-reference report records without request",business.counts.paidReportsAwaitingRequest],
      ["PAID Puja records missing verified partner/schedule",business.counts.paidPujaWithoutReadyPartner],
      ["Open Puja requests missing assignment/time",business.counts.openPujaWithoutSchedule],
      ["Approved astrologer profiles",business.counts.approvedAstrologers],
      ["Astrologer applications pending review",business.counts.pendingAstrologers],
      ["Confirmed unpaid shop orders",business.counts.unpaidConfirmedShopOrders]
    ].map(([name,count])=><div key={name} className="rounded-lg border border-[#ead8c7] p-3"><dt className="text-sm">{name}</dt><dd className="mt-1 text-2xl font-bold tabular-nums">{count}</dd></div>)}</dl>:<p role="status" className="mt-4 text-sm">Database reconciliation data is unavailable; counts have not been substituted with zero.</p>}<div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold"><Link href="/admin/revenue" className="underline">Payment review</Link><Link href="/admin/puja-bookings" className="underline">Puja requests</Link><Link href="/admin/astrologers" className="underline">Practitioner review</Link><Link href="/admin/shop-orders" className="underline">Shop orders</Link></div></section>
    <section className="mt-8 rounded-xl border border-[#dcc1a8] bg-white p-5" aria-labelledby="ops-transport"><h2 id="ops-transport" className="text-xl font-bold">Operational transport evidence</h2><p className="mt-2 text-sm">Last 7 days of privacy-minimized operational counters after this release. Transport acceptance is not GA4 report ingestion, email delivery, external error alert acknowledgement, traffic, sales or settlement.</p><p className="mt-3 text-sm">GA4 transport: {googleAnalyticsEnabled()?"configured":"not enabled"} · External error transport: {monitoring.sentryTransportConfigured?"configured":"not configured"}</p>{transport.available?(transport.hasEvidence?<dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[
      ["GA4 public accepted",transport.counts.ga4_public_accepted],["GA4 public failed / unknown",transport.counts.ga4_public_failed_or_unknown],["GA4 checkout accepted",transport.counts.ga4_checkout_accepted],["GA4 checkout failed / unknown",transport.counts.ga4_checkout_failed_or_unknown],["GA4 purchase accepted",transport.counts.ga4_purchase_accepted],["GA4 purchase failed / unknown",transport.counts.ga4_purchase_failed_or_unknown],["Invalid or expired analytics sessions",transport.counts.ga4_session_rejected],["Framework request failures",transport.counts.request_failure],["External error transport accepted",transport.counts.sentry_accepted],["External error transport failed / unknown",transport.counts.sentry_failed_or_unknown]
    ].map(([label,count])=><div key={label} className="rounded-lg border border-[#ead8c7] p-3"><dt className="text-sm">{label}</dt><dd className="mt-1 font-bold tabular-nums">{count}</dd></div>)}</dl>:<p className="mt-4 text-sm" role="status">No operational receipts recorded in this window. This is not evidence of zero errors.</p>):<p className="mt-4 text-sm" role="status">Operational metrics unavailable; no substitute values shown.</p>}</section>
    {ownerAccess ? <ManualEncryptedRecoveryControl configured={recovery.configured===true} verified={recovery.operational===true} lastSuccessfulAt={recovery.operational && "lastSuccessfulAt" in recovery ? recovery.lastSuccessfulAt : undefined} /> : null}
    <div className="mt-6 flex flex-wrap gap-4">{process.env.DEFERRED_SERVICE_OPERATIONS_ENABLED==="true"?<Link href="/admin/deferred-services" className="rounded-lg border px-4 py-3">Deferred service planning</Link>:null}<Link href="/admin/readiness" className="rounded-lg bg-[#76263b] px-4 py-3 text-white">Email tests and readiness</Link><Link href="/admin" className="rounded-lg border border-[#87525c] px-4 py-3">Back to administration</Link></div>
    <div className="mt-8 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left font-bold">Public event counts — UTC days</caption><thead><tr><th className="p-2">Date</th><th className="p-2">Route category</th><th className="p-2">Event</th><th className="p-2">Count</th></tr></thead><tbody>{traffic.rows.map(row=><tr key={row.day+row.event+row.route} className="border-t border-[#ead8c7]"><td className="p-2">{row.day}</td><td className="p-2">{row.route}</td><td className="p-2">{row.event}</td><td className="p-2">{row.count}</td></tr>)}</tbody></table>{!traffic.rows.length?<p className="mt-4">No consented traffic has been recorded. No sample visits are counted as customers.</p>:null}</div>
  </Section>;
}
