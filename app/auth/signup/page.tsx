import { localizedAuthMetadata } from "@/lib/auth/page-metadata";
import type { Metadata } from "next";
import {AuthPageShell} from "@/components/auth/auth-page-shell";
import {safeInternalAuthPath} from "@/lib/auth/safe-redirect";
import {env} from "@/lib/env";
import {seo} from "@/lib/seo";

const englishMetadata: Metadata = { ...seo({
  title: "Create your Naksharix account",
  description: "Create a Naksharix account to unlock your cosmic destiny with horoscope, kundli, numerology, tarot reading, panchang, and AI guidance.",
  path: "/auth/signup"
}), robots: { index: false, follow: true } };

export function generateMetadata() {
  return localizedAuthMetadata("signup", englishMetadata);
}

type Params=Promise<{error?:string|string[];redirectTo?:string|string[];next?:string|string[]}>;
export default async function AuthPage({searchParams}:{searchParams:Params}){
  const params=await searchParams;
  return <AuthPageShell mode="signup" googleEnabled={Boolean(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET)} resume={safeInternalAuthPath(params.redirectTo??params.next)} legacy={true} oauthAccountNotLinked={params.error==="OAuthAccountNotLinked"}/>;
}
