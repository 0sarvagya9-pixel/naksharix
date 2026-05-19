"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string; consultationType: string; isActive: boolean };
type Props = { astrologerId: string; astrologerName: string; userEmail?: string | null; userName?: string | null; slots: Slot[] };

export function ConsultationRequestForm({ astrologerId, astrologerName, userEmail, userName, slots }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(slots[0]?.id ?? "");
  const activeSlot = slots.find((slot) => slot.id === selectedSlot) ?? slots[0];

  async function submit(formData: FormData) {
    if (!userEmail) {
      setStatus("Please login before booking a consultation.");
      return;
    }
    const date = String(formData.get("bookingDate") ?? "");
    if (!date || !activeSlot) {
      setStatus("Please select a date and availability slot.");
      return;
    }
    const scheduledAt = new Date(`${date}T${activeSlot.startTime}:00`);
    setStatus("Creating booking request...");
    const response = await secureFetch("/api/consultation-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        astrologerProfileId: astrologerId,
        mode: activeSlot.consultationType === "CALL" ? "AUDIO" : activeSlot.consultationType,
        scheduledAt,
        durationMins: 30,
        customerName: formData.get("customerName"),
        customerEmail: userEmail,
        customerPhone: formData.get("customerPhone"),
        birthDate: formData.get("birthDate"),
        birthTime: formData.get("birthTime"),
        birthPlace: formData.get("birthPlace"),
        question: formData.get("question")
      })
    });
    const json = await response.json();
    if (response.ok) {
      router.push(json.data.redirectTo);
      return;
    }
    setStatus(json.error ?? "Unable to create booking request.");
  }

  return (
    <Card className="glass">
      <CardHeader><CardTitle className="font-cinzel">Book Consultation with {astrologerName}</CardTitle><p className="text-sm naksh-muted-text">Your request will be sent to the astrologer for confirmation.</p></CardHeader>
      <CardContent>
        {!userEmail ? <div className="mb-5 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">Please login before booking. <a className="text-[#FFD700]" href="/login">Login</a></div> : <p className="mb-5 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">Consultation confirmation will be sent to: {userEmail}</p>}
        <form action={submit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2"><Field label="Full name"><Input name="customerName" required defaultValue={userName ?? ""} /></Field><Field label="Phone optional"><Input name="customerPhone" /></Field></div>
          <div className="grid gap-4 md:grid-cols-2"><Field label="Date"><Input name="bookingDate" type="date" required /></Field><Field label="Preferred time slot"><select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)} className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm">{slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.consultationType} | {slot.startTime} - {slot.endTime}</option>)}</select></Field></div>
          <div className="grid gap-4 md:grid-cols-3"><Field label="Birth date optional"><Input name="birthDate" type="date" /></Field><Field label="Birth time optional"><Input name="birthTime" type="time" /></Field><Field label="Birth place optional"><Input name="birthPlace" placeholder="Delhi, India" /></Field></div>
          <Field label="Main question / concern"><Textarea name="question" required placeholder="Career, relationship, marriage, finance, health..." /></Field>
          <Button disabled={!userEmail || !slots.length}><CalendarClock className="h-4 w-4" />Book Consultation</Button>
          {status ? <p className="text-sm naksh-muted-text">{status}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }