"use client";

import { cloneElement, useId, useRef, useState } from "react";
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
import {consultationBookingCopy,consultationBookingError,type ConsultationBookingMessage} from "@/lib/consultations/booking-copy";
import {readCheckoutOrderAck,isVerifiedPaymentAck} from "@/lib/payments/client-checkout-contract";

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string; consultationType: string; isActive: boolean };
type Props = { astrologerId: string; astrologerName: string; userEmail?: string | null; userName?: string | null; slots: Slot[]; sessionPrice: number | null };

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

export function ConsultationRequestForm({ astrologerId, astrologerName, userEmail, userName, slots, sessionPrice }: Props) {
  const { requiredMessage, tr, locale } = useLanguage();
  const copy=consultationBookingCopy[locale];
  const router = useRouter();
  const [status, setStatus] = useState<ConsultationBookingMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const busy=useRef(false),reviewRequired=useRef(false);
  const [needsReview,setNeedsReview]=useState(false),[bookingHref,setBookingHref]=useState<string|null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedSlot, setSelectedSlot] = useState(slots[0]?.id ?? "");
  const activeSlot = slots.find((slot) => slot.id === selectedSlot) ?? slots[0];

  function finish(){busy.current=false;setLoading(false);}
  function hold(message:ConsultationBookingMessage){reviewRequired.current=true;setNeedsReview(true);setStatus(message);finish();}

  async function submit(formData: FormData) {
    if(busy.current||reviewRequired.current)return;
    if (!userEmail) {
      setStatus("signIn");
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
      setStatus("invalidSlot");
      return;
    }

    if (sessionPrice === null||!Number.isFinite(sessionPrice)||sessionPrice<=0) { setStatus("notPriced"); return; }
    busy.current=true;
    setStatus("creating");
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
      }),silent:true
    }).catch(() => null);
    if (!response) {
      hold("connection");
      return;
    }

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      const message=consultationBookingError(json?.error,response.status);
      if(response.status>=500)hold(message);else{finish();setStatus(message);}
      return;
    }

    const booking=json?.data?.booking;
    const redirectTo=typeof booking?.id==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(booking.id)?`/consultation/success/${booking.id}`:null;
    if (!redirectTo||json?.data?.redirectTo!==redirectTo) {
      hold("incomplete");
      return;
    }
    setBookingHref(redirectTo);
    // A booking now exists. All recovery continues through that saved booking;
    // this form must not create another reservation after an uncertain payment.
    reviewRequired.current=true;setNeedsReview(true);
    if (booking.paymentStatus === "ADMIN_BYPASS" && ["string","number"].includes(typeof booking.amount) && Number(booking.amount) === 0) {
      finish();
      router.push(redirectTo);
      return;
    }
    const expectedPaise=Math.round(sessionPrice*100);
    if(booking.paymentStatus!=="PENDING"||!["string","number"].includes(typeof booking.amount)||!Number.isFinite(Number(booking.amount))||Math.round(Number(booking.amount)*100)!==expectedPaise){hold("incomplete");return;}

    setStatus("gatewayLoading");
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      hold("gatewayUnavailable");
      return;
    }

    const orderResponse = await secureFetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "CONSULTATION", bookingId: booking.id }),silent:true
    }).catch(() => null);
    if (!orderResponse) {
      hold("paymentPending");
      return;
    }
    const orderJson = await orderResponse.json().catch(() => ({}));
    if (!orderResponse.ok) {
      hold(orderResponse.status>=500||orderResponse.status===409?"paymentPending":"paymentStartFailed");
      return;
    }

    const acknowledgement=readCheckoutOrderAck(orderJson,expectedPaise);
    if(!acknowledgement){hold("paymentPending");return;}
    const { keyId, order, item, paymentId } = acknowledgement;
    let verificationStarted=false;
    try{
    const checkout = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Naksharix",
      description: item.name,
      order_id: order.id,
      theme: { color: "#A6772A" },
      handler: async (paymentResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        if(verificationStarted)return;
        verificationStarted=true;
        setStatus("verifying");
        if(paymentResponse?.razorpay_order_id!==order.id||typeof paymentResponse.razorpay_payment_id!=="string"||!paymentResponse.razorpay_payment_id.startsWith("pay_")||typeof paymentResponse.razorpay_signature!=="string"||!paymentResponse.razorpay_signature){hold("paymentPending");return;}
        const verifyResponse = await secureFetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentResponse),silent:true
        }).catch(() => null);
        const verifyJson=await verifyResponse?.json().catch(()=>null);
        finish();
        if (verifyResponse?.ok&&isVerifiedPaymentAck(verifyJson,{id:paymentId,orderId:order.id,providerPaymentId:paymentResponse.razorpay_payment_id,purpose:"CONSULTATION",amountPaise:order.amount})) {
          setStatus("verified");
          router.push(redirectTo);
        } else {
          hold("paymentPending");
        }
      },
      modal: {
        ondismiss: () => {
          if(!verificationStarted)hold("closed");
        }
      }
    });
    checkout.open();
    }catch{hold("paymentPending");}
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-cinzel">{tr("bookConsultation")} - {astrologerName}</CardTitle>
        <p className="text-sm naksh-muted-text">{tr("consultationConfirmationCopy")}</p>
        <p className="text-sm font-semibold">{copy.sessionTotal}: {sessionPrice === null ? copy.unavailablePrice : new Intl.NumberFormat(locale==="hi"?"hi-IN":"en-IN",{style:"currency",currency:"INR"}).format(sessionPrice)}. {copy.checkoutProvider}</p>
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
        <form onSubmit={event=>{event.preventDefault();void submit(new FormData(event.currentTarget));}} aria-busy={loading} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={tr("fullName")} error={errors.customerName} required>
              <Input
                name="customerName"
                minLength={2}
                maxLength={80}
                data-field="customerName"
                className={errorClass(Boolean(errors.customerName))}
                onChange={() => setErrors((current) => ({ ...current, customerName: undefined }))}
                defaultValue={userName ?? ""}
              />
            </Field>
            <Field label={tr("phoneOptional")}>
              <Input name="customerPhone" maxLength={30} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={tr("date")} error={errors.bookingDate} required>
              <Input
                name="bookingDate"
                data-field="bookingDate"
                className={errorClass(Boolean(errors.bookingDate))}
                onChange={() => setErrors((current) => ({ ...current, bookingDate: undefined }))}
                type="date"
              />
            </Field>
            <Field label={`${tr("preferredTimeSlot")} (IST / UTC+05:30)`} error={errors.selectedSlot} required>
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
                    {slot.consultationType==="CHAT"?copy.chat:slot.consultationType==="CALL"||slot.consultationType==="AUDIO"?copy.call:slot.consultationType==="VIDEO"?copy.video:slot.consultationType} | {slot.startTime} - {slot.endTime}
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
              <Input name="birthPlace" maxLength={160} placeholder={copy.birthPlaceExample} />
            </Field>
          </div>
          <Field label={tr("mainQuestionConcern")} error={errors.question} required>
            <Textarea
              name="question"
              minLength={5}
              maxLength={800}
              data-field="question"
              className={errorClass(Boolean(errors.question))}
              onChange={() => setErrors((current) => ({ ...current, question: undefined }))}
              placeholder={tr("consultationQuestionPlaceholder")}
            />
          </Field>
          <Button type="submit" disabled={loading || needsReview || !userEmail || !slots.length || sessionPrice === null}>
            <CalendarClock className="h-4 w-4" />
            {loading ? copy.processing : tr("bookConsultation")}
          </Button>
          {status ? <p role="status" aria-live="polite" aria-atomic="true" className="text-sm naksh-muted-text">{copy[status]}</p> : null}
          {needsReview?<div className="flex flex-wrap gap-3 text-sm"><Link href={bookingHref??"/dashboard/bookings"} className="underline">{bookingHref?copy.reviewBooking:copy.reviewBookings}</Link><Link href="/dashboard" className="underline">{copy.reviewHistory}</Link></div>:null}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?:boolean; children: React.ReactElement<{id?:string;required?:boolean;"aria-invalid"?:boolean;"aria-describedby"?:string}> }) {
  const generatedId=useId(),id=children.props.id??generatedId;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children,{id,required:required??children.props.required,"aria-invalid":Boolean(error),"aria-describedby":[children.props["aria-describedby"],error?id+"-error":undefined].filter(Boolean).join(" ")||undefined})}
      {error ? <p id={id+"-error"} role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
