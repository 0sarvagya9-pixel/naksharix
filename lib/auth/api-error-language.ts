import { ZodError } from "zod";
import { fail as apiFail, handleApiError as handleCommonError } from "@/lib/api";
import { normalizeLocale } from "@/lib/i18n";
import { authFormCopy } from "@/lib/auth/auth-form-copy";
import { passwordRecoveryCopy } from "@/lib/auth/password-recovery-copy";
import { verificationCopy } from "@/lib/auth/verification-copy";

export function authErrorResponses(request: Request) {
  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)naksharix-language=([^;]*)/);
  const locale = normalizeLocale(cookie?.[1]);
  const auth = authFormCopy[locale], recovery = passwordRecoveryCopy[locale], otp = verificationCopy[locale];
  const messages = {
    "Too many login attempts. Please try again soon.": auth.rate,
    "Invalid email or password": auth.credentials,
    "Email verification required": auth.verifyRequired,
    "This email is not registered as an astrologer/consultant account.": auth.role,
    "This email is registered as a user account. Continue as User or apply as an astrologer/consultant.": auth.role,
    "Credentials changed. Sign in again.": locale === "hi" ? "खाते की जानकारी बदल गई है। दोबारा साइन इन करें।" : "Account details badal gayi hain. Dobara sign in karein.",
    "Too many signup attempts. Please try again later.": auth.rate,
    "Email is already registered": auth.existing,
    "Too many verification-code requests. Please try again later.": auth.rate,
    "Please wait before requesting another verification code.": locale === "hi" ? "दूसरा सत्यापन कोड माँगने से पहले थोड़ी देर प्रतीक्षा करें।" : "Doosra verification code maangne se pehle thoda intezaar karein.",
    "Verification email delivery is temporarily unavailable.": locale === "hi" ? "सत्यापन ईमेल अभी नहीं भेजा जा सका। बाद में फिर प्रयास करें।" : "Verification email abhi nahi bheja ja saka. Baad mein dobara try karein.",
    "Too many verification attempts. Please try again later.": auth.rate,
    "Too many verification attempts. Please request a new code later.": auth.rate,
    "Invalid or expired verification code.": otp.verificationFailed,
    "Too many reset requests. Try again later.": recovery.rate,
    "Password reset email is temporarily unavailable.": recovery.unavailable,
    "Too many attempts. Try again later.": recovery.rate,
    "This reset link is invalid, expired or already used.": recovery.invalid
  };
  return {
    fail(message: keyof typeof messages, status: number, details?: unknown) {
      return apiFail(locale === "en" ? message : messages[message], status, details);
    },
    handleApiError(error: unknown) {
      if (locale === "en") return handleCommonError(error);
      if (error instanceof ZodError) {
        const fields: Record<string, string> = {
          name: auth.name, email: auth.email, code: otp.invalidCode, token: recovery.invalid,
          password: new URL(request.url).pathname.endsWith("/login") ? auth.loginPassword : auth.signupPassword
        };
        return apiFail(auth.input, 422, error.flatten(issue => fields[String(issue.path[0])] ?? auth.input));
      }
      const response = handleCommonError(error);
      return apiFail(response.status === 503 ? auth.unavailable : auth.failed, response.status);
    }
  };
}
