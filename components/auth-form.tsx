"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { BriefcaseBusiness, Chrome, UserRound } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";

type Mode = "login" | "signup";
type RoleIntent = "USER" | "ASTROLOGER";
type LoginMode = "USER" | "ASTROLOGER" | "CONSULTANT" | "ADMIN";

function landingPath(effectiveRole?: LoginMode) {
  if (effectiveRole === "ASTROLOGER" || effectiveRole === "CONSULTANT") return "/astrologer/dashboard";
  if (effectiveRole === "ADMIN") return "/admin";
  return "/dashboard";
}

export function AuthForm({ mode, googleEnabled = false, loginMode = "USER", showRoleCards = true }: { mode: Mode; googleEnabled?: boolean; loginMode?: LoginMode; showRoleCards?: boolean }) {
  const router = useRouter();
  const { tr, apiLocale } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [roleIntent, setRoleIntent] = useState<RoleIntent>(loginMode === "ASTROLOGER" || loginMode === "CONSULTANT" ? "ASTROLOGER" : "USER");
  const [professionalRole, setProfessionalRole] = useState<"ASTROLOGER" | "CONSULTANT">("ASTROLOGER");
  const schema = mode === "signup" ? signupSchema : loginSchema;
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema as never) as unknown as Resolver<Record<string, string>>,
    defaultValues: mode === "signup" ? { role: "USER", locale: apiLocale } : { roleIntent: loginMode === "ASTROLOGER" || loginMode === "CONSULTANT" ? "ASTROLOGER" : "USER", loginMode }
  });

  useEffect(() => {
    if (!showRoleCards) {
      chooseRole(loginMode === "ASTROLOGER" || loginMode === "CONSULTANT" ? "ASTROLOGER" : "USER");
      return;
    }
    const saved = window.localStorage.getItem("naksharix-role-intent");
    if (saved === "USER" || saved === "ASTROLOGER") chooseRole(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseRole(next: RoleIntent) {
    setRoleIntent(next);
    window.localStorage.setItem("naksharix-role-intent", next);
    if (mode === "login") form.setValue("roleIntent", next);
    if (mode === "login") form.setValue("loginMode", next === "ASTROLOGER" ? professionalRole : "USER");
    if (mode === "signup") form.setValue("role", next === "USER" ? "USER" : professionalRole);
  }

  function chooseProfessionalRole(next: "ASTROLOGER" | "CONSULTANT") {
    setProfessionalRole(next);
    if (mode === "login" && roleIntent === "ASTROLOGER") form.setValue("loginMode", next);
    if (mode === "signup" && roleIntent === "ASTROLOGER") form.setValue("role", next);
  }

  async function onSubmit(values: Record<string, string>) {
    setError(null);
    const selectedLoginMode: LoginMode = mode === "login"
      ? roleIntent === "ASTROLOGER" ? professionalRole : "USER"
      : loginMode;
    const payload = mode === "signup"
      ? { ...values, role: roleIntent === "USER" ? "USER" : professionalRole }
      : { ...values, roleIntent, loginMode: selectedLoginMode };
    if (process.env.NODE_ENV === "development") {
      console.info("[Naksharix login]", { selectedMode: roleIntent, loginMode: selectedLoginMode });
    }
    const response = await secureFetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Authentication failed");
      return;
    }
    window.localStorage.setItem("naksharix-role-intent", roleIntent);
    if (mode === "login") window.localStorage.setItem("naksharix-login-mode", selectedLoginMode);
    router.push(landingPath(result.data?.user?.effectiveRole));
  }

  function handleGoogleSignIn() {
    const selectedLoginMode: LoginMode = roleIntent === "ASTROLOGER" ? professionalRole : "USER";
    window.localStorage.setItem("naksharix-role-intent", roleIntent);
    window.localStorage.setItem("naksharix-login-mode", selectedLoginMode);
    if (process.env.NODE_ENV === "development") {
      console.info("[Naksharix Google login]", { selectedMode: roleIntent, loginMode: selectedLoginMode });
    }
    signIn("google", { callbackUrl: `/auth/google-complete?role=${selectedLoginMode}` });
  }

  return (
    <div className="space-y-5">
      {showRoleCards ? <RoleCards selected={roleIntent} onSelect={chooseRole} /> : null}
      {mode === "signup" && roleIntent === "ASTROLOGER" ? (
        <div className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4">
          <Label htmlFor="professionalRole">{tr("professionalType")}</Label>
          <select
            id="professionalRole"
            value={professionalRole}
            onChange={(event) => chooseProfessionalRole(event.target.value as "ASTROLOGER" | "CONSULTANT")}
            className="mt-2 h-10 w-full rounded-md border border-[#F5C542]/20 bg-[#12051f] px-3 text-sm"
          >
            <option value="ASTROLOGER">{tr("astrologer")}</option>
            <option value="CONSULTANT">{tr("consultant")}</option>
          </select>
          <p className="mt-2 text-xs leading-5 naksh-muted-text">{tr("pendingApprovalNote")}</p>
        </div>
      ) : null}
      {googleEnabled ? (
        <>
          <Button
            className="w-full"
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="h-4 w-4" />
            {tr("continueWithGoogle")}
          </Button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] naksh-muted-text">
            <span className="h-px flex-1 bg-[#F5C542]/25" />
            {tr("or")}
            <span className="h-px flex-1 bg-[#F5C542]/25" />
          </div>
        </>
      ) : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="name">{tr("name")}</Label>
            <Input id="name" {...form.register("name")} placeholder="Anaya Sharma" />
          </div>
        ) : null}
        <input type="hidden" {...form.register(mode === "signup" ? "role" : "roleIntent")} />
        {mode === "login" ? <input type="hidden" {...form.register("loginMode")} value={roleIntent === "ASTROLOGER" ? professionalRole : "USER"} readOnly /> : null}
        {mode === "signup" ? <input type="hidden" {...form.register("locale")} value={apiLocale} readOnly /> : null}
        <div className="space-y-2">
          <Label htmlFor="email">{tr("email")}</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{tr("password")}</Label>
          <Input id="password" type="password" {...form.register("password")} placeholder={tr("minimumPassword")} />
        </div>
        {error ? <p className="rounded-md bg-[#FF4D4F]/15 p-3 text-sm text-[#FF4D4F]">{error}</p> : null}
        <Button className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? tr("pleaseWait") : mode === "signup" ? roleIntent === "USER" ? tr("createUserAccount") : tr("createProAccount") : tr("login")}
        </Button>
      </form>
    </div>
  );
}

