"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { BriefcaseBusiness, Chrome, UserRound } from "lucide-react";
import { useForm, type Resolver, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { secureFetch } from "@/lib/security/csrf";
import { siteNotice } from "@/lib/ui/site-notification";
import { useLanguage } from "@/components/language-provider";
import { errorClass, scrollToFirstError } from "@/lib/form-validation";
import { safeInternalAuthPath } from "@/lib/auth/safe-redirect";
import { authFormCopy, authFormErrorKey, authResponseConfirmed, type AuthFormErrorKey } from "@/lib/auth/auth-form-copy";

type Mode = "login" | "signup";
type RoleIntent = "USER" | "ASTROLOGER";
type LoginMode = "USER" | "ASTROLOGER" | "CONSULTANT" | "ADMIN";

function landingPath(effectiveRole?: LoginMode) {
  if (effectiveRole === "ASTROLOGER" || effectiveRole === "CONSULTANT") return "/astrologer/dashboard";
  if (effectiveRole === "ADMIN") return "/admin";
  return "/dashboard";
}

export function AuthForm({ mode, googleEnabled = false, loginMode = "USER", showRoleCards = true, resumePath }: { mode: Mode; googleEnabled?: boolean; loginMode?: LoginMode; showRoleCards?: boolean; resumePath?: string | null }) {
  const router = useRouter();
  const { tr, apiLocale, requiredMessage } = useLanguage();
  const copy = authFormCopy[apiLocale];
  const [error, setError] = useState<AuthFormErrorKey | null>(null);
  function showAuthError(key: AuthFormErrorKey) {
    setError(key);
    siteNotice.error(copy[key], copy.errorTitle);
  }
  const [passwordVisible,setPasswordVisible]=useState(false);
  const [roleIntent, setRoleIntent] = useState<RoleIntent>(loginMode === "ASTROLOGER" || loginMode === "CONSULTANT" ? "ASTROLOGER" : "USER");
  const [professionalRole, setProfessionalRole] = useState<"ASTROLOGER" | "CONSULTANT">(loginMode === "CONSULTANT" ? "CONSULTANT" : "ASTROLOGER");
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
    const explicitRole=new URLSearchParams(window.location.search).get("role");
    if(explicitRole==="professional"){chooseRole("ASTROLOGER");return;}
    if(explicitRole==="user"){chooseRole("USER");return;}
    const saved = window.localStorage.getItem("naksharix-role-intent");
    if (saved === "USER" || saved === "ASTROLOGER") chooseRole(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode === "signup") form.setValue("locale", apiLocale);
  }, [apiLocale, form, mode]);

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
    const params=new URLSearchParams(window.location.search);
    const resume=resumePath===undefined?safeInternalAuthPath(params.get("redirectTo")??params.get("next")):safeInternalAuthPath(resumePath);
    const preserveVerificationDestination=()=>{if(resume)window.sessionStorage.setItem("naksharix-verification-return",resume);else window.sessionStorage.removeItem("naksharix-verification-return");};
    const response = await secureFetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      silent: true
    }).catch(()=>null);
    const result = await response?.json().catch(()=>null);
    if (!response) { showAuthError("connection"); return; }
    if (!result) { showAuthError(authFormErrorKey(response.status, mode, roleIntent === "ASTROLOGER")); return; }
    if (!response.ok) {
      if (
        mode === "login" &&
        result.details?.code === "EMAIL_VERIFICATION_REQUIRED"
      ) {
        window.sessionStorage.setItem("naksharix-pending-email", values.email);
        window.sessionStorage.removeItem("naksharix-otp-delivery-sent");
        preserveVerificationDestination();
        siteNotice.warning(copy.verifyRequired, copy.successTitle);
        router.push("/verify-email");
        return;
      }

      showAuthError(authFormErrorKey(response.status, mode, roleIntent === "ASTROLOGER"));
      return;
    }
    if (!authResponseConfirmed(mode, result)) { showAuthError("failed"); return; }
    window.localStorage.setItem("naksharix-role-intent", roleIntent);
    if (mode === "login") window.localStorage.setItem("naksharix-login-mode", selectedLoginMode);

    if (mode === "signup" && result.data?.verificationRequired) {
      window.sessionStorage.setItem("naksharix-pending-email", values.email);
      window.sessionStorage.setItem(
        "naksharix-otp-delivery-sent",
        result.data?.deliverySent === true ? "true" : "false"
      );
      preserveVerificationDestination();
      siteNotice.success(copy.signupAccepted, copy.successTitle);
      router.push("/verify-email");
      return;
    }

    siteNotice.success(copy.loginAccepted, copy.successTitle);
    const redirectTo=resume;
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.push(landingPath(result.data?.user?.effectiveRole));
    }
  }

  function onInvalid(errors: FieldErrors<Record<string, string>>) {
    const nextErrors = Object.fromEntries(Object.keys(errors).map((key) => [key, requiredMessage]));
    siteNotice.warning(copy.review, copy.reviewTitle);
    scrollToFirstError(nextErrors);
  }

  function fieldError(name: "name" | "email" | "password") {
    if (!form.formState.errors[name]) return undefined;
    if (!form.getValues(name)) return requiredMessage;
    if (name === "password") return mode === "signup" ? copy.signupPassword : copy.loginPassword;
    return copy[name];
  }

  function handleGoogleSignIn() {
    const selectedLoginMode: LoginMode = roleIntent === "ASTROLOGER" ? professionalRole : "USER";
    window.localStorage.setItem("naksharix-role-intent", roleIntent);
    window.localStorage.setItem("naksharix-login-mode", selectedLoginMode);
    if (process.env.NODE_ENV === "development") {
      console.info("[Naksharix Google login]", { selectedMode: roleIntent, loginMode: selectedLoginMode });
    }
    const params=new URLSearchParams(window.location.search);
    const redirectTo=resumePath===undefined?safeInternalAuthPath(params.get("redirectTo")??params.get("next")):safeInternalAuthPath(resumePath);
    const resume = redirectTo ? "&redirectTo=" + encodeURIComponent(redirectTo) : "";
    signIn("google", { callbackUrl: `/auth/google-complete?role=${selectedLoginMode}${resume}` });
  }

  return (
    <div className="space-y-5">
      {showRoleCards ? <RoleCards selected={roleIntent} onSelect={chooseRole} /> : null}
      {roleIntent === "ASTROLOGER" ? (
        <div className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4">
          <Label htmlFor="professionalRole">{tr("professionalType")}</Label>
          <select
            id="professionalRole"
            value={professionalRole}
            onChange={(event) => chooseProfessionalRole(event.target.value as "ASTROLOGER" | "CONSULTANT")}
            className="mt-2 h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm"
          >
            <option value="ASTROLOGER">{tr("astrologer")}</option>
            <option value="CONSULTANT">{tr("consultant")}</option>
          </select>
          {mode === "signup" ? <p className="mt-2 text-xs leading-5 naksh-muted-text">{tr("pendingApprovalNote")}</p> : null}
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
            <span className="h-px flex-1 bg-[#D4AF37]/25" />
            {tr("or")}
            <span className="h-px flex-1 bg-[#D4AF37]/25" />
          </div>
        </>
      ) : null}
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4" noValidate>
        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="name">{tr("name")}</Label>
            <Input id="name" data-field="name" autoComplete="name" className={errorClass(Boolean(fieldError("name")))} {...form.register("name", { onChange: () => form.clearErrors("name") })} placeholder="Anaya Sharma" aria-invalid={Boolean(fieldError("name"))} aria-describedby={fieldError("name")?"auth-name-error":undefined} />
            {fieldError("name") ? <p id="auth-name-error" role="alert" className="text-sm text-destructive">{fieldError("name")}</p> : null}
          </div>
        ) : null}
        <input type="hidden" {...form.register(mode === "signup" ? "role" : "roleIntent")} />
        {mode === "login" ? <input type="hidden" {...form.register("loginMode")} value={roleIntent === "ASTROLOGER" ? professionalRole : "USER"} readOnly /> : null}
        {mode === "signup" ? <input type="hidden" {...form.register("locale")} value={apiLocale} readOnly /> : null}
        <div className="space-y-2">
          <Label htmlFor="email">{tr("email")}</Label>
          <Input id="email" data-field="email" type="email" autoComplete="email" className={errorClass(Boolean(fieldError("email")))} {...form.register("email", { onChange: () => form.clearErrors("email") })} placeholder="you@example.com" aria-invalid={Boolean(fieldError("email"))} aria-describedby={fieldError("email")?"auth-email-error":undefined} />
          {fieldError("email") ? <p id="auth-email-error" role="alert" className="text-sm text-destructive">{fieldError("email")}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{tr("password")}</Label>
          <Input id="password" data-field="password" type={passwordVisible?"text":"password"} autoComplete={mode==="signup"?"new-password":"current-password"} className={errorClass(Boolean(fieldError("password")))} {...form.register("password", { onChange: () => form.clearErrors("password") })} placeholder={mode === "signup" ? tr("minimumPassword") : copy.loginPlaceholder} aria-invalid={Boolean(fieldError("password"))} aria-describedby={fieldError("password")?"auth-password-error":undefined} />
          <button type="button" aria-controls="password" aria-pressed={passwordVisible} className="text-sm font-medium underline" onClick={()=>setPasswordVisible(v=>!v)}>{passwordVisible?(apiLocale==="hi"?"पासवर्ड छिपाएँ":apiLocale==="hinglish"?"Password hide karein":"Hide password"):(apiLocale==="hi"?"पासवर्ड दिखाएँ":apiLocale==="hinglish"?"Password dikhayein":"Show password")}</button>
          {fieldError("password") ? <p id="auth-password-error" role="alert" className="text-sm text-destructive">{fieldError("password")}</p> : null}
        </div>
        {mode==="login"?<Link href="/forgot-password" className="inline-block text-sm font-semibold underline">{apiLocale==="hi"?"पासवर्ड भूल गए?":apiLocale==="hinglish"?"Password bhool gaye?":"Forgot password?"}</Link>:null}
        {error ? <p role="alert" className="rounded-md bg-[#FF4D4F]/15 p-3 text-sm text-[#FF4D4F]">{copy[error]}</p> : null}
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
        aria-pressed={selected==="USER"}
        className={`group rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-[#FFD700]/60 hover:bg-[#024B30]/76 ${selected === "USER" ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#D4AF37]/20 bg-[#061D3C]/70"}`}
      >
        <UserRound className="h-5 w-5 text-[#FFD700]" />
        <p className="mt-3 font-cinzel font-bold">{tr("loginAsUser")}</p>
        <p className="mt-1 text-xs leading-5 naksh-muted-text">{tr("userRoleCopy")}</p>
      </button>
      <button
        type="button"
        onClick={() => onSelect("ASTROLOGER")}
        aria-pressed={selected==="ASTROLOGER"}
        className={`group rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:border-[#FFD700]/60 hover:bg-[#024B30]/76 ${selected === "ASTROLOGER" ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#D4AF37]/20 bg-[#061D3C]/70"}`}
      >
        <BriefcaseBusiness className="h-5 w-5 text-[#FFD700]" />
        <p className="mt-3 font-cinzel font-bold">{tr("loginAsPro")}</p>
        <p className="mt-1 text-xs leading-5 naksh-muted-text">{tr("proRoleCopy")}</p>
      </button>
    </div>
  );
}
