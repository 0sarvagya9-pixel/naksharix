"use client";

import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";

export function AdminLoginForm() {
  const router = useRouter();
  const { tr } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard"
    });
    setLoading(false);
    if (!result || result.error) {
      setError(tr("invalidAdminCredentials"));
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-[#D4AF37]/25 bg-gradient-to-br from-amber-200/10 via-white/[0.04] to-primary/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#FFD700]">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-cinzel text-lg font-bold text-[#FFFFFF]">{tr("adminLogin")}</h2>
          <p className="text-xs naksh-muted-text">{tr("unlimitedAdminCredits")}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">{tr("email")}</Label>
          <Input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">{tr("password")}</Label>
          <Input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </div>
        {error ? <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? tr("pleaseWait") : tr("loginAsAdmin")}
        </Button>
      </div>
    </form>
  );
}


