/** Public website origin only. Do not put secrets or payment credentials in Expo public env. */
const supplied=process.env.EXPO_PUBLIC_API_URL?.trim() || "https://www.naksharix.com";
const url=supplied.replace(/\/+$/,"");
export const mobileEnv={
  apiUrl:url.startsWith("https://")?url:"https://www.naksharix.com",
  privacyPolicyUrl:"https://www.naksharix.com/privacy"
} as const;

export function webUrl(path="/"):string{
  if(!path.startsWith("/")||path.startsWith("//")||/[\\\s]/.test(path))
    throw new Error("Invalid public destination");
  return mobileEnv.apiUrl+path;
}
