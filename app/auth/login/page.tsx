import type { Metadata } from "next";
import {AuthPageShell} from "@/components/auth/auth-page-shell";
import {safeInternalAuthPath} from "@/lib/auth/safe-redirect";
import {env} from "@/lib/env";
import {seo} from "@/lib/seo";

export const metadata: Metadata = { ...seo({
  title: "Sign in to Naksharix",
  description: "Sign in to your Naksharix account for horoscope, kundli, numerology, tarot reading, panchang, and AI astrology dashboard.",
  path: "/auth/login"
}), robots: { index: false, follow: true } };

type Params=Promise<{error?:string|string[];redirectTo?:string|string[];next?:string|string[]}>;
export default async function AuthPage({searchParams}:{searchParams:Params}){
  const params=await searchParams;
  return <AuthPageShell mode="login" googleEnabled={Boolean(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET)} resume={safeInternalAuthPath(params.redirectTo??params.next)} legacy={true} oauthAccountNotLinked={params.error==="OAuthAccountNotLinked"}/>;
}
