import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminRole } from "@/lib/auth/roles";
import { getPujaLaunchState } from "@/lib/puja/launch-readiness";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Puja Launch Readiness | Naksharix Admin",
  robots: {index:false,follow:false}
};
export default async function PujaLaunchReadinessPage() {
  await requireAdminRole();
  const state = await getPujaLaunchState(true);
  return <main className="min-h-[80vh] bg-[#fffaf4] px-5 py-12 text-[#412934]">
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="rounded-3xl border border-[#e2c69e] bg-white p-7">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#865146]">Naksharix · Internal operations</p>
        <h1 className="mt-3 font-cinzel text-3xl font-bold">Puja Launch Readiness</h1>
        <p role="status" className="mt-4 rounded-xl border border-[#d4b38f] bg-[#fff5e7] p-4 font-bold">
          {state.enabled ? "Release gates satisfied — individual Pandit/date acceptance still required per booking."
            : "COMING SOON — new bookings and payments remain closed."}
        </p>
        <p className="mt-4 text-sm leading-7 text-[#6c565d]">
          The booking feature is OFF by default. Published rates and a reviewed Pandit registry do
          not establish actual availability, customer consent, financial settlement or ceremony fulfilment.
          Do not turn on the flag until genuine partner agreements, schedules, logistics and payment/refund
          acceptance tests are independently reviewed.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[#e2c69e] bg-white p-6">
          <h2 className="text-xl font-bold">Verified partner registry</h2>
          <p className="mt-3 text-3xl font-bold">{state.approvedPartnerCount}</p>
          <p className="mt-2 text-sm">Admin-reviewed partners with evidence, not necessarily available on a particular date.</p>
          <Link href="/admin/puja-partners" className="mt-4 inline-block font-bold text-[#7b3245] underline">Review Pandits and exact Puja capability</Link>
        </section>
        <section className="rounded-2xl border border-[#e2c69e] bg-white p-6">
          <h2 className="text-xl font-bold">Topic-specific ready offers</h2>
          <p className="mt-3 text-3xl font-bold">{state.readyServiceCount}</p>
          <p className="mt-2 text-sm">Only approved ₹1,100 offerings with a partner explicitly verified for that Puja ID.</p>
          <Link href="/admin/puja-offerings" className="mt-4 inline-block font-bold text-[#7b3245] underline">Review rates, scope and availability</Link>
        </section>
      </div>
      <section className="rounded-2xl border border-[#e2c69e] bg-white p-7">
        <h2 className="font-cinzel text-xl font-bold">Activation blockers</h2>
        {state.reasons.length ? <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7">
          {state.reasons.map(reason => <li key={reason}>{reason}</li>)}
        </ul> : <p className="mt-3 text-sm">All software launch prerequisites passed. Operator still needs to certify real-world fulfilment and customer acceptance.</p>}
        <h3 className="mt-8 text-lg font-bold">Required operational acceptance</h3>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-7">
          <li>Verify Pandit identity, contact details, exact Puja proficiency, place/online mode, samagri and agreed payout.</li>
          <li>Get written acceptance for a sample date, real cancellation/refund policy and evidence-sharing consent.</li>
          <li>Test customer request email, owner alert and status email to real inboxes. Provider acceptance is not inbox receipt.</li>
          <li>Rehearse REQUESTED → CONFIRMED → SCHEDULED → verified payment → IN_PROGRESS → COMPLETED, including refund and failure cases.</li>
          <li>Only then set PUJA_BOOKINGS_ENABLED=true in the controlled production environment and independently re-check the live domain.</li>
        </ol>
      </section>
      <nav aria-label="Puja admin workspaces" className="flex flex-wrap gap-4 text-sm font-bold text-[#7b3245]">
        <Link className="underline" href="/admin/puja-bookings">Puja booking queue</Link>
        <Link className="underline" href="/admin/readiness">System readiness</Link>
        <Link className="underline" href="/pujas">Public Coming Soon page</Link>
      </nav>
    </div>
  </main>;
}
