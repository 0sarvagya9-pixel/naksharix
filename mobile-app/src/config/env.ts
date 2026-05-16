export const mobileEnv = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://naksharix.com",
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || "https://naksharix.com/privacy",
  razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "",
  googleAdSenseId: process.env.EXPO_PUBLIC_GOOGLE_ADSENSE_ID || ""
};

export function paymentsEnabled() {
  return Boolean(mobileEnv.razorpayKeyId);
}

export function adsEnabled() {
  return Boolean(mobileEnv.googleAdSenseId);
}
