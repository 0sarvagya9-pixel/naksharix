import Link from "next/link";
import { requireAdminRole } from "@/lib/auth/roles";
import { aggregateAnalytics } from "@/lib/analytics/aggregate";
import { recoveryHealth } from "@/lib/ops/daily-recovery";
import { Section } from "@/components/section";
export const dynamic='force-dynamic';
export default async function OperationsPage() {
  await requireAdminRole();
  const [traffic,recovery]=await Promise.all([aggregateAnalytics(),recoveryHealth()]);
  return <Section><h1 className="text-3xl font-bold text-[#572735]">Operations and traffic</h1>
    <p className="mt-3 text-[#66555b]">Live private operational status. Aggregate pageviews are not unique visitors, revenue or verified fulfilment.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-3">
      <article className="rounded-xl border border-[#dcc1a8] bg-white p-5"><h2 className="font-bold">Encrypted recovery</h2><p className="mt-3">{recovery.operational?'Verified backup and restore are current':'Recovery setup or a fresh verified run is still required'}</p><p className="mt-2 text-sm">Private encrypted storage · seven-day retention · isolated restore.</p></article>
      <article className="rounded-xl border border-[#dcc1a8] bg-white p-5"><h2 className="font-bold">Consented pageviews</h2><p className="my-3 text-3xl font-bold">{traffic.pageviews}</p><p>Last 30 days; no visitor identifiers.</p></article>
      <article className="rounded-xl border border-[#dcc1a8] bg-white p-5"><h2 className="font-bold">Consented interactions</h2><p className="my-3 text-3xl font-bold">{traffic.interactions}</p><p>Public-page events only.</p></article>
    </div>
    <div className="mt-6 flex flex-wrap gap-4"><Link href="/admin/readiness" className="rounded-lg bg-[#76263b] px-4 py-3 text-white">Email tests and readiness</Link><Link href="/admin" className="rounded-lg border border-[#87525c] px-4 py-3">Back to administration</Link></div>
    <div className="mt-8 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left font-bold">Public event counts — UTC days</caption><thead><tr><th className="p-2">Date</th><th className="p-2">Route category</th><th className="p-2">Event</th><th className="p-2">Count</th></tr></thead><tbody>{traffic.rows.map(row=><tr key={row.day+row.event+row.route} className="border-t border-[#ead8c7]"><td className="p-2">{row.day}</td><td className="p-2">{row.route}</td><td className="p-2">{row.event}</td><td className="p-2">{row.count}</td></tr>)}</tbody></table>{!traffic.rows.length?<p className="mt-4">No consented traffic has been recorded. No sample visits are counted as customers.</p>:null}</div>
  </Section>;
}
