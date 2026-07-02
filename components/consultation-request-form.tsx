"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string; consultationType: string; isActive: boolean };
type Props = { astrologerId: string; astrologerName: string; userEmail?: string | null; userName?: string | null; slots: Slot[] };

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function ConsultationRequestForm({ astrologerId, astrologerName, userEmail, userName, slots }: Props) {
  const { requiredMessage, tr } = useLanguage();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedSlot, setSelectedSlot] = useState(slots[0]?.id ?? "");
  const activeSlot = slots.find((slot) => slot.id === selectedSlot) ?? slots[0];

  async function submit(formData: FormData) {
    if (!userEmail) {
      setStatus(tr("loginBeforeBooking"));
      return;
    }
    const requiredFields = ["customerName", "bookingDate", "question"] as const;
    const nextErrors = requiredFields.reduce<FieldErrors>((acc, field) => {
      if (isBlank(formData.get(field))) acc[field] = requiredMessage;
      return acc;
    }, {});
    if (!activeSlot) nextErrors.selectedSlot = tr("selectAvailabilitySlot");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      scrollToFirstError(nextErrors);
      return;
    }
    const date = String(formData.get("bookingDate") ?? "");
    if (!date || !activeSlot) {
      setStatus(tr("selectDateAndSlot"));
      return;
    }

    setStatus(tr("creatingBookingRequest"));
    setLoading(true);

    const response = await secureFetch("/api/consultation-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        astrologerProfileId: astrologerId,
        slotId: selectedSlot,
        bookingDate: date,
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
    if (!response.ok) {
      setLoading(false);
      setStatus(json.error ?? tr("errorGeneric"));
      return;
    }

    const { booking, redirectTo } = json.data;
    if (booking.paymentStatus === "ADMIN_BYPASS" || Number(booking.amount) === 0) {
      setLoading(false);
      router.push(redirectTo);
      return;
    }

    setStatus("Loading payment gateway...");
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setLoading(false);
      setStatus("Payment gateway is temporarily unavailable. Please try again later.");
      return;
    }

    const orderResponse = await secureFetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "CONSULTATION", bookingId: booking.id })
    });
    const orderJson = await orderResponse.json();
    if (!orderResponse.ok) {
      setLoading(false);
      setStatus(orderJson.error ?? "Failed to initiate payment. Please try again.");
      return;
    }

    const { keyId, order, item } = orderJson.data;
    const checkout = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Naksharix",
      description: item.name,
      order_id: order.id,
      theme: { color: "#A6772A" },
      handler: async (paymentResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        setStatus("Verifying payment...");
        const verifyResponse = await secureFetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentResponse)
        });
        setLoading(false);
        if (verifyResponse.ok) {
          setStatus("Payment verified successfully!");
          router.push(redirectTo);
        } else {
          const verifyJson = await verifyResponse.json();
          setStatus(verifyJson.error ?? "Payment verification failed.");
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setStatus("Payment checkout was closed.");
        }
      }
    });
    checkout.open();
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-cinzel">{tr("bookConsultation")} - {astrologerName}</CardTitle>
        <p className="text-sm naksh-muted-text">{tr("consultationConfirmationCopy")}</p>
      </CardHeader>
      <CardContent>
        {!userEmail ? (
          <div className="mb-5 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">
            {tr("loginBeforeBooking")}{" "}
            <Link className="text-[#FFD700] font-bold underline" href={`/login?redirectTo=/consultation/book/${astrologerId}`}>
              {tr("login")}
            </Link>
          </div>
        ) : (
          <p className="mb-5 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">
            {tr("consultationConfirmationEmail")}: {userEmail}
          </p>
        )}
        <form action={submit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={tr("fullName")} error={errors.customerName}>
              <Input
                name="customerName"
                data-field="customerName"
                className={errorClass(Boolean(errors.customerName))}
                onChange={() => setErrors((current) => ({ ...current, customerName: undefined }))}
                defaultValue={userName ?? ""}
              />
            </Field>
            <Field label={tr("phoneOptional")}>
              <Input name="customerPhone" />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={tr("date")} error={errors.bookingDate}>
              <Input
                name="bookingDate"
                data-field="bookingDate"
                className={errorClass(Boolean(errors.bookingDate))}
                onChange={() => setErrors((current) => ({ ...current, bookingDate: undefined }))}
                type="date"
              />
            </Field>
            <Field label={tr("preferredTimeSlot")} error={errors.selectedSlot}>
              <select
                data-field="selectedSlot"
                value={selectedSlot}
                onChange={(event) => {
                  setSelectedSlot(event.target.value);
                  setErrors((current) => ({ ...current, selectedSlot: undefined }));
                }}
                className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.selectedSlot))}`}
              >
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.consultationType} | {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={tr("birthDateOptional")}>
              <Input name="birthDate" type="date" />
            </Field>
            <Field label={tr("birthTimeOptional")}>
              <Input name="birthTime" type="time" />
            </Field>
            <Field label={tr("birthPlaceOptional")}>
              <Input name="birthPlace" placeholder="Delhi, India" />
            </Field>
          </div>
          <Field label={tr("mainQuestionConcern")} error={errors.question}>
            <Textarea
              name="question"
              data-field="question"
              className={errorClass(Boolean(errors.question))}
              onChange={() => setErrors((current) => ({ ...current, question: undefined }))}
              placeholder={tr("consultationQuestionPlaceholder")}
            />
          </Field>
          <Button disabled={loading || !userEmail || !slots.length}>
            <CalendarClock className="h-4 w-4" />
            {loading ? "Processing..." : tr("bookConsultation")}
          </Button>
          {status ? <p className="text-sm naksh-muted-text">{status}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
