"use client";

import { useState } from "react";
import { Download, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";

const statuses = [
  "PENDING_REVIEW",
  "PAYMENT_PENDING",
  "PAID",
  "IN_PROGRESS",
  "NEEDS_INFO",
  "READY_FOR_GENERATION",
  "GENERATED",
  "READY_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED"
] as const;

export function ReportRequestActions({
  requestId,
  initialStatus,
  initialNotes,
  hasPdf
}: {
  requestId: string;
  initialStatus: string;
  initialNotes?: string | null;
  hasPdf: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [adminNotes, setAdminNotes] = useState(initialNotes ?? "");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"save" | "pdf" | null>(null);

  async function save() {
    setLoading("save");
    setMessage(null);
    const response = await secureFetch("/api/admin/report-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: requestId, status, adminNotes, reviewConfirmed })
    });
    setLoading(null);
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setMessage(json?.error ?? "Unable to save report workflow changes.");
      return;
    }
    setMessage("Workflow updated. Approval is recorded in the audit history.");
    setReviewConfirmed(false);
  }

  async function generatePdf() {
    setLoading("pdf");
    setMessage(null);
    const response = await secureFetch(`/api/admin/report-requests/${requestId}/generate-pdf`, { method: "POST" });
    setLoading(null);
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setMessage(json?.error ?? "Unable to generate PDF.");
      return;
    }
    setMessage("PDF generated. Refresh the page to see the stored file metadata.");
  }

  async function deliver() {
    setLoading("pdf");
    setMessage(null);
    const response = await secureFetch(`/api/admin/report-requests/${requestId}/deliver`, { method: "POST" });
    setLoading(null);
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setMessage(json?.error ?? "Email delivery is not configured. The generated PDF remains available for secure download.");
      return;
    }
    const delivery = await response.json().catch(() => null);
    setMessage(delivery?.data?.delivery?.skipped
      ? "Already recorded as sent; no duplicate email attempted."
      : "Email provider accepted the report message; recipient inbox delivery is not independently confirmed.");
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#D4AF37]/20 bg-[#0f1c3a]/70 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-200">
          <span>Workflow status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="cosmic-select">
            {statuses.map((item) => (
              <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
            ))}
          </select>
        </label>
        <div className="space-y-2 text-sm text-slate-200">
          <span>PDF actions</span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={generatePdf} disabled={loading !== null || status !== "READY_FOR_GENERATION"} variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              {loading === "pdf" ? "Generating..." : "Generate PDF"}
            </Button>
            {hasPdf ? (
              <>
                <Button type="button" asChild variant="outline">
                  <a href={`/api/report-requests/${requestId}/download`}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button type="button" onClick={deliver} disabled={loading === "pdf"} variant="outline">
                  Send Email
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {status === "READY_FOR_GENERATION" && initialStatus !== "READY_FOR_GENERATION" ? (
        <label className="flex items-start gap-2 rounded-lg border border-[#D4AF37]/30 p-3 text-sm">
          <input type="checkbox" checked={reviewConfirmed} onChange={event => setReviewConfirmed(event.target.checked)}
            className="mt-1" />
          <span>I have manually examined the submitted birth date, time, place, calculation limitations and report scope. Approval and detailed notes are required before any PDF may be generated.</span>
        </label>
      ) : null}
      <label className="block space-y-2 text-sm text-slate-200">
        <span>Admin notes (at least 30 characters when approving for generation)</span>
        <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={4} className="cosmic-textarea" />
      </label>
      <Button type="button" onClick={save} disabled={loading === "save"}>
        <Save className="mr-2 h-4 w-4" />
        {loading === "save" ? "Saving..." : "Save workflow"}
      </Button>
      {message ? <p role="status" className="rounded-md border border-[#D4AF37]/20 bg-[#020612]/70 p-3 text-sm text-slate-200">{message}</p> : null}
    </div>
  );
}
