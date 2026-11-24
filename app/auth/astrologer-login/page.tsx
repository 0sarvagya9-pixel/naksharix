import type { Metadata } from "next";
import {AuthPageShell} from "@/components/auth/auth-page-shell";
import {safeInternalAuthPath} from "@/lib/auth/safe-redirect";
import {env} from "@/lib/env";
import {seo} from "@/lib/seo";

export const metadata: Metadata = { ...seo({
  title: "Astrologer / Consultant Login - Naksharix",
  description: "Login to your Naksharix astrologer or consultant dashboard to manage profile, availability, bookings, and earnings.",
  path: "/auth/astrologer-login"
}), robots: { index: false, follow: true } };

type Params=Promise<{error?:string|string[];redirectTo?:string|string[];next?:string|string[]}>;
export default async function AuthPage({searchParams}:{searchParams:Params}){
  const params=await searchParams;
  return <AuthPageShell mode="professional" googleEnabled={Boolean(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET)} resume={safeInternalAuthPath(params.redirectTo??params.next)} legacy={true} oauthAccountNotLinked={params.error==="OAuthAccountNotLinked"}/>;
}