function RoleCards({ selected, onSelect }: { selected: RoleIntent; onSelect: (role: RoleIntent) => void }) {
  const { tr } = useLanguage();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect("USER")}
        className={`group rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-[#FFD36A]/60 hover:bg-[#28143f]/76 ${selected === "USER" ? "border-[#F5C542] bg-[#F5C542]/10" : "border-[#F5C542]/20 bg-[#201037]/70"}`}
      >
        <UserRound className="h-5 w-5 text-[#FFD36A]" />
        <p className="mt-3 font-cinzel font-bold">{tr("loginAsUser")}</p>
        <p className="mt-1 text-xs leading-5 naksh-muted-text">{tr("userRoleCopy")}</p>
      </button>
      <button
        type="button"
        onClick={() => onSelect("ASTROLOGER")}
        className={`group rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-[#FFD36A]/60 hover:bg-[#28143f]/76 ${selected === "ASTROLOGER" ? "border-[#F5C542] bg-[#F5C542]/10" : "border-[#F5C542]/20 bg-[#201037]/70"}`}
      >
        <BriefcaseBusiness className="h-5 w-5 text-[#FFD36A]" />
        <p className="mt-3 font-cinzel font-bold">{tr("loginAsPro")}</p>
        <p className="mt-1 text-xs leading-5 naksh-muted-text">{tr("proRoleCopy")}</p>
      </button>
    </div>
  );
}










