// Shared customer-facing auth copy. Never expose arbitrary server error text.
export const authFormCopy = {
  "en": {
    "connection": "Unable to connect. Check your connection and try again.",
    "credentials": "Invalid email or password. Check your details and try again.",
    "role": "This account cannot sign in with the selected role. Check your account type.",
    "existing": "This email is already registered. Sign in or recover your password.",
    "input": "Check your email address and the form requirements.",
    "rate": "Too many attempts. Please try again later.",
    "unavailable": "Sign-in or registration is temporarily unavailable. Please try again later.",
    "failed": "The request was not confirmed. Check your details and try again.",
    "name": "Enter a name of 2–80 characters.",
    "email": "Enter a valid email address.",
    "signupPassword": "Use at least 8 characters and at most 72 UTF-8 bytes. Avoid leading/trailing spaces or markup patterns.",
    "loginPassword": "Enter your password (8–120 characters).",
    "review": "Please review the highlighted fields.",
    "reviewTitle": "Complete the form",
    "errorTitle": "Action not completed",
    "loginAccepted": "Sign-in accepted. Opening your account.",
    "signupAccepted": "Registration accepted. Verify your email to continue.",
    "verifyRequired": "Verify your email before signing in.",
    "successTitle": "Account update",
    "loginPlaceholder": "Your password"
  },
  "hi": {
    "connection": "कनेक्शन नहीं हो सका। इंटरनेट जाँचकर फिर प्रयास करें।",
    "credentials": "ईमेल या पासवर्ड सही नहीं है। जानकारी जाँचकर फिर प्रयास करें।",
    "role": "इस खाते से चुनी गई भूमिका में साइन इन नहीं हो सकता। खाते का प्रकार जाँचें।",
    "existing": "यह ईमेल पहले से पंजीकृत है। साइन इन करें या पासवर्ड रीसेट करें।",
    "input": "ईमेल पता और फ़ॉर्म की आवश्यकताएँ जाँचें।",
    "rate": "बहुत अधिक प्रयास हुए हैं। बाद में प्रयास करें।",
    "unavailable": "साइन इन या पंजीकरण अभी उपलब्ध नहीं है। बाद में प्रयास करें।",
    "failed": "अनुरोध की पुष्टि नहीं हुई। जानकारी जाँचकर फिर प्रयास करें।",
    "name": "2 से 80 अक्षरों का नाम दर्ज करें।",
    "email": "मान्य ईमेल पता दर्ज करें।",
    "signupPassword": "कम से कम 8 अक्षर और अधिकतम 72 UTF-8 बाइट का पासवर्ड रखें। शुरू या अंत में स्पेस तथा मार्कअप पैटर्न न रखें।",
    "loginPassword": "अपना पासवर्ड दर्ज करें (8 से 120 अक्षर)।",
    "review": "चिह्नित फ़ील्ड जाँचें।",
    "reviewTitle": "फ़ॉर्म पूरा करें",
    "errorTitle": "कार्रवाई पूरी नहीं हुई",
    "loginAccepted": "साइन इन स्वीकार हुआ। आपका खाता खुल रहा है।",
    "signupAccepted": "पंजीकरण स्वीकार हुआ। आगे बढ़ने के लिए ईमेल सत्यापित करें।",
    "verifyRequired": "साइन इन करने से पहले ईमेल सत्यापित करें।",
    "successTitle": "खाते की जानकारी",
    "loginPlaceholder": "आपका पासवर्ड"
  },
  "hinglish": {
    "connection": "Connection nahi ho paya. Internet check karke dobara try karein.",
    "credentials": "Email ya password sahi nahi hai. Details check karke dobara try karein.",
    "role": "Is account se selected role mein sign in nahi ho sakta. Account type check karein.",
    "existing": "Ye email pehle se registered hai. Sign in karein ya password reset karein.",
    "input": "Email address aur form requirements check karein.",
    "rate": "Bahut zyada attempts ho gaye. Baad mein try karein.",
    "unavailable": "Sign-in ya registration abhi unavailable hai. Baad mein try karein.",
    "failed": "Request confirm nahi hui. Details check karke dobara try karein.",
    "name": "2 se 80 characters ka naam enter karein.",
    "email": "Valid email address enter karein.",
    "signupPassword": "Kam se kam 8 characters aur zyada se zyada 72 UTF-8 bytes rakhein. Shuru ya aakhir mein spaces aur markup patterns na rakhein.",
    "loginPassword": "Apna password enter karein (8 se 120 characters).",
    "review": "Highlighted fields check karein.",
    "reviewTitle": "Form complete karein",
    "errorTitle": "Action complete nahi hua",
    "loginAccepted": "Sign-in accept ho gaya. Account khul raha hai.",
    "signupAccepted": "Registration accept ho gayi. Aage badhne ke liye email verify karein.",
    "verifyRequired": "Sign in karne se pehle email verify karein.",
    "successTitle": "Account update",
    "loginPlaceholder": "Aapka password"
  }
} as const;
export type AuthFormErrorKey = "connection"|"credentials"|"role"|"existing"|"input"|"rate"|"unavailable"|"failed";
export function authFormErrorKey(status: number, mode: "login"|"signup", professional: boolean): AuthFormErrorKey {
  if (status === 429) return "rate";
  if (status === 503 || status === 502 || status === 504) return "unavailable";
  if (status === 401 && mode === "login") return "credentials";
  if (status === 403 && mode === "login" && professional) return "role";
  if (status === 409 && mode === "signup") return "existing";
  if (status === 400 || status === 422) return "input";
  return "failed";
}
export function authResponseConfirmed(mode: "login"|"signup", value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const {data} = value as {data?: {user?: {id?: unknown; effectiveRole?: unknown}; verificationRequired?: unknown}};
  if (!data || typeof data.user?.id !== "string" || !data.user.id.trim()) return false;
  return mode === "signup" ? data.verificationRequired === true : typeof data.user.effectiveRole === "string" && ["USER","ASTROLOGER","CONSULTANT","ADMIN"].includes(data.user.effectiveRole);
}
