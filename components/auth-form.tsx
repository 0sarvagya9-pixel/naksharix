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
type AuthRole = "USER" | "ASTROLOGER" | "CONSULTANT" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
type RoleIntent = "USER" | "ASTROLOGER";

function landingPath(role?: AuthRole) {
  if (role === "ASTROLOGER" || role === "CONSULTANT") return "/astrologer/dashboard";
  if (role === "ADMIN" || role === "SUPER_ADMIN" || role === "MODERATOR") return "/admin";
  return "/dashboard";
}

export function AuthForm({ mode, googleEnabled = false }: { mode: Mode; googleEnabled?: boolean }) {
  const router = useRouter();
  const { tr, apiLocale } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [roleIntent, setRoleIntent] = useState<RoleIntent>("USER");
  const [professionalRole, setProfessionalRole] = useState<"ASTROLOGER" | "CONSULTANT">("ASTROLOGER");
  const schema = mode === "signup" ? signupSchema : loginSchema;
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema as never) as unknown as Resolver<Record<string, string>>,
    defaultValues: mode === "signup" ? { role: "USER", locale: apiLocale } : { roleIntent: "USER" }
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("naksharix-role-intent");
    if (saved === "USER" || saved === "ASTROLOGER") chooseRole(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseRole(next: RoleIntent) {
    setRoleIntent(next);
    window.localStorage.setItem("naksharix-role-intent", next);
    if (mode === "login") form.setValue("roleIntent", next);
    if (mode === "signup") form.setValue("role", next === "USER" ? "USER" : professionalRole);
  }

  function chooseProfessionalRole(next: "ASTROLOGER" | "CONSULTANT") {
    setProfessionalRole(next);
    if (mode === "signup" && roleIntent === "ASTROLOGER") form.setValue("role", next);
  }

  async function onSubmit(values: Record<string, string>) {
    setError(null);
    const payload = mode === "signup"
      ? { ...values, role: roleIntent === "USER" ? "USER" : professionalRole }
      : { ...values, roleIntent };
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
    router.push(landingPath(result.data?.user?.role));
  }

  return (
    <div className="space-y-5">
      <RoleCards selected={roleIntent} onSelect={chooseRole} />
      {mode === "signup" && roleIntent === "ASTROLOGER" ? (
        <div className="rounded-lg border border-amber-200/15 bg-white/[0.04] p-4">
          <Label htmlFor="professionalRole">{tr("professionalType")}</Label>
          <select
            id="professionalRole"
            value={professionalRole}
            onChange={(event) => chooseProfessionalRole(event.target.value as "ASTROLOGER" | "CONSULTANT")}
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="ASTROLOGER">{tr("astrologer")}</option>
            <option value="CONSULTANT">{tr("consultant")}</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{tr("pendingApprovalNote")}</p>
        </div>
      ) : null}
      {googleEnabled ? (
        <>
          <Button
            className="w-full"
            variant="outline"
            type="button"
            onClick={() => signIn("google", { callbackUrl: `/auth/google-complete?role=${roleIntent === "ASTROLOGER" ? professionalRole : "USER"}` })}
          >
            <Chrome className="h-4 w-4" />
            {tr("continueWithGoogle")}
          </Button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {tr("or")}
            <span className="h-px flex-1 bg-border" />
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
        {mode === "signup" ? <input type="hidden" {...form.register("locale")} value={apiLocale} readOnly /> : null}
        <div className="space-y-2">
          <Label htmlFor="email">{tr("email")}</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{tr("password")}</Label>
          <Input id="password" type="password" {...form.register("password")} placeholder={tr("minimumPassword")} />
        </div>
        {error ? <p className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? tr("pleaseWait") : mode === "signup" ? roleIntent === "USER" ? tr("createUserAccount") : tr("createProAccount") : roleIntent === "USER" ? tr("signInAsUser") : tr("signInAsPro")}
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
        className={`group rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-200/55 hover:bg-white/[0.06] ${selected === "USER" ? "border-amber-200 bg-amber-200/10" : "border-amber-200/15 bg-white/[0.04]"}`}
      >
        <UserRound className="h-5 w-5 text-amber-200" />
        <p className="mt-3 font-cinzel font-bold">{tr("loginAsUser")}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{tr("userRoleCopy")}</p>
      </button>
      <button
        type="button"
        onClick={() => onSelect("ASTROLOGER")}
        className={`group rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-200/55 hover:bg-white/[0.06] ${selected === "ASTROLOGER" ? "border-amber-200 bg-amber-200/10" : "border-amber-200/15 bg-white/[0.04]"}`}
      >
        <BriefcaseBusiness className="h-5 w-5 text-amber-200" />
        <p className="mt-3 font-cinzel font-bold">{tr("loginAsPro")}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{tr("proRoleCopy")}</p>
      </button>
    </div>
  );
}







