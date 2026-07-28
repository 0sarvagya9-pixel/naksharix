export const mobileEnv = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://www.naksharix.com",
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || "https://www.naksharix.com/privacy"
};

export function webUrl(path = "/") {
  const base = mobileEnv.apiUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
