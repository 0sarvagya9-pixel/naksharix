"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { secureFetch } from "@/lib/security/csrf";
import { authNavigationHref, safeInternalAuthPath } from "@/lib/auth/safe-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {useLanguage} from "@/components/language-provider";
import {verificationCopy,type VerificationMessage} from "@/lib/auth/verification-copy";
import {otpRequestAccepted,otpVerificationConfirmed} from "@/lib/auth/otp-response-contract";
import {siteNotice} from "@/lib/ui/site-notification";

function landingPath(role?: string) {
  if (role === "ASTROLOGER" || role === "CONSULTANT") {
    return "/astrologer/dashboard";
  }

  if (role === "ADMIN") return "/admin";
  return "/dashboard";
}

export function EmailVerificationForm() {
  const {locale}=useLanguage();const copy=verificationCopy[locale];
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<VerificationMessage | null>(null);
  const [error, setError] = useState<VerificationMessage | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inFlight=useRef(false);
  const [completed,setCompleted]=useState(false);
  const [returnPath,setReturnPath]=useState<string|null>(null);
  function showError(key:VerificationMessage){setError(key);siteNotice.error(copy[key],copy.title);}


  useEffect(() => {
    const storedEmail = window.sessionStorage.getItem("naksharix-pending-email");
    const deliverySent = window.sessionStorage.getItem("naksharix-otp-delivery-sent");
    setReturnPath(safeInternalAuthPath(window.sessionStorage.getItem("naksharix-verification-return")));

    if (storedEmail) setEmail(storedEmail);

    if (storedEmail && deliverySent === "true") {
      setMessage("sent");
      setCooldown(30);
    } else if (storedEmail && deliverySent === "false") {
      setError("deliveryFailed");
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    if(inFlight.current||completed)return;
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("missingEmail");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("invalidCode");
      return;
    }

    inFlight.current=true;
    setVerifying(true);
    let confirmed=false;

    try {
      const response = await secureFetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: normalizedEmail,
          code
        }),
        silent:true
      });

      const result = await response.json();

      if (!response.ok || !otpVerificationConfirmed(result,normalizedEmail)) {
        showError("verificationFailed");
        return;
      }

      window.sessionStorage.removeItem("naksharix-pending-email");
      window.sessionStorage.removeItem("naksharix-otp-delivery-sent");

      const resume=safeInternalAuthPath(window.sessionStorage.getItem("naksharix-verification-return"));
      window.sessionStorage.removeItem("naksharix-verification-return");
      confirmed=true;
      setCompleted(true);
      // Read the newly issued secure session on a fresh server document.
      window.location.assign(resume??landingPath(result.data?.user?.effectiveRole));
    } catch {
      showError("requestFailed");
    } finally {
      if(!confirmed)inFlight.current=false;
      setVerifying(false);
    }
  }

  async function resend() {
    if(inFlight.current||completed||cooldown>0)return;
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("missingEmail");
      return;
    }

    inFlight.current=true;
    setResending(true);

    try {
      const response = await secureFetch("/api/auth/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: normalizedEmail
        }),
        silent:true
      });

      const result=await response.json();
      if (!response.ok || !otpRequestAccepted(result)) {
        showError("requestFailed");
        return;
      }

      window.sessionStorage.setItem("naksharix-pending-email", normalizedEmail);
      window.sessionStorage.removeItem("naksharix-otp-delivery-sent");

      setMessage(
        "requestAccepted"
      );
      setCooldown(30);
    } catch {
      showError("requestFailed");
    } finally {
      inFlight.current=false;
      setResending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
          <ShieldCheck className="h-5 w-5 text-[#FFD700]" />
        </div>
        <div>
          <h1 className="font-cinzel text-xl font-bold">{copy.title}</h1>
          <p className="text-sm naksh-muted-text">
            {copy.intro}
          </p>
        </div>
      </div>

      <form onSubmit={verify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-email">{copy.email}</Label>
          <Input
            id="verification-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);setCode("");setMessage(null);setError(null);
              window.sessionStorage.removeItem("naksharix-otp-delivery-sent");
            }}
            autoComplete="email"
            disabled={verifying||resending||completed}
            aria-describedby={error?"verification-error":undefined}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification-code">{copy.code}</Label>
          <Input
            id="verification-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            disabled={verifying||resending||completed}
            aria-describedby={error?"verification-error":undefined}
            required
          />
        </div>

        {message ? (
          <p role="status" aria-live="polite" className="rounded-md border border-[#01A361]/30 bg-[#01A361]/10 p-3 text-sm">
            {copy[message]}
          </p>
        ) : null}

        {error ? (
          <p id="verification-error" role="alert" className="rounded-md bg-[#FF4D4F]/15 p-3 text-sm text-[#FF4D4F]">
            {copy[error]}
          </p>
        ) : null}

        <Button className="w-full" type="submit" disabled={verifying||resending||completed}>
          {verifying ? copy.verifying : copy.verify}
        </Button>

        <Button
          className="w-full"
          type="button"
          variant="outline"
          disabled={resending||verifying||completed||cooldown>0}
          onClick={resend}
        >
          {resending
            ? copy.sending
            : cooldown > 0
              ? `${copy.retry} ${cooldown}s`
              : copy.resend}
        </Button>
      </form>
      <p className="text-center text-sm naksh-muted-text">
        {locale==="hi"?"ईमेल सत्यापित हो चुका है?":locale==="hinglish"?"Email verify ho chuka hai?":"Already verified?"}{" "}
        <Link href={authNavigationHref("/login",returnPath)} className="text-[#01A361] underline">{locale==="hi"?"लॉगिन पर लौटें":locale==="hinglish"?"Login par laut jaayein":"Return to login"}</Link>
      </p>
    </div>
  );
}
