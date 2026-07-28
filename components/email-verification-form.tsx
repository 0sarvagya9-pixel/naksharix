"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { secureFetch } from "@/lib/security/csrf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function landingPath(role?: string) {
  if (role === "ASTROLOGER" || role === "CONSULTANT") {
    return "/astrologer/dashboard";
  }

  if (role === "ADMIN") return "/admin";
  return "/dashboard";
}

export function EmailVerificationForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const storedEmail = window.sessionStorage.getItem("naksharix-pending-email");
    const deliverySent = window.sessionStorage.getItem("naksharix-otp-delivery-sent");

    if (storedEmail) setEmail(storedEmail);

    if (deliverySent === "true") {
      setMessage("A 6-digit verification code was sent to your email.");
      setCooldown(30);
    } else if (deliverySent === "false") {
      setError("The first verification email could not be delivered. Please use Resend code.");
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
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setVerifying(true);

    try {
      const response = await secureFetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: normalizedEmail,
          code
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Verification failed.");
        return;
      }

      window.sessionStorage.removeItem("naksharix-pending-email");
      window.sessionStorage.removeItem("naksharix-otp-delivery-sent");

      router.push(landingPath(result.data?.user?.effectiveRole));
      router.refresh();
    } catch {
      setError("Verification could not be completed. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address first.");
      return;
    }

    setResending(true);

    try {
      const response = await secureFetch("/api/auth/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: normalizedEmail
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Could not send a verification code.");
        return;
      }

      window.sessionStorage.setItem("naksharix-pending-email", normalizedEmail);
      window.sessionStorage.setItem("naksharix-otp-delivery-sent", "true");

      setMessage(
        "If an unverified account exists for this email, a new 6-digit code has been sent."
      );
      setCooldown(30);
    } catch {
      setError("Verification email could not be sent. Please try again.");
    } finally {
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
          <h1 className="font-cinzel text-xl font-bold">Verify your email</h1>
          <p className="text-sm naksh-muted-text">
            Enter the 6-digit code sent to your email address.
          </p>
        </div>
      </div>

      <form onSubmit={verify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-email">Email</Label>
          <Input
            id="verification-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification code</Label>
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
            required
          />
        </div>

        {message ? (
          <p className="rounded-md border border-[#01A361]/30 bg-[#01A361]/10 p-3 text-sm">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-md bg-[#FF4D4F]/15 p-3 text-sm text-[#FF4D4F]">
            {error}
          </p>
        ) : null}

        <Button className="w-full" type="submit" disabled={verifying}>
          {verifying ? "Verifying..." : "Verify email"}
        </Button>

        <Button
          className="w-full"
          type="button"
          variant="outline"
          disabled={resending || cooldown > 0}
          onClick={resend}
        >
          {resending
            ? "Sending..."
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
        </Button>
      </form>
    </div>
  );
}
