export const passwordRecoveryCopy={
  "en": {
    "requestTitle": "Forgot your password?",
    "confirmTitle": "Choose a new password",
    "email": "Email",
    "password": "New password",
    "confirm": "Confirm password",
    "hide": "Hide passwords",
    "show": "Show passwords",
    "waiting": "Please wait",
    "request": "Request reset link",
    "change": "Change password",
    "login": "Return to login",
    "again": "Request a new reset link",
    "missingToken": "Open the complete one-time link from your reset email.",
    "mismatch": "Enter matching passwords.",
    "length": "Use at least 8 characters and at most 72 UTF-8 bytes. Avoid leading/trailing spaces or markup patterns.",
    "accepted": "If an eligible account exists, a reset email has been requested. Check your inbox and spam folder.",
    "changed": "Your password has changed. Sign in using the new password.",
    "rate": "Too many attempts. Try again later.",
    "invalid": "The reset link is invalid, expired or already used.",
    "input": "Check the email address or password requirements.",
    "unavailable": "Password recovery is temporarily unavailable. Try again later.",
    "failed": "The request could not be completed. Try again."
  },
  "hi": {
    "requestTitle": "पासवर्ड भूल गए?",
    "confirmTitle": "नया पासवर्ड बनाएँ",
    "email": "ईमेल",
    "password": "नया पासवर्ड",
    "confirm": "पासवर्ड की पुष्टि",
    "hide": "पासवर्ड छिपाएँ",
    "show": "पासवर्ड दिखाएँ",
    "waiting": "प्रतीक्षा करें",
    "request": "रीसेट लिंक भेजें",
    "change": "पासवर्ड बदलें",
    "login": "लॉगिन पर लौटें",
    "again": "नया रीसेट लिंक माँगें",
    "missingToken": "ईमेल में प्राप्त पूरा एक बार उपयोग होने वाला रीसेट लिंक खोलें।",
    "mismatch": "दोनों पासवर्ड समान दर्ज करें।",
    "length": "कम से कम 8 अक्षर और अधिकतम 72 UTF-8 बाइट का पासवर्ड रखें। शुरू या अंत में स्पेस तथा मार्कअप पैटर्न न रखें।",
    "accepted": "यदि पात्र खाता मौजूद है तो रीसेट ईमेल का अनुरोध किया गया है। इनबॉक्स और स्पैम फ़ोल्डर जाँचें।",
    "changed": "पासवर्ड बदल गया है। नए पासवर्ड से साइन इन करें।",
    "rate": "बहुत अधिक प्रयास हुए हैं। बाद में प्रयास करें।",
    "invalid": "रीसेट लिंक अमान्य है, उसकी अवधि समाप्त हो गई है या उसका उपयोग हो चुका है।",
    "input": "ईमेल पता या पासवर्ड की आवश्यकताएँ जाँचें।",
    "unavailable": "पासवर्ड रिकवरी अभी उपलब्ध नहीं है। बाद में प्रयास करें।",
    "failed": "अनुरोध पूरा नहीं हुआ। फिर प्रयास करें।"
  },
  "hinglish": {
    "requestTitle": "Password bhool gaye?",
    "confirmTitle": "Naya password banayein",
    "email": "Email",
    "password": "Naya password",
    "confirm": "Password confirm karein",
    "hide": "Passwords chhupayein",
    "show": "Passwords dikhayein",
    "waiting": "Thoda intezar karein",
    "request": "Reset link maangein",
    "change": "Password badlein",
    "login": "Login par laut jaayein",
    "again": "Naya reset link maangein",
    "missingToken": "Reset email mein mila poora one-time link kholein.",
    "mismatch": "Dono passwords ek jaise enter karein.",
    "length": "Kam se kam 8 characters aur zyada se zyada 72 UTF-8 bytes rakhein. Shuru ya aakhir mein spaces aur markup patterns na rakhein.",
    "accepted": "Agar eligible account hai, reset email request ki gayi hai. Inbox aur spam folder check karein.",
    "changed": "Password badal gaya hai. Naye password se sign in karein.",
    "rate": "Bahut zyada attempts ho gaye. Baad mein try karein.",
    "invalid": "Reset link invalid, expired ya pehle use ho chuka hai.",
    "input": "Email address ya password requirements check karein.",
    "unavailable": "Password recovery abhi unavailable hai. Baad mein try karein.",
    "failed": "Request complete nahi hui. Dobara try karein."
  }
} as const;
export type RecoveryKey=keyof typeof passwordRecoveryCopy.en;
export function recoveryErrorKey(status:number,mode:"request"|"confirm"):RecoveryKey{
 if(status===429)return "rate";
 if(status===503)return "unavailable";
 if(status===400&&mode==="confirm")return "invalid";
 if(status===400||status===422)return "input";
 return "failed";
}
export function recoveryPasswordLengthValid(password:string){return password.length>=8&&new TextEncoder().encode(password).length<=72;}
