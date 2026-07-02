"use client";

import { useState } from "react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";

type AdminBooking = {
  id: string;
  mode: string;
  status: string;
  scheduledAt: string;
  durationMins: number;
  birthName: string | null;
  birthDate: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  question: string;
  paymentStatus: string;
  amount: number;
  metadata: unknown;
  user: { name: string; email: string };
  astrologerProfile: { displayName: string };
};

export function AdminConsultationsContent({ initialBookings }: { initialBookings: AdminBooking[] }) {
  const [bookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, { status: string; paymentStatus: string; meetingLink: string; adminNote: string }>>(
    Object.fromEntries(
      initialBookings.map((b) => {
        const metadata = b.metadata && typeof b.metadata === "object" ? b.metadata as Record<string, unknown> : {};
        return [
          b.id,
          {
            status: b.status,
            paymentStatus: b.paymentStatus,
            meetingLink: String(metadata.meetingLink || ""),
            adminNote: String(metadata.adminNote || "")
          }
        ];
      })
    )
  );

  function updateForm(bookingId: string, key: string, value: string) {
    setForms((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [key]: value
      }
    }));
  }

  async function save(bookingId: string) {
    setBusyId(bookingId);
    const form = forms[bookingId];
    const response = await secureFetch("/api/admin/bookings/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        status: form.status,
        paymentStatus: form.paymentStatus,
        meetingLink: form.meetingLink,
        adminNote: form.adminNote
      })
    });
    setBusyId(null);
    if (response.ok) {
      alert("Booking updated successfully!");
    } else {
      const json = await response.json();
      alert(json.error ?? "Failed to update booking.");
    }
  }

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Admin Dashboard</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">Manage Consultations</h1>
        <p className="mt-3 max-w-3xl naksh-muted-text">Review schedules, allocate virtual rooms, and audit transaction profiles.</p>

        <div className="mt-8 grid gap-4">
          {bookings.map((booking) => {
            const form = forms[booking.id];
            return (
              <Card key={booking.id} className="glass">
                <CardHeader>
                  <CardTitle className="font-cinzel text-lg text-white">
                    {booking.user.name} ↔ {booking.astrologerProfile.displayName}
                  </CardTitle>
                  <p className="text-xs naksh-muted-text">
                    Email: {booking.user.email} | {new Date(booking.scheduledAt).toLocaleString("en-IN")}
                  </p>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-sm text-slate-300">
                    <p><span className="text-[#FFD700] font-semibold">Mode:</span> {booking.mode} ({booking.durationMins} mins)</p>
                    <p><span className="text-[#FFD700] font-semibold">Birth Details:</span> {booking.birthName || "-"} | {booking.birthDate ? new Date(booking.birthDate).toLocaleDateString("en-IN") : "-"} | {booking.birthTime || "-"} | {booking.birthPlace || "-"}</p>
                    <p><span className="text-[#FFD700] font-semibold">Question:</span> &quot;{booking.question}&quot;</p>
                    <p><span className="text-[#FFD700] font-semibold">Amount:</span> ₹{booking.amount} ({booking.paymentStatus})</p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Booking Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => updateForm(booking.id, "status", e.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-2 text-xs text-white"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="REQUESTED">REQUESTED</option>
                          <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELED">CANCELED</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Payment Status</label>
                        <select
                          value={form.paymentStatus}
                          onChange={(e) => updateForm(booking.id, "paymentStatus", e.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-2 text-xs text-white"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="FAILED">FAILED</option>
                          <option value="REFUNDED">REFUNDED</option>
                          <option value="ADMIN_BYPASS">ADMIN_BYPASS</option>
                          <option value="FREE">FREE</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-semibold">Meeting Link (Zoom / Google Meet)</label>
                      <Input
                        type="text"
                        placeholder="https://meet.google.com/..."
                        value={form.meetingLink}
                        onChange={(e) => updateForm(booking.id, "meetingLink", e.target.value)}
                        className="mt-1 h-9 border-[#D4AF37]/20 bg-[#02112C] text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-semibold">Admin Note</label>
                      <Input
                        type="text"
                        placeholder="Add private note..."
                        value={form.adminNote}
                        onChange={(e) => updateForm(booking.id, "adminNote", e.target.value)}
                        className="mt-1 h-9 border-[#D4AF37]/20 bg-[#02112C] text-xs text-white"
                      />
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-[#009b72] text-white hover:bg-[#008766] border-none"
                      onClick={() => save(booking.id)}
                      disabled={busyId === booking.id}
                    >
                      {busyId === booking.id ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!bookings.length ? (
            <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">
              No bookings placed yet.
            </p>
          ) : null}
        </div>
      </Section>
    </main>
  );
}
