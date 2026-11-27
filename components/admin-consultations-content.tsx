"use client";

import { useRef, useState } from "react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { fulfilmentCopy, fulfilmentDate, fulfilmentFailure, fulfilmentState, type FulfilmentCopyKey } from "@/lib/admin/fulfilment-copy";
import { consultationUpdateRecorded } from "@/lib/admin/fulfilment-contract";

type AdminBooking = {
  id: string;
  mode: string;
  status: string;
  updatedAt: string;
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

export function AdminConsultationsContent({ initialBookings, initialAvailable = true }: { initialBookings: AdminBooking[]; initialAvailable?: boolean }) {
  const {locale}=useLanguage(),copy=fulfilmentCopy(locale);
  const [bookings,setBookings] = useState(initialBookings);
  const [error,setError]=useState<FulfilmentCopyKey|"">(initialAvailable?"":"unavailable"),[notice,setNotice]=useState<FulfilmentCopyKey|"">("");
  const [uncertain,setUncertain]=useState(false);
  const inFlight=useRef(false);
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
    if(inFlight.current||uncertain||!initialAvailable)return;
    const previous=bookings.find(booking=>booking.id===bookingId);
    if(!previous)return;
    inFlight.current=true;
    const form={...forms[bookingId]};
    setBusyId(bookingId);setError("");setNotice("");
    let failure:FulfilmentCopyKey="unconfirmed";
    try {
      const response=await secureFetch("/api/admin/bookings/status",{
        method:"POST",silent:true,headers:{"Content-Type":"application/json"},
        body:JSON.stringify({bookingId,expectedUpdatedAt:previous.updatedAt,...form})
      });
      const result:unknown=await response.json();
      if(!response.ok){failure=fulfilmentFailure(response.status);throw Error('Consultation not acknowledged');}
      if(!consultationUpdateRecorded(result,{id:bookingId,expectedUpdatedAt:previous.updatedAt,...form}))throw Error('Unmatched consultation acknowledgement');
      setBookings(rows=>rows.map(row=>row.id===bookingId?{...row,status:form.status,paymentStatus:form.paymentStatus,updatedAt:result.data.booking.updatedAt,metadata:{...(row.metadata&&typeof row.metadata==='object'?row.metadata:{}),meetingLink:form.meetingLink,adminNote:form.adminNote}}:row));
      setNotice("consultationSaved");
    } catch {setError(failure);setUncertain(true);}
    finally {inFlight.current=false;setBusyId(null);}
  }

  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{copy.admin}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{copy.consultationTitle}</h1>
        <p className="mt-3 max-w-3xl naksh-muted-text">{copy.consultationIntro}</p>

        {error?<p role="alert" className="mt-4 text-[#fda4af]">{copy[error]} {uncertain?copy.refreshPage:""}</p>:null}
        {notice?<p role="status" className="mt-4 text-[#00f5a0]">{copy[notice]}</p>:null}
        <Button type="button" variant="outline" disabled={busyId!==null} onClick={()=>window.location.reload()} className="mt-4">{copy.refresh}</Button>
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
                    {copy.email}: {booking.user.email} | {fulfilmentDate(booking.scheduledAt,locale)}
                  </p>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 text-sm text-slate-300">
                    <p data-saved-consultation-status>{copy.status}: {fulfilmentState(booking.status,locale)}</p>
                    <p><span className="text-[#FFD700] font-semibold">{copy.mode}:</span> {fulfilmentState(booking.mode,locale)} ({booking.durationMins} {copy.mins})</p>
                    <p><span className="text-[#FFD700] font-semibold"> {copy.birth}:</span> {booking.birthName || "-"} | {booking.birthDate ? fulfilmentDate(booking.birthDate,locale,true) : "-"} | {booking.birthTime || "-"} | {booking.birthPlace || "-"}</p>
                    <p><span className="text-[#FFD700] font-semibold"> {copy.question}:</span> &quot;{booking.question}&quot;</p>
                    <p><span className="text-[#FFD700] font-semibold"> {copy.amount}:</span> ₹{booking.amount} ({fulfilmentState(booking.paymentStatus,locale)})</p>
                  </div>

                  <fieldset disabled={busyId!==null||uncertain||!initialAvailable} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">{copy.bookingStatus}</label>
                        <select
                          aria-label={copy.bookingStatus+" — "+booking.id}
                          value={form.status}
                          onChange={(e) => updateForm(booking.id, "status", e.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-2 text-xs text-white"
                        >
                          <option value="PENDING">{fulfilmentState("PENDING",locale)}</option>
                          <option value="REQUESTED">{fulfilmentState("REQUESTED",locale)}</option>
                          <option value="PAYMENT_PENDING">{fulfilmentState("PAYMENT_PENDING",locale)}</option>
                          <option value="ACCEPTED">{fulfilmentState("ACCEPTED",locale)}</option>
                          <option value="CONFIRMED">{fulfilmentState("CONFIRMED",locale)}</option>
                          <option value="REJECTED">{fulfilmentState("REJECTED",locale)}</option>
                          <option value="COMPLETED">{fulfilmentState("COMPLETED",locale)}</option>
                          <option value="CANCELED">{fulfilmentState("CANCELED",locale)}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">{copy.paymentStatus}</label>
                        <select
                          aria-label={copy.paymentStatus+" — "+booking.id}
                          value={form.paymentStatus}
                          onChange={(e) => updateForm(booking.id, "paymentStatus", e.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-2 text-xs text-white"
                        >
                          <option value="PENDING">{fulfilmentState("PENDING",locale)}</option>
                          <option value="PAID">{fulfilmentState("PAID",locale)}</option>
                          <option value="FAILED">{fulfilmentState("FAILED",locale)}</option>
                          <option value="REFUNDED">{fulfilmentState("REFUNDED",locale)}</option>
                          <option value="ADMIN_BYPASS">{fulfilmentState("ADMIN_BYPASS",locale)}</option>
                          <option value="FREE">{fulfilmentState("FREE",locale)}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-semibold">{copy.meeting}</label>
                      <Input
                        type="text"
                        placeholder="https://meet.google.com/..."
                        aria-label={copy.meeting+" — "+booking.id}
                        value={form.meetingLink}
                        onChange={(e) => updateForm(booking.id, "meetingLink", e.target.value)}
                        className="mt-1 h-9 border-[#D4AF37]/20 bg-[#02112C] text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-semibold">{copy.adminNote}</label>
                      <Input
                        type="text"
                        placeholder={copy.adminNote}
                        aria-label={copy.adminNote+" — "+booking.id}
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
                      {busyId === booking.id ? copy.saving : copy.save}
                    </Button>
                  </fieldset>
                </CardContent>
              </Card>
            );
          })}
          {initialAvailable&&!bookings.length ? (
            <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">
              {copy.noConsultations}
            </p>
          ) : null}
        </div>
      </Section>
    </main>
  );
}
